const wordList = ['among us', 'imposter', 'america', 'britain', 'weeb', 'John F Kennedy', 'Samurai', 'Ninja', 'Viking', 'Knight', 'Jew', 'Darth Vader', 'Magic', 'Bowling', 'porn', 'shitting in the tall grass', 'amazonian thigns', 'death star', 'thanos', 'baby yoda', 'praise the sun', 'dead by daylight', 'benis', 'bussy', 'communist superman', 'bully maguire', 'amish', 'hoes mad', 'pirates', 'confederate states of america', 'colonialism', 'facism', 'censorship', 'hebrew hot dog', 'torah', 'bible', 'quran', 'buddha', 'nationalism', 'subjective', 'nazi', 'adolf hitler'];

function getWord(){
    return wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();
}

module.exports = { 
    getWord
};