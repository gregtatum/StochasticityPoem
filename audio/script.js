var AudioContext = AudioContext || webkitAudioContext,
	AudioScene, Instrument, Musician,
	audioScene;

AudioScene = function() {
	
	this.musicians;
	this.addMusicians();
	
	this.loop();
};
		
AudioScene.prototype = {
	
	addMusicians : function( number ) {
		
		var number = 10;
		
		this.musicians = [];
		
		for( var i=0; i < number; i++ ) {
			this.musicians[i] = new Musician();
		}
		
	},
				
	loop : function() {

		this.update();
		
		setTimeout(function() {
			this.loop();
		}.bind(this), 1000/60 );
		
	},
	
	update : function() {
		
		for( var i=0; i < this.musicians.length; i++ ) {
			this.musicians[i].update();
		}
		
	}
	
};

Musician = function() {
	
	this.x = 0;
	this.y = 0;
	this.prevX = this.x;
	this.prevY = this.y;
	
	this.instrument = new Instrument();
	this.gain = 0.5;
	
	//Choose one note amongst the note frequencies
	var note = Math.floor(
		this.noteFrequencies.length * Math.random()
	);
	
	this.instrument.setFrequency( this.noteFrequencies[ note ] );
	
};

Musician.prototype = {
	
	//Create an array of frequencies
	noteFrequencies : (function() {
		
		var chord = Note.fromLatin('E3G3B3D3E4G4B4D4');
		
		return chord.map(function(note) {
			return note.frequency();
		});
		
	})(),
	
	random : function() {
		//Random number between -1 and 1
		return Math.random() * 2 - 1;
	},
	
	update : function() {
		
		this.prevX = this.x;
		this.prevY = this.y;
		
		this.x = (this.x + 0.1 * Math.random()) % 10;
		this.y = (this.y + 0.1 * Math.random()) % 10;
		
		this.instrument.setPosition(
			this.x - 5,
			this.y - 5,
			-0.5
		);
		
		this.gain += this.random() * 0.1;
		this.gain = Math.max(0, this.gain);
		this.gain = Math.min(1, this.gain);
		
		this.instrument.setGain(
			this.gain
		);
		
		//this.instrument.setBandpassFrequency( 50 + Math.abs( this.y ) * 300 );
		//this.instrument.setBandpassQ( Math.abs( this.x * 2 ) );
		
	}
};

Instrument = function() {
	
	//Test to make sure the AudioContext is available
	this.enabled = ( this.context !== undefined );
	
	if(!this.enabled) return;
	
	//Define audio nodes
	this.panner;
	this.oscillator;
	this.gain;
	this.bandpass;
	
	this.setupNodes();
};

Instrument.prototype = {
	
	context : AudioContext ? new AudioContext() : undefined, //Create only 1 audio context
	
	setupNodes : function() {
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

		this.context.listener.setPosition(0, 0, 0);

		/*
		this.oscillator.connect( this.bandpass );
		this.bandpass.connect( this.panner );
		this.panner.connect( this.gain );
		this.gain.connect( this.context.destination );
		*/
		
		this.oscillator.connect( this.panner );
		this.panner.connect( this.gain );
		this.gain.connect( this.context.destination )
		this.oscillator.start(0);
	},
	
	//Interact with audio:
	
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

$(function() {
	audioScene = new AudioScene();
});