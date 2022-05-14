window.onload = cargarEventos;

function cargarEventos(){
    let musica = document.getElementById("musica");
    let sfx = document.getElementById("sfx");

    let configSFX = localStorage.getItem("pacman-sfx");
    if(configSFX == undefined || configSFX == null){
		configSFX = true;
        sfx.checked = true;
		localStorage.setItem("pacman-sfx", configSFX);
	}else{
        sfx.checked=(configSFX=="true");
	}

    let configMusica = localStorage.getItem("pacman-musica");
    if(configMusica == undefined || configMusica == null){
		configMusica = true;
        musica.checked = true;
		localStorage.setItem("pacman-musica", configMusica);
	}else{
		musica.checked = (configMusica == "true");
	}

    document.getElementById("guardar").addEventListener("click", function(){
        
        localStorage.setItem("pacman-sfx", sfx.checked);
        localStorage.setItem("pacman-musica", musica.checked);
        window.close();
    }, true);
}