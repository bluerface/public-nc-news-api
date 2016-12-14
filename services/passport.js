const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/users');
const secret = require('../config').secret;

const options = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromHeader('authorisation')
};

const jwtAuth = new JwtStrategy(options, function (payload, done) {
  User.findById(payload.sub, function (err, user) {
    if (err) done(err);
    if (user) done(null, user);
    else done(null, false);
  });
});

passport.use(jwtAuth);
