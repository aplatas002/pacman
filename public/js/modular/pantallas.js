class Pantalla{
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

    /*mostrarHasGanado = function(ctx){

        ctx.font = "bold 80px Lucida Console"; //Elegimos fuente y tamaño
	    ctx.fillStyle = "#ffff00";
        var sizeWidth = ctx.canvas.clientWidth;
        var sizeHeight = ctx.canvas.clientHeight;
		ctx.fillText("YOU WIN", sizeWidth/8.5, sizeHeight/5);
        ctx.font = "bold 30px Lucida Console";
        ctx.fillText("Press Spacebar to restart", sizeWidth/35, sizeHeight-50);
    }*/
}