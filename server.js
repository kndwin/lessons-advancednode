"use strict";

const express = require("express");
const passport = require("passport");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const ObjectID = require("mongodb").ObjectID;
const mongo = require('mongodb').MongoClient;
const routes = require('./routes.js')
const auth = require('./auth.js')

if (process.env.NODE_ENV= 'production') {
  require('dotenv').config();
}

const app = express();
app.set('view engine', 'pug');

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({ // you can create sessions (useful to auth later)
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

mongo.connect(process.env.DATABASE, (err, client) => {
  let db = client.db("dev");
  if (err) { 
    console.log(`Database error: ${err}`)
    app.route('/')
      .get((req,res) => {
        res.render('pug', {
          title: err,
          message: 'Database connection error'
        })
      })
  } else {
    console.log(`Sucessful database connection`)
    auth(app, db)
    routes(app, db)

    app.route('/auth/github')
      .get(passport.authenticate('github'))

    app.route('/auth/github/callback')
      .get(passport.authenticate('github', {
        failureRedirect: '/'
      }), (req, res) => {
        res.redirect('/profile')
      })

  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
