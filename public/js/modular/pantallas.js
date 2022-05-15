class Pantalla{

    // Pantalla de Game Over al quedarse sin vidas
    mostrarJuegoTerminado = function(ctx, score){

        ctx.font = "bold 80px Lucida Console"; //Elegimos fuente y tamaño
	    ctx.fillStyle = "#ffff00";
        var sizeWidth = ctx.canvas.clientWidth;
        var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillText("GAME OVER", sizeWidth/23, sizeHeight/5);
        ctx.font = "bold 30px Lucida Console";
        ctx.fillText("Your score: " + score, sizeWidth/5, sizeHeight/2.8);
        ctx.fillText("Press Spacebar to restart", sizeWidth/35, sizeHeight-50);
    }

    // Pantalla de Victoria al comerse todas las píldoras
    //  (Al final esta pantalla no se muestra, con el propósito de que el jugador pueda acumular puntuación en el nivel)
    mostrarHasGanado = function(ctx){

        ctx.font = "bold 80px Lucida Console"; //Elegimos fuente y tamaño
	    ctx.fillStyle = "#ffff00";
        var sizeWidth = ctx.canvas.clientWidth;
        var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillText("YOU WIN", sizeWidth/8.5, sizeHeight/5);
        ctx.font = "bold 30px Lucida Console";
        ctx.fillText("Press Spacebar to restart", sizeWidth/35, sizeHeight-50);
    }
    mostrarJuegoCargando = function(ctx){

        ctx.font = "bold 80px Lucida Console"; //Elegimos fuente y tamaño
	    ctx.fillStyle = "#ffff00";
        var sizeWidth = ctx.canvas.clientWidth;
        var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillText("LOADING", sizeWidth/8.5, sizeHeight/5);
    }

}