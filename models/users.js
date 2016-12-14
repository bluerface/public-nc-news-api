var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String,
    required: true,
    lowercase: true,
    default: '#'
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', function (next) {
  // generate salt
  // hash password
  // set the password to the hash
  let user = this;

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      console.log(user.password);
      next();
    });
  });
});

module.exports = mongoose.model('users', UserSchema);
