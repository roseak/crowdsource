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
  res.send("<div><a href='/" + poll.adminUrl + "/" + poll.id + "'>Admin URL</a><br><a href='/poll/" + poll.id + "'>Poll URL</a></div>");
});

app.get('/new', function(req, res){
  res.sendFile(path.join(__dirname, '/public/new.html'));
});

app.get('/admin/*', function(req, res){
  res.sendFile(path.join(__dirname, '/public/admin.html'));
});

app.get('/poll/:id', function(req, res){
  var poll = polls[req.params.id];
  res.render('user-poll', { poll: poll });
});

var port = process.env.PORT || 3000;

var server = http.createServer(app)
                 .listen(port, function() {
                   console.log('Listening on port ' + port + '.');
                 });

const io = socketIo(server);

function urlHash(poll) {
  poll.id = crypto.createHash('md5').update(poll.question + Date.now()).digest('hex');
  poll.adminUrl = crypto.createHash('md5').update(poll.responses[0] + Date.now()).digest('hex');
  return poll;
}


module.exports = server;