const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const app = express();
const path = require('path');
const crypto = require('crypto');

const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
var polls = {}

app.use(bodyParser.urlencoded({ extended:true }));

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '/views/index.html'));
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
  console.log(poll)
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

  return hash_filter(poll.voteCount, function(item){ return !isNaN(item) });
}

function urlHash(poll) {
  poll.id = crypto.createHash('md5').update(poll.question + Date.now()).digest('hex');
  poll.adminUrl = crypto.createHash('md5').update(poll.responses[0] + Date.now()).digest('hex');
  return poll;
}

io.on('connection', function(socket) {
  socket.on('message', function (channel, message) {
    if (channel === 'voteCast' + message.id) {
      votes[socket.id] = message.vote;
      var poll = polls[message.id];
      socket.emit('currentChoice', message.vote);
      io.sockets.emit('voteCount' + message.id, countVotes(votes, poll));
    }
  });
})

module.exports = server;
