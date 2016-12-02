var Topic = require('../models/topics');

function getAllTopics (req, res, next) {
  Topic.find({}, {_id: 0, title: 1, slug: 1}, function (err, topics) {
    if (err) return next(err);
    res.json({topics: topics});
  });
}

module.exports = {
  getAllTopics
};
