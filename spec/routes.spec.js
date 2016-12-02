/* eslint-env mocha */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const expect = require('chai').expect;
const mongoose = require('mongoose');

require('../server');
const config = require('../config');
const saveTestData = require('../seed/test.seed');
const ROOT = `http://localhost:${config.PORT[process.env.NODE_ENV]}/api`;

describe('/api ROUTES', function () {
  let usefulIds;
  before(function (done) {
    mongoose.connection.once('connected', function () {
      mongoose.connection.db.dropDatabase();
      // drop again to make sure you have a clean slate
    });
    saveTestData(function (ids) {
      usefulIds = ids;
      usefulIds.nonexistent_id = '584191edb8b7b347f5a8627b';
      usefulIds.invalid_id = '584191edb8b7b347f5a8627bxxxxxx';
      // maybe add an invalid id and a nonexistent/incorrect id
      done();
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    done();
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
    it('returns 404 (Not Found) for a nonexistent article id', function (done) {
      request(ROOT)
        .get(`/articles/${usefulIds.nonexistent_id}/comments`)
        .expect(404)
        // .expect({reason: 'article does not exist'})
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });
    // it returns 404 (not found) for a nonexistent article id
    // it returns 400 (bad request) for a invalid article id
  });
});
