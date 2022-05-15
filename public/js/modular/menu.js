/**
 * Función que se encarga de la carga de los audios
 * @param {string} url Url del audio
 * @returns promesa con el audio
 */
function loadAudio(url){
    return new Promise((resolve)=>{
        let audio = new Audio();
        //El evento en el tipo "Audio" es 'loadeddata'
        audio.addEventListener('loadeddata',()=>resolve(audio), true);
        audio.src=url;
    });
}
window.onload=function(){

    //Carga de configuración
    configSFX = localStorage.getItem("pacman-sfx");
	if(configSFX==undefined){
		configSFX=true;
		localStorage.setItem("pacman-sfx", configSFX);
	}else{
		configSFX=(localStorage.getItem("pacman-sfx")=="true");
	}

    configMusica = localStorage.getItem("pacman-musica");
    if(configMusica==undefined){
		configMusica=true;
		localStorage.setItem("pacman-musica", configMusica);
	}else{
		configMusica=(localStorage.getItem("pacman-musica")=="true");
	}

    // Cargar sonidos en variables globales
    loadAudio("./res/audio/game_over.wav").then( audio => game_over = audio);
    loadAudio("./res/audio/finish_level.wav").then( audio => finish_level = audio);
    loadAudio("./res/audio/pacman_dead.wav").then( audio => pacman_dead = audio);
    loadAudio("./res/audio/pellet.wav").then( audio => pellet = audio);
    loadAudio("./res/audio/power_pellet.wav").then( audio => power_pellet = audio);
    loadAudio("./res/audio/finish_vulnerable.wav").then( audio => finish_vulnerable = audio);
    loadAudio("./res/audio/ghost_dead.wav").then( audio => ghost_dead = audio);
    
    console.log("Iniciado");
    //let contenedores = document.getElementsByClassName("contenedor");
    //Eventos en los botones
    document.getElementById("jugar").addEventListener("click", jugar, true);
    document.getElementById("multijugador_local").addEventListener("click", multijugadorLocal, true);
    document.getElementById("online").addEventListener("click", function(){
        result = window.prompt("Nombre de la sala");
        
        // Si el usuario introduce un nombre de sala
        if (result != null){
            document.getElementById("menu").style="display: none";
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?online=true';
            window.history.pushState({path:newurl},'',newurl);
            //Conexión mediante websockets
            setupSockets();
            conectar(result).then((evt)=>{
                if(evt=="emisor"){
                    var s = document.createElement('script');
                    s.setAttribute('src','js/pacman.js');
                    document.head.appendChild(s);
                    s.onload=()=>{
                        var game = new GF();
                        game.start();
                        document.getElementById("vuelta").classList.remove("hidden");
                    };
                    
                }else if(evt=="receptor"){
                    var s = document.createElement('script');
                    s.setAttribute('src','js/remotepacman.js');
                    document.head.appendChild(s);
                    s.onload=()=>{
                        var game = new GFRemote();
                        game.start();
                        document.getElementById("vuelta").classList.remove("hidden");
                    };
                }
            });
            if(configMusica){
                loadAudio("./res/audio/fondo.mp3").then( audio => {audio.volume = 0.15; audio.play();});
            }
        }
        
        // Si pulsa cancelar
        else {
            window.reload();
        }
        
    },true);
    document.getElementById("config").addEventListener("click", mostrarConfig, true);
    document.getElementById("acercade").addEventListener("click", function(){
        var myWindow = window.open("about.html", "PacmanAbout", 'width=600, height=600');
    },true);
    document.getElementById("vuelta").addEventListener("click", volver, true);
};

/*
Función que se encarga de iniciar un juego normal
*/
function jugar(){
    //console.log("jugar");
    //loadAudio("./res/audio/fondo.mp3").then( audio => audio.play());
    //window.location.href="index.html";
    
    var s = document.createElement('script');
    s.setAttribute('src','js/pacman.js');
    document.head.appendChild(s);
    document.getElementById("menu").style="display: none";
    s.onload=()=>{
        var game = new GF();
        game.start();
        document.getElementById("vuelta").classList.remove("hidden");
        if(configMusica){
            loadAudio("./res/audio/fondo.mp3").then( audio => {audio.volume = 0.15; audio.play();});
        }
    };
    
}

/**
 * Función que se encarga de iniciar un juego en modo multijugador
 */
function multijugadorLocal(){
    var s = document.createElement('script');
    s.setAttribute('src','js/pacman.js');
    document.head.appendChild(s);
    document.getElementById("menu").style="display: none";
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?numJugadores=2';
    window.history.pushState({path:newurl},'',newurl);
    s.onload=()=>{
        var game = new GF();
        game.start();
        document.getElementById("vuelta").classList.remove("hidden");
        if(configMusica){
            loadAudio("./res/audio/fondo.mp3").then( audio => {audio.volume = 0.15; audio.play();});
        }
        
    };
    
}

/**
 * Muestra la ventana de configuración al usuario
 */
function mostrarConfig(){
    var myWindow = window.open("config.html", "PacmanConfig", 'width=600, height=600');
    myWindow.addEventListener("beforeunload", function(e){
        window.location.reload();
     }, false);
}


/**
 * Permite al usuario volver al menú principal siempre que quiera
 */
function volver(){
    window.location="index.html";
}