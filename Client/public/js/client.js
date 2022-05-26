let username;
let displayPlanets =true;
let displayStars=true;
let displayTransparency=true;
let displayEffects=true;
let displayParticles=true;
let mobile=true;
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



// Bouton pour ouvrir les paramètres
$("#buttonSettings").on("click", () => {
  if ($("#settingsPanel").css('display') == 'none') {
    $("#settingsPanel").css('display', 'block');
  }
  else {
    $("#settingsPanel").css('display', 'none');
  }
});

// Bouton pour fermer les paramètres
$("#closeButtonSettings").on("click", () => {
  $("#settingsPanel").css('display', 'none');
});
$("#buttonControle").on("click", () => {
  $("#buttonControle").css('color', '#A3ACB7');
  $("#buttonOption").css('color', '#E9E4C6');
  $("#buttonSelected").css('float', 'none');
  $("#divControle").css('display', 'block');
  $("#divOption").css('display', 'none');
});
$("#buttonOption").on("click", () => { 
  $("#buttonControle").css('color', '#E9E4C6');
  $("#buttonSelected").css('float', 'right');
  $("#buttonOption").css('color', '#A3ACB7');
  $("#divControle").css('display', 'none');
  $("#divOption").css('display', 'block');
});

function updateValue(id, value) {
  document.getElementById(id).innerHTML = value;
}

window.onload = ()=>{
  init();
}


function play(){
  mobile = document.getElementById("mobile").checked;
  displayPlanets = document.getElementById("planets").checked;
  displayStars = document.getElementById("stars").checked;
  displayTransparency = document.getElementById("transparency").checked;
  displayEffects = document.getElementById("effects").checked;
  displayParticles = document.getElementById("particles").checked;
  //console.log(displayPlanets,displayStars,displayTransparency,displayEffects)
  document.getElementById("HOME").style.display = "none";
  document.getElementById("userList").style.display = "block";
  document.getElementById("LOADING").style.display = "block";
  document.getElementById("READY").style.display = "none";
  document.getElementById("WAITING").style.display = "none";
  document.getElementById("GAME").style.display = "none";
  document.getElementById("left").style.display = "none";
  document.getElementById("right").style.display = "none";
  
}

function init() {

  // initialize socket.io client-side
  const search = window.location.search; // returns the URL query String
  const params = new URLSearchParams(search);
  let lobby = params.get('lobby'); 
  username =  params.get('username')

  socket = io.connect('https://server-star-fever.herokuapp.com/lobby'+lobby, { transports: ['websocket'], upgrade:false });

  conversation = document.querySelector("#conversation");
  data = document.querySelector("#data");
  datasend = document.querySelector("#datasend");
  users = document.getElementById("users");

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
  if(message !== ""){
    socket.emit("sendchat", message);
  }
  // tell server to execute 'sendchat' and send along one parameter
  
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
    console.log('2222 appel updatePlayers avec :', newPlayer)
     updatePlayers(newPlayer);
  });
  socket.on("updatePlayersAfterDead", (newPlayer) => {
    console.log('33 recu avec :', newPlayer)
    for(player in newPlayer){
      console.log('3333 appel updatePlayers avec :', newPlayer[player])
      updatePlayers(newPlayer[player]);
    } 
   
  });
  socket.on("destructWall", (usernameWall,wallName) => {
    console.log(wallName)
    if(usernameWall!==username){
      destroyWallEnnemi(wallName);
    }
    
  });


  // un mur est a construire
  socket.on("updateWall", (wall) => {
    updateWall(wall);
  });

  // supprimer un tron car déconnexion d'un joueur
  socket.on("disposeTron", (data) =>{
    deleteTron(data);
  });

  // listener, whenever the server emits 'updatechat', this updates the chat body
  socket.on("updatechat", (username, data) => {
    let chatMessage = "<b>" + username + ":</b> " + data + "<br>";
    conversation.innerHTML += chatMessage;
    conversation.scrollTop = conversation.scrollHeight;
  });

  let colors = ["red","green","blue","yellow"]
  // listener, whenever the server emits 'updateusers', this updates the username list
  socket.on("updateusers", (listOfUsers) => {
    users.innerHTML = "";
    console.log(listOfUsers)
    
    for( let id = 0 ; id<4;id++ ) {
      if(listOfUsers[id] !== ""){
        let color = colors[id];
        let userLineOfHTML = document.createElement("div")
        userLineOfHTML.innerHTML = listOfUsers[id]
        userLineOfHTML.style.color = color;
        users.appendChild(userLineOfHTML)
      }
     
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
