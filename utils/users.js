let users = [];

// Join user to chat
function userJoin(id, username, drawer, correct, points) {
  const user = { id, username, drawer, correct, points};

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id == id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers() {
  return users;
}

//isDrawer
function isDrawer(){
  for(let i = 0; i < users.length; i++){
    if(users[i].drawer == true){
      return false;
    }
  }
  return true;
}

//newDrawer
function newDrawer(user){
  for(let i =0; i < users.length; i++){
    if(users[i].username == user.username){
      if(users[i+1] != undefined){
        users[i+1].drawer = true;
        //users[i+1].correct = true;
        users[i].drawer = false;
        return users[i+1];
      }
      else if(users[i+1] == undefined && users[0] != users[i]){
        users[0].drawer = true;
        //users[0].correct = true;
        users[i].drawer = false;
        return users[0];
      }
      else{
        return false;
      }
    }
  }
}

//getDrawer
function getDrawer(){
  for(let i = 0; i < users.length; i++){
    if(users[i].drawer == true){
      return users[i];
    }
  }
  return false;
}

//check if all correctly answered
function checkCorrect()
{
  let counter = 0;
  for(let i = 0; i < users.length; i++){
    if(users[i].correct == true || users[i].drawer == true)
    {
      counter++;
    }
  }
  if(counter == users.length)
  {
    return true;
  }
  else{
    return false;
  }
}

//check if all correctly answered omit a user
function checkCorrectWithout(user)
{
  let the_users = users;
  for(let i = 0; i < the_users.length; i++){
    if(the_users[i].username == user.username){
      the_users = the_users.slice(i, 1);
    }
  }
  let counter = 0;
  for(let i = 0; i < the_users.length; i++){
    if(the_users[i].correct == true || the_users[i].drawer == true)
    {
      counter++;
    }
  }
  if(counter == the_users.length)
  {
    return true;
  }
  else{
    return false;
  }
}

//clear correct answers
function clearCorrect(){
  users.forEach(user => {
    user.correct = false;
  });
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  isDrawer,
  newDrawer,
  getDrawer,
  clearCorrect,
  checkCorrect,
  checkCorrectWithout
};