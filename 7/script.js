var TwoScene = function() {
	
	this.div = document.getElementById( 'container' );
	this.$canvas = $('canvas');
	this.canvas = this.$canvas.get(0);
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	this.context = this.canvas.getContext( '2d' );
	
	this.multiplyChance = 1 / 240;
	this.maxWalkers = 16;
	
	this.setPolyfills();
	//this.addStats();
	this.addEventListeners();
	
	this.resizeCanvas();
	
	this.addWalkers( 1 );
	
	this.loop();
};
		
TwoScene.prototype = {
	
	setPolyfills : function() {					  
		window.requestAnimationFrame = (
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
	        }
		);
	},
	
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
		
		if( this.walkers ) {
			for( var i=0; i < this.walkers.length; i++ ) {
				this.walkers[i].onResize();
			}
		}
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
	
	this.soundWalker = new SoundWalker();
	
	var note = Math.floor(this.noteFrequencies.length * Math.random() );
	this.soundWalker.setFrequency( this.noteFrequencies[ note ] );
	
	this.update();
};

Walker.prototype = {
	
	alphabet : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
	
	noteFrequencies : (function() {
		
		var eMinor7th = Note.fromLatin('E3G3B3D3E4G4B4D4');
		
		return eMinor7th.map(function(note) {
			return note.frequency();
		});
		
	})(),
	
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
	
	onResize : function() {
	
		this.originX = this.scene.width / 2;
		this.originY = this.scene.height / 2;
	},
	
	update : function() {
		
		this.rRandom = this.random();
		
		this.theta += Math.random() * this.moveStep / this.ratio / 90;
		this.r += this.rRandom * this.moveStep;
		this.hue += this.random() * this.hueStep;
		
		this.prevX = this.x;
		this.prevY = this.y;
		
		this.x = Math.cos( this.theta ) * this.r + this.originX;
		this.y = Math.sin( this.theta ) * this.r + this.originY;
		
		var positionX = (this.x - this.scene.width / 2) / (this.scene.width / 2);
		var positionY = (this.y - this.scene.height / 2) / (this.scene.height / 2);
		
		
		this.soundWalker.setPosition(
			positionX * 10,
			positionY * 10,
			-0.5
		);
		
		this.soundWalker.setGain(
			0.5 * this.rRandom
		);
		
		this.soundWalker.setBandpassFrequency( 50 + Math.abs( positionY ) * 300 );
		this.soundWalker.setBandpassQ( Math.abs( positionX * 2 ) );
		
		
		//this.x %= this.scene.width;
		//this.y %= this.scene.height;
		
		this.hue %= 360;
	},
	
	draw : function() {
		/*
		this.scene.context.beginPath();
		
		
		this.scene.context.strokeStyle = this.scene.hslToFillStyle(this.hue, 100, 50, 0.5);
		this.scene.context.lineWidth =  5;
		this.scene.context.lineCap = 'round';
		
		this.scene.context.moveTo(this.prevX, this.prevY);
		this.scene.context.lineTo(
			this.x,
			this.y
		);
		
		this.scene.context.stroke();
		
		this.scene.context.closePath();
		*/
		
		var letter = Math.floor( this.alphabet.length * Math.random() );
		
		this.scene.context.font= [ (this.rRandom * 9 + 4) , "px sans-serif"].join("");
		this.scene.context.fillStyle = this.scene.hslToFillStyle(this.hue, 100, 50, 0.8);
		this.scene.context.fillText(this.alphabet[letter], this.x, this.y);
		
	}
	
};

var twoScene;

var AudioContext = AudioContext || webkitAudioContext;

var SoundWalker = function() {
	
	this.enabled = AudioContext !== undefined;
	
	if(!this.enabled) return;
	
	this.context.listener.setPosition(0, 0, 0);
	
	this.panner = this.context.createPanner();
	this.panner.panningModel = 'equalpower';
	this.panner.coneOuterGain = 0.1;
	this.panner.coneOuterAngle = 180;
	this.panner.coneInnerAngle = 0;
	
	this.oscillator = this.context.createOscillator();
	this.oscillator.type = "sawtooth";
	this.oscillator.frequency.value = 2000;	
	/*
		enum OscillatorType {
		  "sine",
		  "square",
		  "sawtooth",
		  "triangle",
		  "custom"
		}
	*/

	this.gain = this.context.createGain();
	this.gain.gain.value = 0.5;
	
	this.bandpass = this.context.createBiquadFilter();
	this.bandpass.type = "bandpass";
	this.bandpass.frequency.value = 440;
	this.bandpass.Q.value = 0.5;
	
	this.oscillator.connect( this.bandpass );
	this.bandpass.connect( this.panner );
	this.panner.connect( this.gain );
	this.gain.connect( this.context.destination );
	
	this.oscillator.start(0);
	
	this.totalCreated++;
	this.totalCreatedSq = this.totalCreated * this.totalCreated;
};

SoundWalker.prototype = {
	
	context : AudioContext ? new AudioContext() : undefined,
	
	totalCreated : 0,
	
	setFrequency : function ( frequency ) {
		if(!this.enabled) return;
		this.oscillator.frequency.setTargetAtTime(frequency, this.context.currentTime, 0.1);
	},
	
	setPosition : function ( x, y, z ) {
		if(!this.enabled) return;
		this.panner.setPosition( x, y, z );
	},
	
	setGain : function ( gain ) {
		if(!this.enabled) return;
		Math.max( Math.abs( gain ), 1);
		
		gain / this.totalCreatedSq;
				
		this.gain.gain.setTargetAtTime(gain, this.context.currentTime, 0.1)
	},
	
	setBandpassQ : function ( Q ) {
		if(!this.enabled) return;
		this.bandpass.Q.setTargetAtTime(Q, this.context.currentTime, 0.1);
	},
	
	setBandpassFrequency : function ( frequency ) {
		if(!this.enabled) return;
		this.bandpass.frequency.setTargetAtTime(frequency, this.context.currentTime, 0.1);
	}
};

//sound = new SoundWalker();


$(function() {
	twoScene = new TwoScene();
});