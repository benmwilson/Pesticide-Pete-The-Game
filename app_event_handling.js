
var vertexShaderText = [
	'precision mediump float;',

	'attribute vec2 vertPosition;',
	'attribute vec3 vertColor;',
	'uniform vec2 motion;',
	'uniform vec2 scale;',
	'varying vec3 fragColor;',

	'void main()',
	'{',
	'	fragColor = vertColor;',
	'	gl_Position = vec4(vertPosition * scale + motion, 0, 1.0);',
	'	gl_PointSize = 10.0;',
	'}'
].join('\n');

var fragmentShaderText = [
	'precision mediump float;',

	'varying vec3 fragColor;',

	'void main()',
	'{',

	'	gl_FragColor = vec4(fragColor,1.0);',
	'}'
].join('\n')

var program;

var InitDemo = function () {


	//////////////////////////////////
	//       initialize WebGL       //
	//////////////////////////////////
	console.log('this is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

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

	//////////////////////////////////
	// create/compile/link shaders  //
	//////////////////////////////////
	function initShaders() {
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
	}

	initShaders();

	//////////////////////////////////
	//    create triangle buffer    //
	//////////////////////////////////

	//all arrays in JS is Float64 by default
	// var triangleVertices = [
	// 	//X,   Y,     R, G, B
	// 	0.0, 0.5, 1, 1, 1,
	// 	-0.5, -0.5, 1, 1, 1,
	// 	0.5, -0.5, 1, 1, 1
	// ];

	// var triangleVertices = [
	// 	//X,   Y,     R, G, B
	// 	0.0,  0.5,    1, 1, 1,
	// 	-0.5,-0.5,    1, 1, 1,
	// 	0.5, -0.5,    1, 1, 1,
	// 	0.5,0.5, 1,1,1
	// ];
	var circleSize = 1.025; // Value from 1 -inf Higher the number, smaller the circle
	var vertices = []
	for (var i = 0; i <= 360; i++) {
		var j = i * Math.PI / 180;
		vertex = [Math.sin(j), Math.cos(j)];
		vertices.push(vertex[0] / circleSize);
		vertices.push(vertex[1] / circleSize);
		vertices.push(1);
		vertices.push(1);
		vertices.push(0);
	}
	var circle = vertices;


	gl.useProgram(program);


	drawShape(gl.LINE_STRIP);



	//////////////////////////////////
	//          math things         //
	//////////////////////////////////

	var motion = new Float32Array(2);
	var scale = new Float32Array(2);

	//get the address of motion variable in the vertex shader
	var motionUniformLocation = gl.getUniformLocation(program, 'motion');
	gl.uniform2fv(motionUniformLocation, motion);

	//get the address of scale variable in the vertex shader
	var scaleUniformSize = gl.getUniformLocation(program, 'scale');
	gl.uniform2fv(scaleUniformSize, scale);

	//////////////////////////////////
	//       Main render loop       //
	//////////////////////////////////

	var x = 0;
	var y = 0;

	//Init circle size
	scale[0] = 1;
	scale[1] = 1;
	rate = 0;

	var triangle = [
		//X,   Y,     R, G, B
		0.0, 0.5, 0, 0, 0,
		-0.5, -0.5, 0, 0, 0,
		0.5, -0.5, 0, 0, 0
	];

	var square = [
		0.5, 0.5, 1, 0, 0,
		-0.5, 0.5, 1, 0, 0,
		-0.5, -0.5, 1, 0, 0,
		0.5, -0.5, 1, 0, 0,
		0.5, 0.5, 1, 0, 0
	]

	scaleObject(triangle, 0.5, 0.5);
	moveObject(triangle, 0.5, 0.5);


	var loop = function () {
		gl.clearColor(0, 0.6, 0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		drawShape(gl.TRIANGLE_FAN, circle);

		motion[0] = x;
		motion[1] = y;
		gl.uniform2fv(motionUniformLocation, motion);

		scale[0] += rate;
		scale[1] += rate;
		gl.uniform2fv(scaleUniformSize, scale);


		//gl.drawArrays(gl.LINE_LOOP, 0, 3);

		drawShape(gl.LINE_LOOP, triangle);
		drawShape(gl.LINE_STRIP, square);

		//call loop function whenever a frame is ready for drawing, usually it is 60fps.
		//Also, if the tab is not focused loop function will not be called
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);

	function moveObject(object, x, y) {
		var coordCount = 0; //Only read x and y coords from object matrix
		for (var i = 0; i < object.length; i++) {
			if (coordCount != 2) {
				if (coordCount == 0) {
					object[i] += x;
					console.log(object[i]);
				} else {
					object[i] += y;
					console.log(object[i]);
				}
				//console.log(square[i]);
				coordCount += 1;
			} else {
				i += 2
				coordCount = 0;
			}
		}
	}

	function scaleObject(object, x, y) {
		var coordCount = 0; //Only read x and y coords from object matrix
		for (var i = 0; i < object.length; i++) {
			if (coordCount != 2) {
				if (coordCount == 0) {
					object[i] *= x;
					console.log(object[i]);
				} else {
					object[i] *= y;
					console.log(object[i]);
				}
				//console.log(square[i]);
				coordCount += 1;
			} else {
				i += 2
				coordCount = 0;
			}
		}
	}

	function drawShape(type, vertices) {
		vertices = new Float32Array(vertices);
		var n = vertices.length / 5;

		var vertexBufferObject = gl.createBuffer();
		//set the active buffer to the triangle buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		//gl expecting Float32 Array not Float64
		//gl.STATIC_DRAW means we send the data only once (the triangle vertex position
		//will not change over time)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
		var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
		gl.vertexAttribPointer(
			positionAttribLocation, //attribute location
			2, //number of elements per attribute
			gl.FLOAT,
			gl.FALSE,
			5 * Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
			0 * Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
		);
		gl.vertexAttribPointer(
			colorAttribLocation, //attribute location
			3, //number of elements per attribute
			gl.FLOAT,
			gl.FALSE,
			5 * Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
			2 * Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);

		gl.drawArrays(type, 0, n);
	}


	canvas.onmousemove = function (ev) {
		var mx = ev.clientX, my = ev.clientY;
		mx = mx / canvas.width - 0.5;
		my = my / canvas.height - 0.5;
		mx = mx * 2;
		my = my * -2;
		//console.log(mx + ' ' + my);
		x = mx;
		y = my;
	}


	window.onkeypress = function (event) {
		if (event.key == 'd')
			x = x + 0.005;
		if (event.key == 'a')
			x = x - 0.005;
		if (event.key == 'w')
			y = y + 0.005;
		if (event.key == 's')
			y = y - 0.005;
	}


};