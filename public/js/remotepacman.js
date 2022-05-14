

//-----------   Variables globales   -----------//
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;


let intervalo;
/*******************************************************************************
****                             GAME_FRAMEWORK                             ****
*******************************************************************************/
const GFRemote = function () {

		//-------------   Parámetros GET   -------------//

		// Determinamos si hay o no dos jugadores, por parámetro GET
		let url = new URL(window.location);
		let parametroMultiGrupal = url.searchParams.get("online");
		let multijugador=false;
		// Si se especifican 2 jugadores
		// Activar flag
	    let second_player = true;
		setupSockets();
		multijugador = true;
		

		//---------------   Load music   ---------------//
		
		function loadAudio(url){

			return new Promise((resolve)=>{
				let audio = new Audio();
				//El evento en el tipo "Audio" es 'loadeddata'
				audio.addEventListener('loadeddata',()=>resolve(audio), true);
				audio.src = url;
			});
		}


	/*************************************************
	**                    Level                     **
	*************************************************/

	const Level = function (ctx) {

		// Contexto
		this.ctx = ctx;

		// Dimensiones del nivel
		this.lvlWidth = 0;
		this.lvlHeight = 0;

		// Este flag se encarga de no devolver valores de map hasta que este esté totalmente cargado
		this.ready = false;

		// Matriz con el nivel
		this.map = [];

		// Número de pildoras en map
		this.pellets = 0;

		// Timer para el parpadeo de las píldoras de poder
		this.powerPelletBlinkTimer = 0;


		//-------------   Display score   --------------//
		this.displayScore = function(){

			/*
			*	Este método muesta la puntuación y vidas en pantalla
			*/

			//Elegimos fuente y tamaño
			ctx.font = "20px Open Sans"; 

			// Vidas
			ctx.fillStyle = "#00ff00";
			ctx.fillText(`VIDAS:`, TILE_WIDTH, 16);

			// Puntos
			ctx.fillStyle = "#ff0000";
			ctx.fillText(`HI: ${thisGame.highscore}`, 295, 16);
			ctx.fillText(`${thisGame.points}`, 456, 16);

		}

		//--------------   Set map tile   --------------//
		this.setMapTile = function (row, col, newValue) {
			
			// Pasar de coordenadas del canvas a coordenadas de la matriz
			coordY = Math.trunc( col / TILE_HEIGHT );
			coordX = Math.trunc( row / TILE_WIDTH );

			// Validación para aumentar la puntuación
			if((this.map[coordX][coordY] == "3" || this.map[coordX][coordY] == "2") && newValue == "0"){
				
				//Se reduce número de píldoras
				//this.pellets--; 

				// Si se ha comido una píldora de poder
				if(this.map[coordX][coordY] == "3"){

					// Aumento de puntuación
					/*thisGame.points += 50;

					// Activar efectos
					thisGame.modeTimer = 7;

					// Sonido de píldora de poder
					if (!multijugador) {
						power_pellet.currentTime = 0;
						power_pellet.play();
					}*/

				}
				
				// Si es una píldora normal
				else {

					//Aumento de puntuación
					//thisGame.points += 10;

					// Sonido de píldora normal
					/*if (!multijugador) {
						pellet.currentTime = 0;
						pellet.play();
					}*/
				}

				// Si no quedan píldoras
				if(this.pellets === 0){
				
					// Reiniciar tablero
					//reset();
					//this.loadLevel();

					// Audio de final del nivel
					//finish_level.play();

					// Poner el timer a 0 por si la última píldora que coge es de poder, que no haga efecto
					//thisGame.modeTimer = 0;

					// Corrección de altura al recoger la última píldora
					/*switch(inputStates.actualOrientation){
						case 'up': player.y += player.speed; break;
						case 'down': player.y -= player.speed; break;
					}

					// Corrección de altura al recoger la última píldora jugador 2
					switch(inputStates2.actualOrientation){
						case 'up': player2.y += player2.speed; break;
						case 'down': player2.y -= player2.speed; break;
					}*/
					
				}

			}

			// Actualizar valor de la matriz
			this.map[coordX][coordY] = newValue; //Y es cada fila, por la altura! primera componente de vector es Y!
					//EJE Y   EJE X				 //X es cada columna!
			/*
				________________________	
				|    a    |      b     |
				------------------------
				|    c    |      d     |
				------------------------
				x=1,y=0  --> [0][1]=b
				x=0,y=1  --> [1][0]=c
			*/
		};

		//--------------   Get map tile   --------------//
		this.getMapTile = function (row, col) {

			//if (this.ready) // Si map está totalmente cargado
				return parseInt(this.map[row][col]);
		};

		//---------------   Print map   ----------------//
		this.printMap = function () {

			// Imprimir dimendiones
			console.log('Level width: ' + this.lvlWidth);
			console.log('Level height: ' + this.lvlHeight);

			// Imprimir matriz
			for (let i = 0; i < this.map.length; i++) {
				console.log(this.map[i].join('\t') + '\n')
			}
		};

		//---------------   Load level   ---------------//
		/*this.loadLevel = function () {

			// Leer res/levels/1.txt y guardarlo en el atributo map
			fetch('/res/levels/1.txt') // TODO CAMBIAR
				.then(respone => respone.text())
				.then(text => {
					
					// Reiniciar atributos (por si acaso)
					this.map=[];
					this.pellets=0;

					// Separar por filas
					let rows = text.split('\n');

					// Obtener Width y Height
					this.lvlWidth = rows[0].split(' ').filter(Number)[0];
					this.lvlHeight = rows[1].split(' ').filter(Number)[0];

					// Generar matriz de números
					for (let i = 0; i < rows.length; i++){

						// Descartar '#' y espacios vacíos
						if(!rows[i].includes('#') && rows[i] !== '') {

							// Introducir fila (array) en map (quitando vacíos)
							this.map.push(rows[i].split(' ').filter(e => e));
						}
					}
					
					
					//this.printMap();
					this.ready = true;

				});

		};*/

		//----------------   Draw map   ----------------//
		this.drawMap = function () {

			const TILE_WIDTH = thisGame.TILE_WIDTH;
			const TILE_HEIGHT = thisGame.TILE_HEIGHT;

			const tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3,
				'pellet': 2,
				'pacman': 4
			};

			// Recorrer matriz para dibujar tablero
			for (let i = 0; i <= thisGame.screenTileSize[1]; i++) {
				for (let j = 0; j <= thisGame.screenTileSize[0]; j++) {

					// Obtener valor
					let valueID = this.getMapTile(j, i);

					// Si en un muro
					if (valueID > 99) {

						// Pintar cuadro azul
						ctx.fillStyle = '#1010CC';
						ctx.strokeStyle = '#1010CC';
						ctx.beginPath();
						ctx.rect(i*TILE_WIDTH, j*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
						ctx.stroke();
						ctx.fill();

					}
					
					// Si es una píldora normal
					else if (valueID === tileID.pellet){

						// Pintar círculo blanco
						ctx.fillStyle = '#FFFFFF';
						ctx.beginPath();
						ctx.arc(i*TILE_WIDTH+TILE_WIDTH/2, j*TILE_HEIGHT+TILE_HEIGHT/2, player.radius/3, 0, 2 *Math.PI);
						ctx.fill();

					}
					
					// Si es una píldora de poder (se desactivan las píldoras de poder en modo remoto)
					else if (valueID === tileID["pellet-power"]){

						// Únicamente se pinta si powerPelletBlink es mayor que 30
						if (this.powerPelletBlinkTimer < 30){
							
							// Pintar círculo rojo
							ctx.fillStyle = '#FF2200';
							ctx.beginPath();
							ctx.arc(i*TILE_WIDTH+TILE_WIDTH/2, j*TILE_HEIGHT+TILE_HEIGHT/2, player.radius/2, 0, 2 *Math.PI);
							ctx.fill();

						}

						// Si powerPelletBlink llega a 60, reiniciar
						if (this.powerPelletBlinkTimer === 60)
							this.powerPelletBlinkTimer = 0;

						this.powerPelletBlinkTimer += 1;

					} 
					
					// Si es el pacman y está sin inicializar
					else if (player.x === -100 && player.y === -100 && valueID === tileID.pacman){
						
						// Sobreescribir coordenadas jugador 1
						player.y = j*TILE_HEIGHT;
						player.x = i*TILE_WIDTH;
						player.homeY = j*TILE_HEIGHT;
						player.homeX = i*TILE_WIDTH;

						// Sobreescribir coordenadas jugador 2
						player2.y = j*TILE_HEIGHT;
						player2.x = i*TILE_WIDTH;
						player2.homeY = j*TILE_HEIGHT;
						player2.homeX = i*TILE_WIDTH;
					}

					// Si es un fantasma
					else if (valueID <= 13 && valueID >= 10){
						
						// Si no está inicializado
						if (ghosts[valueID-10].x === -1 && ghosts[valueID-10].y === -1) {
							
							// Sobreescribir coordenadas del fantasma
							ghosts[valueID-10].x = i*TILE_WIDTH;
							ghosts[valueID-10].y = j*TILE_HEIGHT;
							ghosts[valueID-10].homeX = i*TILE_WIDTH;
							ghosts[valueID-10].homeY = j*TILE_HEIGHT;
							ghosts[valueID-10].draw();
						}

					}
				}
			}

			// Se muestran el número de vidas en forma de pacmans
			let posX = TILE_WIDTH *5;
			let posY = 10;

			// Pintar 3 pacmans
			for (let i = 0; i < 3; i++) {
				
				// Color amarillo
				ctx.fillStyle = '#FFFF00';

				// Pintar media circunferencia
				ctx.beginPath();
				ctx.arc(posX, posY, player.radius, 0.25 * Math.PI, 1.25 * Math.PI, false);
				ctx.fill();

				// Pintar otra mitad
				ctx.beginPath();
				ctx.arc(posX, posY, player.radius, 0.75 * Math.PI, 1.75 * Math.PI, false);
				ctx.fill();
				
				// Tachamos los pacmans según el número de vidas
				if (i + 1 > thisGame.lifes) {

					// Pintar línea roja
					ctx.beginPath();
					ctx.lineWidth = 5;
					ctx.strokeStyle = "red";
					ctx.moveTo(posX + player.radius, posY - player.radius);
					ctx.lineTo(posX - player.radius, posY + player.radius)
					ctx.stroke();
					ctx.closePath();
					ctx.lineWidth = 1;
				}

				// incrementar x para el siguiente pacman
				posX += TILE_WIDTH*1.2;
			}

		};

		//----------------   Is wall   -----------------//
		this.isWall = function (row, col) {

			// Devuleve true si en las coordenadas (row, col) hay un muro
			return (thisLevel.getMapTile(row, col) > 99);
		};

		//-----------   Check if hit wall   ------------//
		this.checkIfHitWall = function (possiblePlayerX, possiblePlayerY, row, col) {

			// Pasar de coordenadas del canvas, a coordenadas de la matriz
			let coordX = Math.trunc(possiblePlayerX / TILE_WIDTH);
			let coordY = Math.trunc(possiblePlayerY / TILE_HEIGHT);

			// Devuelve true si hay muro y solo es un salto de menos de 2 casillas
			return (this.isWall(coordY, coordX)
				&& Math.abs(coordX - parseInt(row/TILE_WIDTH)) < 2
				&& Math.abs(coordY - parseInt(col/TILE_HEIGHT)) < 2);
						
		};

		//--------   Check if ghost hit door   ---------//
		this.checkIfGhostHitDoor = function(x, y, ghost_id) {

			/*
			* Este método lleva el control de teletransporte de fantasmas
			*/

			// Obtener coordenadas de la matriz
			let ghostX = Math.trunc(x / TILE_WIDTH);
			let ghostY = Math.trunc( y / TILE_HEIGHT);


			switch(thisLevel.getMapTile(ghostY, ghostX)) {

				// Gestiona las puertas teletransportadoras horizontales
				case 20:
					
					// Si va hacia la izquierda, aparecer en la derecha
					if (ghostX < ghosts[ghost_id].speed) { ghosts[ghost_id].x = (thisLevel.map[0].length - 1) * TILE_WIDTH; }
					
					// Si va hacia la derecha, aparecer en la izquierda
					else { ghosts[ghost_id].x = TILE_WIDTH; }

					break;


				// Gestiona las puertas teletransportadoras verticales
				case 21:
					
					// Si va hacia arriba, aparecer abajo
					if (ghostY < ghosts[ghost_id].speed) { ghosts[ghost_id].y = (thisLevel.map.length - 2) * TILE_HEIGHT; }
					
					// Si va hacia abajo, aparecer arriba
					else { ghosts[ghost_id].y = TILE_HEIGHT; }

					break;
			}

		}

		//--------------   Check if hit   --------------//
		this.checkIfHit = function (playerX, playerY, x, y, holgura) {

			// Devuelve true si la holgura es menor o igual que la distancia entre coordenadas
			if (Math.abs(playerX - x) <= holgura && Math.abs(playerY - y) <= holgura) {
				return true;
			}
		};
		
		//---------   Check if hit something   ---------//
		this.checkIfHitSomething = function (playerX, playerY, row, col, pacmanID) {
			
			var tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3,
				'pellet': 2
			};

			// Establecer variable con el jugador correspondiente (1 o 2)
			let pacman;
			if (pacmanID === 2) { pacman = player2; }
			else { pacman = player; }

			// Obtener las coordenadas de la matriz
			let coordX = Math.trunc(playerX / TILE_WIDTH);
			let coordY = Math.trunc(playerY / TILE_HEIGHT);

			switch(thisLevel.getMapTile(coordY, coordX)){
				
				// Gestiona la recogida de píldoras
				case tileID.pellet:

					thisLevel.setMapTile(col, row, '0');
					break;

				// Gestiona la recogida de píldoras de poder
				case tileID['pellet-power']:

					thisLevel.setMapTile(col, row, '0');
					break;

				// Gestiona las puertas teletransportadoras horizontales
				case tileID["door-h"]:
					
					// Si va hacia la izquierda, aparecer en la derecha
					if (coordX < pacman.speed) { pacman.x = (thisLevel.map[0].length - 2) * TILE_WIDTH; }
					
					// Si va hacia la derecha, aparecer en la izquierda
					else { pacman.x = TILE_WIDTH; }

					break;


				// Gestiona las puertas teletransportadoras verticales
				case tileID["door-v"]:

					// Si va hacia arriba, aparecer abajo
					if (coordY < pacman.speed) { pacman.y = (thisLevel.map.length - 1) * TILE_HEIGHT; }
					
					// Si va hacia abajo, aparecer arriba
					else { pacman.y = TILE_HEIGHT; }

					break;

			}			

		};

	}; // end Level


	/*------------------------------------------------
	|                      Game                      |
	------------------------------------------------*/

	const thisGame = {

		getLevelNum: function () {
			return 0;
		},

		setMode: function (mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},

		screenTileSize: [24, 21],

		TILE_WIDTH: 24,
		TILE_HEIGHT: 24,

		ghostTimer: 0,

		NORMAL: 1,
		HIT_GHOST: 2,
		GAME_OVER: 3,
		WAIT_TO_START: 4,
		modeTimer: 0,

		lifes: 3,
		points: 0,
		highscore: 0

	};

	// Generar Level
	const thisLevel = new Level(canvas.getContext("2d"));

	// Poner modo de juego normal
	thisGame.setMode(thisGame.NORMAL);

	// variables para contar frames/s, usadas por measureFPS
	let frameCount = 0;
	let lastTime;
	let fpsContainer;
	let fps;

	// Almacenará los movimientos a realizar del pacman en las keys actualOrientation y nextOrientation
	inputStates = {nextOrientation: 'right'};
	inputStates2 = {nextOrientation: 'left'};

	const TILE_WIDTH = 24, TILE_HEIGHT = 24;

	// Información de los fantasmas
	const numGhosts = 4;
	const ghostcolor = {};
	ghostcolor[0] = "rgba(255,	0,	  0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128,   0, 255)";
	ghostcolor[4] = "rgba( 50,	50, 255, 255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost

	// hold ghost objects
	const ghosts = {};

	/*************************************************
	**                    Ghost                     **
	*************************************************/
	const Ghost = function (id, ctx) {

		// Posición actual del fantasma
		this.x = -1;
		this.y = -1;
		
		// Velocidad del fantasma
		this.speed = 1;

		// Estado del fantasma
		this.state = Ghost.NORMAL;
		
		// Contexto
		this.ctx = ctx;
		
		// Id del fantasma (0-3)
		this.id = id;

		// Posición inical del fantasma (donde volverá al morir)
		this.homeX = 0;
		this.homeY = 0;

		// Dirección a la que se mueve el fantasma
		this.actualOrientation = "";

		// Radio del la cabeza del fantasma
		this.radius = 10;

		//------------------   Draw   ------------------//
		this.draw = function () {

			/*// Opción de pintar fanrasmas cuadrados
			ctx.beginPath();
			ctx.fillStyle = ghostcolor[this.id];
			ctx.rect(this.x, this.y, TILE_WIDTH, TILE_HEIGHT);
			ctx.fill();*/

			// Color del pacman
			let color = ghostcolor[this.id];

			// Si el fantasma está asustado
			if (this.state === Ghost.VULNERABLE){
				color = ghostcolor[4]; // Color azul

				// Si queda menos de 1 segundo, parpadeo
				if (thisGame.modeTimer < 2 && parseInt(thisGame.ghostTimer / 10) % 2 !== 0) {
					color = ghostcolor[5]; // Color blanco
				}
				
			}

			// Obtener centro de la casilla
			let center = {x: this.x + TILE_WIDTH/2, y: this.y + TILE_HEIGHT/2 + this.radius - 1};
			
			// Si no está muerto
			if (this.state !== Ghost.SPECTACLES) {          
				
				// Dibujar cuerpo
				ctx.beginPath();

				// Colores de la cabeza y patas
				ctx.fillStyle = color;
				ctx.strokeStyle = "black";

				// Cabeza
				ctx.moveTo(center.x - this.radius, center.y);
				ctx.lineTo(center.x - this.radius, center.y - this.radius);
				ctx.arc(center.x, center.y - this.radius, this.radius, Math.PI, 2*Math.PI);

				// Patas
				ctx.arc(center.x + this.radius * 0.66, center.y, this.radius / 3, 0, Math.PI);
				ctx.arc(center.x, center.y, this.radius / 3, 0, Math.PI);
				ctx.arc(center.x - this.radius * 0.66, center.y, this.radius / 3, 0, Math.PI);

				// Pintar
				ctx.fill();
				ctx.stroke();

				ctx.closePath();
			
			}

            // Ojo 1
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(center.x + this.radius / 2.5, center.y - this.radius - 1, this.radius / 2.6, 0, 2*Math.PI);
            ctx.arc(center.x + this.radius / 2.5, center.y - this.radius + 1, this.radius / 2.6, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();

            // Ojo 2
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(center.x - this.radius / 2.5, center.y - this.radius + 1, this.radius / 2.6, 0, 2*Math.PI);
            ctx.arc(center.x - this.radius / 2.5, center.y - this.radius - 1, this.radius / 2.6, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();

			// Posicionar ojos según la orientación
			switch(this.actualOrientation) {
				case 'left': center.x -= 2; break;
				case 'right': center.x += 2; break;
				case 'up': center.y -= 3; break;
				case 'down': center.y += 3; break;
			}

            // Pupila 1
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.arc(center.x + this.radius / 2.5, center.y - this.radius, this.radius / 5, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();

            // Pupila 2
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.arc(center.x - this.radius / 2.5, center.y - this.radius, this.radius / 5, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();

		}; // draw


		//------------------   Move   ------------------//
		this.move = function () {

			// Si el fantasma no está muerto ni el juega pausado
			if (this.state !== Ghost.SPECTACLES && this.actualOrientation !== 'space') {

				// Obtenemos los posibles movimientos del fantasma
				let solutions = [];
				let lastSolution;

				// Si las posiciones ya están inicializadas
				if (this.x !== -1 && this.y !== -1) {

					// Si el fantasma está centrado en y
					if (Math.trunc(this.y / TILE_HEIGHT) === Math.trunc((this.y + TILE_HEIGHT - 1) / TILE_HEIGHT)) {
				
						// Si no hay muros a la izquierda
						/*if (!thisLevel.checkIfHitWall(this.x - this.speed, this.y, this.x, this.y)) {
							
							// Si actualmente se está moviendo a la derecha
							if (this.actualOrientation === 'right') {
								
								// Guardar izquiera como última opción
								lastSolution = 'left';

							}
							// Si no, añadir izquierda como posibles soluciones
							else { solutions.push('left'); }

						}*/

						// Si no hay muros a la derecha
						/*if (!thisLevel.checkIfHitWall(this.x + this.speed + TILE_WIDTH, this.y, this.x, this.y)) {

							// Si actualmente se está moviendo a la izquierda
							if (this.actualOrientation === 'left') {
								
								// Guardar derecha como última opción
								lastSolution = 'right';
							
							// Si no, añadir derecha como posibles soluciones
							} else { solutions.push('right'); }

						}*/

					}

					// Si el fantasma está centrado en x
					if (Math.trunc(this.x / TILE_HEIGHT) === Math.trunc((this.x + TILE_HEIGHT - 1) / TILE_HEIGHT)) {

						// Si no hay muros arriba
						/*if (!thisLevel.checkIfHitWall(this.x, this.y - this.speed, this.x, this.y)) {
								
							// Si actualmente se está moviendo hacia abajo
							if (this.actualOrientation === 'down') {
								
								// Guardar arriba como última opción
								lastSolution = 'up';
							
							// Si no, añadir arriba como posibles soluciones
							} else { solutions.push('up'); }

						}*/

						// Si no hay muros abajo
						/*if (!thisLevel.checkIfHitWall(this.x, this.y + this.speed + TILE_HEIGHT, this.x, this.y)) {
								
							// Si actualmente se está moviendo hacia arriba
							if (this.actualOrientation === 'up') {
								
								// Guardar abajo como última opción
								lastSolution = 'down';
							
							// Si no, añadir abajo como posibles soluciones
							} else { solutions.push('down'); };

						}*/

					}

					let nextOrientation;

					// Si no hay posibles soluciones, escoger la última opción
					if (solutions.length === 0) { 
						//nextOrientation = lastSolution; 
					}
					
					// Si no, escoger una aleatoria entre las posibles
					else { 
						//nextOrientation = solutions[Math.floor(Math.random()*solutions.length)]; 
					}
					
					switch(nextOrientation) {

						// En caso de haber escogido izquierda
						case 'left':

							// Comprobar teletransporte
							//thisLevel.checkIfGhostHitDoor(this.x - this.speed, this.y, this.id);

							// Mover a la izquierda
							//this.x -= this.speed;

							// Actualizar movimiento actual
							//this.actualOrientation = 'left';

							break;

						// En caso de haber escogido derecha
						case 'right':

						// Comprobar teletransporte
						//thisLevel.checkIfGhostHitDoor(this.x + this.speed, this.y, this.id);

							// Mover a la derecha
							//this.x += this.speed;

							// Actualizar movimiento actual
							//this.actualOrientation = 'right';

							break;
						
						// En caso de haber escogido arriba
						case 'up':

							// Comprobar teletransporte
							//thisLevel.checkIfGhostHitDoor(this.x, this.y - this.speed, this.id);

							// Mover hacia arriba
							//this.y -= this.speed;

							// Actualizar movimiento actual
							//this.actualOrientation = 'up';

							break;
						
						// En caso de haber escogido abajo
						case 'down':

							// Comprobar teletransporte
							//thisLevel.checkIfGhostHitDoor(this.x, this.y + TILE_HEIGHT, this.id);

							// Mover hacia abajo
							//this.y += this.speed;

							// Actualizar movimiento actual
							//this.actualOrientation = 'down';

							break;

					}					
				}	
			}
			
			// Si el fantasma está muerto
			else if (this.state === Ghost.SPECTACLES) {

				// Moverse en x hacia home
				//if (this.x > this.homeX) { this.x -= this.speed; }
				//else if (this.x < this.homeX) { this.x += this.speed; }

				// Moverse en y hacia home
				//if (this.y > this.homeY) { this.y -= this.speed; }
				//else if (this.y < this.homeY) { this.y += this.speed; }

				// Si ha llegado a home, volver al estado normal
				//if (this.x == this.homeX && this.y == this.homeY) {
				//	this.state = Ghost.NORMAL;
				//}

			}

		};

	}; // fin clase Ghost

	//----   Static variables (ghosts states)   ----//
	Ghost.NORMAL = 1;
	Ghost.VULNERABLE = 2;
	Ghost.SPECTACLES = 3;


	/*************************************************
	**                    Pacman                    **
	*************************************************/
	const Pacman = function (id) {

		// Radio del pacman
		this.radius = 10;

		// Posición actual del Pacman (se inicializa a -100 para que no coincida con los fantasmas)
		this.x = -100;
		this.y = -100;

		// Posición inicial del pacman (donde reaparecerá si muere)
		this.homeX = 0;
		this.homeY = 0;

		// Velocidad del pacman
		this.speed = 3;

		// Ángulos para dibujar el pacman
		this.angle1 = 0.25;
		this.angle2 = 1.75;

		// Orientación de las circunferencias que forman el pacman
		this.orientation = {};

		// Último movimiento antes de pausar
		this.lastMove = '';

		// ID del pacman (jugador1 o jugador2)
		this.id = id;
	};

	//--------------   Move pacman   ---------------//
	Pacman.prototype.movePacman = function(orientation){

		/*
		* Este método actualiza la posición del Pacman según el parámetro "orientation".
		* Antes de realizar cualquier movimiento se comprueba lo siguiente:
		*	- Que en la próxima posición no esté ocupada por un muro
		*	- Que el pacman encaje en el hueco de la siguiente posición
		*		· Para ello se comprueba que el pacman se encuentre centrado en una misma casilla.
		*/
		
		let coordY;
		let coordX;

		switch(orientation){

			// Si el pacman va hacia la izquierda
			case "left":
			
				// Obtenemos siguiente posición
				coordX = this.x - this.speed;

				// Si no hay un muros
				if (!thisLevel.checkIfHitWall(coordX, this.y, this.x, this.y)
					// y el pacman está centrado en y
					&& (Math.trunc(this.y / TILE_HEIGHT) === Math.trunc((this.y + TILE_HEIGHT - 1) / TILE_HEIGHT))) {

						// Comprobar si es una puerta o píldora
						//thisLevel.checkIfHitSomething(coordX, this.y, this.x + TILE_WIDTH - 10, this.y, this.id);

						// Avanza a la izquierda
						//this.x -= this.speed;

						// Actualizar orientación actual
						if (this.id === 2) {
						//	inputStates2.actualOrientation = orientation;
						}
						else { 
							//inputStates.actualOrientation = orientation; 
						}
						return true;

				}
				break;

			// Si el pacman va hacia la derecha
			case "right":
			
				// Obtenemos siguiente posición
				coordX = this.x + this.speed + TILE_WIDTH;

				// Si no hay un muros
				if (!thisLevel.checkIfHitWall(coordX, this.y, this.x, this.y)
					// Y el pacman está centrado en y
					&& (Math.trunc(this.y / TILE_HEIGHT) === Math.trunc((this.y + TILE_HEIGHT - 1) / TILE_HEIGHT))) {
						
						// Comprobar si es una puerta o píldora
						//thisLevel.checkIfHitSomething(coordX, this.y, this.x + 10, this.y, this.id);

						// Avanza a la derecha
						//this.x += this.speed;

						// Actualizar orientación actual
						if (this.id === 2) {
							//inputStates2.actualOrientation = orientation;
						}
						else { 
							//inputStates.actualOrientation = orientation; 
						}
						return true;

				}
				break;

			// Si el pacman va hacia arriba
			case "up":

				// Obtenemos siguiente posición
				coordY = this.y - this.speed;
				
				// Si no hay un muros y el pacman cabe
				if (!thisLevel.checkIfHitWall(this.x, coordY, this.x, this.y)
					// y el pacman está centrado en x
					&& (Math.trunc(this.x / TILE_WIDTH) === Math.trunc((this.x + TILE_WIDTH - 1) / TILE_WIDTH))) {
						
						// Comprobar si es una puerta o píldora
						//thisLevel.checkIfHitSomething(this.x, coordY, this.x, this.y + TILE_HEIGHT - 10, this.id);

						// Avanza hacia arriba
						//this.y -= this.speed;

						// Actualizar orientación actual
						if (this.id === 2) {
						//	inputStates2.actualOrientation = orientation;
						}
						else { 
						//	inputStates.actualOrientation = orientation; 
						}
						return true;
				}
				break;
			
			// Si el pacman va hacia abajo
			case "down":

				// Obtenemos siguiente posición
				coordY = this.y + this.speed + TILE_HEIGHT;

				// Si no hay un muros y el pacman cabe
				if (!thisLevel.checkIfHitWall(this.x, coordY, this.x, this.y)
					// y el pacman está centrado en x
					&& (Math.trunc(this.x / TILE_WIDTH) === Math.trunc((this.x + TILE_WIDTH - 1) / TILE_WIDTH))) {
						
						// Comprobar si es una puerta o píldora
						//thisLevel.checkIfHitSomething(this.x, coordY, this.x, this.y + 10, this.id);

						// Avanza hacia abajo
						//this.y += this.speed;

						// Actualizar orientación actual
						if (this.id === 2) {
						//	inputStates2.actualOrientation = orientation;
						}
						else { 
						//	inputStates.actualOrientation = orientation; 
						}
						return true;
				}
				break;

			// Si pulsa espacio
			case "space":
				
				return true;
				break;
				
				
		}
	
	}

	//------------------   Move   ------------------//
	Pacman.prototype.move = function () {

		/*
		* En la variable inputStates, se almacenan las keys:
		*	- nextOrientation: que contiene el próximo movimiento a realizar
		*	- actualOrientation: contiene el moviento que el pacman está realizando actualmente.
		*/

		// Mover pacman únicamente si está inicializado
		if (this.x !== -100 && this.y !== -100) {

			// Si el id del pacman es 2
			if (this.id === 2) {
				
				// Intenta hacer el siguiente movimiento, si no lo consigue
				if (!this.movePacman(inputStates2.nextOrientation)){

					// Sigue realizando el movimiento actual
					this.movePacman(inputStates2.actualOrientation);
				}

			} 
			
			// Si el id del pacman es 1
			else {

				// Intenta hacer el siguiente movimiento, si no lo consigue
				if (!this.movePacman(inputStates.nextOrientation)){

					// Sigue realizando el movimiento actual
					this.movePacman(inputStates.actualOrientation) 
						
						//hit_wall.play();
					
					
				}	
			}
			
		

			// Por cada fantasma
			for (let i = 0; i < numGhosts; i++) {
				
				// Si ha chocado
				if (thisLevel.checkIfHit(this.x, this.y, ghosts[i].x, ghosts[i].y, 10)) {

					// Si el fantasma es vulnerable
					if (ghosts[i].state === Ghost.VULNERABLE) {

						// Matar fantasma
						//ghosts[i].state = Ghost.SPECTACLES;

						// Sumar 100 puntos
						//thisGame.points += 100;

						// Sonido del comer fantasma
						//ghost_dead.pause();
						//ghost_dead.duration = 0;
						if (!multijugador) {
							//ghost_dead.currentTime = 0;
							///ghost_dead.play();
						}

					}

					// Si el fantasma está normal y no se ha perdido la partida
					else if (ghosts[i].state === Ghost.NORMAL && thisGame.mode !== thisGame.GAME_OVER) {
						
						// Restar una vida
						thisGame.lifes--;

						// Resetear partida
						reset();

						// Si era la última vida
						if (thisGame.lifes === 0) {

							// Pausar juego
							document.dispatchEvent(new KeyboardEvent('keydown', {'key': ' '}));

							// Activas GAME OVER
							thisGame.setMode(thisGame.GAME_OVER);

							// Reproducir sonido de Game Over
							//game_over.play();
							
						}
						
						else {

							// Reproducir sonido de pacman muerto
							if (!multijugador) {
								pacman_dead.currentTime = 0;
							}
							//pacman_dead.play();
						}
					}
				}
			}
		}
	};

	//------------------   Draw   ------------------//
	Pacman.prototype.draw = function (x, y) {

		/*
		* Método para dibujar el pacman
		* El pacman está compuesto por 2 medias circunferencias.
		* La orientación del pacman se realiza invirtiéndolas.
		*/

		// Si se muestra la pantalla GAME OVER, pintar pacman mirando a la derecha
		if (thisGame.mode === thisGame.GAME_OVER) {
			inputStates.actualOrientation = 'right';
			inputStates2.actualOrientation = 'right';
		} 

		// Obtener inputStates del jugador correspondiente (1 o 2)
		let input;
		if (this.id === 2) { input = inputStates2; }
		else { input = inputStates; }
		
		// Obtener posición de las circunferencias según la orientación del pacman
		switch (input.actualOrientation) {
			case 'left':
				this.orientation = {inferior: true, superior: true};
				break;
			case 'right':
				this.orientation = {inferior: false, superior: false};
				break;
			case 'up':
				this.orientation = {inferior: false, superior: true};
				break;
			case 'down':
				this.orientation = {inferior: true, superior: false};
				break;
		}

		// Color amarillo
		ctx.fillStyle = '#FFFF00';

		// Pintar media circunferencia
		ctx.beginPath();
		ctx.arc(x+this.radius + (TILE_WIDTH/this.radius), y+this.radius + (TILE_HEIGHT/this.radius), this.radius, 0.25 * Math.PI, 1.25 * Math.PI, this.orientation.inferior);
		ctx.fill();

		// Pintar otra mitad
		ctx.beginPath();
		ctx.arc(x+this.radius + (TILE_WIDTH/this.radius), y+this.radius + (TILE_HEIGHT/this.radius), this.radius, 0.75 * Math.PI, 1.75 * Math.PI, this.orientation.superior);
		ctx.fill();

		/* // Opción de poner el pacman cuadrado
		ctx.beginPath();
		ctx.rect(x, y, TILE_WIDTH, TILE_HEIGHT);
		ctx.fill();
		*/

	};

	// Generar pacman
	const player = new Pacman(1);
	const player2 = new Pacman(2);

	// Generar fantasmas
	for (let i = 0; i < numGhosts; i++) {
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}

	// Cargar nivel
	//thisLevel.loadLevel(thisGame.getLevelNum());

	// Obetener FPS
	const measureFPS = function (newTime) {
		// la primera ejecución tiene una condición especial

		if (lastTime === undefined) {
			lastTime = newTime;
			return;
		}

		// calcular el delta entre el frame actual y el anterior
		const diffTime = newTime - lastTime;

		if (diffTime >= 1000) {

			fps = frameCount;
			frameCount = 0;
			lastTime = newTime;
		}

		// mostrar los FPS en una capa del documento
		// que hemos construído en la función start()
		fpsContainer.innerHTML = 'FPS: ' + fps;
		frameCount++;
	};

	// Limpiar canvas
	const clearCanvas = function () {
		ctx.clearRect(0, 0, w, h);
	};

	// Control de efecto de las píldoras de poder
	const updateTimers = function () {
		
		/*if(thisGame.modeTimer === 7){
			
			// Poner timer a 0 (control de parpadeo de fantasmas)
			thisGame.ghostTimer = 0;

			// Poner contador a 6 (control de segundos)
			thisGame.modeTimer = 6;

			// Por cada fantasma
			for (let i = 0; i < numGhosts; i++) {

				// Si no está muerto
				if (ghosts[i].state !== Ghost.SPECTACLES) {
					
					// Cambiar estado a "vulnerable"
					ghosts[i].state = Ghost.VULNERABLE;

				}
				
			}
			
			if(intervalo != undefined){
				
				clearInterval(intervalo);
			}

			intervalo = setInterval(function(){
				
				// Si el tiempo llega a 0
				if(thisGame.modeTimer <= 0){

					// Por cada fantasma
					for (let i = 0; i < numGhosts; i++) {
						temporizadorActivo=false;
						clearInterval(intervalo);

						// Si no está muerto
						if (ghosts[i].state !== Ghost.SPECTACLES) {

							// Cambiar estado a normal
							ghosts[i].state = Ghost.NORMAL;
						}
					}
				}
				
				// Si el juego NO está pausado
				if (inputStates.actualOrientation !== 'space'){
					
					// Decrementar contador
					thisGame.modeTimer--;
				}
				
			}, 1000);
			
			
		}

		// Si el timer llega a 60, reiniciar, sino incrementar en 1
		if (thisGame.ghostTimer === 60) {
			thisGame.ghostTimer = 0;
		} else { thisGame.ghostTimer++; }*/
		
	};


	/*------------------------------------------------
	|                   Main_loop                    |
	------------------------------------------------*/
	const mainLoop = function (time) {
		//console.log("Multijugador: "+multijugador);
		//console.log("en remoto: "+conexionJugadorRemoto);
		
			
				/*	
				// Ejercicio 1

				// Color verde
				ctx.strokeStyle = '#00FF00';
				ctx.fillStyle = '#00FF00';

				ctx.beginPath();
				// Circulos completos (0, 2*PI) en posición random de radio 5
				ctx.arc(Math.floor(Math.random() * (w)), Math.floor(Math.random() * (h)), 5, 0, 2 * Math.PI);
				ctx.fill();
			*/

			// main function, called each frame
			measureFPS(time);

			// Mover fantasmas
			/*for (let i = 0; i < numGhosts; i++) {
				if((multijugador && isEmisor) || !multijugador){
					ghosts[i].move();
				}
			}*/
			

			// Mover Pacman
			//player.move();
			//if (second_player) { player2.move(); }
			thisLevel.map=mapa;
			thisGame.lifes=nVidas;
			thisGame.mode=estadoJuego;
			player.x=player1X;
			player.y=player1Y;
			inputStates.actualOrientation=player1Orientacion;
			player2.x=player2X;
			player2.y=player2Y;
			inputStates2.actualOrientation=player2Orientacion;
			thisGame.modeTimer=estadoTiempo;
			thisGame.ghostTimer=estadoTiempoFantasmas;
			thisGame.points=puntuacionActual;
			thisGame.highscore=puntuacionRecord;

			for(let i=0; i<4; i++){
				ghosts[i].x=ghostsPosition[i].x;
				ghosts[i].y=ghostsPosition[i].y;
				ghosts[i].actualOrientation=ghostsPosition[i].orientacion;
				ghosts[i].state=ghostsPosition[i].estado;
			}
			thisLevel.lvlWidth=21;
			thisLevel.lvlHeight=25;

			// Limpiar canvas
			clearCanvas();

			// Pintar tablero
			if(thisLevel.map!=undefined){
				thisLevel.drawMap();
			}
			

			// Pintar fantasmas
			for (let i = 0; i < numGhosts; i++) {
				ghosts[i].draw();
			}

			// Si la partida ha finalizado (victoria o derrota), habrá que indicárselo pantalla mediante
			let pantalla = new Pantalla();

			switch(thisGame.mode){

				case thisGame.GAME_OVER:
					pantalla.mostrarJuegoTerminado(ctx, thisGame.points);
					break;

			}

			// Pintar Pacman
			player.draw(player.x, player.y);
			if (second_player) { player2.draw(player2.x, player2.y); }

			// Actualizar timers
			updateTimers();

			//Llamada a actualización de puntuación
			thisLevel.displayScore();
		
		
		// call the animation loop every 1/60th of second
		requestAnimationFrame(mainLoop);
	};


	//-------------   Add listeners   --------------//
	const addListeners = function () {

		// Generar listener de teclas
		document.addEventListener("keydown", (event) => {
			envioDatosAHost(event.key);
			// Si ha pulsado espacio cuando estaba en pause
			if ((inputStates.actualOrientation === 'space' || thisGame.mode !== thisGame.NORMAL) && event.key === ' ') {
				
				// Si el juego ha finalizado
				/*if(thisGame.mode === thisGame.GAME_OVER){

					// Recargar nivel
					thisLevel.loadLevel();

					// Si ha ganado con un nuevo redord, almacenarlo
					if(thisGame.points > thisGame.highscore){
						thisGame.highscore = thisGame.points;
					}
 
					// Volver a modo normal
					thisGame.setMode(thisGame.NORMAL);
					
					// Reiniciar vidas y puntos
					thisGame.lifes = 3;
					thisGame.points = 0;

					// Orientación derecha pacman
					inputStates.nextOrientation = 'right';

					// Orientación izquierda pacman 2
					inputStates2.nextOrientation = 'left'; 

				}
				
				else {

					// Al quitar el pause, restaurar última acción
					inputStates.nextOrientation = player.lastMove;
					inputStates2.nextOrientation = player2.lastMove;
				}*/

				// Empezar a mover pacman
				//inputStates.actualOrientation = '';

				// Empezar a mover pacman 2
				//inputStates2.actualOrientation = '';
							
				// Empezar a mover fantasmas
				/*for (let i = 0; i < numGhosts; i++) {
					ghosts[i].actualOrientation = '';
				}*/
				//envioDatosAHost(" ");
				
			}
			
			// Si actualmente el juego NO está en pause
			else if (inputStates.actualOrientation !== 'space' &&  thisGame.mode === thisGame.NORMAL) {
				
				switch (event.key) {

					// Si se ha pulsado la tecla izquierda
					case "ArrowLeft":
						//inputStates.nextOrientation = 'left';
						//envioDatosAHost("ArrowLeft");
						break;

					// Si se ha pulsado la tecla derecha
					case "ArrowRight":
						//envioDatosAHost("ArrowRight");
						//inputStates.nextOrientation = 'right';
						break;

					// Si se ha pulsado la tecla abajo
					case "ArrowDown":
						//envioDatosAHost("ArrowDown");
						//inputStates.nextOrientation = 'down';
						break;

					// Si se ha pulsado la tecla arriba
					case "ArrowUp":
						//envioDatosAHost("ArrowUp");
						//inputStates.nextOrientation = 'up';
						break;
					case " ":
						//envioDatosAHost(" ");
						break;

					// Si se ha pulsado la tecla izquierda
					/*case "a":
						inputStates2.nextOrientation = 'left';
						break;

					// Si se ha pulsado la tecla derecha
					case "d":
						inputStates2.nextOrientation = 'right';
						break;

					// Si se ha pulsado la tecla abajo
					case "s":
						inputStates2.nextOrientation = 'down';
						break;

					// Si se ha pulsado la tecla arriba
					case "w":
						inputStates2.nextOrientation = 'up';
						break;*/

					// Si se ha pulsado la tecla espacio
					/*case " ":

						// Guardar orientación actual
						player.lastMove = inputStates.actualOrientation;
						player2.lastMove = inputStates2.actualOrientation;

						// Poner Pacman en pause
						inputStates.nextOrientation = 'space';
						inputStates.actualOrientation = 'space';

						// Poner Pacman 2 en pause
						inputStates2.nextOrientation = 'space';
						inputStates2.actualOrientation = 'space';

						// Poner fantasmas en pause
						for (let i = 0; i < numGhosts; i++) {
							ghosts[i].actualOrientation = 'space';
						}

						console.log('Juego pausado');
						
						break;*/
				}
			}

			// Mover pacman
			//Pacman.prototype.move();
			player.move();
			if (second_player) { player2.move(); }
			

		}, false);

	};

	//-----------------   Reset   ------------------//
	const reset = function () {

		// Reiniciar fantasmas
		/*for (let i = 0; i < numGhosts; i++){
			ghosts[i].x = -1;
			ghosts[i].y = -1;
			ghosts[i].state = Ghost.NORMAL;
		}
		
		// Reiniciar posición del pacman
		if (player.homeY === 0 && player.homeX === 0){
			player.homeX = -100;
			player.homeY = -100;
		}

		if (player2.homeY === 0 && player2.homeX === 0){
			player2.homeX = 100;
			player2.homeY = -100;
		}

		player.x = player.homeX;
		player.y = player.homeY;
		player2.x = player2.homeX;
		player2.y = player2.homeY;

		// Colocar pacman hacia la derecha
		inputStates.nextOrientation = 'right';
		inputStates2.nextOrientation = 'left';

		// Pintar pacman en la casilla de inicio
		player.draw(player.homeX, player.homeY);
		player2.draw(player2.homeX, player2.homeY);*/

	};

	//-----------------   Start   ------------------//
	const start = function () {

		// adds a div for displaying the fps value
		fpsContainer = document.createElement('div');
		document.body.appendChild(fpsContainer).style.color = "#FFFFFF";

		// Activar listerners
		addListeners();

		// Reinicar tablero
		reset();

		// start the animation
		requestAnimationFrame(mainLoop);
	};


	// Our GameFramework returns a public API visible from outside its scope
	return {
		start: start,

		// solo para el test 10
		ghost: Ghost,

		// solo para los test12 y test13
		ghosts: ghosts,

		// solo para el test12
		thisLevel: thisLevel,

		// solo para el test 13
		Ghost: Ghost,

		// solo para el test14
		thisGame: thisGame
	};
};

// New Game Framework, start.
//var game = new GF();
//game.start();

