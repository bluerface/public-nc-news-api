var express = require('express');
var passport = require('passport');
var router = express.Router();
require('../services/passport');

const {getAllTopics,
  getAllArticles,
  isValidArticle,
  getArticle,
  voteArticle,
  getArticleComments,
  postComment,
  isValidComment,
  voteComment} = require('../controllers/controller');

const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', function (req, res) {
  res.status(200).json({status: 'OK'});
});

router.get('/topics', getAllTopics);

router.get('/articles', getAllArticles);

router.use('/articles/:article_id/', isValidArticle);

router.get('/articles/:article_id/', getArticle);

router.put('/articles/:article_id/', voteArticle);

router.get('/articles/:article_id/comments', getArticleComments);

router.post('/articles/:article_id/comments', requireAuth, postComment);

router.use('/comments/:comment_id', isValidComment);

router.put('/comments/:comment_id', voteComment);

module.exports = router;
