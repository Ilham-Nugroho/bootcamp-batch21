const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Author = require('../model/author')





function initialize(passport, author, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const author = await Author.findOne({
      email: email
    })
    if (author == null) {
      return done(null, false, {
        message: "No user with that email"
      })
    }

    try {
      if (await bcrypt.compare(password, author.password)) {
        return done(null, author)
      } else {
        return done(null, false, {
          message: "Password incorrect"
        })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({
      usernameField: 'email'
    },
    authenticateUser))
  passport.serializeUser((author, done) => {
    done(null, author.id)
  })
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}


module.exports = initialize
