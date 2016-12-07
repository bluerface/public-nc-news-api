var _ = require('underscore');

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

function isValidArticle (req, res, next) {
  Articles.findById(req.params.article_id, function (err, articles) {
    if (err && err.name === 'CastError') { return res.status(400).json({reason: 'invalid article id'}); }
    if (err) return next(err);
    if (!articles) { return res.status(404).json({reason: 'article does not exist'}); }
    next();
  });
}

function getArticleComments (req, res, next) {
  Comments.find({belongs_to: req.params.article_id}, function (err, comments) {
    if (err) return next(err);
    res.json({comments: comments});
  });
}

function postComment (req, res, next) {
  if (_.isEmpty(req.body)) {
    return res.status(400).json({reason: 'request must have a json body'});
  } else if (typeof req.body.comment !== 'string') {
    return res.status(400).json({reason: 'body must contain \'comment\' property which is a string'});
  }

  let comment = new Comments({body: req.body.comment, belongs_to: req.params.article_id});
  comment.save((err, comment) => {
    if (err) return next(err);
    res.status(201).json(comment);
  });
}

module.exports = {
  getAllTopics,
  getAllArticles,
  isValidArticle,
  getArticleComments,
  postComment
};
