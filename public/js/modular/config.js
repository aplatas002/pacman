window.onload = cargarEventos;

/**
 * Eventos de la sección de configuración
 */
function cargarEventos(){

    //-----------   Efectos de sonido   ------------//

    // Botón
    let sfx = document.getElementById("sfx");

    // La configuración de los efectos de sonido se almacena en localStorage 
    let configSFX = localStorage.getItem("pacman-sfx");

    // Si no hay configuración inicializada
    if(configSFX == undefined || configSFX == null){

        // Activar efectos de sonido por defecto
		configSFX = true;
        sfx.checked = true;
		localStorage.setItem("pacman-sfx", configSFX);
	}
    
    else{
        // Cargar configuración del localStorage
        sfx.checked = (configSFX == "true");
	}

    //------------   Música de fondo   -------------//

    // Botón
    let musica = document.getElementById("musica");

    // La configuración de la música de fondo se almacena en localStorage 
    let configMusica = localStorage.getItem("pacman-musica");

    // Si no hay configuración inicializada
    if(configMusica == undefined || configMusica == null){

        // Activar música de fondo por defecto
		configMusica = true;
        musica.checked = true;
		localStorage.setItem("pacman-musica", configMusica);
	}
    
    else{
        // Cargar configuración del localStorage
		musica.checked = (configMusica == "true");
	}

    //------------   Botón de guardar   ------------//

    document.getElementById("guardar").addEventListener("click", function(){
        
        // Almacenar selección del usuario en el localStorage
        localStorage.setItem("pacman-sfx", sfx.checked);
        localStorage.setItem("pacman-musica", musica.checked);

        // Cerrar ventana
        window.close();
        
    }, true);
}