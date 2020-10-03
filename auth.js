const passport = require("passport");
const LocalStrategy = require('passport-local');

module.exports = function (app, database) {
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
