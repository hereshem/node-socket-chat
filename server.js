var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var messages = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/jquery-1.11.1.js', function(req, res){
  res.sendFile(__dirname + '/jquery-1.11.1.js');
});

app.get('/socket.io-1.2.0.js', function(req, res){
  res.sendFile(__dirname + '/socket.io-1.2.0.js');
});

io.on('connection', function(socket){
	var id = socket.id;
	socket.on('join', function(user){
    if(!user || !user.name){
      user = {name:new Date().getTime().toString(),room:"myroom"};
    }
    console.log(user.name + " joined");
		socket.name = user.name;
		socket.room = user.room;
		socket.join(socket.room);
    io.in(socket.room).emit('join', name);
    for (var i = 0; i < messages.length; i++) {
      socket.emit('message', messages[i]);
    }
    io.in(socket.room).emit('join', name);
	});
	
  socket.on('message', function(msg){
  	if(msg){
      var message = {name:socket.name,message:msg,timestamp:new Date().getTime()};
  		console.log("<" + message.name + "> " + msg);
      messages.push(message);
  		if(messages.length > 100){
  			messages.shift();
  		}
  		io.in(socket.room).emit('message', message);
	    // io.socket(id).emit('message', message);
		  // io.emit('message', message);
	}
  });
  socket.on('typing', function(msg){
    var message = {name:socket.name,message:msg,timestamp:new Date().getTime()};
    io.in(socket.room).emit('typing', message);
  });
});

http.listen(port, function(){
  console.log('Listening on port ' + port);
});
