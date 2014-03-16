var TwoScene = function() {
	
	this.div = document.getElementById( 'container' );
	this.$canvas = $('canvas');
	this.canvas = this.$canvas.get(0);
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	this.context = this.canvas.getContext( '2d' );
	
	this.multiplyChance = 1 / 240;
	
	this.vectorFlow = new VectorFlow( this );

	//this.addStats();
	this.addEventListeners();
	
	this.resizeCanvas();
	
	this.addWalkers( 1 );
	
	this.maxWalkers = 500;
	
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
		
		this.context.fillStyle = this.rgbToFillStyle(245, 245, 245, 0.05);
		this.context.fillRect(0,0,this.width, this.height);
		this.context.fill();
		
		this.vectorFlow.drawCells();
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

var VectorFlow = function(scene) {
	this.scene = scene;
	this.targetCellWidth = 200;
	
	this.arrowLength = 0.5;
	
	this.strokeStyle = this.scene.rgbToFillStyle(0,0,0,0.2);
	this.lineWidth = 2;
	this.lineCap = "round";
	
	this.grid = {
		cells : [],
		width : Math.ceil( $(window).width() / this.targetCellWidth ),
		height : Math.ceil( $(window).height() / this.targetCellWidth ),
		position : new THREE.Vector2(),
		cellSize : new THREE.Vector2()
	}
	
	this.generateGrid();
	this.updateSceneCoordinates();
	this.defineArrow();
}

VectorFlow.prototype = {
	
	generateGrid : function() {
		
		var cells = this.grid.cells,
			i, j, position = new THREE.Vector2(),
			cell;
		
		for( i = 0; i < this.grid.width; i++) {
			
			cells[ i ] = [];
			
			for(j=0; j < this.grid.height; j++) {
				
				cell = {
					
					vector : this.setDirection( new THREE.Vector2(), position.set(i,j) ),
					gridCoordinates : new THREE.Vector2(i, j),
					sceneCoordinates : new THREE.Vector2(),
					pixelCenter : new THREE.Vector2(),
					theta : undefined
				};
				
				cell.theta = Math.atan2( cell.vector.y, cell.vector.x );
				cell.theta = Math.PI * 2 * Math.random();
				cell.theta = 0;
				
				cells[ i ][ j ] = cell;
			}
		}
	},
	
	updateSceneCoordinates : function() {
		
		var cells = this.grid.cells,
			i, j,
			cell;
		
		this.grid.cellSize = new THREE.Vector2(
			$(window).width() / this.grid.width,
			$(window).height() / this.grid.height
		);
		
		console.log(this.grid.width, this.grid.height, this.grid.cellSize.x, this.grid.cellSize.y);
		
		for( i = 0; i < this.grid.width; i++) {
			for(j=0; j < this.grid.height; j++) {
				
				cell = cells[ i ][ j ];
				
				cell.sceneCoordinates.set(
					i * this.grid.cellSize.x,
					j * this.grid.cellSize.y
				);
				
				cell.pixelCenter
					.copy( this.grid.cellSize )
					.multiplyScalar( 0.5 )
					.add( cell.sceneCoordinates );
					
					console.log(i,j,cell.sceneCoordinates.x, cell.sceneCoordinates.y)
			}
		}
	},
	
	setDirection : function( vector, position ) {
		
		vector.set( Math.random(), Math.random() );
		vector.normalize();
		
		return vector;
	},
	
	defineArrow : function() {
		
		var i, cellSize, halfLengthY;
		
		this.arrowPoints = [
			new THREE.Vector2(),
			new THREE.Vector2(),
			new THREE.Vector2(),
			new THREE.Vector2()
		];
		this.drawPoints = [
			new THREE.Vector2(),
			new THREE.Vector2(),
			new THREE.Vector2(),
			new THREE.Vector2()
		];
		
		this.arrowBase = this.arrowPoints[0];
		this.arrowTip = this.arrowPoints[1];
		this.arrowTipL = this.arrowPoints[2];
		this.arrowTipR = this.arrowPoints[3];
		
		this.drawBase = this.drawPoints[0];
		this.drawTip = this.drawPoints[1];
		this.drawTipL = this.drawPoints[2];
		this.drawTipR = this.drawPoints[3];
			
		this.arrowLengths = [];
		
		cellSize = this.grid.cellSize;
		halfLengthY = (this.arrowLength * cellSize.y) / 2;
		
		this.arrowBase.set(
			0,
			halfLengthY * -1
		);
		
		this.arrowTip.set(
			0,
			halfLengthY
		);
		
		this.arrowTipL.set(
			this.arrowLength * cellSize.x / -4,
			(this.arrowLength * cellSize.y) / 4
		);
		
		this.arrowTipR.set(
			this.arrowLength * cellSize.x / 4,
			(this.arrowLength * cellSize.y) / 4
		);
		
		for(i=0; i < this.arrowPoints.length; i++) {
			this.arrowLengths.push( this.arrowPoints[i].length() );
		}
	},
	
	drawCell : function( cell ) {
			
		//Rotate the points
		for(i=0; i < this.arrowPoints.length; i++) {
			
			this.drawPoints[i].x = Math.cos( cell.theta ) * this.arrowLengths[i];
			this.drawPoints[i].y = Math.sin( cell.theta ) * this.arrowLengths[i];
			
			debugger;
			
			this.drawPoints[i].add( cell.pixelCenter );
		}
		
		
		//Draw the points
		this.scene.context.moveTo(this.drawBase.x,	this.drawBase.y);
		this.scene.context.lineTo(this.drawTip.x,	this.drawTip.x);
		
		
		//this.scene.context.lineTo(this.drawTipL.x,	this.drawTipL.y);
		//this.scene.context.moveTo(this.drawTip.x,	this.drawTip.y);
		//this.scene.context.lineTo(this.drawTipR.x,	this.drawTipR.y);
		this.scene.context.stroke();
		
	},
	
	drawCells : function() {
		var cells = this.grid.cells,
			position = new THREE.Vector2(),
			cell;
		
		this.scene.context.strokeStyle = this.strokeStyle;
		this.scene.context.lineWidth = this.lineWidth;
		this.scene.context.lineCap = this.lineCap;
	
		for( position.x = 0; position.x < this.grid.width; position.x++) {
			for(position.y=0; position.y < this.grid.height; position.y++) {
				
				this.drawCell( cells[ position.x ][ position.y ] );
			}
		}
		
		debugger;
	}
};

var twoScene;

$(function() {
	twoScene = new TwoScene();
});