"use strict";

var gl;
var points=[];

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    
    
    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    createSphere();
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function cartesian(r,phi,theta){
    var x=r*Math.sin(theta)*Math.cos(phi);
    var y=r*Math.sin(theta)*Math.sin(phi);
    var z=r*Math.cos(theta);
    return [x,y,z];
}

function createSphere(){
    var delta=Math.PI/10;
    var theta0=0;
    
    
    var r0=1;
    var phi0=Math.PI/2;
    
    var N=20;
    var M=10;
    for (var j = 0; j < M; j++) {
        var theta1 = theta0 + delta;
        for (var i = 0; i < N; i++) {
            var phi1 = phi0 - delta;
            var p0 = cartesian(r0, phi0, theta0);
            var p1 = cartesian(r0, phi0, theta1);
            var p2 = cartesian(r0, phi1, theta0);
            var p3 = cartesian(r0, phi1, theta1);

            points.push(vec3(p0[0], p0[2], p0[1]));
            points.push(vec3(p1[0], p1[2], p1[1]));
            points.push(vec3(p2[0], p2[2], p2[1]));
            points.push(vec3(p3[0], p3[2], p3[1]));
            phi0 = phi1;
        }
        theta0=theta1;
    }
  
    
  
   
//  points = [
//         vec3( p0),
//         vec3( p1),
//         vec3(  p2)
//     ];
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );
}
