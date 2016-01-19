const moment = require('moment');

function endConfigure(poll) {
  var milTime = moment(poll.endTime).format('x');
  var timeDone = milTime - moment().format('x');
    poll.displayTime = moment(poll.endTime).fromNow();
  setTimeout(function(){
    poll.status = "closed";
    io.sockets.emit('pollOver' + poll.id)
  }, timeDone);
};

module.exports = endConfigure;
