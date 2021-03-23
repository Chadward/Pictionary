const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    isDrawer,
    setDrawer,
    newDrawer,
    getDrawer
  } = require('./utils/users');

const { 
  currentDrawer, 
  getWord,  
  addCorrectUser, 
  getCorrectUsers
} = require('./utils/words');
  
const { userMessage } = require('./utils/messages');

var timer = 10

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){

    //add user to user array
    socket.on('joinRoom', (username) => {
        //set a drawer
        let user = null;   
        //console.log(isDrawer());
        if(isDrawer())
        {
          user = userJoin(socket.id, username, true, false);
          setDrawer(user);
          socket.emit('drawer', user);
        }
        else{
          user = userJoin(socket.id, username, false, false);
        }
        //Send users info
        io.emit('roomUsers', {
            users: getRoomUsers()
        });
        socket.emit('message', userMessage(false, "Welcome to unending pain!", 1));
        socket.broadcast.emit('message', userMessage(user.username, " has entered the depression!", 2));
  });

  //chatroom
  socket.on('chat message', msg => {
    const user = getCurrentUser(socket.id);
    io.emit('message', userMessage(user.username, msg, 0));
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
          // io.emit('counter', "Times Up");
          timer = 10;
          clearInterval(WinnerCountdown);

        }
      }, 1000);
    })

    //update permissions
    socket.on('permission', () => {
      const user = getCurrentUser(socket.id);
      if(user.drawer == true){
          socket.emit('drawer');
      }
    })

    //client disconnect
    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id);
        if(user){
          if(user.drawer == true){
            const newDraw = newDrawer(user);
            io.emit('set permissions');
          }
          userLeave(socket.id);
          socket.broadcast.emit('message', userMessage(user.username, " has exited the depression!", 3));

          // Send users and room info
          io.emit('roomUsers', {
            users: getRoomUsers()
          });
        }
      });

})

http.listen(port, () => console.log('listening on port ' + port));