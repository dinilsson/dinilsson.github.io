"use strict";

var gl;
var points=[];
var fColor;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);

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
    fColor = gl.getUniformLocation(program,"fColor");
    

    render();
};

function cartesian(r,phi,theta){
    var x=r*Math.sin(theta)*Math.cos(phi);
    var y=r*Math.sin(theta)*Math.sin(phi);
    var z=r*Math.cos(theta);
    return [x,y,z];
}

function vPlus(a,b,length){
    var out=[];
    for(var i=0;i<length;i++){
        out.push(a[i]+b[i]);
    }
    return out;
}

function createSphere(){
   
    var theta0=0;
    
    var r0=0.5;
 
    var x0=0;
    var y0=0;
    var z0=0;
    var xp=[x0,y0,z0];
    var phi0=Math.PI/2;
    var M=6;
    var N=2*M;
    var delta=Math.PI/M;
    for (var j = 0; j < M; j++) {
        var theta1 = theta0 + delta;
        for (var i = 0; i < N; i++) {
            var phi1 = phi0 - delta;
            
            var p0 = cartesian(r0, phi0, theta0);
         //   p0=vPlus(p0,xp,3);
            var p1 = cartesian(r0, phi0, theta1);
           // p1=vPlus(p1,xp,3);
            var p2 = cartesian(r0, phi1, theta0);
           // p2=vPlus(p1,xp,3);
            var p3 = cartesian(r0, phi1, theta1);
           // p3=vPlus(p3,xp,3);
            points.push(vec3(p0[0], p0[1], p0[2]));
            points.push(vec3(p1[0], p1[1], p1[2]));
            points.push(vec3(p2[0], p2[1], p2[2]));
            points.push(vec3(p3[0], p3[1], p3[2]));
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
     gl.uniform4fv(fColor, flatten(red));
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );
    gl.uniform4fv(fColor, flatten(black));
  
    for(var i=0;i<points.length;i+=4){
      gl.drawArrays( gl.LINE_LOOP, i, 3 );
      gl.drawArrays(gl.LINES,i,2);
  }
}
