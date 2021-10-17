// vertex shader
const VERTSHADER = [].join("\n");

// fragment shader
const FRAGSHADER = [].join("\n");

// game related constants
const PLAYER_LOSS_THRESHOLD = 100;
const BACTERIA_COUNT = 10; // amount of bacteria on the canvas

// shape scale/dimensions
const FIELD_SCALE = 0.9; // Scale of the background field relative to the canvas
var currentBacteriaRadius = 0.0; // radius of current bacteria
var bacteriaScale = 0.01; // initial bacteria size, increased each frame

// global game states 
var gameWon = false; // true when game is won
var gameLost = false; // true when game is lost

// player state variables
var playerScore = 0.0; // player score
var bacteriaOrigins = []; // store origin coords of each bacteria

// create a set of colours for the pests
var pestColours = generateBacteriaColours();

function initGame() {
  let canvas = document.getElementById("gameCanvas"); // grab canvas elements 

  let gl = getWebGLContext(canvas); // get webgl context
  if (!gl) {
    console.log("Error"); // error if cannot find
    return;
  }

  // gl.clearColor(0.0, 0.0, 0.0, 1.0); // set canvas bg colour

  // initialize shaders / WebGL program
  if (!initShaders(gl, VERTSHADER, FRAGSHADER)) {
    console.log("Error");
    return;
  }

  var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Error");
    return;
  }

  var modelMatrix = new Matrix4(); // generate 4x4 matrix

  // generate bacteria data
  bacteriaOrigins = generateBacteriaOrigins();
  var bacteriaColors = generateBacteriaColours();

  /***********************************
      SCARY GAME LOOP OOOO SCARY
  /***********************************/

  function gameLoop() {
    if (!gameWon && !gameLost) {
      bacteriaScale = growBacteria(bacteriaScale); // animate the bacteria growth

      drawCanvas(gl, bacteriaScale, modelMatrix, u_ModelMatrix, bacteriaOrigins,bacteriaColors); // draw all the shapes onto the canvas

    }
    checkWinStatus(); // check if the player has won this loop
    checkLossStatus(); // check if the player has lost this loop
   
    // if neither won or lost, still playing
    if (!gameWon && !gameLost){
       requestAnimationFrame(gameLoop, canvas); // run the gameLoop another round
    }else {
      gl.clear(gl.COLOR_BUFFER_BIT); //   clear the game canvas of all elements and end the gameLoop
      canvas.setAttribute("height", 0); // set canvas height to 0
    }
  }

  gameLoop(); // run the game loop boyyyy
}

  function generateBacteriaOrigins() {
    var bacteriaOrigins = [];
    for (var i = 0; i < BACTERIA_COUNT; i++) {
      
      var h = ((Math.floor(Math.random() * 360) + 1) * Math.PI) / 180;
     
      var centerX = Math.sin(h).toFixed(2) * FIELD_SCALE;
      var centerY = Math.cos(h).toFixed(2) * FIELD_SCALE;
      
      bacteriaOrigins = bacteriaOrigins.concat(centerX);
      bacteriaOrigins = bacteriaOrigins.concat(centerY);
      console.log("Bacteria #" +  (i + 1) + " Origin: X = " + bacteriaOrigins[i] + ", Y = " + bacteriaOrigins[i + 1] ); // print indiv bacteria coord data to console
    }

    return bacteriaOrigins;
  }



  function generateBacteriaColours() {
    var bacteriaColours = [];
    var max = 1.0, min = 0.1; // colour bounds

    for (var i = 0; i < 10; i++) {
      var red = Math.random() * (max - 0.5) + 0.5;
      var green = Math.random() * (max - min) + min;
      var blue = Math.random() * (max - min) + min;
     
      bacteriaColours[i] = generateCircleColours(red, green, blue);
    }

    return bacteriaColours;
  }

  function generateCircleColours(red, green, blue) {
    var circleColours = [];
    
    for (var i = 0.0; i <= 360; i++) {  // loop over all verticies that make up the circle
     
      var v1 = [ red, green, blue];
      
      var v2 = [0.0, 0.0, 0.0];
      
      circleColours = circleColours.concat(v1);
      circleColours = circleColours.concat(v2);
      
    return circleColours;
  }

  function generateCircleVertices() {
    // TODO: Generate all the verticies of the circle which is comprised of 360 triangle strips.
  }

  function generateBacteriaVertices(){
    // TODO: Generate all the verticies of the bacteria which is comprised of 360 triangle strips.
  }

  function growBacteria() {
    // TODO: Increase bacteria size each gameLoop
  }

  function drawCanvas(gl, currentSize, modelMatrix, u_ModelMatrix, bacteriaLocations, bacteriaColors) {
    // TODO: Draw the canvas
    // TODO: Call drawField to create the playing field
    // TODO: Call drawBacteria to create bacteria on circumference of the field
  }

  function drawField(gl) {
    // TODO: Draw the field which the game will play on
  }

  function drawBacteria(gl, centerX, centerY, colorArray, scale) {
    // TODO: Draw the bacteria
  }

    // TODO: Check if we click inside a bacteria

    // coordinate calculations from https://github.com/davidwparker/programmingtil-webgl/blob/master/0033-reading-pixels/libs/uiUtils.js
    function pixelInputToCanvasCoord(event, canvas) {
      var x = event.clientX,
        y = event.clientY,
        rect = event.target.getBoundingClientRect();
      x = x - rect.left;
      y = rect.bottom - y;
      return {x:x,y:y};
      }

    // allows for console logs to be saved to an array
    console.stdlog = console.log.bind(console);
      console.logs = [];
      console.log = function(){
          console.logs.push(Array.from(arguments));
          console.stdlog.apply(console, arguments);
      }
    // Gets the colour of the pest that is clicked on and calls eradicatePests 
    canvas.onmousedown = function(e){
      var point = pixelInputToCanvasCoord(e,canvas);
      
      
      var pixels = new Uint8Array(4);
      gl.readPixels(point.x,point.y,1,1,gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      console.log(pixels);
  
      var currentColour = console.logs[console.logs.length - 1];
      console.logs.length = 0;
      eradicatePests(currentColour);
    }

  function eradicatePests(colours){
    //TODO: Write function to delete the pest that has been clicked on
    for(var i = 0; i < 10; i++){
      if(colours == pestCoulours[i]){
        vertexArray.splice(i,1,NULL); // sets the index i in vertexArray to NULL so the object isnt drawn in the render loop
      }
    }
  }

  //if every index in vertexArray is NULL, game is won
  function checkWinStatus() {
    // TODO: Write check to see if all bacteria on the field have been eradicated
    var count = 0;
    for(var i = 0; i < 10; i++){
      if(vertexArray[i] == NULL){ 
        count++
      }
    }
    if(count == 10){
      gameWon = TRUE;
    }
  }

  function checkLossStatus() {

    // TODO: Write check to see if the bacteria have gotten too large or however we're gonna lose lol

    // if (playerScore >= PLAYER_LOSS_THRESHOLD) {
    //   gameLost = true;
    //   alert("GAME LOST");
    //   console.log("GAME LOST");
    // }
  }
}
