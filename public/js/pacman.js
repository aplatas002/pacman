// >=test1
// Variables globales de utilidad
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;

// >=test1
// GAME FRAMEWORK 
const GF = function () {

	const Level = function (ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;

		this.ready = false;     //Se va a usar el siguiente flag

		this.map = [];

		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;



		/**
		 * Mostrar puntuación en pantalla
		 */
		this.displayScore = function(){
			let puntuacion = thisGame.points;
			let maxPunt = thisGame.highscore;
			let vidas = thisGame.lifes;
			ctx.font = "20px Open Sans"; //Elegimos fuente y tamaño
			ctx.fillStyle = "#00ff00";
			ctx.fillText(`VIDAS:`, 0, 15);
			ctx.fillStyle = "#ffff00";
			ctx.fillText(vidas, 66, 15);
			ctx.fillStyle = "#ff0000";
			ctx.fillText(`HI: ${maxPunt}`, 90, 15);
			ctx.fillText(`PUNTUACIÓN: ${puntuacion}`, 300, 15);
		}

		this.setMapTile = function (row, col, newValue) {
			
			

			coordY = Math.trunc( col / TILE_HEIGHT );

			coordX = Math.trunc( row / TILE_WIDTH );

			//Validación para aumentar la puntuación:
			if((this.map[coordX][coordY] == "3" || this.map[coordX][coordY] == "2") && newValue == "0"){
				
				//Se reduce número de píldoras
				this.pellets--; 

				if(this.map[coordX][coordY]=="3"){

					//Aumento de puntuación en caso de píldora de poder
					thisGame.points+=50;
					thisGame.ghostTimer = 7;

				}else{
					//Aumento de puntuación en caso de píldora normal
					thisGame.points+=10; 
				}
			}


			this.map[coordX][coordY] = newValue; //Y es cada fila, por la altura! primera componente de vector es Y!
					//EJE Y   EJE X				 //X es cada columna!
												//FIXME Invertir componentes
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

		this.getMapTile = function (row, col) {

			if (this.ready)
				return parseInt(this.map[row][col]);
		};

		this.printMap = function () {

			console.log('Level width: ' + this.lvlWidth);
			console.log('Level height: ' + this.lvlHeight);

			for (let i = 0; i < this.map.length; i++) {
				console.log(this.map[i].join('\t') + '\n')
			}
		};

		this.loadLevel = function () {

			// Leer res/levels/1.txt y guardarlo en el atributo map
			fetch('/res/levels/1.txt')
				.then(respone => respone.text())
				.then(text => {

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
					for(let i=0; i<this.map.length; i++){
						for(let j=0; j<this.map[i].length; j++){
							
							if(this.map[i][j]=="2" || this.map[i][j]=="3"){
								this.pellets++;
							}
						}
					}
					this.printMap();

					this.ready = true;

				});


			// test10
			// TODO Tu código aquí

		};

		this.drawMap = function () {

			const TILE_WIDTH = thisGame.TILE_WIDTH;
			const TILE_HEIGHT = thisGame.TILE_HEIGHT;

			const tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3
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
					else if (valueID === 2){

						// Pintar círculo blanco
						ctx.fillStyle = '#FFFFFF';
						ctx.beginPath();
						ctx.arc(i*TILE_WIDTH+TILE_WIDTH/2, j*TILE_HEIGHT+TILE_HEIGHT/2, player.radius/3, 0, 2 *Math.PI);
						ctx.fill();

					}
					
					// Si es una píldora de poder
					else if (valueID === 3){

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
					else if (player.x === -10 && player.y === -10 && valueID === 4){
						
						// Sobreescribir coordenadas
						player.y = j*TILE_HEIGHT;
						player.x = i*TILE_WIDTH;
					}

					// Si es un fantasma
					else if (valueID <= 13 && valueID >= 10){
						
						if (ghosts[valueID-10].x === -1 && ghosts[valueID-10].y === -1) {
							
							ghosts[valueID-10].x = i*TILE_WIDTH;
							ghosts[valueID-10].y = j*TILE_HEIGHT;
							ghosts[valueID-10].draw();
						}

						

					}
				}
			}

		};


		this.isWall = function (row, col) {

			// Devuleve true si en las coordenadas (row, col) hay un muro
			return (thisLevel.getMapTile(row, col) > 99);
		};


		this.checkIfHitWall = function (possiblePlayerX, possiblePlayerY, row, col) {

			// Pasar de coordenadas del canvas, a coordenadas de la matriz
			let coordX = Math.trunc(possiblePlayerX / TILE_WIDTH);
			let coordY = Math.trunc(possiblePlayerY / TILE_HEIGHT);

			// Devuelve true si hay muro y solo es un salto de menos de 2 casillas
			return (this.isWall(coordY, coordX)
				&& Math.abs(coordX - parseInt(row/TILE_WIDTH)) < 2
				&& Math.abs(coordY - parseInt(col/TILE_HEIGHT)) < 2);
						
		};



		// >=test11
		this.checkIfHit = function (playerX, playerY, x, y, holgura) {
			// Test11

			// TODO REVISAR
			if (Math.abs(playerX - x) <= holgura && Math.abs(playerY - y) <= holgura) {
				return true;
			}
		};

		this.checkIfHitSomething = function (playerX, playerY, row, col) {
			
			var tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3,
				'pellet': 2
			};

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
					thisLevel.setMapTile(coordY, coordX, '0');
					//thisLevel.puntuacion+=50;
					//TODO Efecto a realizar (fantasmas se asustan)
					break;

				// Gestiona las puertas teletransportadoras horizontales
				case tileID["door-h"]:
					
					// Si va hacia la izquierda, aparecer en la derecha
					if (coordX < player.speed) {
						player.x = (thisLevel.map[0].length - 1) * TILE_WIDTH;
					
					}
					
					// Si va hacia la derecha, aparecer en la izquierda
					else { player.x = 0; }

					break;


				// Gestiona las puertas teletransportadoras verticales
				case tileID["door-v"]:

					// Si va hacia arriba, aparecer abajo
					if (coordY < player.speed) {
						player.y = (thisLevel.map.length - 1) * TILE_HEIGHT;
					
					}
					
					// Si va hacia abajo, aparecer arriba
					else { player.y = 0; }

					break;

			}			

		};

	}; // end Level


// >=test5
	const thisGame = {
		getLevelNum: function () {
			return 0;
		},

		// >=test14
		setMode: function (mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},

		// >=test6
		screenTileSize: [24, 21],

		// >=test5
		TILE_WIDTH: 24,
		TILE_HEIGHT: 24,

		// >=test12
		ghostTimer: 0,

		// >=test14
		NORMAL: 1,
		HIT_GHOST: 2,
		GAME_OVER: 3,
		WAIT_TO_START: 4,
		modeTimer: 0,

		//Variables pedidas en sección 11:
		lifes: 3,
		points:0,
		highscore:0
	};

	const thisLevel = new Level(canvas.getContext("2d"));

	// variables para contar frames/s, usadas por measureFPS
	let frameCount = 0;
	let lastTime;
	let fpsContainer;
	let fps;

	// Almacenará los movimientos a realizar del pacman en las keys actualOrientation y nextOrientation
	inputStates = {};

	// >=test10
	const TILE_WIDTH = 24, TILE_HEIGHT = 24;
	const numGhosts = 4;
	const ghostcolor = {};
	ghostcolor[0] = "rgba(255,	0,	  0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128,   0, 255)";
	ghostcolor[4] = "rgba( 50,	50, 255, 255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost

	// >=test10
	// hold ghost objects
	const ghosts = {};

	// >=test10
	const Ghost = function (id, ctx) {

		this.x = -1;
		this.y = -1;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;

		this.nearestRow = 0;
		this.nearestCol = 0;

		this.ctx = ctx;

		this.id = id;
		this.homeX = 0;
		this.homeY = 0;

		this.actualOrientation = {};

		this.radius = 10;

		this.draw = function () {

			/*// Pintar fanrasmas cuadrados
			ctx.beginPath();
			ctx.fillStyle = ghostcolor[this.id];
			ctx.rect(this.x, this.y, TILE_WIDTH, TILE_HEIGHT);
			ctx.fill();*/

			// Color del pacman
			let color = ghostcolor[this.id];

			// Si el fantasma está asustado
			if (thisGame.mode === Ghost.VULNERABLE){
				color = ghostcolor[4];

				// Si queda menos de 1 segundo (parpadeo)
				if (thisGame.modeTimer < 1 && thisLevel.powerPelletBlinkTimer > 30) {
					color = ghostcolor[5];
				} 
				
			}       

            let center = {x: this.x + TILE_WIDTH/2, y: this.y + TILE_HEIGHT/2 + this.radius - 1};

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

            ctx.fill();
            ctx.stroke();

            ctx.closePath();

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

			// test12
			// TODO Tu código aquí
			// Asegúrate de pintar el fantasma de un color u otro dependiendo del estado del fantasma y de thisGame.ghostTimer
			// siguiendo el enunciado

			// test13
			// TODO Tu código aquí
			// El cuerpo del fantasma sólo debe dibujarse cuando el estado del mismo es distinto a Ghost.SPECTACLES

		}; // draw


		this.move = function () {
			// test10

			// Obtenemos los posibles movimientos del fantasma
			let solutions = [];
			let lastSolution;

			// Si las posiciones ya están inicializadas
			if (this.x !== -1 && this.y !== -1) {

				// Si el fantasma está centrado en y
				if (Math.trunc(this.y / TILE_HEIGHT) === Math.trunc((this.y + TILE_HEIGHT - 1) / TILE_HEIGHT)) {
			
					// Si no hay muros a la izquierda
					if (!thisLevel.checkIfHitWall(this.x - this.speed, this.y, this.x, this.y)) {
						
						// Si actualmente se está moviendo a la derecha
						if (this.actualOrientation === 'right') {
							
							// Guardar izquiera como última opción
							lastSolution = 'left';

						}
						// Si no, añadir izquierda como posibles soluciones
						else { solutions.push('left'); }

					}

					// Si no hay muros a la derecha
					if (!thisLevel.checkIfHitWall(this.x + this.speed + TILE_WIDTH, this.y, this.x, this.y)) {

						// Si actualmente se está moviendo a la izquierda
						if (this.actualOrientation === 'left') {
							
							// Guardar derecha como última opción
							lastSolution = 'right';
						
						// Si no, añadir derecha como posibles soluciones
						} else { solutions.push('right'); }

					}

				}

				// Si el fantasma está centrado en x
				if (Math.trunc(this.x / TILE_HEIGHT) === Math.trunc((this.x + TILE_HEIGHT - 1) / TILE_HEIGHT)) {

					// Si no hay muros arriba
					if (!thisLevel.checkIfHitWall(this.x, this.y - this.speed, this.x, this.y)) {
							
						// Si actualmente se está moviendo hacia abajo
						if (this.actualOrientation === 'down') {
							
							// Guardar arriba como última opción
							lastSolution = 'up';
						
						// Si no, añadir arriba como posibles soluciones
						} else { solutions.push('up'); }

					}

					// Si no hay muros abajo
					if (!thisLevel.checkIfHitWall(this.x, this.y + this.speed + TILE_HEIGHT, this.x, this.y)) {
							
						// Si actualmente se está moviendo hacia arriba
						if (this.actualOrientation === 'up') {
							
							// Guardar abajo como última opción
							lastSolution = 'down';
						
						// Si no, añadir abajo como posibles soluciones
						} else { solutions.push('down'); };

					}

				}

				let nextOrientation;

				// Si no hay posibles soluciones
				if (solutions.length === 0) {

					// Escoger la última opción
					nextOrientation = lastSolution;
				
				// Si no, escoger una aleatoria entre las posibles
				} else {
					nextOrientation = solutions[Math.floor(Math.random()*solutions.length)];
				}
				
				switch(nextOrientation) {

					// En caso de haber escogido izquierda
					case 'left':

						// Mover a la izquierda
						this.x -= this.speed;

						// Actualizar movimiento actual
						this.actualOrientation = 'left';

						break;

					// En caso de haber escogido derecha
					case 'right':

						// Mover a la derecha
						this.x += this.speed;

						// Actualizar movimiento actual
						this.actualOrientation = 'right';

						break;
					
					// En caso de haber escogido arriba
					case 'up':

						// Mover hacia arriba
						this.y -= this.speed;

						// Actualizar movimiento actual
						this.actualOrientation = 'up';

						break;
					
					// En caso de haber escogido abajo
					case 'down':

						// Mover hacia abajo
						this.y += this.speed;

						// Actualizar movimiento actual
						this.actualOrientation = 'down';

						break;

				}

				// Control de teletransporte de los fantasmas
				if (this.x < this.speed) { this.x = (thisLevel.map[0].length - 1)*TILE_WIDTH; }
				else if (this.x > (thisLevel.map[0].length - 1)*TILE_WIDTH) { this.x = 0; }

				if (this.y < this.speed) { this.y = (thisLevel.map.length - 2)*TILE_HEIGHT; }
				else if (this.y > (thisLevel.map.length - 2)*TILE_HEIGHT) { this.y = 0; }
				
			}			

			// test13
			// TODO Tu código aquí
			// Si el estado del fantasma es Ghost.SPECTACLES
			// Mover el fantasma lo más recto posible hacia la casilla de salida
		};

	}; // fin clase Ghost

	// >=test12
	// static variables
	Ghost.NORMAL = 1;
	Ghost.VULNERABLE = 2;
	Ghost.SPECTACLES = 3;

// >=test2
	const Pacman = function () {
		this.radius = 10;
		this.x = -10;
		this.y = -10;
		this.speed = 1;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};

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
				coordX = player.x - player.speed;

				// Si no hay un muros
				if (!thisLevel.checkIfHitWall(coordX, player.y, player.x, player.y)
					// y el pacman está centrado en y
					&& (Math.trunc(player.y / TILE_HEIGHT) === Math.trunc((player.y + TILE_HEIGHT-1) / TILE_HEIGHT))) {

						// Comprobar si es una puerta o píldora
						thisLevel.checkIfHitSomething(coordX, player.y, player.x + TILE_WIDTH - 5, player.y);

						// Avanza a la izquierda
						player.x -= player.speed;

						// Actualizar orientación actual
						inputStates.actualOrientation = orientation;
						return true;

				}
				break;

			// Si el pacman va hacia la derecha
			case "right":
			
				// Obtenemos siguiente posición
				coordX = player.x + player.speed + TILE_WIDTH;

				// Si no hay un muros
				if (!thisLevel.checkIfHitWall(coordX, player.y, player.x, player.y)
					// Y el pacman está centrado en y
					&& (Math.trunc(player.y / TILE_HEIGHT) === Math.trunc((player.y + TILE_HEIGHT - 1) / TILE_HEIGHT))) {
						
						// Comprobar si es una puerta o píldora
						thisLevel.checkIfHitSomething(coordX, player.y, player.x + 5, player.y);

						// Avanza a la derecha
						player.x += player.speed;

						// Actualizar orientación actual
						inputStates.actualOrientation = orientation;
						return true;

				}
				break;

			// Si el pacman va hacia arriba
			case "up":

				// Obtenemos siguiente posición
				coordY = player.y - player.speed;
				
				// Si no hay un muros y el pacman cabe
				if (!thisLevel.checkIfHitWall(player.x, coordY, player.x, player.y)
					// y el pacman está centrado en x
					&& (Math.trunc(player.x / TILE_WIDTH) === Math.trunc((player.x + TILE_WIDTH - 1) / TILE_WIDTH))) {
						
						// Comprobar si es una puerta o píldora
						thisLevel.checkIfHitSomething(player.x, coordY, player.x, player.y + TILE_HEIGHT - 5);

						// Avanza hacia arriba
						player.y -= player.speed;

						// Actualizar orientación actual
						inputStates.actualOrientation = orientation;
						return true;
				}
				break;
			
			// Si el pacman va hacia abajo
			case "down":

				// Obtenemos siguiente posición
				coordY = player.y + player.speed + TILE_HEIGHT;

				// Si no hay un muros y el pacman cabe
				if (!thisLevel.checkIfHitWall(player.x, coordY, player.x, player.y)
					// y el pacman está centrado en x
					&& (Math.trunc(player.x / TILE_WIDTH) === Math.trunc((player.x + TILE_WIDTH - 1) / TILE_WIDTH))) {
						
						// Comprobar si es una puerta o píldora
						thisLevel.checkIfHitSomething(player.x, coordY, player.x, player.y + 5);

						// Avanza hacia abajo
						player.y += player.speed;

						// Actualizar orientación actual
						inputStates.actualOrientation = orientation;
						return true;
				}
				break;

			// Si pulsa espacio
			case "space":
				
				return true;
				break;
				
				
			//}

			// >=test8: introduce esta instrucción
			// dentro del código implementado en el test7:
			// tras actualizar this.x  y  this.y...
			// check for collisions with other tiles (pellets, etc)

			// test11
			// TODO Tu código aquí
			// check for collisions with the ghosts

			// test13
			// TODO Tu código aquí
			// Si chocamos contra un fantasma y su estado es Ghost.VULNERABLE
			// cambiar velocidad del fantasma y pasarlo a modo Ghost.SPECTACLES

			// test14
			// TODO Tu código aquí.
			// Si chocamos contra un fantasma cuando éste esta en estado Ghost.NORMAL --> cambiar el modo de juego a HIT_GHOST
		}
	
	}

	// >=test3
	Pacman.prototype.move = function () {

		// test3 / test4 / test7

		/*
		* En la variable inputStates, se almacenan las keys:
		*	- nextOrientation: que contiene el próximo movimiento a realizar
		*	- actualOrientation: contiene el moviento que el pacman está realizando actualmente.
		*/
			// Intenta hacer el siguiente movimiento, si no lo consigue
		if (!this.movePacman(inputStates.nextOrientation)){

			// Sigue realizando el movimiento actual
			this.movePacman(inputStates.actualOrientation);
		}

		// Comprueba que no se haya chocado con un fantasma
		// TODO REVISAR
		for (let i = 0; i < 4/*ghosts.length No va a funcionar porque no es un array, sino una especie de objeto JSON*/; i++) {
			if (thisLevel.checkIfHit(this.x, this.y, ghosts[i].x, ghosts[i].y, 1/*24*/)) {
				console.log('Choque! Vidas restantes: '+thisGame.lifes);
				thisGame.lifes--;
			}
		}

	};

	// >=test2
	// Función para pintar el Pacman
	// En el test2 se llama drawPacman(x, y) {
	Pacman.prototype.draw = function (x, y) {

		// Pac Man
		// test2

		/*
		* El pacman dibujado está compuesto por 2 medias circunferencias.
		* La orientación del pacman se realiza invirtiéndolas.
		*
		*/

		let orientation = {};

		switch (inputStates.actualOrientation) {
			case 'left':
				orientation = {inferior: true, superior: true};
				break;
			case 'right':
				orientation = {inferior: false, superior: false};
				break;
			case 'up':
				orientation = {inferior: false, superior: true};
				break;
			case 'down':
				orientation = {inferior: true, superior: false};
				break;
		}

		// Color amarillo
		ctx.fillStyle = '#FFFF00';

		// Pintar media circunferencia
		ctx.beginPath();
		ctx.arc(x+this.radius + (TILE_WIDTH/this.radius), y+this.radius + (TILE_HEIGHT/this.radius), this.radius, 0.25 * Math.PI, 1.25 * Math.PI, orientation.inferior);
		ctx.fill();

		// Pintar otra mitad
		ctx.beginPath();
		ctx.arc(x+this.radius + (TILE_WIDTH/this.radius), y+this.radius + (TILE_HEIGHT/this.radius), this.radius, 0.75 * Math.PI, 1.75 * Math.PI, orientation.superior);
		ctx.fill();

		/* // Opción de poner el pacman cuadrado
		ctx.beginPath();
		ctx.rect(x, y, TILE_WIDTH, TILE_HEIGHT);
		ctx.fill();
		*/

		// ojo: en el test2 esta función se llama drawPacman(x,y))

	};

	// >=test5
	const player = new Pacman();

	// >=test10
	for (let i = 0; i < numGhosts; i++) {
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}
	thisLevel.loadLevel(thisGame.getLevelNum());
	// thisLevel.printMap();

	// >=test2
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

	// >=test3
	// clears the canvas content
	const clearCanvas = function () {
		ctx.clearRect(0, 0, w, h);
	};

	// >=test4
	const checkInputs = function () {

		// test4
		// TODO Tu código aquí (reestructúralo para el test7)

		// test7
		// TODO Tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7
	};

	// >=test12
	const updateTimers = function () {
		// test12
		// TODO Tu código aquí
		// Actualizar thisGame.ghostTimer (y el estado de los fantasmas, tal y como se especifica en el enunciado)
		if(thisGame.ghostTimer == 7){
			thisGame.ghostTimer = 6;
			thisGame.modeTimer = 6;
			thisGame.mode = Ghost.VULNERABLE;

			setInterval(function(){

				if(thisGame.ghostTimer == 0){
					thisGame.mode = Ghost.NORMAL;
					clearInterval(this);
				}
				thisGame.ghostTimer--;
				thisGame.modeTimer--;

			}, 1000);
		}
		// test14
		// TODO Tu código aquí
		// actualiza modeTimer...
	};

	// >=test1
	const mainLoop = function (time) {

		// test1

		/*
			// Color verde
			ctx.strokeStyle = '#00FF00';
			ctx.fillStyle = '#00FF00';

			ctx.beginPath();
			// Circulos completos (0, 2*PI) en posición random de radio 5
			ctx.arc(Math.floor(Math.random() * (w)), Math.floor(Math.random() * (h)), 5, 0, 2 * Math.PI);
			ctx.fill();
		*/


		// >=test2
		// main function, called each frame
		measureFPS(time);

		// test14
		// TODO Tu código aquí
		// sólo en modo NORMAL

		// >=test4
		checkInputs();

		// test10
		// Mover fantasmas
		for (let i = 0; i < numGhosts; i++) {
			ghosts[i].move();
		}

		// >=test3
		//ojo: en el test3 esta instrucción es pacman.move()
		player.move();


		// test14
		// TODO Tu código aquí
		// en modo HIT_GHOST
		// seguir el enunciado...

		// test14
		// TODO Tu código aquí
		// en modo WAIT_TO_START
		// seguir el enunciado...


		// >=test2
		// Clear the canvas
		clearCanvas();

		// >=test6
		thisLevel.drawMap();

		// test10
		// Pintar fantasmas
		for (let i = 0; i < numGhosts; i++) {
			ghosts[i].draw();
		}

		// >=test3
		//ojo: en el test3 esta instrucción es pacman.draw()

		player.draw(player.x, player.y);


		//Pacman.prototype.draw(this.x, this.y);

		// >=test12
		updateTimers();

		thisLevel.displayScore();
		// call the animation loop every 1/60th of second
		// comentar esta instrucción en el test3
		requestAnimationFrame(mainLoop);
	};

	// >=test4
	const addListeners = function () {

		// add the listener to the main, window object, and update the states
		// test4

		// Generar listener de teclas
		document.addEventListener("keydown", (event) => {
			switch (event.key) {

				// Si se ha pulsado la tecla izquierda o 'a'
				case "ArrowLeft":
				case "a":
					inputStates.nextOrientation = 'left';
					break;

				// Si se ha pulsado la tecla derecha o 'd'
				case "ArrowRight":
				case "d":
					inputStates.nextOrientation = 'right';
					break;

				// Si se ha pulsado la tecla abajo o 's'
				case "ArrowDown":
				case "s":
					inputStates.nextOrientation = 'down';
					break;

				// Si se ha pulsado la tecla arriba o 'w'
				case "ArrowUp":
				case "w":
					inputStates.nextOrientation = 'up';
					break;

				// Si se ha pulsado la tecla espacio
				case " ":
					inputStates.actualOrientation = 'space';
					inputStates.nextOrientation = 'space';
					console.log('Pacman pausado');
					break;
			}
			Pacman.prototype.move();
		}, false);

	};


	//>=test7
	const reset = function () {

		// test12
		// TODO Tu código aquí
		// probablemente necesites inicializar los atributos de los fantasmas
		// (x,y,velX,velY,state, speed)

		// test7
		// TODO Tu código aquí
		// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
		// inicializa la posición inicial de Pacman tal y como indica el enunciado

		// test10
		// TODO Tu código aquí
		// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente

		// >=test14
		thisGame.setMode(thisGame.NORMAL);
	};

	// >=test1
	const start = function () {

		// >=test2
		// adds a div for displaying the fps value
		fpsContainer = document.createElement('div');
		document.body.appendChild(fpsContainer).style.color = "#FFFFFF";

		// >=test4
		addListeners();

		// >=test7
		reset();

		// start the animation
		requestAnimationFrame(mainLoop);
	};

	// >=test1
	//our GameFramework returns a public API visible from outside its scope
	return {
		start: start,

		// solo para el test 10
		ghost: Ghost,  // exportando Ghost para poder probarla

		// solo para estos test: test12 y test13
		ghosts: ghosts,

		// solo para el test12
		thisLevel: thisLevel,

		// solo para el test 13
		Ghost: Ghost,

		// solo para el test14
		thisGame: thisGame
	};
};

// >=test1
var game = new GF();
game.start();


