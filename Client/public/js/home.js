function refreshLobbyCounter(){
    var settings = {
        "url": "https://server-star-fever.herokuapp.com/getplayers",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
      for (let index = 0; index < response.length; index++) {
          const element = response[index];
          document.getElementById("count"+(index)).innerHTML = element +"/4 player(s) connected"
      }
      
    });
    
}
