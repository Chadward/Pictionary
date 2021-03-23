const users = [];
let drawer = [];

// Join user to chat
function userJoin(id, username, drawer, correct) {
  const user = { id, username, drawer, correct};

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
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

//getDrawer
function isDrawer(){
  if(drawer.length == 0)
  {
    return true;
  }
  else
  {
    return false;
  } 
}

//setDrawer
function setDrawer(user){
  drawer.push(user);
  //add drawer=true to users array?
}

//newDrawer
function newDrawer(user){
  for(let i =0; i < users.length; i++){
    if(users[i].username == user.username){
      users[i].drawer = false;
      if(users[i+1] != undefined){
        drawer = [];
        drawer = users[i+1];
        users[i+1].drawer = true;
        return drawer;
      }
      else if(users[i+1] == undefined && users[0] != drawer[0]){
        drawer = [];
        drawer = users[0];
        users[0].drawer = true;
        return drawer;
      }
      else{
        drawer = [];
        return drawer;
      }
    }
  }
}

//getDrawer
function getDrawer(){
  return drawer;
}
module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  isDrawer,
  setDrawer,
  newDrawer,
  getDrawer
};