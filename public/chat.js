'use strict';

(function() {
    var socket = io();
    var my_username = '';
    
    //inactivity remove (40 minutes => sweden by C418)
    var inactivityTime = function () {
        var lime;
        window.onload = resetTimer;
        // DOM Events
        document.onmousemove = resetTimer;
        document.onkeypress = resetTimer;
    
        function logout() {
            socket.disconnect();
            window.location.href = "https://open.spotify.com/track/4NsPgRYUdHu2Q5JRNgXYU5?si=5GfxX9CCS3qQK0FJ-wzNQg";
        }
    
        function resetTimer() {
            clearTimeout(lime);
            lime = setTimeout(logout, 1000000)
            // 1000 milliseconds = 1 second
        }
    };

    window.onload = function() {
        inactivityTime(); 
      }

    var usersList = document.getElementById('usersList')

        //Whiteboard (drawing board)
        var canvas = document.getElementsByClassName('whiteboard')[0];
        canvas.width = 500;
        canvas.height = 500;

        var colors = document.getElementsByClassName('color');
        var context = canvas.getContext('2d');
    
        var current = {
            color: 'black'
        };
        var drawing = false;
    
        socket.on('drawing', onDrawingEvent);
        function drawLine(x0, y0, x1, y1, color, emit){
            context.beginPath();
            context.moveTo(x0 - canvas.offsetLeft, y0 - canvas.offsetTop);
            context.lineTo(x1 - canvas.offsetLeft, y1 - canvas.offsetTop);
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
            e.preventDefault()
            drawing = true;
            current.x = e.pageX ||e.touches[0].pageX;
            current.y = e.pageY||e.touches[0].pageY;
        }
    
        function onMouseUp(e){
            if (!drawing) { return; }
            e.preventDefault()
            drawing = false;
            drawLine(current.x, current.y, e.pageX||e.touches[0].pageX, e.pageY||e.touches[0].pageY, current.color, true);
        }
    
        function onMouseMove(e){
            if (!drawing) { return; }
            e.preventDefault()
            drawLine(current.x, current.y, e.pageX||e.touches[0].pageX, e.pageY||e.touches[0].pageY, current.color, true);
            current.x = e.pageX||e.touches[0].pageX;
            current.y = e.pageY||e.touches[0].pageY;
        }
    
        function onColorUpdate(e){
            for (var i = 0; i < colors.length; i++){
                colors[i].style.borderStyle = 'none';
                colors[i].style.borderColor = '#022c43';
            }
            if(e.target.className.split(' ')[1] == 'clear')
            {
                socket.emit('clear');
            }
            else
            {
                for (var i = 0; i < colors.length; i++){
                    if(e.target.className == colors[i].className) {
                    colors[i].style.borderStyle = 'solid';
                    colors[i].style.borderWidth = '5px';
                    if(e.target.className == 'color black') {
                        colors[i].style.borderColor = 'red';
                    }
                    }
                }
                current.color = e.target.className.split(' ')[1];
            }

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

        //clear canvas
        socket.on('clear all', () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
        })

    //User joining room
        // Get username and room from URL
        const {username} = Qs.parse(location.search, {
        ignoreQueryPrefix: true,
        });
        my_username = username;
    socket.emit('joinRoom', username);

    // Get users
        // Add users to DOM
    function outputUsers(userss) {
        usersList.innerHTML = '';        
        var user_array = userss.users;
        user_array.sort(function(a, b) {
            return b.points - a.points;
        });

        user_array.forEach((user) => {
          const li = document.createElement('li');
          li.style.borderStyle = 'solid';
          li.style.borderColor = '#022c43';
          li.style.backgroundColor = '#115173';
          li.style.color = 'black';
          li.style.listStyleType = 'none';
          li.style.borderWidth = '4px'
          li.style.height = '50px';
          li.style.padding = '10px';
          li.style.margin = '4px';
          li.style.maxWidth = '250px';
          if(user.username == my_username){
            var strong = document.createElement('strong');
            var strong2 = document.createElement('strong');
            strong.textContent = user.username;
            strong.style.color = '#ffd700';
            li.appendChild(strong);
            strong2.textContent += '\t' + user.points;
            li.appendChild(strong2);
          }
          else{
            //li.innerText = user.username + '\t' + user.points;
            var strong = document.createElement('strong');
            var strong2 = document.createElement('strong');
            strong.textContent = user.username;
            li.appendChild(strong);
            strong2.textContent += '\t' + user.points;
            li.appendChild(strong2);
          }
          if(user.correct == true){li.style.backgroundColor = 'green'; li.style.borderColor = '#022c43';}
          if(user.drawer == true){ li.style.color = 'black'; li.style.borderColor = '#ffd700';}
          usersList.appendChild(li);
        });
    }
    socket.on('roomUsers', (users) => {
        outputUsers(users);
    });
    
    //setting drawer
    socket.on('drawer', (words) => {
        var word = document.getElementById('word');
        var timer = document.getElementById('timer');
        var input = document.getElementById('input');
        input.style.display = 'none';
        timer.style.display = 'flex';
        word.style.display = 'flex';
        word.innerText = '';
        word.innerText = words;

        for (var i = 0; i < colors.length; i++){
            colors[i].addEventListener('click', onColorUpdate, false);
        }

        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('mouseout', onMouseUp, false);
        canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
        
                //Touch support for mobile devices
        canvas.addEventListener('touchstart', onMouseDown, false);
        canvas.addEventListener('touchend', onMouseUp, false);
        canvas.addEventListener('touchcancel', onMouseUp, false);
        canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);
    });

    socket.on('modal display', (data) => {
        if(data.user == my_username){
            modal.style.display = "block";
            modalContent.innerText = data.word;
            }
        });

    socket.on('set permissions', function(){
        socket.emit('permission');
    })

    //remove drawer
    socket.on('not drawer', (data) => {
        var words = data.word;
        var drawer = data.drawer;
        for (var i = 0; i < colors.length; i++){
            colors[i].removeEventListener('click', onColorUpdate, false);
        }

        drawing = false;

        canvas.removeEventListener('mousedown', onMouseDown, false);
        canvas.removeEventListener('mouseup', onMouseUp, false);
        canvas.removeEventListener('mouseout', onMouseUp, false);
        canvas.removeEventListener('mousemove', throttle(onMouseMove, 10), false);
        
                //Touch support for mobile devices
        canvas.removeEventListener('touchstart', onMouseDown, false);
        canvas.removeEventListener('touchend', onMouseUp, false);
        canvas.removeEventListener('touchcancel', onMouseUp, false);
        canvas.removeEventListener('touchmove', throttle(onMouseMove, 10), false);

        var word = document.getElementById('word');
        var timer = document.getElementById('timer');
        var span = document.createElement('span');
        var input = document.getElementById('input');
        input.style.display = 'flex';
        timer.style.display = 'none';
        word.innerText = '';

        span.textContent = "Waiting on " + drawer + " to start new round!"
        word.appendChild(span);
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
          item.style.color = '#ffd700';
          break;
        case 2:
          strong.textContent = data.username;
          main.textContent = data.text;
          item.appendChild(strong);
          item.appendChild(main);
          item.style.color = '#ffd700';
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
            main.textContent = data.text;
            item.appendChild(strong);
            item.appendChild(main);
            item.style.color = '#39FF14';
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
        socket.emit('timer');
        socket.emit('clear');
        modal.style.display = 'none';
    }

    timer.addEventListener("click", startTimer);

    socket.on('counter', function(count){
        if(count < 11){time.style.color = 'red'}
        if(count > 10){time.style.color = '#ffd700'}
        time.textContent = count;
      });
    
    //Hint
    socket.on('hint', (update) => {
        var word = document.getElementById('word');
        var span = document.createElement('span');
        var hints = update.hintIndex;
        var theWord = update.theWord;
        var counter = update.counter;
        switch(theWord.length){
            case 2:
            case 3:
            case 4:
            if(counter == 60){
                for(let i = 0; i < theWord.length; i++){
                    if(theWord[i] == ' '){
                        span.textContent += "\u00A0" + "\u00A0";
                    }
                    else{
                    span.textContent += '_ ';
                    }
                }
                word.innerText = '';
                word.appendChild(span);
            }
            if(counter == 25){
                word.innerText = '';
                for(let i = 1; i <= theWord.length; i++){
                    if(hints.includes(i)){
                        span.textContent += theWord[i - 1] + ' ';
                    }
                    else if(theWord[i - 1] == ' '){
                        span.textContent += "\u00A0" + "\u00A0";
                    }
                    else{
                        span.textContent += '_ ';
                    }
                }
                word.appendChild(span);
            }
          break;
            case 5:
            case 6:
            case 7:
            if(counter == 60){
                for(let i = 0; i < theWord.length; i++){
                    if(theWord[i] == ' '){
                        span.textContent += "\u00A0" + "\u00A0";
                    }
                    else{
                    span.textContent += '_ ';
                    }
                }
                word.innerText = '';
                word.appendChild(span);
            }
            if(counter == 35 || counter == 20){
                word.innerText = '';
                for(let i = 1; i <= theWord.length; i++){
                    if(hints.includes(i)){
                        span.textContent += theWord[i - 1] + ' ';
                    }
                    else if(theWord[i - 1] == ' '){
                        span.textContent += "\u00A0" + "\u00A0";
                    }
                    else{
                        span.textContent += '_ ';
                    }
                }
                word.appendChild(span);
            }
          break;
        default:
            if(counter == 60){
                for(let i = 0; i < theWord.length; i++){
                    if(theWord[i] == ' '){
                        span.textContent += "\u00A0" + "\u00A0";
                    }
                    else{
                    span.textContent += '_ ';
                    }
                }
                word.innerText = '';
                word.appendChild(span);
            }
            if(counter == 40 || counter == 27 || counter == 15){
                word.innerText = '';
                for(let i = 1; i <= theWord.length; i++){
                    if(hints.includes(i)){
                        span.textContent += theWord[i - 1] + ' ';
                    }
                    else if(theWord[i - 1] == ' '){
                        span.textContent += "\u00A0" + "\u00A0";
                    }
                    else{
                        span.textContent += '_ ';
                    }
                }
                word.appendChild(span);
            }
        }
    })

    //MODAL LOGIC
        var modalContent = document.getElementById('modalContent');
        var modal = document.getElementById("myModal");

        var modal2 = document.getElementById("myModal2")
        var modalContent2 = document.getElementById('modalContent2');

        socket.on('modal', (data) => {
            var word = data.word;

            modal2.style.display = "block";
            modalContent2.innerText = word;
            setTimeout(function(){modal2.style.display = "none"}, 2500);
        })

})();