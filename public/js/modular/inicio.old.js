//DEPRECATED

document.addEventListener("load", inicio, true);
//let estadoMenu=undefined;
/*let selector=undefined;
let estados={
    inicio: 0,
    jugar: 1,
    multijugador_local: 2, 
    multijugador_red: 3,
    acerca_de: 4
}
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let w = canvas.width;
let h = canvas.height;
*/
/**
 * 
 */
function inicio(){
    
   document.addEventListener("keydown", eventoTecla, true);
   if(selector==undefined){
  //     estadoMenu=estados.inicio;
       selector=estados.inicio;
       pintarMenuPrincipal(ctx, w, h);
   }
}

function pintarMenuPrincipal(ctx, w, h){
    ctx.fillStyle="#ffa500";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#FFFF00";
    ctx.font = "bold 60px Lucida Console";
    let texto ="Pacman";
    
    //https://stackoverflow.com/a/13773507
    let textWidth = ctx.measureText(texto).width;
    ctx.fillText(texto,  (w/2) - (textWidth / 2), 70);
    ctx.fillStyle="#0000FF";
    let rectX=100;
    let rectY=100;
    let rectWidth=400;
    let rectHeight=100;
    //ctx.fillRect(rectX,rectY,rectWidth,rectHeight);

    
    /*texto="Play";
    textWidth=ctx.measureText(texto).width;
    ctx.fillText(texto,((rectWidth+rectX)/2)-(textWidth/2)+50,220); //https://stackoverflow.com/q/24565458*/
    pintarRectangulo(ctx, "Jugar", rectX, rectY, rectWidth, rectHeight, 0, 165, "#FFFFFF", "#000864");
    pintarRectangulo(ctx, "2-player", rectX, 220, rectWidth, rectHeight, 0, 285, "#FFFFFF", "#0000FF");
    pintarRectangulo(ctx, "Online", rectX, 340, rectWidth, rectHeight, 0, 405, "#FFFFFF", "#0000FF");
    pintarRectangulo(ctx, "About", rectX, 460, rectWidth, rectHeight, 0, 525, "#FFFFFF", "#0000FF");

}


function pintarRectangulo(ctx, texto, xRect, yRect, wRect, hRect, xText, yText, colorTxt, colorRect){
    ctx.fillStyle=colorRect;
    ctx.font = "bold 50px Lucida Console";
    ctx.fillRect(xRect,yRect,wRect,hRect);
    ctx.fillStyle=colorTxt;
    ctx.font = "bold 50px Lucida Console";
    textWidth=ctx.measureText(texto).width;
    ctx.fillText(texto,((wRect+xRect)/2)-(textWidth/2)+50,yText); //https://stackoverflow.com/q/24565458


}

function eventoTecla(evt){
    console.log(evt);
    switch(evt.key){
        case "ArrowDown":
            destacar();
        break;
        case "ArrowUp":
        break;
        case "Enter":
        break;
        case "Escape":
        break;
    }
}