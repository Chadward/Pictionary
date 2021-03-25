const wordList = ['cat', 'dog', 'money', 'north america', 'ocean', 'banana'];

function getWord(){
    return wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();
}

module.exports = { 
    getWord
};