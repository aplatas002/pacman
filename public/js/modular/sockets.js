//Declaración de variables globales
const serverURL = window.location.hostname + ":" +  window.location.port;
let socket; 
let isEmisor=false;
let conexionJugadorRemoto=false;

let player1X=-100;
let player1Y=-100;
let player2X=-100;
let player2Y=-100;
let player1Orientacion="right";
let player2Orientacion="right";
let ghostsPosition={
    0: {x: -1, y:-1, orientacion: "up", estado: 1},
    1: {x: -1, y:-1, orientacion: "up", estado: 1},
    2: {x: -1, y:-1, orientacion: "up", estado: 1},
    3: {x: -1, y:-1, orientacion: "up", estado: 1}
}
let mapa;
let nVidas=3;
let estadoJuego;
let puntuacionActual;
let puntuacionRecord;
let estadoTiempo;
let estadoTiempoFantasmas;

/**
 * Función que se encarga de configurar los sockets
 */
function setupSockets(){
    socket= io.connect(serverURL, {secure: true});
    //Función específica para el anfitrion
    socket.on('remote-player-connect', (evt)=>{
        conexionJugadorRemoto=true;
    });

    socket.on('sala-llena', ()=>{
        alert("Lo sentimos, esta sala ya tiene usuarios");
        window.location.reload();
    });

    socket.on('play-sonido',(evt)=>{
        if(configSFX){
            switch(evt.efecto){
                case "pellet":
                    if(pellet!=undefined){
                        pellet.currentTime=0;
                        pellet.play();
                    }
                break;
                case "power_pellet":
                    if(power_pellet!=undefined){
                        power_pellet.currentTime=0;
                        power_pellet.play();
                    }
                break;
                case "finish_vulnerable":
                    if(finish_vulnerable!=undefined){
                        finish_vulnerable.currentTime=0;
                        finish_vulnerable.play();    
                    }
                break;
                case "ghost_dead":
                    if(ghost_dead!=undefined){
                        ghost_dead.currentTime=0;
                        ghost_dead.play();
                    }
                break;
                case "pacman_dead":
                    if(pacman_dead!=undefined){
                        pacman_dead.currentTime=0;
                        pacman_dead.play();
                    }
                break;
                case "game_over":
                    if(game_over!=undefined){
                        game_over.currentTime=0;
                        game_over.play();
                    }
                break;
                case "finish_level":
                    if(finish_level!=undefined){
                        finish_level.currentTime=0;
                        finish_level.play();
                    }
                break;
    
            }
        }
    });

    /**
     * Dependiendo de si el usuario que recibe el mensaje es anfitrión o no,
     * pueden suceder 2 cosas:
     *     - Disparo de eventos que el invitado ha enviado.
     *     - Recepción de datos para que el invitado pueda recrearlos.
     */
    socket.on('remote-player-move', (evt)=>{
        if(evt.tipoUsuario=="receptor"){ //El usuario que ha enviado el mensaje es receptor (invitado).
            //console.log(evt);
            dispararEventoTeclado(evt.tecla);
        }else if(evt.tipoUsuario=="emisor"){//El usuario que ha enviado el mensaje es emisor (anfitrión/host).
            mapa=evt.datos.mapa;
            nVidas=evt.datos.numVidas;
            estadoJuego=evt.datos.estadoJuego;
            player2X=evt.datos.datosPacmanHost.x;
            player2Y=evt.datos.datosPacmanHost.y;
            player2Orientacion=evt.datos.datosPacmanHost.orientacion;
            player1X=evt.datos.datosPacmanInvitado.x;
            player1Y=evt.datos.datosPacmanInvitado.y;
            player1Orientacion=evt.datos.datosPacmanInvitado.orientacion;
            for(let i=0; i<4; i++){
                ghostsPosition[i].x=evt.datos.datosFantasmas[i].x;
                ghostsPosition[i].y=evt.datos.datosFantasmas[i].y;
                ghostsPosition[i].orientacion=evt.datos.datosFantasmas[i].orientacion;
                ghostsPosition[i].estado=evt.datos.datosFantasmas[i].estado;
            }
            estadoTiempo = evt.datos.estadoTiempo;
            estadoTiempoFantasmas = evt.datos.estadoTiempoFantasmas;
            puntuacionActual=evt.datos.puntuacionActual;
            puntuacionRecord=evt.datos.puntuacionRecord;
        }
    });

    socket.on('usuario-desconectado', ()=>{
        alert("El otro jugador se ha desconectado");
        window.location.reload();
    });

}

/**
 * Función que permite al usuario conectar al servidor para iniciar posteriormente un juego online
 * @param {string} nomSala Nombre de la sala
 * 
 */
function conectar(nomSala){
    return new Promise((resolve)=>{
        socket.emit('remote-player-connect', nomSala);
        socket.on("respuesta-conexion", (evt)=>{
            salaAsignada=nomSala;
            if(evt=="emisor"){
                isEmisor=true;
                resolve("emisor");
            }else if(evt=="receptor"){
                conexionJugadorRemoto=true; //El flag se lo activamos directamente al usuario //TODO Revisar porque igual para el receptor no hace falta
                resolve("receptor");
            }
        });
    });
}

/*
        Función que se encarga de enviar al anfitrión:
    - Mapa con sus datos actualizados
    - Número de vidas de pacman
    - Estado del juego (pausado o no)
    - Posición (x,y) y orientación de pacman
    - Posición (x,y), orientación y estado de todos y cada uno de los fantasmas
    - Puntuación actual
    - Puntuación record
    - Timers para controlar el estado de los fantasmas cuando están asustados
*/
function enviarDatos(mapa, numVidas, estadoJuego, datosPacmanHost, datosPacmanInvitado, datosFantasmas, puntActual, puntRecord, estadoTiempoJuego, estadoTiempoFantasmas){
    
    if(isEmisor){
        let obj={
            mapa: mapa,
            numVidas: numVidas,
            estadoJuego: estadoJuego,
            datosPacmanHost: datosPacmanHost,
            datosPacmanInvitado: datosPacmanInvitado,
            datosFantasmas: datosFantasmas,
            puntuacionActual: puntActual,
            puntuacionRecord: puntRecord,
            estadoTiempo: estadoTiempoJuego,
            estadoTiempoFantasmas: estadoTiempoFantasmas
        }
        socket.emit('remote-player-move',{nomSala: salaAsignada, datos: obj, tipoUsuario: "emisor"});
    }
    
}

//Envía un flag de activación de audio al invitado
function enviarSonido(efecto){
    socket.emit('play-sonido', {nomSala: salaAsignada, efecto:efecto});
}

//Función para que el invitado envíe los datos de sus teclas al host
function envioDatosAHost(teclaPulsada){
    socket.emit("remote-player-move",{nomSala: salaAsignada, tecla: teclaPulsada, tipoUsuario: "receptor"});
}

/**
 * Función que dispara un evento en el teclado del anfitrión
 * @param {*} evt Evento del teclado
 */
function dispararEventoTeclado(evt){
    let tecla;
    switch(evt){
        case "ArrowUp":
            tecla="w"
        break;
        case "ArrowDown":
            tecla="s";
        break;
        case "ArrowLeft":
            tecla="a";
        break;
        case "ArrowRight":
            tecla="d";
        break;
        case " ":
            tecla=" ";
        break;
        default:
            tecla=evt;
        break;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': tecla}));
}