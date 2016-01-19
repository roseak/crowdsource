function countVotes(poll) {
  poll.voteTally = {};
  for (var i = 0; i < poll.responses.length; i++) {
    poll.voteTally[poll.responses[i].toUpperCase()] = 0;
  }
  for (var vote in poll.votes) {
    poll.voteTally[poll.votes[vote]] += 1;
  }
  poll.voteTally = hash_filter(poll.voteTally, function(item){ return !isNaN(item) });
  return poll.voteTally
}

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

module.exports = countVotes;
