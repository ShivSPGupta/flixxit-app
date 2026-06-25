const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestContextMiddleware } = require('./utils/requestContext');

dotenv.config();

const app = express();

// Render and similar hosts sit behind a reverse proxy that sets X-Forwarded-For.
// This lets express-rate-limit use the real client IP instead of throwing proxy warnings.
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

// Connect to MongoDB
connectDB();

// Middleware
app.use(requestContextMiddleware);
app.use(helmet());

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_URL ||
  'http://localhost:5173,https://flixxit-app.vercel.app'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/user', require('./routes/favorites'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
