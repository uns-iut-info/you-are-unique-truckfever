let username;
let displayPlanets;
let displayStars;
let displayTransparency;
let displayEffects;
let displayParticles;
let mobile;
let conversation, data, datasend, users;
let fullScreen = false;
let artificialLatencyDelay = 10;
let socket;
let chat = false;
// on load of page
//window.onload = init();

function displayChat(){
  if(chat){
    document.getElementById("chatMessages").style.display = "none";
    chat=false;
  }else{
    document.getElementById("chatMessages").style.display = "block";
    chat=true;
  }
}


// Listener Fullscreen
$("#buttonFullscreen").on("click", () => {
  console.log("la");
  if(!fullScreen){
    document.body.requestFullscreen();
    fullScreen = true
    $("#buttonFullscreen").attr("id", "buttonMinimisedscreen");
  }else{
    document.exitFullscreen();
    fullScreen = false;
    $("#buttonMinimisedscreen").attr("id", "buttonFullscreen");
  }
});


function getUsername(){
  username = document.getElementById("username").value;
  mobile = document.getElementById("mobile").checked;
  displayPlanets = document.getElementById("planets").checked;
  displayStars = document.getElementById("stars").checked;
  displayTransparency = document.getElementById("transparency").checked;
  displayEffects = document.getElementById("effects").checked;
  displayParticles = document.getElementById("particles").checked;
  //console.log(displayPlanets,displayStars,displayTransparency,displayEffects)
  if(username==""){
    alert("Veuillez entrer un pseudo :) !");
  }else{
    init();
  }
}

function init() {

  // initialize socket.io client-side
  socket = io.connect('https://server-star-fever.herokuapp.com/', { transports: ['websocket'], upgrade:false });
  conversation = document.querySelector("#conversation");
  data = document.querySelector("#data");
  datasend = document.querySelector("#datasend");
  users = document.querySelector("#users");

 // Listener for send button
 datasend.onclick = (evt) => {
  sendMessage();
};


// detect if enter key pressed in the input field
data.onkeypress = (evt) => {
  // if pressed ENTER, then send
  if (evt.keyCode == 13) {
    this.blur();
    sendMessage();
  }
};

// sends the chat message to the server
function sendMessage() {
  let message = data.value;
  data.value = "";
  // tell server to execute 'sendchat' and send along one parameter
  socket.emit("sendchat", message);
}
  
  // on connection to server, ask for user's name with an anonymous callback
  socket.on("connect", () => {
    clientStartTimeAtConnection = Date.now();
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    while(username==undefined){}
    socket.emit("adduser", username);
  });



  // update the whole list of players, useful when a player
  // connects or disconnects, we must update the whole list
  socket.on("updatePlayers", (newPlayer) => {
     updatePlayers(newPlayer);
  });

  // un mur est a construire
  socket.on("updateWall", (wall) => {
    updateWall(wall);
  });

  // supprimer un tron car déconnexion d'un joueur
  socket.on("disposeTron", (data) =>{
    deleteTron(data.username);
  });

  // listener, whenever the server emits 'updatechat', this updates the chat body
  socket.on("updatechat", (username, data) => {
    let chatMessage = "<b>" + username + ":</b> " + data + "<br>";
    conversation.innerHTML += chatMessage;
  });

  // listener, whenever the server emits 'updateusers', this updates the username list
  socket.on("updateusers", (listOfUsers) => {
    users.innerHTML = "";
    for (let name in listOfUsers) {
      let userLineOfHTML = "<div>" + name + "</div>";
      users.innerHTML += userLineOfHTML;
    }
  });

  // update la position d'un joueur
  socket.on("updatePos",  (newPos) => {
     updatePlayerNewPos(newPos);
    //console.log(newPos);
  });

  // un bonus est à remplacer
  socket.on("sendBonus", (unBonus) => {
    replaceBonus(unBonus);
    //console.log(newPos);
  });

  // demande du serveur à mettre "READY"
  socket.on("getReady", () => {
    getReady();
  });

  // début de la game dans X secondes
  socket.on("starting", (startTime) => {
    starting(startTime);
  });

  // instanciation de la partie
  socket.on("startGame",(name) =>{
    if(username == name){
      document.getElementById("HOME").style.display = "none";
      document.getElementById("userList").style.display = "block";
      document.getElementById("LOADING").style.display = "block";
      document.getElementById("READY").style.display = "none";
      document.getElementById("WAITING").style.display = "none";
      document.getElementById("GAME").style.display = "none";
      document.getElementById("left").style.display = "none";
      document.getElementById("right").style.display = "none";
      startGame();
    }
  });
}

// PERMET D'ENVOYER SUR WEBSOCKET 
function send(typeOfMessage, data) {
  setTimeout(() => {
      socket.emit(typeOfMessage, data)
  }, artificialLatencyDelay);
}
