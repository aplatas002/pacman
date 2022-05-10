#!/usr/bin/env node

/**
 * Module dependencies.
 */
 var express = require('express');

 var app =  express();//require('../app');
 var debug = require('debug')('sockets:server');
 var http = require('http');
 var fs = require('fs');
 var https = require('https');
 
 
 /**
  * Get port from environment and store in Express.
  */
 
 var port = normalizePort(process.env.PORT || '8081');
 app.set('port', port);
 
 /**
  * Create HTTP server.
  */
  
 var server = http.createServer(app);
 
 /**
  * Listen on provided port, on all network interfaces.
  */
 
 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);
 
 
 app.use(express.static(__dirname + '/public', { dotfiles : 'allow' }))
 app.use(express.static(__dirname + '/public/javascripts', { dotfiles : 'allow' }))
 app.use(express.static(__dirname + '/public/stylesheets', { dotfiles : 'allow' }))

 const httpsServer = https.createServer({
    key: fs.readFileSync('/certificados/private.key'),
    cert: fs.readFileSync('/certificados/certificate.crt'),
    ca: fs.readFileSync('/certificados/ca_bundle.crt')
 }, app);
 
 httpsServer
     .listen(8080, function () {
         console.log('Example app listening on port 3030! Go to https://localhost:3030/')
     });
 
 const io = require('socket.io')(httpsServer);
 // create a WebSocket listener for the same server
 const realtimeListener = io.listen(httpsServer);
 
 
 // object to store desktop sockets
 let desktopSocket = null;
 let mobileSocket = null;
 
 // the socket can be a phone or a desktop
 /*realtimeListener.on('connection', function (socket) {
 
     // receives a connect message from a desktop (for this example, we will only have one)
     socket.on("desktop-connect", function () {
         console.log("Desktop Connected");
         desktopSocket = socket;
         desktopSocket.on("crash", function(){
             console.log("Registrado choque. Emitiendo...");
             if(mobileSocket){
                mobileSocket.emit("crash");
             }
        });
     });
 
     // receives a connect message from a phone
     socket.on("phone-connect", function () {
         console.log("Phone Connected");
         if (desktopSocket) {
             // ... informs desktop that a phone has connected
             desktopSocket.emit('phone-connect');
         }
         mobileSocket=socket;
     });
 
     // receives a connect message from a phone
     socket.on("phone-move", function (data) {
         console.log("Phone moved:" + data.beta  );
         if (desktopSocket)
             desktopSocket.emit('phone-move', data.beta);
     });

     
 });*/
 
 
 /**
  * Normalize a port into a number, string, or false.
  */
 
 function normalizePort(val) {
     var port = parseInt(val, 10);
 
     if (isNaN(port)) {
         // named pipe
         return val;
     }
 
     if (port >= 0) {
         // port number
         return port;
     }
 
     return false;
 }
 
 /**
  * Event listener for HTTP server "error" event.
  */
 
 function onError(error) {
     if (error.syscall !== 'listen') {
         throw error;
     }
 
     var bind = typeof port === 'string'
         ? 'Pipe ' + port
         : 'Port ' + port;
 
     // handle specific listen errors with friendly messages
     switch (error.code) {
         case 'EACCES':
             console.error(bind + ' requires elevated privileges');
             process.exit(1);
             break;
         case 'EADDRINUSE':
             console.error(bind + ' is already in use');
             process.exit(1);
             break;
         default:
             throw error;
     }
 }
 
 /**
  * Event listener for HTTP server "listening" event.
  */
 
 function onListening() {
     var addr = server.address();
     var bind = typeof addr === 'string'
         ? 'pipe ' + addr
         : 'port ' + addr.port;
     debug('Listening on ' + bind);
 }