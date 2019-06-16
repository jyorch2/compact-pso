
function Particle(x, y, xl, xu, yl, yu) {
	this.x = x;
	this.y = y;
	this.xl = xl;
	this.xu = xu;
	this.yl = yl;
	this.yu = yu;

	this.r = 20;
	this.minBright = 80;
	this.maxBright = 220;

	this.red = random(this.minBright, this.maxBright);
	this.green = random(this.minBright, this.maxBright);
	this.blue = random(this.minBright, this.maxBright);

	this.show = function() {
		stroke(10);
		strokeWeight(1);
		fill(this.red, this.green, this.blue);
		var nx = map(this.x, this.xl, this.xu, 0, width);
		var ny = map(this.y, this.yl, this.yu, height, 0);
		ellipse(nx, ny, this.r, this.r);
	}

	this.newColor = function(){
		this.red = random(this.minBright, this.maxBright);
		this.green = random(this.minBright, this.maxBright);
		this.blue = random(this.minBright, this.maxBright);
	}
}
