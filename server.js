const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const app = express();
const path = require('path');
const crypto = require('crypto');
const moment = require('moment');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended:true }));

app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('index');
});

app.post('/', function(req, res){
  poll = req.body.poll;
  urlHash(poll);
  var id = poll.id;
  polls[id] = poll;
  res.render('link-show', { poll: poll });
});

app.get('/poll/:id', function(req, res){
  var poll = polls[req.params.id];
  res.render('user-poll', { poll: poll });
});

app.get('/:adminUrl/:id', function(req, res){
  var poll = polls[req.params.id];
  if (poll.adminUrl === req.params.adminUrl) {
    res.render('admin', { poll: poll });
  } else {
    res.send("404");
  }
});

var port = process.env.PORT || 3000;

var server = http.createServer(app)
                 .listen(port, function() {
                   console.log('Listening on port ' + port + '.');
                 });

const io = socketIo(server);

var polls = {}
var votes = {};

var hash_filter = function(hash, test_function) {
  var filtered, key, keys, i;
  keys = Object.keys(hash);
  filtered = {};
  for (i = 0; i < keys.length; i++) {
    key = keys[i];
    if (test_function(hash[key])) {
      filtered[key] = hash[key];
    }
  }
  return filtered;
}

function countVotes(votes, poll) {
  poll.voteCount = {};
  for (var i = 0; i < poll.responses.length; i++) {
    poll.voteCount[poll.responses[i].toUpperCase()] = 0;
  }
  for (var vote in votes) {
    poll.voteCount[votes[vote]] += 1;
  }

  poll.voteCount = hash_filter(poll.voteCount, function(item){ return !isNaN(item) });
  return poll.voteCount
}

function urlHash(poll) {
  poll.id = crypto.createHash('md5').update(poll.question + Date.now()).digest('hex');
  poll.adminUrl = crypto.createHash('md5').update(poll.responses[0] + Date.now()).digest('hex');
  return poll;
}

io.on('connection', function(socket) {
  socket.on('message', function (channel, message) {
    if (channel === 'voteCast' + message.id) {
      var poll = polls[message.id];
      if (poll.endTime) {
        var milTime = moment(poll.endTime).format('x');
        var timeDone = milTime - moment().format('x');
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
        votes[socket.id] = message.vote;
        socket.emit('currentChoice', message.vote);
        io.sockets.emit('voteCount' + message.id, countVotes(votes, poll));
      }
    }

    if (channel === 'endPoll' + message) {
      var poll = polls[message];
      poll.status = "closed";
      io.sockets.emit('pollOver' + message);
    }
  });
})


module.exports = server;
