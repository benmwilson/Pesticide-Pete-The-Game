//Vertex and fragment shader code from 
//https://webglfundamentals.org/webgl/lessons/webgl-2d-matrices.html

var vertexShaderText = [
	'attribute vec2 a_position;',
	'uniform vec2 u_resolution;',
	'uniform mat3 u_matrix;',
	'void main() {',
	// Multiply the position by the matrix.
	'   vec2 position = (u_matrix * vec3(a_position, 1)).xy;',
	// convert the position from pixels to 0.0 to 1.0
	'   vec2 zeroToOne = position / u_resolution;',
	// convert from 0->1 to 0->2
	'   vec2 zeroToTwo = zeroToOne * 2.0;',
	// convert from 0->2 to -1->+1 (clipspace)
	'   vec2 clipSpace = zeroToTwo - 1.0;',
	'   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);',
	'}',
].join('\n');

var fragmentShaderText = [
	'precision mediump float;',
	'uniform vec4 u_color;',
	'void main() {',
	'   gl_FragColor = u_color;',
	'}',
].join('\n');

var program;
var canvas;
var gl;

var positionLocation;
var resolutionLocation;
var colorLocation;
var matrixLocation;

// game related constants
const PLAYER_LOSS_THRESHOLD = 100;
const BACTERIA_COUNT = 10; // amount of bacteria on the canvas

// shape scale/dimensions
const FIELD_SCALE = 0.9; // Scale of the background field relative to the canvas
var currentBacteriaRadius = 0.0; // radius of current bacteria
var bacteriaScale = 0.01; // initial bacteria size, increased each frame

// global game states 
var gameWon = true; // false when game is won
var gameLost = true; // false when game is lost
var growthRate = 0.5;
var lossFactor = 200; //controls how long it takes to lose

// player state variables
var playerScore = 0.0; // player score
var bacteriaOrigins = []; // store origin coords of each bacteria

var bacteriaOrigins;
var bacteriaColours;
var bacteriaActive;

function initGame() {
	initWebGLContext();
	initialiazeShaders();
	gl.useProgram(program);

	bacteriaOrigins = generateBacteriaOrigins(gl.canvas.height / 2 * 0.9);
	bacteriaColors = generateBacteriaColours();
	bacteriaActive = [true, true, true, true, true, true, true, true, true, true];

	square = [
		10, 10,
		-10, 10,
		-10, -10,
		10, -10,
		10, 10,
	]

	var gameArea = createCircleVertices(0, 0, (gl.canvas.height / 2) * 0.9);
  
	var scaleFactor = 10;

	//Enable mouseclick
	canvas.addEventListener("click", getColor);

console.log(gl.canvas.width / 2 * 0.9);
  
	var loop = function () {
		gl.clearColor(0, 0.6, 0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		//Draw gameArea
		//drawShape(gl.TRIANGLE_FAN, gameArea, [gl.canvas.width / 2, gl.canvas.height / 2], 0, [1, 1], [1, 1, 0, 1]);

		var won = true;
		for(var x = 0; x < bacteriaActive.length; x++){
			if(bacteriaActive[x])
				won = false;
		}

		
   		if(scaleFactor == lossFactor){
      		console.log("lost");
			gameLost = false;
		} 
		if(won){
			console.log("won");
			gameWon = false
		}
	
		if (gameLost && gameWon) {
      console.log("still on");
			drawShape(gl.TRIANGLE_FAN, gameArea, [gl.canvas.width / 2, gl.canvas.height / 2], 0, [1, 1], [1, 1, 0, 1]);

			//Draw bacteria
			for (var x = 0; x < bacteriaOrigins.length; x++) {
				vertices = createCircleVertices(0, 0, 1);
				if (bacteriaActive[x])
					drawShape(gl.TRIANGLE_FAN, vertices, [bacteriaOrigins[x][0], bacteriaOrigins[x][1]], 0, [scaleFactor, scaleFactor], bacteriaColors[x]);
			}
			scaleFactor += growthRate;
		}

		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);

}

function initWebGLContext() {
	canvas = document.getElementById('gameCanvas');
	//gl = getWebGLContext(canvas);
	gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

	if (!gl) {
		console.log('webgl not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}
	if (!gl) {
		alert('your browser does not support webgl');
	}

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	var screenDimension = Math.min(canvas.width, canvas.height);
	canvas.width = screenDimension;
	canvas.height = screenDimension;
	gl.viewport(0, 0, canvas.width, canvas.height);
}

function initialiazeShaders() {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader!', gl.getShaderInfoLog(vertexShader))
		return;
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader!', gl.getShaderInfoLog(fragmentShader))
		return;
	}

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Error linking program!', gl.getProgramInfo(program));
		return;
	}

	// look up where the vertex data needs to go.
	positionLocation = gl.getAttribLocation(program, "a_position");

	// lookup uniforms
	resolutionLocation = gl.getUniformLocation(program, "u_resolution");
	colorLocation = gl.getUniformLocation(program, "u_color");
	matrixLocation = gl.getUniformLocation(program, "u_matrix");

}

function drawShape(type, vertices, translation, rotationDegrees, scale, color) {
	//Some code referenced from https://webglfundamentals.org/webgl/lessons/webgl-2d-matrices.html

	vertices = new Float32Array(vertices);
	var n = vertices.length / 2;

	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	//var color = [0,0,0,1];

	//Set resolution
	gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
	//Set color
	gl.uniform4fv(colorLocation, color);

	// Compute the matrices
	var translationMatrix = m3.translation(translation[0], translation[1]);
	var rotationMatrix = m3.rotation(rotationDegrees * (Math.PI / 180));
	var scaleMatrix = m3.scaling(scale[0], scale[1]);

	// make a matrix that will move the origin of the 'F' to its center.
	var moveOriginMatrix = m3.translation(0, 0);

	// Multiply the matrices.
	var matrix = m3.multiply(translationMatrix, rotationMatrix);
	matrix = m3.multiply(matrix, scaleMatrix);
	matrix = m3.multiply(matrix, moveOriginMatrix);

	// Set the matrix.
	gl.uniformMatrix3fv(matrixLocation, false, matrix);

	// Draw the geometry.
	gl.drawArrays(type, 0, n);
}

function createCircleVertices(x, y, scale) {
	//Leave x,y as 0 otherwise weird translations happen as scale is changed
	var vertices = [];
	for (var i = 0; i <= 360; i++) {
		var j = i * Math.PI / 180;
		vertex = [Math.sin(j) + x, Math.cos(j) + y];
		vertices.push(vertex[0] * scale);
		vertices.push(vertex[1] * scale);
	}
	return vertices
}

function generateBacteriaOrigins(radius) {
	var bacteriaOrigins = [];
	var origin = [gl.canvas.width / 2, gl.canvas.height / 2];

	for (var i = 0; i < BACTERIA_COUNT; i++) {
		var angle = ((Math.floor(Math.random() * 360) + 1) * Math.PI) / 180;
		var centerX = radius * Math.cos(angle) + origin[0];
		var centerY = radius * Math.sin(angle) + origin[1];
		bacteriaOrigins.push([centerX, centerY]);
		//console.log("Bacteria #" + (i + 1) + " Origin: X = " + bacteriaOrigins[i][0] + ", Y = " + bacteriaOrigins[i][1]); // print indiv bacteria coord data to console
	}

	return bacteriaOrigins;
}

function generateBacteriaColours() {
	bacteriaColours = [];
	var max = 1.0, min = 0; // colour bounds

	for (var i = 0; i < 10; i++) {
		var red = Math.random() * (max - 0.5) + 0.5;
		var green = Math.random() * (max - min) + min;
		var blue = Math.random() * (max - min) + min;
		var alpha = 1

		bacteriaColours[i] = [red, green, blue, alpha];
	}

	return bacteriaColours;
}

function pixelInputToCanvasCoord(event) {
	var x = event.clientX,
		y = event.clientY,
		rect = event.target.getBoundingClientRect();
	x = x - rect.left;
	y = rect.bottom - y;
	return { x: x, y: y };
}

function getColor(e) {
	var point = pixelInputToCanvasCoord(e);

	var pixels = new Uint8Array(4);
	gl.readPixels(point.x, point.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	// console.log("R: " + pixels[0]);
	// console.log("G: " + pixels[1]);
	// console.log("B: " + pixels[2]);
	removeBacteria(pixels[0], pixels[1], pixels[2])
}

function removeBacteria(r, g, b) {
	x = 0;
	for (var x = 0; x < bacteriaColours.length; x++) {
		bacR = Math.round(lerp(0, 255, bacteriaColours[x][0]));
		bacG = Math.round(lerp(0, 255, bacteriaColours[x][1]));
		bacB = Math.round(lerp(0, 255, bacteriaColours[x][2]));
		// console.log("Mouse Color: (" + r + ", " + g + ", " + b + ")");
		// console.log("Bacteria Color: (" + bacR + ", " + bacG + ", " + bacB + ")");
		if (r == bacR && g == bacG && b == bacB) {
			//console.log("Bacteria hit")
			bacteriaActive[x] = false;
		}
	}
}

function lerp(a, b, t) {
	return (1 - t) * a + t * b;
}

var m3 = {
	//Matrix math code from https://webglfundamentals.org/webgl/lessons/webgl-2d-matrices.html

	identity: function () {
		return [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
		];
	},

	translation: function (tx, ty) {
		return [
			1, 0, 0,
			0, 1, 0,
			tx, ty, 1,
		];
	},

	rotation: function (angleInRadians) {
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
		return [
			c, -s, 0,
			s, c, 0,
			0, 0, 1,
		];
	},

	scaling: function (sx, sy) {
		return [
			sx, 0, 0,
			0, sy, 0,
			0, 0, 1,
		];
	},

	multiply: function (a, b) {
		var a00 = a[0 * 3 + 0];
		var a01 = a[0 * 3 + 1];
		var a02 = a[0 * 3 + 2];
		var a10 = a[1 * 3 + 0];
		var a11 = a[1 * 3 + 1];
		var a12 = a[1 * 3 + 2];
		var a20 = a[2 * 3 + 0];
		var a21 = a[2 * 3 + 1];
		var a22 = a[2 * 3 + 2];
		var b00 = b[0 * 3 + 0];
		var b01 = b[0 * 3 + 1];
		var b02 = b[0 * 3 + 2];
		var b10 = b[1 * 3 + 0];
		var b11 = b[1 * 3 + 1];
		var b12 = b[1 * 3 + 2];
		var b20 = b[2 * 3 + 0];
		var b21 = b[2 * 3 + 1];
		var b22 = b[2 * 3 + 2];
		return [
			b00 * a00 + b01 * a10 + b02 * a20,
			b00 * a01 + b01 * a11 + b02 * a21,
			b00 * a02 + b01 * a12 + b02 * a22,
			b10 * a00 + b11 * a10 + b12 * a20,
			b10 * a01 + b11 * a11 + b12 * a21,
			b10 * a02 + b11 * a12 + b12 * a22,
			b20 * a00 + b21 * a10 + b22 * a20,
			b20 * a01 + b21 * a11 + b22 * a21,
			b20 * a02 + b21 * a12 + b22 * a22,
		];
	},
};

// //if every index in vertexArray is NULL, game is won
// function checkWinStatus() {
// 	// TODO: Write check to see if all bacteria on the field have been eradicated
// 	var count = 0;
// 	for (var i = 0; i < 10; i++) {
// 		if (vertexArray[i] == NULL) {
// 			count++
// 		}
// 	}
// 	if (count == 10) {
// 		gameWon = TRUE;
// 	}
// }