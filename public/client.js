var socket = io();
var adminSocket = io('/admin/:id');
var pollId = window.location.pathname.split('/')[2];

function addInput(element) {
  var newInput = document.createElement('div');
  newInput.innerHTML = "<input type='text' placeholder='enter option' class='poll-response' name='poll[responses][]'>"
  document.getElementById(element).appendChild(newInput);
}

var buttons = document.querySelectorAll('#choices button')

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    socket.send('voteCast' + this.id, { vote: this.innerText, id: this.id });
  })
}

var endButton = document.getElementById('close-button');
var pollClosed = document.getElementById('close-poll');

if(endButton) {
  endButton.addEventListener('click', function() {
    socket.send('endPoll' + pollId, pollId);
  });
}

socket.on('pollOver' + pollId, function() {
  pollClosed.innerText = "Poll is now closed!";
});

var currentTally = document.getElementById('current-tally');

socket.on('voteCount' + pollId, function(votes) {
  var result = "";
  for (var choice in votes) {
    result += choice + ": " + votes[choice] + " ";
  }
  currentTally.innerText = "Vote Results: " + result;
});

var currentChoice = document.getElementById('current-choice');

socket.on('currentChoice', function(message) {
  currentChoice.innerText = "Your current vote is for " + message;
});
