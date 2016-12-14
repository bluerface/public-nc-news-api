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

  res.send('hello');
}

module.exports = {
  signup
};
