var TwoScene = function() {
	
	this.div = document.getElementById( 'container' );
	this.canvasColors = document.getElementById("colors");
	this.canvasVectors = document.getElementById("vectors");
	
	this.$canvasColors = $( this.canvasColors );
	this.$canvasVectors = $( this.canvasVectors );
	
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	this.contextColors = this.canvasColors.getContext( '2d' );
	this.contextVectors = this.canvasVectors.getContext( '2d' );
	
	this.multiplyChance = 1 / 240;
	this.stats = false;
	this.maxWalkers = 500;
	
	this.resizeCanvas();
	this.addEventListeners();

	PERLIN.noise.seed( Math.random() );
	
	this.addStats();
	this.vectorFlow = new VectorFlow( this, this.contextVectors );
	this.addWalkers( 125 );
	//this.addWalkers( 1 );
	
	
	this.loop();
};
		
TwoScene.prototype = {
	
	addWalkers : function( number ) {
		
		this.walkers = [];
		
		for(var i=0; i < number; i++) {
			this.walkers[i] = new Walker( this, this.contextColors, this.vectorFlow );
		}
	},
	
	drawWalkers : function() {
		
		var oldWalker, newWalker;
		
		for( var i=0; i < this.walkers.length; i++ ) {
			this.walkers[i].update();
			this.walkers[i].draw();
		}
		/*
		if( Math.random() <= this.multiplyChance && this.walkers.length < this.maxWalkers ) {
			
			oldWalker = this.walkers[ Math.floor( this.walkers.length * Math.random() ) ];
			newWalker = new Walker( this, this.contextColors, this.vectorFlow );
			
			this.walkers.push( newWalker );
			
			newWalker.copy( oldWalker );

		}*/
		
	},
	
	addStats : function() {
		if(!this.stats) return;
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		$("#container").append( this.stats.domElement );
	},
	
	addEventListeners : function() {
		$(window).on('resize', this.resizeCanvas.bind(this));
	},
	
	resizeCanvas : function(e) {
		
		this.width = $(window).width();
		this.height = $(window).height();
		
		this.canvasColors.width = this.width;
		this.canvasColors.height = this.height;
		
		this.canvasVectors.width = this.width;
		this.canvasVectors.height = this.height;
		
		this.left = this.$canvasColors.offset().left;
		this.top = this.$canvasColors.offset().top;
		
		Walker.prototype.maxDistanceSq = Math.min(this.width * this.width, this.height * this.height) / 2;
		if(this.vectorFlow !== undefined) {
			this.vectorFlow.generateGrid();
			this.vectorFlow.updateSceneCoordinates();
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
		if(this.stats) this.stats.update();
		
		//this.context.clearRect(0,0,this.width, this.height);
		
		this.drawWalkers();
		
		this.contextColors.fillStyle = this.rgbToFillStyle(245, 245, 245, 0.01);
		this.contextColors.fillRect(0,0,this.width, this.height);
		
		//Vectors
		this.contextVectors.clearRect(0,0,this.width, this.height);
		this.vectorFlow.drawCells();
	}
	
};

var Walker = function( scene, context, vectorFlow ) {
	
	this.context = context;
	this.vectorFlow = vectorFlow;
	
	this.ratio = 0.5;
	this.scene = scene;
	this.x = this.scene.width * Math.random();
	this.y = this.scene.height * Math.random();
	this.prevX = this.x;
	this.prevX = this.y;
	this.moveStep = 3;
	this.hueStep = 3;
	this.size = 5;
	this.hue = (Math.random() * 45) + this.hueStart;
};

Walker.prototype = {
	
	hueStart : 360 * Math.random(),
	
	maxDistanceSq : 0,
	
	random : function() {
		return Math.random() * 2 - 1;
	},
	
	update : function() {
		
		var length = Math.random() * this.moveStep;
		
		var cell = this.vectorFlow.getCellAtSceneCoordinate(this.x, this.y);
		
		this.prevX = this.x;
		this.prevY = this.y;
		
		this.x += Math.cos( cell.theta ) * this.moveStep + this.scene.width;	//Add on the modulo amount to ensure positive numbers;
		this.y += Math.sin( cell.theta ) * this.moveStep + this.scene.height;
		
		this.hue += this.random() * this.hueStep;
		
		this.x = this.x % this.scene.width;
		this.y = this.y % this.scene.height;
		
		this.hue %= 360;
	},
	
	copy : function( walker ) {
		
		this.x = walker.x;
		this.y = walker.y;
		this.prevX = walker.prevX;
		this.prevY = walker.prevY;
		this.hue = walker.hue;
	},
	
	draw : function() {
		
		var distanceSq = Math.pow(this.x - this.prevX, 2) + Math.pow(this.y - this.prevY, 2);
		
		if(distanceSq > this.maxDistanceSq) return;
		
		this.context.beginPath();
		this.context.strokeStyle = this.scene.hslToFillStyle(this.hue, 100, 50, 0.5);
		//this.context.strokeStyle = this.scene.hslToFillStyle(this.hue, 100, 0, 1);
		this.context.lineWidth =  2;
		this.context.lineCap = 'round';
		
		this.context.moveTo(this.prevX, this.prevY);
		this.context.lineTo(
			this.x,
			this.y
		);
		
		this.context.stroke();
		this.context.closePath();
	}
	
};

var VectorFlow = function( scene, context ) {
	this.scene = scene;
	this.context = context;
	this.targetCellWidth = 25;
	
	this.arrowLength = 0.5;
	
	this.strokeStyle = this.scene.rgbToFillStyle(0,0,0, 0.25);
	this.lineWidth = 1;
	this.lineCap = "butt";
	
	this.noiseDelta = 0;
	this.noiseSpeed;
	this.noiseScale;
	
	this.grid = {
		cells : [],
		width : Math.ceil( $(window).width() / this.targetCellWidth ),
		height : Math.ceil( $(window).height() / this.targetCellWidth ),
		position : new THREE.Vector2(),
		cellSize : new THREE.Vector2()
	};
	
	this.generateGrid();
	this.updateSceneCoordinates();
	this.defineArrow();
}

VectorFlow.prototype = {
	
	generateGrid : function() {
		
		var cells, cell,
			i, j;
		
		this.grid.cells = [];
		
		cells = this.grid.cells;
		
		for( i = 0; i < this.grid.width; i++) {
			
			cells[ i ] = [];
			
			for(j=0; j < this.grid.height; j++) {
				
				cell = {
					vector :			new THREE.Vector2( Math.random(), Math.random() ),
					gridCoordinates :	new THREE.Vector2(i, j),
					sceneCoordinates :	new THREE.Vector2(),
					pixelCenter :		new THREE.Vector2(),
					theta :				PERLIN.noise.simplex3(i,j,0) //Scalar value
				};
				
				cells[ i ][ j ] = cell;
			}
		}
	},
	
	updateSceneCoordinates : function() {
		
		var cells = this.grid.cells,
			i, j,
			cell, averageCellSize;
		
		this.grid.cellSize = new THREE.Vector2(
			$(window).width() / this.grid.width,
			$(window).height() / this.grid.height
		);
		
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
			}
		}

		averageCellSize = ( this.grid.cellSize.x + this.grid.cellSize.y ) / 2;
		this.noiseSpeed = 0.0001 / averageCellSize;
		this.noiseScale = averageCellSize;
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
		this.arrowAngles = [];
		
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
		
		this.theta = 0;
		
		for(i=0; i < this.arrowPoints.length; i++) {
			this.arrowLengths.push( this.arrowPoints[i].length() );
			this.arrowAngles.push( Math.atan2( this.arrowPoints[i].x, this.arrowPoints[i].y ) );
		}
	},
	
	drawCell : function( cell ) {
		
		this.noiseDelta += this.noiseSpeed;
		
		cell.theta = 2 * Math.PI * PERLIN.noise.simplex3(
			cell.gridCoordinates.x / this.noiseScale,
			cell.gridCoordinates.y / this.noiseScale,
			this.noiseDelta
		);
		
		//Rotate the points
		for(i=0; i < this.arrowPoints.length; i++) {
			
			this.drawPoints[i].x = Math.cos( cell.theta + this.arrowAngles[i] ) * this.arrowLengths[i];
			this.drawPoints[i].y = Math.sin( cell.theta + this.arrowAngles[i] ) * this.arrowLengths[i];
			
			this.drawPoints[i].add( cell.pixelCenter );
			
		}
		
		//Draw the points
		this.context.moveTo(this.drawBase.x,	this.drawBase.y);
		this.context.lineTo(this.drawTip.x,	this.drawTip.y);
		this.context.moveTo(this.drawTipL.x,	this.drawTipL.y);
		this.context.lineTo(this.drawTip.x,	this.drawTip.y);
		this.context.lineTo(this.drawTipR.x,	this.drawTipR.y);
		
	},
	
	drawCells : function() {
		var cells = this.grid.cells,
			position = new THREE.Vector2(),
			cell;
		
		this.context.strokeStyle = this.strokeStyle;
		this.context.lineWidth = this.lineWidth;
		this.context.lineCap = this.lineCap;
	
		this.context.beginPath()
		for( position.x = 0; position.x < this.grid.width; position.x++) {
			for(position.y=0; position.y < this.grid.height; position.y++) {
				
				this.drawCell( cells[ position.x ][ position.y ] );
			}
		}
		this.context.stroke();
		this.context.closePath();
	},
	
	coordinateSceneToGrid : function( sceneCoordinate ) {
		
		var i, j, cellSize = this.grid.cellSize;
				
 		i = Math.floor( sceneCoordinate.x / cellSize.x );
		j = Math.floor( sceneCoordinate.y / cellSize.y );
	},
	
	getCellAtSceneCoordinate : function( x, y ) {
		
		var i, j, cellSize = this.grid.cellSize;
				
 		i = Math.floor( x / cellSize.x );
		j = Math.floor( y / cellSize.y );
		
		//if(i < 0 || i > this.grid.width - 1 || j < 0 || i > this.grid.height) console.warn( "Error!" );
		
		i = Math.max(i, 0);
		j = Math.max(j, 0);
		
		i = Math.min(i, this.grid.width - 1);
		j = Math.min(j, this.grid.height - 1);
		
		return this.grid.cells[i][j];
	}
};

var twoScene;

$(function() {
	twoScene = new TwoScene();
});