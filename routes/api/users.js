require('dotenv').config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const User = require("../../models/User");


router.get("/login",(req,res)=>{
  
  res.sendFile(__dirname+"/signIn.html");
})

router.get("/register",(req,res)=>{
  
  res.sendFile(__dirname+"/signUp.html");
})

router.get("/reset",(req,res)=>{
  
  res.sendFile(__dirname+"/forgetpassword.html");
})


router.post("/register", (req, res) => {

  const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: "Email already exists" });
        } else {
            const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                .save()
                .then(user => res.json(user))
                .catch(err => console.log(err));
            });
            });
        }
    });
});


router.post("/login", (req, res) => {


  const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email }).then(user => {

      if (!user) {
         
        return res.status(404).json({ emailnotfound: "Email not found" });
        
        
      }

      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {

          const payload = {
            id: user.id,
            name: user.name
          };

          jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.sendFile(__dirname+"/loggedIn.html");
            }
          );
        } else {
          // return res
          //   .status(400)
          //   .json({ passwordincorrect: "Password incorrect" });
          res.status(404).sendFile(__dirname+"/failure.html");
          return ;
        }
      });
    });
  });


router.post("/reset", (req, res) => {

  //console.log(req.body);

  let hashedPassword =  req.body.password;
  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
        return res.status(400).json({ email: "Email doesn't exists" });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(hashedPassword, salt, (err, hash) => {
            if (err) throw err;
            else{
            
              hashedPassword = hash;
              User.findOneAndUpdate({ email: req.body.email }, {$set:{password:hashedPassword}}, {new: true}, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!");
                }
            
                else res.sendFile(__dirname+"/loggedIn.html");
              });
            }
        })   
      });
  
    
    }
  })

});

module.exports = router;