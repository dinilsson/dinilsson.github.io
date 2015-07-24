"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;
var fColor;
const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
var bufferId;

var theta=1;
var thetaPos;
 
 // First, initialize the corners of our gasket with three points.
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];
    
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    thetaPos=gl.getUniformLocation(program,"theta");
    fColor = gl.getUniformLocation(program,"fColor");
    gl.uniform1f(thetaPos,theta);
     
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 || count == "0" ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        //XXX
        divideTriangle(ab,ac,bc,count);
    }
}
function updateAngle(value){
   theta=document.getElementById("slider").value;
    gl.uniform1f(thetaPos,theta);
    console.log(theta);  
}

function updateTess(value){
    console.log("value: ", value);
    NumTimesToSubdivide=value;
    points=[];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  //  gl.bufferSubData( gl.ARRAY_BUFFER, 0,flatten(points) );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
     gl.uniform4fv(fColor, flatten(red));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    gl.uniform4fv(fColor, flatten(black));
  for(var i=0;i<points.length;i+=3){
      gl.drawArrays( gl.LINE_LOOP, i, 3 );
  }
    
    requestAnimFrame(render);
}
