const serverURL = window.location.hostname + ":" +  window.location.port;
let socket; 
let isEmisor=false;
let conexionJugadorRemoto=false;
let salaAsignada="a";
let remoteUserX=-100;
let remoteUserY=-100;
let orientacionRemoteUser="right";
let ghostsPosition={
    0: {x: -1, y:-1, orientation: "up"},
    1: {x: -1, y:-1, orientation: "up"},
    2: {x: -1, y:-1, orientation: "up"},
    3: {x: -1, y:-1, orientation: "up"}
}

function setupSockets(){
    socket= io.connect(serverURL, {secure: true});
    socket.emit('remote-player-connect', salaAsignada);
    socket.on('remote-player-connect', (evt)=>{
        conexionJugadorRemoto=true;
    });

    socket.on("respuesta-conexion", (evt)=>{
        if(evt=="emisor"){
            isEmisor=true;
        }else if(evt=="receptor"){
            conexionJugadorRemoto=true;
        }
    });

    socket.on('sala-llena', ()=>{
        alert("Lo sentimos, esta sala ya tiene usuarios");
    })

    socket.on('remote-player-move', (data)=>{
        //console.log("Movimiento recibido: "+data.movimiento);
        remoteUserX=data.movimiento.x;
        remoteUserY=data.movimiento.y;
        orientacionRemoteUser=data.orientacion;
    });

    socket.on('remote-ghost-move', (data)=>{
        if(!isEmisor){
            ghostsPosition[data.ghostID].x=data.x;
            ghostsPosition[data.ghostID].y=data.y;
            ghostsPosition[data.ghostID].orientation=data.orientation;
        }
    });

}

function enviarDatos(x,y, orientacion){
    /*dato={
        orientation: teclado
    };*/
    //console.log("enviando datos "+teclado);
    if(isEmisor){
        //console.log(`enviando datos como emisor: (x,y) = (${x},${y})`);
        socket.emit('remote-player-move',{nomSala: salaAsignada, movimiento: {x: x, y: y, orientacion: orientacion}, tipoUsuario: "emisor"});
    }else{
        //console.log(`enviando datos de receptor: (x,y) = (${x},${y})`);
        socket.emit('remote-player-move',{nomSala: salaAsignada, movimiento: {x: x, y: y, orientacion: orientacion}, tipoUsuario: "receptor"});
    }
    
}

//Funcion unica para el emisor
function enviarDatosFantasmas(x,y,orientation, ghostID){
    if(isEmisor){
        //console.log("Enviando datos fantasmas: X: "+x+" Y:"+y+" Ori: "+orientation+" GID: "+ghostID);
        socket.emit('remote-ghost-move', {nomSala: salaAsignada, ghostID:ghostID,  x: x, y: y, orientation: orientation});
    }
}