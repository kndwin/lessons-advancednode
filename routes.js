const passport = require("passport");
const pug = require("pug");
const hash = require('bcrypt');

let done = (err, data) => {
  console.log( err ? `Error: ${err}` : `Success!: ${data}`)
}

module.exports = function (app, database) {
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
  
  app.route('/logout')
    .get((req, res) => {
      req.logout()
      res.redirect("/")
    })

  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  })
}

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}


