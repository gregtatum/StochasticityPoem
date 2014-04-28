var WebcamPromise = function(settings) {
	
	return function() {

		var deferred = new $.Deferred();

		navigator.getUserMedia (settings,
			function(localMediaStream) {
				deferred.resolve(localMediaStream);
			},
			function( error ) {
				deferred.reject( error );
			}
		);

		return deferred.promise();
	};
	
};
	
var MotionWebcam = function( scene ) {
	
	_.bindAll(this, [
		"startVisualWebcam",
		"startDataWebcam",
		"attachVisualWebcam",
		"attachDataWebcam",
		"update"
	]);
	
	this.scene = scene;
	this.flip = true;
	
	//Create the visual camera and video
	this.$message = $message;
	this.$video = $('<video autoplay></video>');
	this.video = this.$video.get(0);
	//this.$video.appendTo('body');
	
	this.$canvas1 = $('<canvas></canvas>');
	this.canvas1 = this.$canvas.get(0);
	this.$canvas2 = $('<canvas></canvas>');
	this.canvas2 = this.$canvas.get(0);
	
	this.context = this.canvas.getContext('2d');

	//Create the reference camera and video
	this.$dataVideo = $('<video autoplay></video>');
	this.dataVideo = this.$dataVideo.get(0);
	this.$dataVideo.hide().appendTo('body');
	this.imageData1 = undefined;
	this.imageData2 = undefined;
	
	this.start();
};

MotionWebcam.prototype = {

	start : function() {
		
		return Q.fcall
			 (	this.startVisualWebcam )
		.then(	this.attachVisualWebcamToVideo )
		.then(	this.startDataWebcam )
		.then(	this.attachDataWebcamToVideo );
	},
	
	startVisualWebcam : WebcamPromise({
		video: {
			mandatory: { maxWidth: 320, maxHeight: 180	}
		  },
		audio: false
	}),
	
	startDataWebcam : WebcamPromise({
		video: {
			mandatory: { maxWidth: 320, maxHeight: 180	}
		  },
		audio: false
	}),
	
	attachVideoWebcam : function( localMediaStream ) {
		this.video.src = window.URL.createObjectURL(localMediaStream);
	},
	
	attachDataWebcam : function( localMediaStream ) {
		
		this.dataVideo.src = window.URL.createObjectURL(localMediaStream);
		
		this.canvas1.width  = this.canvas2.width  = this.video.width;
		this.canvas1.height = this.canvas2.height = this.video.height;
		
		return Q.defer().resolve().promise;
	},
	
	sampleColor : function( x, y, optionalRgbObject ) {
		
		var colors = optionalRgbObject || {};
		var imageData = this.flip ? this.imageData1 : this.imageData2;
		
		if(imageData) {
			
			var newX = Math.floor(((this.scene.width - x) / this.scene.width) * this.imageData.width);
			var newY = Math.floor((y / this.scene.height) * this.imageData.height);
			
			var offset = (newX + newY * imageData.width) * 4;
			
			colors.r = imageData.data[offset + 0];
			colors.g = imageData.data[offset + 1];
			colors.b = imageData.data[offset + 2];
		}
		
		return colors;
	},
	
	hasMotion : function( x, y, optionalRgbObject ) {
		
		var newX, newY, offset,
			nowR, nowG, nowB, oldR, oldG, oldB;
		var colors = optionalRgbObject || {};
		var imageDataNow = this.flip ? this.imageData1 : this.imageData2;
		var imageDataOld = this.flip ? this.imageData2 : this.imageData1;
		var diff = this.diff * 256 * 3;
		
		if(imageDataNow && imageDataOld) {
			
			newX = Math.floor(((this.scene.width - x) / this.scene.width) * this.imageData.width);
			newY = Math.floor((y / this.scene.height) * this.imageData.height);
			
			offset = (newX + newY * imageData.width) * 4;
			
			nowR = imageDataNow.data[offset + 0];
			nowG = imageDataNow.data[offset + 1];
			nowB = imageDataNow.data[offset + 2];
			
			oldR = imageDataOld.data[offset + 0];
			oldG = imageDataOld.data[offset + 1];
			oldB = imageDataOld.data[offset + 2];
			
			if(
				Math.abs(nowR - oldR) +
				Math.abs(nowG - oldG) +
				Math.abs(nowB - oldB)
				> diff
			) return true;
		}
		
		return false;
	},
	
	update : function() {
		this.flip = !this.flip;
		
		if(this.flip) {
			this.context1.drawImage(this.dataVideo, 0, 0, this.canvas1.width, this.canvas1.height);
			this.imageData1 = this.context1.getImageData(0, 0, this.canvas1.width, this.canvas1.height);
		} else {
			this.context2.drawImage(this.dataVideo, 0, 0, this.canvas2.width, this.canvas2.height);
			this.imageData2 = this.context2.getImageData(0, 0, this.canvas2.width, this.canvas2.height);
		}
	}
};