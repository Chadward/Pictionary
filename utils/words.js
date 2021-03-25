const wordList = ['cat', 'dog', 'bear', 'snake', 'chad'];

function getWord(){
    return wordList[Math.floor(Math.random() * wordList.length)];
}

module.exports = { 
    getWord
};