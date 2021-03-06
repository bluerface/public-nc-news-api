/* eslint-env mocha */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const expect = require('chai').expect;
const mongoose = require('mongoose');

require('../server');
const config = require('../config');
const saveTestData = require('../seed/test.seed');
const ROOT = `http://localhost:${config.PORT[process.env.NODE_ENV]}/api`;

describe.only('/api ROUTES', function () {
  let usefulIds;
  let token;
  before(function (done) {
    mongoose.connection.once('connected', function () {
      mongoose.connection.db.dropDatabase();
      // drop again to make sure you have a clean slate
    });
    saveTestData(function (ids) {
      usefulIds = ids;
      usefulIds.nonexistent_id = '584191edb8b7b347f5a8627b';
      usefulIds.invalid_id = '584191edb8b7b347f5a8627bxxxxxx';
      // add an invalid id and a nonexistent/incorrect id
      request(ROOT.slice(0, -4))
        .post('/signin')
        .send({username: 'northcoder', password: 'password'})
        .end((err, res) => {
          if (err) console.log(err);
          token = res.body.token;
          done();
        });
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });

  describe('GET /api', function () {
    it('GET /api', function (done) {
      request(ROOT)
        .get('/')
        .expect(200)
        .expect({status: 'OK'})
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });
  });

  describe('GET /api/topics', function () {
    it('returns 200 with an array of the available topics', function (done) {
      request(ROOT)
        .get('/topics')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body.topics).to.be.an('array');
          expect(res.body.topics).to.eql([
            {title: 'Football', slug: 'football'},
            {title: 'Cooking', slug: 'cooking'},
            {title: 'Cats', slug: 'cats'}
          ]);
          done();
        });
    });
  });

  describe('GET /api/articles', function () {
    it('will return 200 with an array of all the articles', function (done) {
      request(ROOT)
        .get('/articles')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body.articles).to.be.an('array');
          res.body.articles.forEach((article) => {
            expect(article).to.have.ownProperty('title');
            expect(article).to.have.ownProperty('body');
            expect(article).to.have.ownProperty('belongs_to');
          });
          done();
        });
    });
  });

  describe('GET /api/articles/:article_id', function () {
    it('returns 200 with the article object', function (done) {
      request(ROOT)
        .get(`/articles/${usefulIds.article_id}`)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body._id).to.eql(usefulIds.article_id.toString());
          expect(res.body.title).to.equal('Cats are great');
          expect(res.body.body).to.equal('something');
          expect(res.body.created_by).to.equal('northcoder');
          expect(res.body.belongs_to).to.equal('cats');
          expect(res.body.votes).to.equal(0);
          expect(res.body.__v).to.equal(0);
          done();
        });
    });
  });

  describe('GET /api/articles/:article_id/comments', function () {
    it('returns 200 with an array of the comments belonging to the article', function (done) {
      request(ROOT)
        .get(`/articles/${usefulIds.article_id}/comments`)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body.comments).to.be.an('array').with.lengthOf(2);
          res.body.comments.forEach(function (comment) {
            expect(comment).to.have.ownProperty('body');
            expect(comment.belongs_to).to.eql(usefulIds.article_id.toString());
          });
          done();
        });
    });
    it('returns 200 and an empty array for a valid article with no comments', function (done) {
      request(ROOT)
        .get(`/articles/${usefulIds.article_nocomments_id}/comments`)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body.comments).to.eql([]);
          done();
        });
    });
    it('returns 404 (Not Found) for a nonexistent article id', function (done) {
      request(ROOT)
        .get(`/articles/${usefulIds.nonexistent_id}/comments`)
        .expect(404)
        .expect({reason: 'article does not exist'})
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });
    it('returns 400 (bad request) for a invalid article id', function (done) {
      request(ROOT)
        .get(`/articles/${usefulIds.invalid_id}/comments`)
        .expect(400)
        .expect({reason: 'invalid article id'})
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });
  });

  describe('POST /api/articles/:article_id/comments', function () {
    it('should return 404 (not found) for a nonexistent article id', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.nonexistent_id}/comments`)
        .expect(404)
        .expect({reason: 'article does not exist'})
        .end((err, res) => {
          if (err) throw err;
          done();
        });
    });
    it('should return 400 (bad request) for an invalid article id', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.invalid_id}/comments`)
        .expect(400)
        .expect({reason: 'invalid article id'})
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });
    it('should return 400 (bad request) if the request body does not have a "comment" property', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.article_id}/comments`)
        .set('authorisation', token)
        .send({'some': 'kind of nonesense json'})
        .expect(400)
        .expect({reason: 'body must contain \'comment\' property which is a string'})
        .end((err, res) => {
          if (err) throw err;
          done();
        });
    });
    it('should return 400 (bad request) if the "comment" property is not a string', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.article_id}/comments`)
        .set('authorisation', token)
        .send({comment: 5675607687584})
        .expect(400)
        .expect({reason: 'body must contain \'comment\' property which is a string'})
        .end((err, res) => {
          if (err) throw err;
          done();
        });
    });
    it('should return 400 (bad request) if the request does not have a body', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.article_id}/comments`)
        .set('authorisation', token)
        .expect(400)
        .expect({reason: 'request must have a json body'})
        .end((err, res) => {
          if (err) throw err;
          done();
        });
    });
    it('should return 201 and the new comment object for valid requests', function (done) {
      request(ROOT)
        .post(`/articles/${usefulIds.article_id}/comments`)
        .set('authorisation', token)
        .send({'comment': 'This is the new comment'})
        .expect(201)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body.comment._id).to.exist;
          expect(res.body.comment.body).to.equal('This is the new comment');
          expect(res.body.comment.belongs_to).to.equal(usefulIds.article_id.toString());
          expect(res.body.comment.created_at).to.exist;
          expect(res.body.comment.votes).to.equal(0);
          expect(res.body.comment.created_by).to.equal('northcoder');

          done();
        });
    });
  });

  describe('PUT /api/articles/:article_id/?vote=up/down', function () {
    it('returns 202 and the new article object for a successfull upvote', function (done) {
      request(ROOT)
        .put(`/articles/${usefulIds.article_id}/?vote=up`)
        .expect(202)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body._id).to.eql(usefulIds.article_id.toString());
          expect(res.body.title).to.equal('Cats are great');
          expect(res.body.body).to.equal('something');
          expect(res.body.created_by).to.equal('northcoder');
          expect(res.body.belongs_to).to.equal('cats');
          expect(res.body.votes).to.equal(1);
          expect(res.body.__v).to.equal(0);
          done();
        });
    });
    it('returns 202 and the new article object for a successfull downvote', function (done) {
      request(ROOT)
        .put(`/articles/${usefulIds.article_id}/?vote=down`)
        .expect(202)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body._id).to.eql(usefulIds.article_id.toString());
          expect(res.body.title).to.equal('Cats are great');
          expect(res.body.body).to.equal('something');
          expect(res.body.created_by).to.equal('northcoder');
          expect(res.body.belongs_to).to.equal('cats');
          expect(res.body.votes).to.equal(0);
          expect(res.body.__v).to.equal(0);
          done();
        });
    });
  });

  describe('PUT /api/comments/:comment_id/?vote=up/down', function () {
    it('returns 202 and the updated comment object for a successfull upvote', function (done) {
      request(ROOT)
        .put(`/comments/${usefulIds.comment_id}/?vote=up`)
        .expect(202)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body.comment._id).to.equal(usefulIds.comment_id.toString());
          expect(res.body.comment.body).to.equal('this is a comment');
          expect(res.body.comment.belongs_to).to.equal(usefulIds.article_id.toString());
          expect(res.body.comment.created_by).to.equal('northcoder');
          expect(res.body.comment.votes).to.equal(1);
          expect(res.body.comment.created_at).to.exist;
          expect(res.body.comment.__v).to.equal(0);
          done();
        });
    });
    it('returns 202 and the updated comment object for a successfull downvote', function (done) {
      request(ROOT)
        .put(`/comments/${usefulIds.comment_id}/?vote=down`)
        .expect(202)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body.comment._id).to.equal(usefulIds.comment_id.toString());
          expect(res.body.comment.body).to.equal('this is a comment');
          expect(res.body.comment.belongs_to).to.equal(usefulIds.article_id.toString());
          expect(res.body.comment.created_by).to.equal('northcoder');
          expect(res.body.comment.votes).to.equal(0);
          expect(res.body.comment.created_at).to.exist;
          expect(res.body.comment.__v).to.equal(0);
          done();
        });
    });
  });
});
