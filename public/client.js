var socket = io();

function addInput(element) {
  var newInput = document.createElement('div');
  newInput.innerHTML = "<input type='text' placeholder='enter option' class='poll-response' name='poll[responses][]'>"
  document.getElementById(element).appendChild(newInput);
}
