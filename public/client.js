var socket = io();
var adminSocket = io('/admin/:id');
var pollId = window.location.pathname.split('/')[2];
var buttons = document.querySelectorAll('#choices button')
var endButton = document.getElementById('close-button');
var pollClosed = document.getElementById('close-poll');
var currentTally = document.getElementById('current-tally');
var currentChoice = document.getElementById('current-choice');

function addInput(element) {
  var newInput = document.createElement('div');
  newInput.innerHTML = "<input type='text' placeholder='enter option' class='poll-response' name='poll[responses][]'>"
  document.getElementById(element).appendChild(newInput);
}

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    socket.send('voteCast' + this.id, { vote: this.innerText, id: this.id });
  })
}

if (endButton) {
  endButton.addEventListener('click', function() {
    socket.send('endPoll' + pollId, pollId);
  });
}

socket.on('pollOver' + pollId, function() {
  pollClosed.innerText = "Poll is now closed!";
});

socket.on('voteCount' + pollId, function(votes) {
  var result = "";
  for (var choice in votes) {
    result += "<tr><td>" + choice + "</td><td>" + votes[choice] + "</td></tr>";
  }
  currentTally.innerHTML = "<h5>Vote Results</h5> \n\n<table class='highlight'><thead>"
    + "<tr><th>Choice</th><th>Votes</th></tr></thead><tbody>" + result + "</tbody></table>";
});

socket.on('currentChoice', function(message) {
  currentChoice.innerText = "Your current vote is for " + message;
});
