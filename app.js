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
 //let socketPlayer1 = null;
 //let socketPlayer2 = null;
 
const mapa = [];
 // the socket can be a phone or a desktop
 realtimeListener.on('connection', function (socket) {
 
     // receives a connect message from a desktop (for this example, we will only have one)
     socket.on("remote-player-connect", function(nomSala){
        let salaEncontrada=false; 
        for(let i=0; i<mapa.length; i++){ //pobre Koldo G., y pensar que tengo un notable en EDA...
            if(mapa[i].sala==nomSala){
                console.log("Sala existente encontrada");
                salaEncontrada=true;
                if(mapa[i].emisor==undefined){
                    mapa[i].receptor=socket;
                    console.log("Receptor encontrado");
                    socket.emit('respuesta-conexion', 'receptor');
                }else if (mapa[i].receptor==undefined){
                    mapa[i].emisor=socket;
                    socket.emit('respuesta-conexion', 'emisor');
                }else{
                    socket.emit("sala-llena");
                }
            }
        }

        if(!salaEncontrada){
            console.log("Sala no encontrada");
            let datos={
                sala: nomSala,
                emisor: socket
            }
            socket.emit('respuesta-conexion', 'emisor');
            mapa.push(datos);
        }
     });
     //socket.set("heartbeat timeout", 10);
     //socket.set("heartbeat interval", 5);
     socket.on("connect_error", ()=>{
        console.log("El cliente se ha desconectado");
     });
    /*socket.on("remote-player-connect", function () {
         console.log("Usuario remoto conectado");
         //desktopSocket = socket;
         if(socketPlayer1==undefined){
             console.log("Usuario 1");
             socketPlayer1=socket;
             socket.emit("conexion-confirmada");
            }else if(socketPlayer2==undefined){
                    //console.log("Usuario 2");
                    socketPlayer2=socket;
                    socket.emit("conexion-confirmada", "receptor");
                    socketPlayer2.on("remote-player-move", function(evt){
                        //console.log("Usuario 2 envía a 1 "+evt);
                        socketPlayer1.emit('remote-player-move', evt);
                    });
                    socketPlayer2.on('remote-ghost-move', function(evt){
                        socketPlayer1.emit('remote-ghost-move', evt);
                    });
            }
         */
         /*socket.on("remote-player-move", function(evt){
            console.log("Usuario 2 envía a 1 "+evt);
            socketPlayer1.emit('remote-player-move', evt);
        });
     });*/
     //console.log("sp1 "+socketPlayer1+". sp2 "+socketPlayer2);
     // receives a connect message from a phone
     /*if(socketPlayer1){
        socketPlayer1.on("remote-player-move", function (evt) {
            //console.log("Phone Connected");
            if (socketPlayer2) {
                console.log("Usuario 1 envía a 2 "+evt);
                // ... informs desktop that a phone has connected
                socketPlayer2.emit('remote-player-move', evt);
            }
            //mobileSocket=socket;
        });
        socketPlayer1.on('remote-ghost-move', function(evt){
            if (socketPlayer2) {
                socketPlayer2.emit('remote-ghost-move', evt);
            }
        });
     }*/

     /*if(socketPlayer2){
         socketPlayer2.on("remote-player-move", function(evt){
             console.log("Usuario 2 envía a 1 "+evt);
             socketPlayer1.emit('remote-player-move', evt);
         });
     }*/
 
     // receives a connect message from a phone
     /*socket.on("phone-move", function (data) {
         console.log("Phone moved:" + data.beta  );
         if (desktopSocket)
             desktopSocket.emit('phone-move', data.beta);
     });*/

     
 });
 
 
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