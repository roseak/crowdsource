const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');

describe('Server', function() {
  before(function(done) {
    this.port = 9876;
    this.server = app.listen(this.port, function(error, result) {
      if (error) { return done(error); }
      done();
    });
    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    });
  });

  after(function() {
    this.server.close();
  });

  it('should exist', function() {
    assert(app);
  });

  describe('GET /', function() {
    it('should return a 200', function(done) {
      this.request.get('/', function(error, response) {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should have content in the body', function(done) {
      var title = "crowdsource";

      this.request.get('/', function(error, response) {
        if (error) { done(error); }
        assert(response.body.includes(title),
              `"${response.body}" does not include "${title}"`);
        done();
      });
    });
  });

  describe('POST /poll', function() {
    beforeEach(function() {
      app.locals.polls = {};
    });

    it('should return a 200', function(done) {
      var payload = { poll: fixtures.validPoll };

      this.request.post('/', { form: payload }, function(error, response) {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should store the form data sent', function(done) {
      var payload = { poll: fixtures.validPoll };

      this.request.post('/', { form: payload }, function(error, response) {
        if (error) {done(error); }
        var pollTally = Object.keys(app.locals.polls).length;
        assert.equal(pollTally, 1, `"Expected 1 poll, found ${pollTally}"`);
        done();
      });
    });

    it('should show admin and poll links', function(done) {
      var payload = { poll: fixtures.validPoll };

      this.request.post('/', { form: payload }, function(error, response) {
        if (error) {done(error); }
        assert(response.body.includes('Admin URL'));
        assert(response.body.includes('Poll URL'));
        done();
      });
    });
  });

  describe('GET /poll/:id', function(done) {
    beforeEach(function() {
      app.locals.polls.pizza = fixtures.validPoll;
    });

    it('should return 200', function(done) {
      this.request.get('/poll/pizza', function(error, response) {
        if (error) {done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should show the poll question', function(done) {
      var poll = app.locals.polls.pizza;

      this.request.get('/poll/pizza', function(error, response) {
        if (error) { done(error); }
        assert(response.body.includes(poll.question), `"${response.body} does not include ${poll.question}"`);
        done();
      });
    });

    it('should show the poll options', function(done) {
      var poll = app.locals.polls.pizza;

      this.request.get('/poll/pizza', function(error, response) {
        if (error) { done(error); }
        assert(response.body.includes(poll.responses[1]),
              `"${response.body} does not include ${poll.responses[1]}"`);
        done();
      });
    });
  });

  describe('GET /:adminUrl/:id', function(done) {
    beforeEach(function() {
      app.locals.polls.pizza = fixtures.validPoll;
    });

    it('should return 200', function(done) {
      this.request.get('/adminPizza/pizza', function(error, response) {
        if (error) {done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should not display the poll if it is not given the correct admin url', function(done) {
      var poll = app.locals.polls.pizza;

      this.request.get('adminBurgers/pizza', function(error, response) {
        if (error) { done(error); }
        assert(response.body.includes(404), `"${response.body} does not return 404"`);
        done();
      });
    });

    it('should show the poll question', function(done) {
      var poll = app.locals.polls.pizza;

      this.request.get('/adminPizza/pizza', function(error, response) {
        if (error) { done(error); }
        assert(response.body.includes(poll.question), `"${response.body} does not include ${poll.question}"`);
        done();
      });
    });


  });
});
