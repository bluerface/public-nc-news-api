/* eslint-env mocha */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const expect = require('chai').expect;
const mongoose = require('mongoose');

require('../server');
const config = require('../config');
const saveTestData = require('../seed/test.seed');
const ROOT = `http://localhost:${config.PORT[process.env.NODE_ENV]}`;

const newUser = {
  username: 'joebloggs555',
  name: 'Joe Blogs',
  password: 'Ilovecats'
};

let token;

describe.only('Authentication', function () {
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

  describe('POST /signup', function () {
    it('it returns a token and user details for a successfull request', function (done) {
      request(ROOT)
        .post('/signup')
        .send(newUser)
        .expect(201)
        .end((err, res) => {
          if (err) throw err;
          token = res.body.token;
          expect(res.body.token).to.be.a('string');
          expect(res.body.user.username).to.equal(newUser.username);
          expect(res.body.user.name).to.equal(newUser.name);
          expect(res.body.user.avatar_url).to.equal('#');
          done();
        });
    });
    it('returns 422 (unprocessable entity) for requests with no username/name/password properties', function (done) {
      request(ROOT)
        .post('/signup')
        .send({stuff: 'things'})
        .expect(422, {reason: 'body must include password, username and name properties'}, done);
    });
    it('returns 422 (unprocessable entity) if the username is already in use', function (done) {
      request(ROOT)
        .post('/signup')
        .send(newUser)
        .expect(422, {reason: 'Username is in use'}, done);
    });
    it('username lookup is case insensitive', function (done) {
      request(ROOT)
        .post('/signup')
        .send({username: 'joEbloGGs555', name: 'Joe Blogs', password: 'Ilovecats'})
        .expect(422, {reason: 'Username is in use'}, done);
    });
  });

  describe('authenticated route', function () {
    it('lets the user post a comment if the authorisation token is set', function (done) {
      request(ROOT)
        .post(`/api/articles/${usefulIds.article_id}/comments`)
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
    it('returns "Unauthorised" for post requests with no token', function (done) {
      request(ROOT)
        .post(`/api/articles/${usefulIds.article_id}/comments`)
        .send({'comment': 'This is the new comment'})
        .expect(401, 'Unauthorized', done);
    });
  });

  describe('POST /signin', function () {
    it('returns a token and user details for a successfull signin', function (done) {
      request(ROOT)
        .post('/signin')
        .send({username: newUser.username, password: newUser.password})
        .expect(202)
        .end((err, res) => {
          if (err) throw err;
          token = res.body.token;
          expect(res.body.token).to.be.a('string');
          expect(res.body.user.username).to.equal(newUser.username);
          expect(res.body.user.name).to.equal(newUser.name);
          expect(res.body.user.avatar_url).to.equal('#');
          done();
        });
    });
    it('returns a valid token', function (done) {
      request(ROOT)
        .post(`/api/articles/${usefulIds.article_id}/comments`)
        .set('authorisation', token)
        .send({'comment': 'This is another new comment'})
        .expect(201)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body.comment._id).to.exist;
          expect(res.body.comment.body).to.equal('This is another new comment');
          expect(res.body.comment.belongs_to).to.equal(usefulIds.article_id.toString());
          expect(res.body.comment.created_at).to.exist;
          expect(res.body.comment.votes).to.equal(0);
          expect(res.body.comment.created_by).to.equal('northcoder');
          done();
        });
    });
    it('returns 401 (Unauthorized) for invalid username', function (done) {
      request(ROOT)
        .post('/signin')
        .send({username: 'nobody', password: 'password'})
        .expect(401, 'Unauthorized', done);
    });
    it('returns 401 (Unauthorized) for correct user but no ', function (done) {
      request(ROOT)
        .post('/signin')
        .send({username: newUser.username, password: 'wrongpassword'})
        .expect(401, 'Unauthorized', done);
    });
  });
});
