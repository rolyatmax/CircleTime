(function(){

	///// Defaults
	var defaults = {
		startingSize: 60,
		speed: 5,
		spawnerLimit: 5,
		production: 200,
		shrink: 0.97
	};

	var COLORS = ['#69D2E7', '#BEFAF6', '#9D91EB', '#B6D4CD', '#435B9C'];





	/////////////////
	/////// Spawner
	/////////////////

	var Spawner = function( x, y, ctx ) {
		this.x = x;
		this.y = y;
		this.ctx = ctx;
		this.particles = [];
		this.alive = true;
		this.id = random(9999999) + "-" + new Date().getTime();

	};

	Spawner.prototype = {

		draw: function() {

			if (!this.alive && !this.particles.length) {
				this.remove();
				return;
			}

			var total = this.particles.length;
			var target = this.ctx.production;

			var i = target - total;
			while (i >= 0 && i--) {
				this.spawn();
			}

			var len = this.particles.length;
			while (len--) {
				this.particles[len].draw();
			}
		},

		spawn: function() {
			if (!this.alive) return;

			var h = this.y;
			var w = this.x;
			var r = random( this.ctx.startingSize ) + 1;
			var color = random(COLORS);

			this.particles.push( new Particle( w, h, r, color, this ) );
		},

		remove: function() {
			var spawners = this.ctx.spawners;
			var len = spawners.length;

			for (var i = 0; i < len; i++) {
				spawner = spawners[ i ];
				if (spawner.id === this.id) {
					spawners.splice( i, 1 );
					break;
				}
			}
		}
	};




	/////////////////
	/////// Particle
	/////////////////

	var Particle = function( x, y, radius, color, spawner ) {
		this.spawner = spawner;
		this.x = x || 0;
		this.y = y || 0;
		this.radius = radius || 10;
		this.color = color || '#ffffff';
		this.speed = random(1,8) / 10 * this.spawner.ctx.speed;
		this.multiplier = random(0,15);
		this.id = random(9999999) + "-" + new Date().getTime();
	};

	Particle.prototype = {

		draw: function() {
			var ctx = this.spawner.ctx;

			this.move();
			ctx.globalCompositeOperation = "lighter";
			ctx.beginPath();
			ctx.arc( this.x, this.y, this.radius, 0, TWO_PI );
			ctx.fillStyle = this.color;
			ctx.fill();
		},

		move: function() {

			this.x += this.speed * sin(this.multiplier);
			this.y += this.speed * cos(this.multiplier);
			this.radius *= this.spawner.ctx.shrink;

			this.multiplier += random(-0.2, 0.2);

			if (this.x < -this.radius || this.y < -this.radius || this.radius < 1) {
				this.remove();
			}
		},

		remove: function() {
			var particles = this.spawner.particles;
			var len = particles.length;
			while (len--) {
				particle = particles[ len ];
				if (particle.id === this.id) {
					particles.splice( len, 1 );
					break;
				}
			}
		}
	};




	///// Setup CTX

	var container = document.getElementById("container");
	var ctx = Sketch.create({ container: container });

	_.extend( ctx, defaults, {
		spawners: [],
		starting: {
			x: ctx.width / 2,
			y: ctx.height / 2
		},

		draw: function() {
			this.checkSpawnCount();

			var len = this.spawners.length;
			while (len--) {
				this.spawners[len].draw();
			}
		},

		mousemove: function() {

			this.starting.x = this.mouse.x;
			this.starting.y = this.mouse.y;
		},

		click: function() {
			this.addSpawner.call(this);
		},

		addSpawner: function() {

			var h = this.starting.y;
			var w = this.starting.x;

			this.spawners.push( new Spawner( w, h, this ) );

		},

		keydown: function(e) {
			if (this.keys.SPACE) {
				e.preventDefault();
				this.clearSpawners();
			}
		},

		clearSpawners: function() {
			var i = this.spawners.length;
			while (i--) {
				this.spawners[ i ].alive = false;
			}
		},

		checkSpawnCount: function() {
			var total = this.aliveSpawners().length;
			var limit = this.spawnerLimit;

			if (total > limit) {
			
				var i = total - limit;
				while (i >= 0 && i--) {
					this.killSpawner();
				}
			}
		},

		killSpawner: function() {
			var aliveSpawners = this.aliveSpawners();
			for (var i = 0, len = aliveSpawners.length; i < len; i++) {
				if (aliveSpawners[ i ].alive) {
					aliveSpawners[ i ].alive = false;
					break;
				}
			}
		},

		aliveSpawners: function() {
			return _.where(this.spawners, { alive: true });
		}
	});



	////// Setup dat.GUI

	var gui = new dat.GUI();
	gui.add(ctx, 'production', 1, 350).step(1);
	gui.add(ctx, 'spawnerLimit', 1, 20).step(1);
	gui.add(ctx, 'speed', 1, 50);
	gui.add(ctx, 'startingSize', 1, 200);
	gui.add(ctx, 'shrink', 0.10, 0.99);
	gui.add(ctx, 'clearSpawners');

	// Exports

	window.ctx = ctx;
	window.gui = gui;

}());