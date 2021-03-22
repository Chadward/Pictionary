'use strict';

(function() {
    var socket = io();
    
    var usersList = document.getElementById('usersList')

    //User joining room
        // Get username and room from URL
        const {username} = Qs.parse(location.search, {
        ignoreQueryPrefix: true,
        });
    socket.emit('joinRoom', username);

    // Get users
        // Add users to DOM
    function outputUsers(userss) {
        usersList.innerHTML = '';        
        var user_array = userss.users;         
        user_array.forEach((user) => {
          const li = document.createElement('li');
          li.innerText = user.username;
          usersList.appendChild(li);
        });
    }
    socket.on('roomUsers', (users) => {
        outputUsers(users);
    });

    //Chat

    var messages = document.getElementById('messages');
    var form = document.getElementById('form');
    var input = document.getElementById('input');

    form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
    });

    socket.on('message', function(data) {
    var item = document.createElement('li');
    var strong = document.createElement('strong');
    var main = document.createElement('span');
    var colon = document.createElement('strong');

    switch(data.type) {
        case 0:
          strong.textContent = data.username;
          main.textContent = data.text;
          colon.textContent = ': ';
          item.appendChild(strong);
          item.appendChild(colon);
          item.appendChild(main);
          item.style.color = 'black';
          break;
        case 1:
          strong.textContent = data.text
          item.appendChild(strong);
          item.style.color = 'blue';
          break;
        case 2:
          strong.textContent = data.username;
          main.textContent = data.text;
          item.appendChild(strong);
          item.appendChild(main);
          item.style.color = 'blue';
          break;
        case 3:
          strong.textContent = data.username;
          main.textContent = data.text;
          item.appendChild(strong);
          item.appendChild(main);
          item.style.color = 'red';
          break;
        case 4:
          strong.textContent = data.username;
          var strong2 = document.createElement('strong');
          strong2.textContexnt = data.text;
          item.appendChild(strong);
          item.appendChild(strong2);
          item.style.color = 'lightgreen';
          break;  
        default:
        item.style.color = 'black';
        }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    });

    //Timer
    var time = document.getElementById('time');
    var timer = document.getElementById('timer');

    function startTimer(){
        socket.emit('timer')
    }

    timer.addEventListener("click", startTimer);

    socket.on('counter', function(count){
        if(count < 11){time.style.color = 'red'}
        if(count > 10){time.style.color = ''}
        time.textContent = count;
      });

    //Whiteboard (drawing board)
    var canvas = document.getElementsByClassName('whiteboard')[0];  
    canvas.width = 800;
    canvas.height = 800;

    var colors = document.getElementsByClassName('color');
    var context = canvas.getContext('2d');

    var current = {
        color: 'black'
    };
    var drawing = false;

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
    
            //Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    for (var i = 0; i < colors.length; i++){
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    socket.on('drawing', onDrawingEvent);

    function drawLine(x0, y0, x1, y1, color, emit){
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = 4;
        context.stroke();
        context.closePath();

        if (!emit) { return; }

        socket.emit('drawing', {
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
        color: color
        });
    }

    function onMouseDown(e){
        drawing = true;
        current.x = e.pageX||e.touches[0].pageX;
        current.y = e.pageY||e.touches[0].pageY;
    }

    function onMouseUp(e){
        if (!drawing) { return; }
        drawing = false;
        drawLine(current.x, current.y, e.pageX||e.touches[0].pageX, e.pageY||e.touches[0].pageY, current.color, true);
    }

    function onMouseMove(e){
        if (!drawing) { return; }
        drawLine(current.x, current.y, e.pageX||e.touches[0].pageX, e.pageY||e.touches[0].pageY, current.color, true);
        current.x = e.pageX||e.touches[0].pageX;
        current.y = e.pageY||e.touches[0].pageY;
    }

    function onColorUpdate(e){
        current.color = e.target.className.split(' ')[1];
    }

            // limit the number of events per second
    function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function() {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
        };
    }

    function onDrawingEvent(data){
        drawLine(data.x0, data.y0, data.x1, data.y1, data.color);
    }
})();