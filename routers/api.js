var express = require('express');
var router = express.Router();

const {getAllTopics} = require('../controllers/controller');

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

router.get('/', function (req, res) {
  res.status(200).json({status: 'OK'});
});

router.get('/topics', getAllTopics);

module.exports = router;