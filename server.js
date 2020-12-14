const express = require("express");
const mongoose = require("mongoose");

const passport = require("passport");
const users = require("./routes/api/users");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));


mongoose.connect('mongodb://localhost:27017/cognitensorDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});


app.use(passport.initialize());

require("./config/passport")(passport);


app.use("/api/users", users);

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log("Server has started at port 3000...");
})
