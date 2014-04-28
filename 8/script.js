var TwoScene = function() {
	
	this.setPolyfills();
	
	this.div = document.getElementById( 'container' );
	this.$canvas = $('canvas');
	this.canvas = this.$canvas.get(0);
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	this.context = this.canvas.getContext( '2d' );
	
	//this.addStats();
	this.addEventListeners();
	
	this.resizeCanvas();
	
	this.webcam = new WebcamSampler( this );
	this.addWalkers( 250 );
};

TwoScene.prototype = {

	setPolyfills : function() {
		navigator.getUserMedia = (
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia  ||
			navigator.mozGetUserMedia  ||
			navigator.msGetUserMedia
		);
							  
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
		this.canvas.width = $(window).width();
		this.canvas.height = $(window).height();
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.left = this.$canvas.offset().left;
		this.top = this.$canvas.offset().top;
		Walker.prototype.maxDistanceSq = Math.min(this.width * this.width, this.height * this.height) / 2;
	
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

		this.webcam.update();
		this.drawWalkers();
	}
	
};

var Walker = function(scene) {
	this.scene = scene;
	this.x = this.scene.width * Math.random();
	this.y = this.scene.height / 2;
	this.prevX = this.x;
	this.prevY = this.y;
	this.moveStep = 20;
	this.hueStep = 1;
	this.size = 4;
	
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.centricity = 1;
	
};

Walker.prototype = {
	
	alphabet : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
	
	hueStart : 360 * Math.random(),
	
	random : function() {
		return Math.random() * 2 - 1;
	},
	
	update : function() {
		this.prevX = this.x;
		this.prevY = this.y;
		
		this.x += this.random() * this.moveStep;
		this.y += this.random() * this.moveStep;
		this.hue += this.random() * this.hueStep;
		
		this.x %= this.scene.width;
		this.y %= this.scene.height;
		
		this.hue %= 360;
	},
	
	draw : function() {
		
		var distanceSq = Math.pow(this.x - this.prevX, 2) + Math.pow(this.y - this.prevY, 2);
		
		if(distanceSq > this.maxDistanceSq) return;
		
		this.scene.webcam.sampleColor( this );
		
		this.scene.context.strokeStyle = this.scene.rgbToFillStyle(
			this.r,
			this.g,
			this.b,
			0.4
		);
		
		//this.scene.context.lineWidth = this.size;
		this.scene.context.lineWidth = this.size;

		this.scene.context.beginPath();		
		this.scene.context.moveTo(this.prevX, this.prevY);
		this.scene.context.lineTo(this.x, this.y);
		this.scene.context.stroke();
		this.scene.context.closePath();
		
		
		/*
		var letter = Math.floor( this.alphabet.length * Math.random() );
		this.scene.webcam.sampleColor( this );
		
		this.scene.context.font = [ (Math.random() * 4 + 9) , "px sans-serif"].join("");
		this.scene.context.fillStyle = this.scene.rgbToFillStyle(
			this.r,
			this.g,
			this.b,
			0.4
		);
		this.scene.context.fillText(this.alphabet[letter], this.x, this.y);
		*/
	}
	
};

var WebcamSampler = function( scene ) {
	
	this.scene = scene;
	this.flip = true;
	
	this.$video = $('<video autoplay></video>');
	this.video = this.$video.get(0);
	this.$video.hide().appendTo('body');
	
	this.$canvas = $('<canvas></canvas>');
	this.$canvas.hide().appendTo('body');
	this.canvas = this.$canvas.get(0);
	this.context = this.canvas.getContext('2d');
	
	this.webcamPromise = this.startWebcam();
	this.attachWebcamToVideo();
};

WebcamSampler.prototype = {

	startWebcam : function() {
		
		var deferred = new $.Deferred();
		
		navigator.getUserMedia ({
				video: {
					mandatory: { maxWidth: 320, maxHeight: 180	}
				  },
				audio: false
			},
			function(localMediaStream) {
				deferred.resolve(localMediaStream);
			},
			function( error ) {
				deferred.reject( error );
			}
		);
		
		return 	deferred.promise();
	},
	
	attachWebcamToVideo : function() {
		$.when(this.webcamPromise).then( function(localMediaStream) {

			this.video.src = window.URL.createObjectURL(localMediaStream);
			this.canvas.width = this.$video.width();
			this.canvas.height = this.$video.height();
			
			this.scene.loop();
			
		}.bind(this), function( error ) {
			$('#webcam-error').show();
			console.log(error);
		}).always(function() {
			$('#webcam-please').hide();
		});
	},
	
	updateColorSample : function() {
		this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
		this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	},
	
	sampleColor : function( walker ) {
		if(this.imageData) {
			var x = Math.floor(((this.scene.width - walker.x) / this.scene.width) * this.imageData.width);
			var y = Math.floor((walker.y / this.scene.height) * this.imageData.height);
			
			var offset = (x + y * this.imageData.width) * 4;
			
			walker.r = this.imageData.data[offset + 0];
			walker.g = this.imageData.data[offset + 1];
			walker.b = this.imageData.data[offset + 2];
			
		}
	},
	
	update : function() {
		if(this.flip) this.updateColorSample();
		this.flip = !this.flip;
		
	}
};

var twoScene;

$(function() {
	twoScene = new TwoScene();
});