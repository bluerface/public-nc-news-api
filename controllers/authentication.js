const User = require('../models/users');

function signup (req, res, next) {
  // expect to get password, username and name
  // check whether user already exists
  // save new user to database
    // hash & salt password before saving
    // return user (insensitive only) & token

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
        user
      });
    });
  });
}

module.exports = {
  signup
};
