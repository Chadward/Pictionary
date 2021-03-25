const wordList = ['cats ssss', 'chad d', 'in n' , 'in', 'seven'];

function getWord(){
    return wordList[Math.floor(Math.random() * wordList.length)];
}

module.exports = { 
    getWord
};