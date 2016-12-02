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
      // maybe add an invalid id and a nonexistent/incorrect id
      done();
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    done();
  });

  describe('GET /api', function () {
    it('GET /api', function () {
      request(ROOT)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('OK');
      });
    });
  });
});
