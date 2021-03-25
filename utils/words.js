const wordList = ['jew', 'non jew'];

function getWord(){
    return wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();
}

module.exports = { 
    getWord
};