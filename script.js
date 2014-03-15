var TwoScene = function() {
	
	this.div = document.getElementById( 'container' );
	this.$canvas = $('canvas');
	this.canvas = this.$canvas.get(0);
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	this.context = this.canvas.getContext( '2d' );

	//this.addStats();
	this.addEventListeners();
	
	this.resizeCanvas();
	
	this.addWalkers( 150 );
	
	this.loop();
};
		
TwoScene.prototype = {
	
	addWalkers : function( number ) {
		
		this.walkers = [];
		this.walkersCount = number;
		
		for(var i=0; i < number; i++) {
			this.walkers[i] = new Walker( this );
		}
	},
	
	drawWalkers : function() {
		
		for(var i=0; i < this.walkersCount; i++) {
			this.walkers[i].update();
			this.walkers[i].draw();
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
		this.canvas.width = $(window).width() * this.ratio;
		this.canvas.height = $(window).height() * this.ratio;
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
	}
	
};

var Walker = function(scene) {
	this.scene = scene;
	this.x = this.scene.width / 2;
	this.y = this.scene.height / 2;
	this.moveStep = 2;
	this.hueStep = 1;
	this.size = 2;
	this.hue = (Math.random() * 45) + this.hueStart;
	
	
};

Walker.prototype = {
	
	hueStart : 360 * Math.random(),
	
	random : function() {
		return Math.random() * 2 - 1;
	},
	
	update : function() {
		this.x += this.random() * this.moveStep;
		this.y += this.random() * this.moveStep;
		this.hue += this.random() * this.hueStep;
		
		this.x %= this.scene.width;
		this.y %= this.scene.height;
		
		this.hue %= 360;
	},
	
	draw : function() {
		this.scene.context.beginPath();
		this.scene.context.fillStyle = this.scene.hslToFillStyle(this.hue, 100, 50, 0.5);
		this.scene.context.fillRect(
			this.x,
			this.y,
			this.size,
			this.size
		);
		this.scene.context.fill();
	}
	
};

var twoScene;

$(function() {
	twoScene = new TwoScene();
});