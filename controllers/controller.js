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

// articles

function getAllArticles (req, res, next) {
  Articles.find({}, function (err, articles) {
    if (err) return next(err);
    res.json({articles: articles});
  });
}

function isValidArticle (req, res, next) {
  Articles.findById(req.params.article_id, function (err, article) {
    if (err && err.name === 'CastError') { return res.status(400).json({reason: 'invalid article id'}); }
    if (err) return next(err);
    if (!article) { return res.status(404).json({reason: 'article does not exist'}); }
    res.locals.article = article;
    next();
  });
}

function getArticle (req, res, next) {
  res.status(200).send(res.locals.article);
}

function voteArticle (req, res, next) {
  if (!req.query.vote) return next('vote query value not specified');
  if (req.query.vote !== 'up' && req.query.vote !== 'down') return next('vote query must be up or down');
  let val = req.query.vote === 'up' ? 1 : -1;

  Articles.findByIdAndUpdate(req.params.article_id, {$inc: {'votes': val}}, {new: true}, (err, article) => {
    if (err) return next(err);
    res.status(202).send(article);
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

  console.log(req.user);

  let comment = new Comments({
    body: req.body.comment,
    belongs_to: req.params.article_id,
    created_by: req.user.username
  });
  comment.save((err, comment) => {
    if (err) return next(err);
    res.status(201).json({comment});
  });
}

// comments

function isValidComment (req, res, next) {
  Comments.findById(req.params.comment_id, function (err, comment) {
    if (err && err.name === 'CastError') { return res.status(400).json({reason: 'invalid comment id'}); }
    if (err) return next(err);
    if (!comment) { return res.status(404).json({reason: 'comment does not exist'}); }
    res.locals.comment = comment;
    next();
  });
}

function voteComment (req, res, next) {
  if (!req.query.vote) return next('vote query value not specified');
  if (req.query.vote !== 'up' && req.query.vote !== 'down') return next('vote query must be up or down');
  let val = req.query.vote === 'up' ? 1 : -1;

  Comments.findByIdAndUpdate(req.params.comment_id, {$inc: {'votes': val}}, {new: true}, (err, comment) => {
    if (err) return next(err);
    res.status(202).send({comment});
  });
}

module.exports = {
  getAllTopics,
  getAllArticles,
  isValidArticle,
  getArticle,
  voteArticle,
  getArticleComments,
  postComment,
  isValidComment,
  voteComment
};
