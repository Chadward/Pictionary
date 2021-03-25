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
    newDrawer,
    getDrawer,
    clearCorrect,
    checkCorrect
  } = require('./utils/users');

const { 
  getWord
} = require('./utils/words');
  
const { userMessage } = require('./utils/messages');

var timer = 45;
var word = '';
var hintIndex = [];

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){

    //add user to user array
    socket.on('joinRoom', (username) => {
        //set a drawer
        let user = null;
        if(isDrawer())
        {
          user = userJoin(socket.id, username, true, false);
          //socket.emit('drawer', user);
          word = getWord();
          io.emit('set permissions');
        }
        else{
          user = userJoin(socket.id, username, false, false);
          io.emit('set permissions');
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
    if(user){
    if(msg.toLowerCase() == word){
      io.emit('message', userMessage(user.username, " guessed the word!", 4));
      user.correct = true;
          if(checkCorrect()){
              const drawer = getDrawer();
              const newDraw = newDrawer(drawer);
              word = getWord();
              clearCorrect();
              io.emit('set permissions');
              io.emit('roomUsers', {
                users: getRoomUsers()
              });
          } else {
          io.emit('roomUsers', {
            users: getRoomUsers()
          });
        }
    } else {
      io.emit('message', userMessage(user.username, msg, 0));
    }
  }
  });

  //whiteboard connection
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

    //room drawing/guess timer
    socket.on('timer', () => {
      var counter = 45;
      clearInterval(WinnerCountdown);
      timer = 45;
      var WinnerCountdown = setInterval(function(){
      if(timer == 'left early'){
          timer = 45;
          hintIndex = [];
          clearInterval(WinnerCountdown)
          io.emit('counter', timer);
      } else {
          let selected = '';
          switch(word.length){
              case 2:
              case 3:
              case 4:
              if(counter == 25){
                  while(hintIndex.includes(selected) || selected == '' || word[selected - 1] == ' ')
                  {
                      selected = Math.floor(Math.random() * Math.floor(word.length)) + 1;
                  }
                  hintIndex.push(selected);
                }
              break;

              case 5:
              case 6:
              case 7:
              if(counter == 35 || counter == 20){
                  while(hintIndex.includes(selected) || selected == '' || word[selected - 1] == ' ')
                  {
                      selected = Math.floor(Math.random() * Math.floor(word.length)) + 1;
                  }
                  hintIndex.push(selected);
                }
              break;
              
              default:
                  if(counter == 40 || counter == 27 || counter == 15){
                      while(hintIndex.includes(selected) || selected == '' || word[selected - 1] == ' ')
                      {
                          selected = Math.floor(Math.random() * Math.floor(word.length)) + 1;
                      }
                      hintIndex.push(selected);
                    }
                  break;
          }
        socket.broadcast.emit('hint', { counter, theWord: word, hintIndex})
        io.emit('counter', counter);
        counter--;
        timer = counter;
        if (counter == -1) {  
          hintIndex = [];
          io.emit('counter', "Times Up");
          timer = 45;
          clearInterval(WinnerCountdown);
          const user = getCurrentUser(socket.id);
          if(user.drawer == true){
            const newDraw = newDrawer(user);
            word = getWord();
            io.emit('set permissions');
            io.emit('roomUsers', {
              users: getRoomUsers()
            });
          }
        }
      }
    }, 500); // set to 1000
    })

    //update hint
    socket.on('push hint', (selected) => {
      hintIndex.push(selected);
    })

    //update permissions
    socket.on('permission', () => {
      // clearCorrect();
      const user = getCurrentUser(socket.id);
      if(user){
        if(user.drawer == true){
            socket.emit('drawer', word);
        }
        else{
          socket.emit('not drawer', word);
        }
      }
    })

    //client disconnect
    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id);
        if(user){
          if(user.drawer == true){
            const newDraw = newDrawer(user);
            word = getWord();
            io.emit('set permissions');
            timer = 'left early';
            //setTimeout(function(){ timer = 45;}, 100);
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