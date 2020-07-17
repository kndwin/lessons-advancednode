"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const pug = require("pug");
const session = require("express-session");
const passport = require("passport");
// require('dotenv').config();

const app = express();

let done = (err, data) => {
  console.log( err ? `Error: ${err}` : `Sucess!: ${data}`)
}

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.use(session({ // you can create sessions (useful to auth later)
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(( user, done ) => {
  done( null, user._id )
})

app.route("/").get((req, res) => {
  // process.cwd() means current working directory
  res.render( process.cwd() + '/views/pug/index.pug' , { 
    title: "Hello", // You can pass variables to .pug files!
    message: "Please login"
  }) ;

});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
