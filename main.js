var connect = require('connect');
var http = require('http');
var WebSocketServer = require('ws').Server;

// web server

var app = connect();
app.use(connect.static('static'));
http.createServer(app).listen(4000);

// web sockets

var wsserver = new WebSocketServer({ port: 3999 });

wsserver.on('connection', function(ws) {
    // ws.on('message', function(msg) {
        
    // });

    // ws.send('one');
});