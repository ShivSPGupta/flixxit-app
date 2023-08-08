const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const userRoutes = require("./routes/UserRoutes");
const app = express();
require("dotenv").config({path: '../.env'});


app.use(cors());
app.use(express.json());

const PORT = process.env.ENV_PORT;
const dbUrl = process.env.ENV_MONGODB;
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect( dbUrl, connectionParams )
.then(()=>{
    console.log("DB Connected");
})
.catch((err) => {
    console.log(err.message);
  });

app.use("/api/user", userRoutes);

app.listen(PORT, ()=> {
    console.log('Server started on port ', {PORT});
});
