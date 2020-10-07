"use strict";

const express = require("express");
const passport = require("passport");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const ObjectID = require("mongodb").ObjectID;
const mongo = require('mongodb').MongoClient;
const LocalStrategy = require('passport-local');
const pug = require("pug");
const hash = require('bcrypt');
//const routes = require('./routes.js')
//const auth = require('./auth.js')

if (process.env.NODE_ENV= 'production') {
  require('dotenv').config();
}

let done = (err, data) => {
  console.log( err ? `Error: ${err}` : `Success!: ${data}`)
}

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
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
    //auth(app, db)
    //routes(app, db)

  app.route("/")
    .get((req, res) => {
      // process.cwd() means current working directory
      res.render( process.cwd() + '/views/pug/index.pug' , { 
        title: "Hello", // You can pass variables to .pug files!
        message: "Home Page",
        showLogin: true,
        showRegistration: true,
        showSocialAuth: true
      })
    })
  
  app.route('/login')
    .post(passport.authenticate('local', { 
      failureRedirect: '/' 
    }),(req, res) => {
      res.redirect('/profile')
    })

  app.route('/profile')
    .get(ensureAuthenticated,(req, res) => {
      res.render(process.cwd() + '/views/pug/profile', {
        username: req.user.username
      })
    })
  
  app.route('/register')
    .post((req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12)
      database.collection('users')
        .findOne({
          username: req.body.username
        },(err, user) => {
          if (err) {
            next(err)
          } else if (user) {
            res.redirect('/')
          } else {
            database.collection('users')
              .insertOne({
                username: req.body.username,
                password: hash
              },(err, user) => {
                if (err) {
                  res.redirect('/')
                } else {
                  next(null, user)
                }
              }
            )
          }
        }
      )
    },passport.authenticate(
      'local',{failureRedirect: '/'}
      ),(req, res, next) => {
        res.redirect('profile')
      })
  
  app.route('/auth/github')
    .get(passport.authenticate('github'))

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      failureRedirect: '/'
    }), (req, res) => {
      res.redirect('/profile')
    })

  app.route('/logout')
    .get((req, res) => {
      req.logout()
      res.redirect("/")
    })

  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  })

  passport.serializeUser(( user, done ) => {
    done( null, user._id )
  })

  passport.deserializeUser(( id, done ) => {
    database.collection('users').findOne(
      { _id: new ObjectID( id ) },
      ( err, doc ) => { done(null,doc) }
    )
  })

  passport.use(new LocalStrategy(
    function( username, password, done ) {
      database.collection('users')
      .findOne({ username: username }, (err, user) => {
        console.log('User ' + username + ' attempted to log in.');
        if (err) { return done(err) }
        if (!user) { return done(null, false) }
        if (!bcrypt.compareSync(password, user.password)) { 
          return done(null, false) 
        }
        return done( null, user )
      })
    }
  ))
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
