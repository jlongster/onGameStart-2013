var connect = require('connect');
var http = require('http');
var WebSocketServer = require('ws').Server;
var settings = require('./settings');

// web server

var app = connect();
app.use(connect.static('static'));
http.createServer(app).listen(settings.port || 4000);

// web sockets

var wsserver = new WebSocketServer({ port: 3999 });
var connections = [];
var currentSlide = null;

wsserver.on('connection', function(ws) {
    connections.push(ws);
    console.log('connected [' + connections.length + ']');
    
    // ****** REMOVE THIS FOR PRODUCTION *******
    ws.admin = true;

    ws.on('message', function(msg) {
        msg = JSON.parse(msg);

        if(msg.authenticate) {
            if(msg.authenticate == 'bug') {
                ws.admin = true;
                currentSlide = msg.currentSlide;

                ws.send(JSON.stringify({
                    authenticated: true
                }));
            }
        }
        else if(ws.admin && msg.showContent) {
            currentSlide = msg.showContent;

            connections.forEach(function(remotews) {
                if(remotews != ws) {
                    remotews.send(JSON.stringify(msg));
                }
            });
        }
    });

    ws.on('close', function() {
        connections.splice(connections.indexOf(ws), 1);
        console.log('removing [' + connections.length + ']');

        // ***** REMOVE THIS FOR PRODUCTION ****
        // if(ws.admin) {
        //     currentSlide = null;
        // }
    });

    ws.send(JSON.stringify({
        showContent: currentSlide || 'dummy'
    }));
});
