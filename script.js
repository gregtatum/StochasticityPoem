var TwoScene = function() {
	
	this.div = document.getElementById( 'container' );
	this.$canvas = $('canvas');
	this.canvas = this.$canvas.get(0);
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	this.context = this.canvas.getContext( '2d' );
	
	this.multiplyChance = 1 / 240;
	this.maxWalkers = 200;
	
	//this.addStats();
	this.addEventListeners();
	
	this.resizeCanvas();
	
	this.addWalkers( 10 );
	
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
		
		if( Math.random() <= this.multiplyChance && this.walkers.length < this.maxWalkers ) {
			
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
		
		this.context.fillStyle = this.rgbToFillStyle(245, 245, 245, 0.025);
		this.context.fillRect(0,0,this.width, this.height);
		this.context.fill();
	}
	
};

var Walker = function(scene) {
	this.ratio = 1;
	this.scene = scene;
	this.r = 0;
	this.theta = 0;
	
	this.originX = this.scene.width / 2;
	this.originY = this.scene.height / 2;
	
	this.x = this.originX;
	this.y = this.originY;
	this.prevX = this.originX;
	this.prevY = this.originY;

	
	this.moveStep = 6;
	this.hueStep = 3;
	this.sizeBase = 1;
	this.sizeAdder = 20;
	this.hue = (Math.random() * 45) + this.hueStart;
	
	this.update();
};

Walker.prototype = {
	
	hueStart : 360 * Math.random(),
	
	random : function() {
		return Math.random() * 2 - 1;
	},
	
	copy : function( walker ) {
		
		
		this.x = walker.x;
		this.y = walker.y;
		this.r = walker.r;
		this.theta = walker.theta;
		this.hue = walker.hue;
		this.prevX = walker.prevX;
		this.prevY = walker.prevY;
	},
	
	update : function() {
		
		this.theta += Math.random() * this.moveStep / this.ratio / 90;
		this.r += this.random() * this.moveStep;
		this.hue += this.random() * this.hueStep;
		
		this.prevX = this.x;
		this.prevY = this.y;
		
		this.x = Math.cos( this.theta ) * this.r + this.originX;
		this.y = Math.sin( this.theta ) * this.r + this.originY;
		
		
		//this.x %= this.scene.width;
		//this.y %= this.scene.height;
		
		this.hue %= 360;
	},
	
	draw : function() {
		this.scene.context.beginPath();
		
		
		this.scene.context.strokeStyle = this.scene.hslToFillStyle(this.hue, 100, 50, 0.5);
		this.scene.context.lineWidth =  this.r / 2;
		this.scene.context.lineCap = 'round';
		
		this.scene.context.moveTo(this.prevX, this.prevY);
		this.scene.context.lineTo(
			this.x,
			this.y
		);
		
		this.scene.context.stroke();
		
		
	}
	
};

var twoScene;

$(function() {
	twoScene = new TwoScene();
});