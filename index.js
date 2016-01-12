const express = require('express');
const app = express();
const http = require('http').Server(app);

const path = require('path');

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

http.listen(process.env.PORT || 3000, function(){
  console.log('Your server is up and running on Port 3000. Good job!');
});
