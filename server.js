var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var messages = [], users = [];


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/jquery-1.11.1.js', function(req, res){
    res.sendFile(__dirname + '/jquery-1.11.1.js');
});
app.get('/socket.io.js', function(req, res){
    res.sendFile(__dirname + '/socket.io.js');
});

io.on('connection', function(socket){
    socket.on('join', function(name, room){
        socket.name = name || new Date().getTime().toString();
        console.log(socket.name + " joined");
        for (var i = 0; i < messages.length; i++) {
          socket.emit('message', messages[i]);
        }
        if(room) {
            socket.room = room;
            socket.join(socket.room);
            io.in(socket.room).emit('join', socket.name);
        }
        else{
            io.emit('join', socket.name);
        }
        var me = {id:socket.id, name:socket.name, room:socket.room};
        users.push(me);
        socket.emit('me', me);
    });
	
    socket.on('message', function(msg, to_room, to_id){
        if(msg){
            var message = {user_id:socket.id,name:socket.name,to_room:to_room,to_id:to_id,message:msg,timestamp:new Date().getTime()};
            console.log("<" + message.name + "> " + msg);
            messages.push(message);
            if(messages.length > 10){
                messages.shift();
            }
            if(to_room) {
                io.in(to_room).emit('message', message);
            }
            else if(to_id){
                io.socket(to_id).emit('message', message);
            }
            else{
                io.emit('message', message);
            }
        }
    });
    socket.on('typing', function(msg){
        var message = {user_id:socket.id,name:socket.name,message:msg,timestamp:new Date().getTime()};
        io.emit('typing', message);
    });
    socket.on('users', function(){
        socket.emit('users', users);
    });
    socket.on('part', function(){
        //delete user
        var index;
        for(var i=0;i<users.length;i++){
            if(users[i].id == socket.id){
                index = i;
                break;
            }
        }
        if(index)
            users.splice(i,1);
        if(socket.room)
            io.in(socket.room).emit('part', socket.name);
        else
            io.emit('part', socket.name);
    });
});

http.listen(port, function(){
    console.log('Listening on port ' + port);
});
