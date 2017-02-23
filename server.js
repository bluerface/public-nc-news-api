if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var app = express();
var config = require('./config');
var db = config.DB[process.env.NODE_ENV] || process.env.DB;
var PORT = config.PORT[process.env.NODE_ENV] || process.env.PORT;

var apiRouter = require('./routers/api.js');
var authController = require('./controllers/authentication');

const passport = require('passport');
require('./services/passport');
const requireSignin = passport.authenticate('local', {session: false});

mongoose.connect(db, function (err) {
  if (!err) {
    console.log(`connected to the Database: ${db}`);
  } else {
    console.log(`error connecting to the Database ${err}`);
  }
});

app.use(bodyParser.json());

app.use(cors());

app.get('/', function (req, res) {
  res.status(200).sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api', apiRouter);

app.post('/signup', authController.signup);
app.post('/signin', requireSignin, authController.signin);

app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`);
});
