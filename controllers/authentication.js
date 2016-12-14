const User = require('../models/users');
const jwt = require('jwt-simple');
const secret = require('../config').secret;

function createUserToken (user) {
  return jwt.encode({
    sub: user.id,
    iat: Date.now()
  }, secret);
}

function signup (req, res, next) {
  const {password, username, name} = req.body;

  if (!password || !username || !name) {
    return res.status(422).json({reason: 'body must include password, username and name properties'});
  }

  User.findOne({username}, function (err, existingUser) {
    if (err) return next(err);
    if (existingUser) {
      return res.status(422).json({reason: 'Username is in use'});
    }

    const newUser = new User({username, password, name});
    newUser.save(function (err, user) {
      if (err) return next(err);

      res.status(201).json({
        token: createUserToken(user),
        user: {
          username,
          name,
          avatar_url: user.avatar_url
        }
      });
    });
  });
}

function signin (req, res, next) {
  const user = req.user;
  const {username, name, avatar_url} = req.user;
  res.json({
    token: createUserToken(user),
    user: {
      username, name, avatar_url
    }
  });
}

module.exports = {
  signup,
  signin
};
