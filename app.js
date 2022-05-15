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
 
 
 //Estructura de grafo para controlar las salas existentes y liberar aquellas no usadas
const mapa = new Map();
const socketMap = new Map();
 realtimeListener.on('connection', function (socket) {
 
     /**
      * Este evento se dispara cuando algún usuario va a conectarse
      */
     socket.on("remote-player-connect", function(nomSala){
        let sala = mapa.get(nomSala); 
        //Existe una sala con el nombre
        if(sala!=undefined){
                console.log("Sala "+nomSala+" encontrada");
                if(sala.receptor==undefined){
                    //Hay emisor pero no receptor
                    sala.receptor=socket;
                    socket.emit('respuesta-conexion', 'receptor');
                    console.log("Asignado receptor a sala "+nomSala);
                    sala.emisor.emit('remote-player-connect');
                    socketMap.set(socket, nomSala);
                }else if(sala.emisor==undefined){
                    //Hay receptor pero no emisor (caso muy atípico)
                    sala.emisor=socket;
                    socket.emit('respuesta-conexion', 'emisor');
                    console.log("[EXCP] Asignado emisor a sala "+nomSala);
                    sala.emisor.emit('remote-player-connect');
                    socketMap.set(socket, nomSala);
                }else{
                    //Existe emisor y receptor
                    console.log("La sala está llena");
                    socket.emit("sala-llena");
                }
            
        }else{
            //No hay sala con ese nombre
            console.log("Sala "+nomSala+" no encontrada");
            let datos={
                emisor: socket
            }
            console.log("Asignado emisor a sala "+nomSala);
            socket.emit('respuesta-conexion', 'emisor');
            mapa.set(nomSala,datos);
            socketMap.set(socket, nomSala); //Indicamos el socket qué sala tiene
        }

        /**
         * Cuando ocurre algo en la partida del anfitrión que genere un sonido,
         * ésto se envía para que el receptor pueda emitir el mismo sonido.
         */
        socket.on('play-sonido', (evt)=>{
            if(evt.nomSala !=undefined && mapa.has(evt.nomSala)){
                let sala = mapa.get(evt.nomSala);
                sala.receptor.emit("play-sonido", evt);
            }
            
        });

                
     });


     /**
      * Evento que se dispara una vez se desconecte el usuario de la partida
      */
     socket.on('disconnect', function(){
         console.log("Alguien se desconecta");
         console.log("Mapa de sockets tiene a este socket: "+socketMap.has(socket));
        if(socketMap.has(socket)){
            let nomSala = socketMap.get(socket);
            if(mapa.has(nomSala)){
                datosSala=mapa.get(nomSala);
                if(datosSala.emisor!=undefined /*&& datosSala.emisor.connected*/){
                    datosSala.emisor.emit("usuario-desconectado");
                }
                if(datosSala.receptor!=undefined /*&& datosSala.receptor.connected*/){
                    datosSala.receptor.emit("usuario-desconectado");
                }
                //console.log("\tDatosSala.emisor: "+datosSala.emisor);
                //console.log("\tDatosSala.emisor.connected: "+datosSala.emisor.connected);
                //console.log("\tDatosSala.receptor: "+datosSala.receptor);
                //console.log("\tDatosSala.receptor.connected: "+datosSala.receptor.connected);
                //VALORAR EL OR
                let salaVacia = (datosSala.emisor==undefined || !datosSala.emisor.connected) || (datosSala.receptor==undefined || !datosSala.receptor.connected);
                if(salaVacia){
                    console.log(`La sala ${socketMap.get(socket)} está vacía`);
                    mapa.delete(nomSala);
                }
            }
            socketMap.delete(socket);
        }
    });

    /**
     * Evento que redirigen los datos entre emisores y receptores
     */
    socket.on("remote-player-move", (datos)=>{
        if(mapa.has(datos.nomSala)){
            let sala = mapa.get(datos.nomSala);
            if(datos.tipoUsuario=="emisor"){
                if(sala.receptor!=undefined){
                    sala.receptor.emit("remote-player-move", datos);
                }
                
            }else if(datos.tipoUsuario=="receptor"){
                if(sala.emisor!=undefined){
                    sala.emisor.emit("remote-player-move", datos);
                }
            }
        }
    });
     
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