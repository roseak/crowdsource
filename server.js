const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const app = express();
const moment = require('moment');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const countVotes = require('./lib/count-votes');
const urlHash = require('./lib/url-hash');

app.locals.polls = {};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended:true }));

app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('index');
});

app.post('/', function(req, res){
  var poll = req.body.poll;
  urlHash(poll);
  var id = poll.id;
  app.locals.polls[id] = poll;
  poll['votes'] = {};
  if (poll.endTime) {
    poll.displayTime = moment(poll.endTime).format('MMMM Do YYYY, h:mm:ss a');
  }
  res.render('link-show', { poll: poll });
});

app.get('/poll/:id', function(req, res){
  var poll = app.locals.polls[req.params.id];
  res.render('user-poll', { poll: poll });
});

app.get('/:adminUrl/:id', function(req, res){
  var poll = app.locals.polls[req.params.id];
  if (poll.adminUrl === req.params.adminUrl) {
    res.render('admin', { poll: poll });
  } else {
    res.send("404");
  }
});

const server = http.createServer(app).listen(port, function() {
                   console.log('Listening on port ' + port + '.');
                 });

const io = socketIo(server);

io.on('connection', function(socket) {
  socket.on('message', function (channel, message) {
    if (channel === 'voteCast' + message.id) {
      var poll = app.locals.polls[message.id];

      if (poll.endTime) {
        var milTime = moment(poll.endTime).format('x');
        var timeDone = milTime - moment().format('x');
          poll.displayTime = moment(poll.endTime).fromNow();
        setTimeout(function(){
          poll.status = "closed";
          io.sockets.emit('pollOver' + poll.id)
        }, timeDone);
      }

      if (moment() >= moment(poll.endTime) || poll.status === "closed") {
        poll.status = "closed";
        io.sockets.emit('pollOver' + message.id);
      }

      if (poll.status === "on") {
        poll['votes'][socket.id] = message.vote;
        socket.emit('currentChoice', message.vote);
        io.sockets.emit('voteCount' + message.id, countVotes(poll));
      }
    }

    if (channel === 'endPoll' + message) {
      app.locals.polls[message]['status'] = "closed";
      io.sockets.emit('pollOver' + message);
    }
  });
});

module.exports = app;
