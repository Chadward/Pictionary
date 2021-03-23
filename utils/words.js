let drawer = '';
const wordList = ['cat', 'dog', 'bear', 'snake', 'chad'];
let correctUsers = [];

function currentDrawer(){
    return drawer;
}

function setDrawer(user){
    drawer = user;
}

function getWord(){
    return Math.floor(Math.random() * wordList.lenght);
}

function addCorrectUser(user){
    correctUsers.push(user);
    return correctUsers;
}

function getCorrectUsers(user){
    return correctUsers;
}

module.exports = { 
    currentDrawer, 
    getWord, 
    setDrawer, 
    addCorrectUser, 
    getCorrectUsers
};