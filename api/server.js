const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const userRoutes = require("./routes/UserRoutes");
const app = express();

app.use(cors());
app.use(express.json());

const dbUrl = "mongodb+srv://sspgupta11:VbGEzITde0eKru3q@cluster0.tmwxxjz.mongodb.net/flixxitapi?retryWrites=true&w=majority";
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

app.listen(5000, ()=> {
    console.log("server started on port 5000");
});
