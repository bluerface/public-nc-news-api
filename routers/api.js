var express = require('express');
var router = express.Router();

const {getAllTopics,
  getAllArticles,
  isValidArticle,
  getArticleComments,
  postComment} = require('../controllers/controller');

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

router.get('/articles', getAllArticles);

router.use('/articles/:article_id/', isValidArticle);

router.get('/articles/:article_id/comments', getArticleComments);

router.post('/articles/:article_id/comments', postComment);

module.exports = router;
