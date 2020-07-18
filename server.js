"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const pug = require("pug");
const session = require("express-session");
const passport = require("passport");
const ObjectID = require("mongodb").ObjectID;
const mongo = require('mongodb').MongoClient;
const LocalStrategy = require('passport-local');

if (process.env.NODE_ENV= 'production') {
  require('dotenv').config();
}

const app = express();

let done = (err, data) => {
  console.log( err ? `Error: ${err}` : `Sucess!: ${data}`)
}

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect('/');
  }
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

mongo.connect(process.env.DATABASE, (err, db) => {
  if (err) { console.log(`Database error: ${err}`) }
  else {
    console.log(`Sucessful database connection`)
    passport.serializeUser(( user, done ) => {
      done( null, user._id )
    })

    passport.deserializeUser(( id, done ) => {
      db.collection('users').findOne(
        { _id: new ObjectID( id ) },
        ( err, doc ) => { done(null,doc) }
      )
    })

    passport.use(new LocalStrategy(
      function( username, password, done ) {
        db.collection('users').findOne({ username: username }, (err, user) => {
          console.log('User ' + username + ' attempted to log in.');
          if (err) { return done(err) }
          if (!user) { return done(null, false) }
          if (password !== user.password) { return done(null, false) }
          return done( null, user )
        })
      }
    ))

    app.route("/").get((req, res) => {
      // process.cwd() means current working directory
      res.render( process.cwd() + '/views/pug/index.pug' , { 
        title: "Hello", // You can pass variables to .pug files!
        message: "Please login",
        showLogin: true
      });
    });

    // before redirecting to profile, we run passport.authenticate
    app.route('/login').post(
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res) => res.redirect('/profile')
    )

    app.route('/profile').get(
      // ensures authenticattion works before displaying the profile
      ensureAuthenticated,(req, res) => {
        res.render(process.cwd() + '/views/pug/profile')
      }
    )

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }
})
