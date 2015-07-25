"use strict";

var canvas;
var gl;

var points = [];
var segments=[];

var fColor;
const black = vec4(0.0, 0.0, 0.0, 1.0);

var bufferId;
var drawing=false;
var red=0;
var green=0;
var blue=0;

function segment(points,color){
  this.points=points;      
  this.color=color;
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    canvas.addEventListener("mousedown",mousePressed);
    canvas.addEventListener("mouseup",mouseReleased);
    canvas.addEventListener("mousemove",mouseMove);
     canvas.style.cursor='default';
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    // gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );

    fColor = gl.getUniformLocation(program,"fColor");
     
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function mouseReleased(){
  console.log("mouseRelease");
  drawing=false;
}

function mouseMove(event){
  if (drawing) {
    var t = toCanvasCoord(event);
    draw(t);
 //   console.log("mouseMove: ", t);
  }
}

function draw(point){
  var seg=segments[segments.length-1];
  var points=seg.points;
  points.push(point);  
 
}

function updateRed(value){
  red=value;
}

function updateGreen(value){
  green=value;
}

function updateBlue(value){
  blue=value;  
}

function mousePressed(event){
  var points=[];
  var point=toCanvasCoord(event);
  points.push(point);
  var col=[red,green,blue];
  var seg=new segment(points,col);
  segments.push(seg);
  drawing=true;
 
}

  function toCanvasCoord(event) {
    return vec2(-1 + 2 * event.clientX / canvas.width, -1 + 2 * (canvas.height - event.clientY) / canvas.height);
  }

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform4fv(fColor, flatten(black));
  
  for (var i = 0; i < segments.length; i++) {
     var seg=segments[i];
     var points = seg.points;
     var col=vec4(seg.color[0],seg.color[1],seg.color[2],1.0);
     gl.uniform4fv(fColor, flatten(col));
     gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
     gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );    
     gl.drawArrays(gl.LINE_STRIP, 0, points.length);
  }
  
  requestAnimFrame(render);
}
