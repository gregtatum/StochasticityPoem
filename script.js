var TwoScene = function() {
	
	this.div = document.getElementById( 'container' );
	this.$canvas = $('canvas');
	this.canvas = this.$canvas.get(0);
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	this.context = this.canvas.getContext( '2d' );
	
	this.multiplyChance = 1 / 240;

	//this.addStats();
	this.addEventListeners();
	
	this.resizeCanvas();
	
	this.addWalkers( 1 );
	
	this.loop();
};
		
TwoScene.prototype = {
	
	addWalkers : function( number ) {
		
		this.walkers = [];
		
		for(var i=0; i < number; i++) {
			this.walkers[i] = new Walker( this );
		}
	},
	
	drawWalkers : function() {
		
		var oldWalker, newWalker;
		
		for( var i=0; i < this.walkers.length; i++ ) {
			this.walkers[i].update();
			this.walkers[i].draw();
		}
		
		if( Math.random() <= this.multiplyChance ) {
			
			oldWalker = this.walkers[ Math.floor( this.walkers.length * Math.random() ) ];
			newWalker = new Walker( this );
			
			this.walkers.push( newWalker );
			
			newWalker.copy( oldWalker );

		}
		
	},
	
	addStats : function() {
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		$("#container").append( this.stats.domElement );
	},
	
	addEventListeners : function() {
		$(window).on('resize', this.resizeCanvas.bind(this));
	},
	
	resizeCanvas : function(e) {
		this.canvas.width = $(window).width();
		this.canvas.height = $(window).height();
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.left = this.$canvas.offset().left;
		this.top = this.$canvas.offset().top;
		
		console.log(this.width, this.height);
	},
			
	loop : function() {

		requestAnimationFrame( this.loop.bind(this) );
		this.render();

	},
	
	rgbToFillStyle : function(r, g, b, a) {
		if(a === undefined) {
			return ["rgb(",r,",",g,",",b,")"].join('');
		} else {
			return ["rgba(",r,",",g,",",b,",",a,")"].join('');
		}
	},
	
	hslToFillStyle : function(h, s, l, a) {
		if(a === undefined) {
			return ["hsl(",h,",",s,"%,",l,"%)"].join('');
		} else {
			return ["hsla(",h,",",s,"%,",l,"%,",a,")"].join('');
		}
	},
	
	render : function() {
		//this.stats.update();
		
		//this.context.clearRect(0,0,this.width, this.height);
		
		this.drawWalkers();
		
		this.context.fillStyle = this.rgbToFillStyle(245, 245, 245, 0.05);
		this.context.fillRect(0,0,this.width, this.height);
		this.context.fill();
	}
	
};

var Walker = function(scene) {
	this.ratio = 0.5;
	this.scene = scene;
	this.x = 0;
	this.y = this.scene.height / 2;
	this.moveStep = 3;
	this.hueStep = 3;
	this.size = 5;
	this.hue = (Math.random() * 45) + this.hueStart;
	
	
};

Walker.prototype = {
	
	hueStart : 360 * Math.random(),
	
	random : function() {
		return Math.random() * 2 - 1;
	},
	
	update : function() {
		this.x += Math.random() * this.moveStep / this.ratio;
		this.y += this.random() * this.moveStep * this.ratio;
		this.hue += this.random() * this.hueStep;
		
		this.x %= this.scene.width;
		this.y %= this.scene.height;
		
		this.hue %= 360;
	},
	
	copy : function( walker ) {
		
		this.x = walker.x;
		this.y = walker.y;
		this.hue = walker.hue;
	},
	
	draw : function() {
		this.scene.context.beginPath();
		this.scene.context.fillStyle = this.scene.hslToFillStyle(this.hue, 100, 50, 0.5);
		this.scene.context.fillRect(
			this.x,
			this.y,
			this.size / this.ratio,
			this.size * this.ratio
		);
		this.scene.context.fill();
	}
	
};

var twoScene;

$(function() {
	twoScene = new TwoScene();
});