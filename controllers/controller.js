var Topic = require('../models/topics');
var Articles = require('../models/articles');

function getAllTopics (req, res, next) {
  Topic.find({}, {_id: 0, title: 1, slug: 1}, function (err, topics) {
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

module.exports = {
  getAllTopics,
  getAllArticles
};
