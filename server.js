const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

var timer = 15

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){

    //whiteboard connection
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));


    //room drawing/guess timer
    socket.on('timer', () => {
        var counter = timer;
        var WinnerCountdown = setInterval(function(){
        io.emit('counter', counter);
        counter--
        timer = counter;
        if (counter === 0) {  
          io.emit('counter', "Times Up");
          timer = 15;
          clearInterval(WinnerCountdown);
        }
      }, 1000);
    })

})

http.listen(port, () => console.log('listening on port ' + port));