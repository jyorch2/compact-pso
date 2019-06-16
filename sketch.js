// Elementos de la interfaz grafica
var txtGBEST;

// Establecer las restricciones de dominio
var xl, xu;
var yl, yu;
var t = 0;

// Parametros del PSO
var c1, c2;
var particle;
var v = 0;
var lbest;
var gbest;

// vector de probabilidades
var m = [];
var s = [];

// propias de la interfaz
var startingFPS = 60;
var maxFPS = 120;

function elegirFuncion() {
	if (funcion === "rastrigin") {
		xl = -5.12;
		xu = 5.12;
		yl = xl;
		yu = xu;
	} else if (funcion === "sphere") {
		xl = -5.12;
		xu = 5.12;
		yl = xl;
		yu = xu;
	} else if (funcion === "rosenbrock") {
		xl = -2.048;
		xu = 2.048;
		yl = xl;
		yu = xu;
	} else if (funcion == "ackley") { // aunque parece dificil, es relativamente facil f(0, 0)
		xl = -32.768;
		xu = 32.768;
		yl = xl;
		yu = xu;
	} else if (funcion == "mccormick") { // el verdadero optimo esta muy lejos, cuesta llegar sin una inicializacion correcta
		xl = -1.5;
		xu = 4;
		yl = -3;
		yu = 4;
	} else if (funcion == "easom") { // es un plano, con un hoyito jajaja, f*(pi, pi) = -1
		xl = -100.0;
		xu = 100.0;
		yl = xl;
		yu = xu;
	} else if (funcion == "booth") { // resulto muy simple, aunque tarda mucho jajaja f(1, 3) = 0
		xl = -10.0;
		xu = 10.0;
		yl = xl;
		yu = xu;
	} else if (funcion == "schaffer4") { // encontre: f(1.253131835127104, 8.125492598805042e-8) = 0.29257863203598045
		xl = -100.0;
		xu = 100.0; // parece lograr mejores resultados que en la literatura (al parecer tiene varios optimos)
		yl = xl;
		yu = xu;
	} else if (funcion == "schwefel") { // parece de las peorsitas, no lo se, f(420.9687, 420.9687) = 0.0
		xl = -500;
		xu = 500;
		yl = xl;
		yu = xu;
	} else if (funcion == "dejongf5") {
		xl = -65.536;
		xu = 65.536;
		yl = xl;
		yu = xu;
	}
}

// funcion a optimizar
function f(particle) {
	var x = particle.x;
	var y = particle.y;
	var pi = Math.PI;
	var two_pi = 2.0 * pi;
	if (funcion === "rastrigin") {
		var suma = 0;
		suma += (x * x - 10.0 * cos(two_pi * x));
		suma += (y * y - 10.0 * cos(two_pi * y));
		return 20.0 + suma;
	} else if (funcion === "sphere") {
		return x * x + y * y;
	} else if (funcion == "rosenbrock") {
		return (100.0 * (y - x * x) * (y - x * x) + (x - 1.0) * (x - 1.0));
	} else if (funcion == "ackley") {
		var a = 20.0;
		var b = 0.2;
		var c = two_pi;
		return -a * exp(-b * sqrt(0.5 * (x * x + y * y))) - exp(0.5 * (cos(c * x) + cos(c * y))) + a + exp(1.0);
	} else if (funcion == "mccormick") {
		return sin(x + y) + (x - y) * (x - y) - 1.5 * x + 2.5 * y + 1.0;
	} else if (funcion == "easom") {
		return -cos(x) * cos(y) * exp(-(x - pi) * (x - pi) - (y - pi) * (y - pi));
	} else if (funcion == "booth") {
		return (x + 2 * y - 7.0) * (x + 2 * y - 7.0) + (2 * x + y - 5.0) * (2 * x + y - 5.0);
	} else if (funcion == "schaffer4") {
		return 0.5 + (pow(cos(sin(abs(x * x - y * y))), 2) - 0.5) / pow((1.0 + 0.001 * (x * x + y * y)), 2);
	} else if (funcion == "schwefel") {
		return 418.9829 * 2.0 - (x * sin(sqrt(abs(x))) + y * sin(sqrt(abs(y))));
	} else if (funcion == "dejongf5") { // finalmente la clasica
		var j;
		var fj = 0.0;
		var sumaFj_1 = 0.0;
		var a = [
			[-32, -16, 0, 16, 32, -32, -16, 0, 16, 32, -32, -16, 0, 16, 32, -32, -16, 0, 16, 32, -32, -16, 0, 16, 32],
			[-32, -32, -32, -32, -32, -16, -16, -16, -16, -16, 0, 0, 0, 0, 0, 16, 16, 16, 16, 16, 32, 32, 32, 32, 32]
		];
		for (j = 0; j < 25; j++) {
			fj = (j + 1) + pow(x - a[0][j], 6) + pow(y - a[1][j], 6);
			sumaFj_1 += 1.0 / fj;
		}
		return 1.0 / (0.002 + sumaFj_1);
	}
}

// generar un aleatorio normal mediante box-muller
function aleatorioNormal(mu, sigma, a, b) {
	var r = 0;
	var pi = Math.PI;
	var two_pi = 2.0 * pi;
	if((mu - 2*sigma) < a || (mu + 2*sigma) > b)
		r = random(a, b);
	else{
		var u1 = random(0, 1);
		var u2 = random(0, 1);
		while (u1 == 0.0) u1 = random(0, 1);
		r = mu + sigma * (sqrt(-2.0 * log(u1)) * cos(two_pi * u2));
		while(r < a || r > b){
			u1 = random(0, 1);
			u2 = random(0, 1);
			while(u1 == 0.0) u1 = random(0, 1);
			r = mu + sigma * (sqrt(-2.0 * log(u1)) * cos(two_pi * u2));
		}
	}
	return r;
}

function inicializarPSO() {
	
	// Seleccionar la funcion a optimizar
	elegirFuncion();
	txtGBEST.show();

	// particula temporal si se requiere una inicializacion multiple
	partTemp = new Particle(0, 0, xl, xu, yl, yu);

	particle = new Particle(random(xl, xu), random(yl, yu), xl, xu, yl, yu);
	gbest = new Particle(random(xl, xu), random(yl, yu), xl, xu, yl, yu);
	m[0] = random(xl, xu); m[1] = random(yl, yu);
	s[0] = xu - xl; s[1] = yu - yl;
	lbest = new Particle(random(xl, xu), random(yl, yu), xl, xu, yl, yu);
	var fgbest = f(gbest);

	// En caso de un multi muestreo (no es recomendable introducir ventajas en multimodales)
	for (var i = 0; i < popInicial; i++) {
		partTemp.x = random(xl, xu);
		partTemp.y = random(yl, yu);
		if (f(partTemp) < f(gbest)) {
			gbest.x = partTemp.x;
			gbest.y = partTemp.y;
		}
	}

	// Obtener al gbest
	if (f(particle) < f(gbest)) {
		var tmp = gbest;
		gbest = particle;
		particle = tmp;
	}

}

function setup() {
	// Inicializar los parametros de la interfaz grafica
	createCanvas(750, 750);
	frameRate(startingFPS);
	
	// Mostrar coordenadas mejor particula
	txtGBEST = createElement('h2', '');
	txtGBEST.position(0, height + 10);

	inicializarPSO();

}

function drawGbest() {
	fill(0, 0, 255);
	var radio = 8;
	var nx = map(gbest.x, xl, xu, 0, width);
	var ny = map(gbest.y, yl, yu, height, 0);
	noStroke();
	ellipse(nx, ny, radio, radio);
	txtGBEST.html('f(' + gbest.x + ", " + gbest.y + ") = " + f(gbest).toPrecision(21));

}

function restaurarVelocidad(x, linf, lsup) {
	if(Math.random() > 0.01) return x;
	if (x < linf) return linf;
	else if (x > lsup) return lsup;
	return x;
}

function restaurar(x, linf, lsup) {
	if (x < linf) return linf;
	else if (x > lsup) return lsup;
	return x;
}


function drawLines(){

	var altoLinea = 2;
	var nx = (xu - xl);
	var ny = (yu - yl);

	// Obtener escala en potencias de 10
	px = 1;
	while(px * 10.0 <= nx/10.0) px*= 10.0;
	py = 1;
	while(py * 10.0 <= ny/10.0) py*= 10.0;

	fill(0);
	var colorCuadricula = 225;

	// YA dibuje el 0, asi que lo salto
	for(var i = py; i <= yu; i+=py){
		var p = map(i, yl, yu, height, 0);
		var q = 0.5 * width;

		stroke(colorCuadricula); line(0, p, width, p); // cuadricula
		text(i.toFixed(0), q - 15, p + 5);
		stroke(0);
		line(q - altoLinea, p, q + altoLinea, p);

		p = map(-i, yl, yu, height, 0);
		stroke(colorCuadricula); line(0, p, width, p);
		text(-i.toFixed(0), q - 15, p + 5);

		stroke(0);
		line(q - altoLinea, p, q + altoLinea, p);
	}

	for(var i = 0; i <= xu; i+=px){
		var p = map(i, xl, xu, 0, width);
		var q = 0.5 * height;

		stroke(colorCuadricula); line(p, 0, p, height); // cuadricula
		text(i.toFixed(0), p - 3, q + 15);
		stroke(0);
		line(p, q - altoLinea, p, q + altoLinea);

		// la otra parte (arreglar, asumo que siempre hay negativos)
		// arreglar la escala cuando son escalas de miles
		p = map(-i, xl, xu, 0, width);
		stroke(colorCuadricula); line(p, 0, p, height); // cuadricula
		text(-i.toFixed(0), p - 3, q + 15);

		stroke(0);
		line(p, q - altoLinea, p, q + altoLinea);

	}
}

var pm = 1e-5; // 1e-3 o 1e-2
var np = 100.0; // 50 muy faciles y sin mutaciones

// funciones adicionales
var popInicial = 1;

var historyLength = 800;
let particleHistory = [];
let elitistHistory = [];

var funcion = "mccormick"

function draw() {

	c1 = 2.0;
	c2 = 2.0;

	/******* Coordinate Axis *****/

	background(255);
	strokeWeight(1);
	drawLines();
	stroke(0);
	line(0, 0.5 * height, width, 0.5 * height);
	line(0.5 * width, 0, 0.5 * width, height);

	// draw a line from all the gbests going from dark red to red
	for(var i = 1; i < particleHistory.length; i++){
		stroke(i * 255/particleHistory.length, parseInt(Math.random()*100), parseInt(Math.random()*100));
		line(particleHistory[i -1].x,  particleHistory[i -1].y, particleHistory[i].x,  particleHistory[i].y);
	}

	// draw gbest history
	for(var i = 1; i < elitistHistory.length; i++){
		strokeWeight(2);
		stroke(0, 0, i * 170/elitistHistory.length + 85);
		line(elitistHistory[i -1].x,  elitistHistory[i -1].y, elitistHistory[i].x,  elitistHistory[i].y);
		strokeWeight(1);
	}


	/******* Mostrar la particula y su mejor historico *****/
	particle.show();
	drawGbest();
	
	/******  Inicia el proceso del PSO  ******/

	// 1) generar una nueva solucion por medio del vector de prob
	lbest.x = aleatorioNormal(m[0], s[0], xl, xu);
	lbest.y = aleatorioNormal(m[1], s[1], yl, yu);
	
	r1 = random(0, 1);
	r2 = random(0, 1);
	v = c1 * r1 * (gbest.x - particle.x) + c2 * r2 * (lbest.x - particle.x);
	v = restaurarVelocidad(v, xl, xu);
	particle.x = particle.x + v;
	particle.x = restaurar(particle.x, xl, xu);

	r1 = random(0, 1);
	r2 = random(0, 1);
	v = c1 * r1 * (gbest.y - particle.y) + c2 * r2 * (lbest.y - particle.y);
	v = restaurarVelocidad(v, yl, yu);
	particle.y = particle.y + v;
	particle.y = restaurar(particle.y, yl, yu);

	if (f(particle) < f(gbest)) {
		gbest.x = particle.x;
		gbest.y = particle.y;
		var nx = map(gbest.x, this.xl, this.xu, 0, width);
		var ny = map(gbest.y, this.yl, this.yu, height, 0);
		// store the gbest to display the historic
		elitistHistory.push(new Particle(nx, ny));
	}

	// free some drawing memory
	if(particleHistory.length > historyLength) particleHistory = particleHistory.splice(historyLength/2.0, historyLength);

	var nx = map(particle.x, this.xl, this.xu, 0, width);
	var ny = map(particle.y, this.yl, this.yu, height, 0);
	particleHistory.push(new Particle(nx, ny));

	// Update the probability vector
	m[0] = m[0] + 1.0 / np * (gbest.x - m[0]);
	//s[0] = abs(gbest.x - m[0]) / (np - 1);
	
	m[1] = m[1] + 1.0 / np * (gbest.y - m[1]);
	//s[1] = abs(gbest.y - m[1]) / (np - 1);

	// standard deviation is based on tchebycheff norm
	if(gbest.y - m[1] > gbest.x - m[0]){
		s[0] = abs(gbest.y - m[1]);
		s[1] = s[0]
	}else{
		s[0] = abs(gbest.x - m[0]);
		s[1] = s[0];
	}

	// turbulence operator
	if (random(0, 1) < pm){
		s[0] = (xu - xl);
		particle.newColor();
	}
	if (random(0, 1) < pm){
		s[1] = (yu - yl);
		particle.newColor();
	}


	t++;
}