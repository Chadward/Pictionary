const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./utils/users');

var timer = 15

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){

    //add user to user array
    socket.on('joinRoom', (username) => {
        const user = userJoin(socket.id, username)
        //Send users info
        io.emit('roomUsers', {
            users: getRoomUsers()
        });
  });
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

    //client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
    
        if (user) {
        //   io.to(user.room).emit(
        //     'message',
        //     formatMessage(botName, `${user.username} has left the chat`)
        //   );
    
          // Send users and room info
          io.emit('roomUsers', {
            users: getRoomUsers()
          });
        }
      });

})

http.listen(port, () => console.log('listening on port ' + port));