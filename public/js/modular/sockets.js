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
                    pellet.currentTime=0;
                    pellet.play();
                break;
                case "power_pellet":
                    power_pellet.currentTime=0;
                    power_pellet.play();
                break;
                case "finish_vulnerable":
                    finish_vulnerable.currentTime=0;
                    finish_vulnerable.play();
                break;
                case "ghost_dead":
                    ghost_dead.currentTime=0;
                    ghost_dead.play();
                break;
                case "pacman_dead":
                    pacman_dead.currentTime=0;
                    pacman_dead.play();
                break;
                case "game_over":
                    game_over.currentTime=0;
                    game_over.play();
                break;
                case "finish_level":
                    finish_level.currentTime=0;
                    finish_level.play();
                break;
    
            }
        }
    });

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

}

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
        Qué enviar:
    - Mapa con sus datos actualizados
    - Número de vidas de pacman
    - Estado del juego (pausado o no)
    - Posición (x,y) y orientación de pacman
    - Posición (x,y), orientación y estado de todos y cada uno de los fantasmas
    - Puntuación actual
    - Puntuación record
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