"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const pug = require("pug");
const session = require("express-session");
const passport = require("passport");

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ // you can create sessions (useful to auth later)
  secret: 'itsgonnabeokay',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.set('view engine', 'pug');

app.route("/").get((req, res) => {
  // process.cwd() means current working directory
  // __dirname
  res.render( __dirname + '/views/pug/index.pug' , { 
    title: "Hello", // You can pass variables to .pug files!
    message: "Please login"
  }) ;

});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
