const wordList = ['cat', 'dog', 'bear', 'snake', 'chad'];

function getWord(){
    return Math.floor(Math.random() * wordList.lenght);
}

module.exports = { 
    getWord
};