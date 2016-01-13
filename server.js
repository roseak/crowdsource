const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const app = express();
const path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended:true }));

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/admin/*', function(req, res){
  res.sendFile(path.join(__dirname, '/public/admin.html'));
});

app.get('/poll/*', function(req, res){
  res.sendFile(path.join(__dirname, '/public/poll.html'));
});

app.get('/new-poll', function(req, res){
  res.sendFile(path.join(__dirname, '/public/new.html'));
});

var port = process.env.PORT || 3000;

var server = http.createServer(app)
                 .listen(port, function() {
                   console.log('Listening on port ' + port + '.');
                 });

const io = socketIo(server);





module.exports = server;
