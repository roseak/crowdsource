var socket = io();

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

var currentTally = document.getElementById('current-tally');

socket.on('voteCount', function(votes) {
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
