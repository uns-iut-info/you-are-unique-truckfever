let express = require('express');
let app = express();

app.use("/", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.get("/game", (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
});


let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});