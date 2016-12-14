const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local');
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/users');
const secret = require('../config').secret;

const options = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromHeader('authorisation')
};

const jwtAuth = new JwtStrategy(options, function (payload, done) {
  User.findById(payload.sub, function (err, user) {
    if (err) return done(err, false);
    if (user) return done(null, user);
    else done(null, false);
  });
});

const localAuth = new LocalStrategy(function (username, password, done) {
  User.findOne({username}, function (err, user) {
    if (err) return done(err, false);
    if (!user) return done(null, false);

    user.verifyPassword(password, function (err, isMatch) {
      if (err) return done(err, false);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  });
});

passport.use(jwtAuth);
passport.use(localAuth);
