# 🎬 Flixxit

A full-stack Netflix clone built with the MERN stack, featuring real movie data, YouTube trailers, and user authentication.

![Netflix Clone](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based registration and login
- 🎥 **Real Movie Data** - Powered by TMDb API with fast movie metadata and posters
- ▶️ **YouTube Trailers** - Auto-play trailers on hover
- ⭐ **My List** - Save your favorite movies
- 🔍 **Smart Search** - Real-time search with instant results
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Netflix UI** - Authentic Netflix-style interface with smooth animations
- 👤 **User Profiles** - Manage account settings and preferences

## 🚀 Live Demo

**App Link**: [Live Demo](https://my-portfolio-six-azure-30.vercel.app/)

## 📸 Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x400?text=Home+Page+Screenshot)

### Movie Details
![Movie Details](https://via.placeholder.com/800x400?text=Movie+Details+Screenshot)

### My List
![My List](https://via.placeholder.com/800x400?text=My+List+Screenshot)

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **Rate limiting** for API protection

### External APIs
- **TMDb API** - Movie database
- **YouTube Data API** - Trailer videos

## ⚙️ Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- TMDb API key ([get one here](https://www.themoviedb.org/settings/api))
- YouTube Data API key ([get from Google Cloud](https://console.cloud.google.com))

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/ShivSPGupta/flixxit-app.git
cd flixxit-app/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_token_secret
TMDB_API_KEY=your_tmdb_api_key
YOUTUBE_API_KEY=your_youtube_api_key
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
NODE_ENV=development
EOF

# Start the server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to see the app!


## 🎯 Key Features Explained

### Authentication Flow
- User registers with email and password
- Password is hashed using bcrypt
- JWT tokens (access + refresh) are generated
- Tokens are stored in localStorage
- Auto-refresh on token expiration

### Movie Browsing
- Multiple categorized rows (Action, Marvel, Horror, etc.)
- Horizontal scrolling with smooth animations
- Hover effects with trailer preview
- Click for detailed movie information

### Search Functionality
- Debounced search (500ms delay)
- Live results dropdown
- Full search results page
- Powered by TMDb API

### My List
- Add/remove movies with one click
- Persistent storage in MongoDB
- Dedicated page to view saved movies
- Visual feedback for added items

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Refresh token rotation
- Rate limiting on endpoints
- CORS protection
- Helmet.js security headers
- Input validation


## 🐛 Known Issues

- TMDb covers poster images directly; keep a fallback image in case a title has no poster
- YouTube API has 10,000 units/day quota
- Some movies may not have trailers available


## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@ShivSPGupta](https://github.com/ShivSPGupta)
- LinkedIn: [Shiv Shankar Gupta](https://linkedin.com/in/shiv-shankar-gupta)
- Portfolio: [Portfolio](https://my-portfolio-six-azure-30.vercel.app/)


## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---
