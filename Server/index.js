let playersPosStart = [{'x' : 190, 'z' :0, 'orientation' : -Math.PI/2,'color':0},{'x' : 0, 'z' :190, 'orientation' : Math.PI,'color':1},{'x' : -190, 'z' :0, 'orientation' : Math.PI/2,'color':2},{'x' : 0, 'z' :-190, 'orientation' : 0,'color':3}]
let nbLobby =  4 ;
class Player {
    constructor(id, name) {
        this.x = playersPosStart[id].x;
        this.y = 3;
		this.z = playersPosStart[id].z;
		this.orientation = playersPosStart[id].orientation;
		this.id = id;
        this.username = name;
		this.points = 0;
		this.color = playersPosStart[id].color;
    }
}
var playerByLobby =[]
const setIOserver = async (lobby) => {
	const ioLobby = io.of("/lobby"+lobby)
	// Datas du serveur pour la gestion de la partie et des connexions 
	let playerNames = ["","","",""];
	let slot0,slot1,slot2,slot3 = false;
	let numbPlayer = 0;
	let nbPlayerConnected = 0;
	let listOfPlayers = {};
	let nbWall =0;
	let bonus = [];
	let time =Date.now();
	let oldTime = time;
	let calculHeartbeat = 20;
	let gameRestarting = true ;
	let playersReady = 0;
	let playerInGame = 0;
	
	console.log("/lobby"+lobby+" created")
	playerByLobby.push("0")
	
	
	
	// LES CONNEXIONS ET ENVOIS DE DONNEES AUX CLIENTS
	ioLobby.on('connection', (socket) => {
		// RECUPERE LES POSITIONS ET LES REENVOIS AUX JOUEURS
		socket.on('sendpos', (data) => {
			ioLobby.emit('updatePos', {"username" : data.username , 'x':data.x , 'y' : data.y , 'z':data.z,'rotationx' : data.rotationx, 'rotationy' : data.rotationy,'rotationz' : data.rotationz,'color' : data.color });
		});
	
		// RECUPERE UN MUR ET LE REENVOI AUX JOUEURS
		socket.on('wall', (data) => {
			nbWall ++;
			ioLobby.emit('updateWall', data);
		});
	
		// RECUPERE LE BONUS A RECREER
		socket.on('deleteBonus', (i) => {
			deleteBonus(i);
		});
	
	
		// AJOUTE UN JOUEUR ET ENVOIS SES DATAS AUX AUTRES CLIENTS
		socket.on('adduser', (username) => {
			if(nbPlayerConnected<4){
				socket.username = username;
				console.log(lobby + ': ', socket.username ,' has connected !')
				
				socket.emit('updatechat', 'SERVER', 'you have connected');
				socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
				let player;
				if(!slot0){
					player = new Player(0,username);
					playerNames[0] = username;
					ioLobby.emit('updateusers', playerNames);
					slot0 = true
				}else if(!slot1){
					player = new Player(1,username);
					playerNames[1] = username;
					ioLobby.emit('updateusers', playerNames);
					slot1 = true
				}else if(!slot2){
					player = new Player(2,username);
					playerNames[2] = username;
					ioLobby.emit('updateusers', playerNames);
					slot2 = true
				}else if(!slot3){
					player = new Player(3,username);
					playerNames[3] = username;
					ioLobby.emit('updateusers', playerNames);
					slot3 = true
				}
				
				nbPlayerConnected ++;
				playerByLobby[lobby] = nbPlayerConnected
				listOfPlayers[username] = player;
				createAllBonus();
				ioLobby.emit('startGame',username);
				console.log(lobby + ': ', 'Asking to get Ready to players !')
				playersReady=0;
				ioLobby.emit('getReady',);
				gameRestarting = true;
				ioLobby.emit('updatePlayers',{'username' : username , 'x' : player.x,'y' : player.y,'z' : player.z ,'orientation' : player.orientation,'color' : player.color, "id" : player.id});
			}else{
				socket.emit('refused', 'SERVER', 'you have connected');
			}
			
		});
	
		// UN JOUEUR EST READY
		socket.on('ready',(data) => {
			console.log(lobby + ': ', data.username, ' is READY !')
			ioLobby.emit('updatechat', 'SERVER', socket.username + ' is READY !');
			listOfPlayers[data.username].ready = true ;
			playersReady ++;
			ioLobby.emit('updatechat', 'SERVER',  playersReady+'/'+nbPlayerConnected+' players ready');
			console.log(lobby + ': ',playersReady,'/',nbPlayerConnected,' players ready');
		});
	
		// UN JOUEUR A PERDU, CHECK SI IL RESTE UN JOUEUR EN JEU 
		socket.on('gameEnded',(data) => {
			gameRestarting = true;
			console.log(lobby + ': ', data.username, ' has ended the game !')
			playerInGame--;
			ioLobby.emit('updatechat', 'SERVER', socket.username + ' lost with : ' + data.points + ' points.');
			if(playerInGame<=0){
				ioLobby.emit('getReady');
			
				console.log(lobby + ': ', 'Asking to get Ready to players !')
				console.log(lobby + ': ',playersReady,'/',nbPlayerConnected,' players ready');
			}else{ 
				console.log(lobby + ': ',"Game still running");
			}
			
		});
	
		// when the client emits 'sendchat', this listens and executes
		socket.on('sendchat', (data) => {
			// we tell the client to execute 'updatechat' with 2 parameters
			ioLobby.emit('updatechat', socket.username, data);
		});
		socket.on('wallDestruct', (data) => {
			
			ioLobby.emit('destructWall',socket.username, data.name);
		});
		
		// when the user disconnects.. perform this
		socket.on('disconnect', () => {
			let id= playerNames.indexOf(socket.username)
			// remove the username from global usernames list
			if(id === 0){
				slot0 = false
				playerNames[0] = "";
			}else if(id === 1){
				slot1= false
				playerNames[1] = "";
			}else if(id === 2){
				slot2 = false
				playerNames[2] = "";
			}else if(id === 3){
				slot3 = false
				playerNames[3] = "";
			}
			console.log(lobby + ': ', socket.username ,' has disconnected !')
			gameRestarting = true;
			// update list of users in chat, client-side
			ioLobby.emit('updateusers', playerNames);	
			ioLobby.emit('disposeTron', socket.username);
			nbPlayerConnected = 0
			if(slot0){
				nbPlayerConnected++
			}else if(slot1){
				nbPlayerConnected++
			}else if(slot2){
				nbPlayerConnected++
			}else if(slot3){
				nbPlayerConnected++
			}
			playerByLobby[lobby] = nbPlayerConnected
			// Remove the player too
			delete listOfPlayers[socket.username];		
			ioLobby.emit('updatePlayersAfterDead',listOfPlayers);
			if(nbPlayerConnected>0){
				playersReady=0;
				playerInGame=0;
				ioLobby.emit('getReady');
				console.log(lobby + ': Asking to get Ready to players !');
				
				console.log(lobby + ': ',playersReady,'/',nbPlayerConnected,' players ready');
				
			} 
			// echo globally that this client has left
			socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		});
	});
	
	// CHECK SI TOUT LE MONDE EST PRET AVANT DE LANCER LA PARTIE 
	function checkEveryoneReady(){
		
		if(playersReady>=nbPlayerConnected){
			let timeStart = Date.now()+3000; 
			ioLobby.emit('starting',timeStart);
			playerInGame = playersReady;
			console.log(lobby + ': EVERYONE READY !');
			playersReady = 0;
			gameRestarting = false ;
		}
	}
	
	// UN TIMER
	function timer(currentTime) {
		let delta = currentTime - oldTime;
		oldTime = currentTime;
		return delta/1000;
	}
	// Création de tout les bonus 
	function createAllBonus(){
		for(let i = 0 ; i < 5 ; i++){
			bonus[i] = createBonus();
			ioLobby.emit('sendBonus', {'numBonus' : i , 'position' : bonus[i]});
		}
	}
	
	// Création d'un bonus 
	function createBonus(){
		let pos = Math.floor(Math.random() * 199);  
		let rad = Math.floor(Math.random() * 360) * Math.PI/180;  
		let position = {'x': pos*Math.sin(rad),'y':6,'z':pos*Math.cos(rad)};
		return position;
	}

	// Recrée un bonus et l'envoie aux clients 
	function deleteBonus(i){
		bonus[i]=createBonus();
		ioLobby.emit('sendBonus', {'numBonus' : i , 'position' : bonus[i]});
	}
	
	

 
	
	// BOUCLE SERVEUR
	setInterval(()=> {
		time = Date.now();
		delta = timer(time);
		if(gameRestarting){
			checkEveryoneReady();
		}
	},calculHeartbeat);
	
	
}


	const express = require('express')
	const app = express();
	app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, x-xsrf-token');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        next();
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
	const http = require('http').Server(app);
	const io = require("socket.io")(http, {
		cors: {
		  origin: "http://localhost:3000/"
		}
	});
	
	const PORT = process.env.PORT  || 8082
	
	http.listen(PORT, () => {
		console.log("Web server écoute sur le port : " , PORT);
	})
	
	// Indicate where static files are located. Without this, no external js file, no css...  
	app.use(express.static(__dirname));    
	
	
	
	// routing
	app.get('/', (req, res) => {
	  res.sendFile(__dirname + 'index.html');
	}); 
	app.get('/game', (req, res) => {
		res.sendFile(__dirname + '/game.html');
	  }); 
	app.get('/getplayers', (req, res) => {
		res.send(playerByLobby);
	  }); 
	app.get('/socket.io/socket.io.js', (req, res) => {
		res.sendFile(__dirname + 'socket.io/socket.io.js');
	  }); 

	  for(let i = 0 ; i < nbLobby ; i++){
		setIOserver(i)
	}