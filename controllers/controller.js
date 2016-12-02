var Topics = require('../models/topics');
var Articles = require('../models/articles');
var Comments = require('../models/comments');

function getAllTopics (req, res, next) {
  Topics.find({}, {_id: 0, title: 1, slug: 1}, function (err, topics) {
    if (err) return next(err);
    res.json({topics: topics});
  });
}

function getAllArticles (req, res, next) {
  Articles.find({}, function (err, articles) {
    if (err) return next(err);
    res.json({articles: articles});
  });
}

function getArticleComments (req, res, next) {
  Articles.findById(req.params.article_id, function (err, articles) {
    // console.log(err);
    if (err && err.name === 'CastError') {
      return res.status(400).json({reason: 'invalid article id'});
    }
    if (err) return next(err);
    if (!articles) {
      return res.status(404).json({reason: 'article does not exist'});
    }
    Comments.find({belongs_to: req.params.article_id}, function (err, comments) {
      if (err) return next(err);
      res.json({comments: comments});
    });
  });
}

module.exports = {
  getAllTopics,
  getAllArticles,
  getArticleComments
};
