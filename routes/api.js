var express = require('express');
var route = express.Router();

route.get('/', function (req, res) {
  res.status(200).json({status: 'OK'});
})

// route.get('/', function (req, res) {
//   res.status(200).send(
// `
// The available routes are;
//
// GET  /api/topics
// GET  /api/topics/:topic_slug/articles
// GET  /api/articles
// GET  /api/articles/:article_id/comments
// POST /api/articles/:article_id/comments
// PUT  /api/articles/:article_id?vote=up (/down)
// PUT  /api/comments/:comment_id?vote=up (/down)
// DEL  /api/comments/:comment_id
// GET  /api/users/:username
// `
//   )
// })



module.exports = route;
