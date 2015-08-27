"use strict";

var gl;
//var points=[];
var fColor;

var modelViewMatrixLoc;
const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
var bufferId;
var renderingList=[];
var spherePoints=[];
var cylinderPoints=[];
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var lookRad=0.5;
var lookTheta=0;
var lookPhi=0;
var eye = vec3( lookRad*Math.sin(lookTheta)*Math.cos(lookPhi),
                    lookRad*Math.sin(lookTheta)*Math.sin(lookPhi),
                    lookRad*Math.cos(lookTheta));
function initEventHandlers(){
    document.getElementById("sphere_button").onclick=function(event){
        var r=document.getElementById("sphere_radius").value;
        var x0=document.getElementById("sphere_x0").value;
        var y0=document.getElementById("sphere_y0").value;
        var z0=document.getElementById("sphere_z0").value;
        renderingList.push(new createSphere(r,[x0,y0,z0]));
    }
     document.getElementById("cylinder_button").onclick=function(event){
        var r=document.getElementById("cylinder_radius").value;
        var x0=document.getElementById("cylinder_x0").value;
        var y0=document.getElementById("cylinder_y0").value;
        var z0=document.getElementById("cylinder_z0").value;
        var height=document.getElementById("cylinder_height").value;
        renderingList.push(new createCylinder(r,[x0,y0,z0],height));
    }
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
 
    
     gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);
    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    fColor = gl.getUniformLocation(program,"fColor");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    initEventHandlers();
 
    spherePoints=unitSphere();
    cylinderPoints=unitCylinder();
    var points=spherePoints.concat(cylinderPoints);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    render();
};

//return cartesian from spherical
function sphericalToCartesian(r,phi,theta){
    var x=r*Math.sin(theta)*Math.cos(phi);
    var y=r*Math.sin(theta)*Math.sin(phi);
    var z=r*Math.cos(theta);
    return [x,y,z];
}

function cylindricalToCartesian(r,phi,z){
    var x=r*Math.cos(phi);
    var y=r*Math.sin(phi);
    return [x,y,z];
}

function unitCylinder(){
    var points=new Array();
    var phi0=0;
    var r0=1;
    var z0=1;
    var numZ=10;
    var numPhi=10;
    var deltaPhi=2*Math.PI/numPhi;
    var deltaZ=1/numZ;
    var points=new Array();
    for(var i=0;i<numZ;i++){
       var z1=z0-deltaZ;
       for(var j=0;j<numPhi;j++){
           var phi1=phi0+deltaPhi;
           var p0=cylindricalToCartesian(r0,phi0,z0);
           points.push(vec4(p0[0],p0[1],p0[2],1));       
               
           var p1=cylindricalToCartesian(r0,phi0,z1);
           points.push(vec4(p1[0],p1[1],p1[2],1));     
                     
           var p2=cylindricalToCartesian(r0,phi1,z0);
           points.push(vec4(p2[0],p2[1],p2[2],1));     
                  
           var p3=cylindricalToCartesian(r0,phi1,z1);
           points.push(vec4(p3[0],p3[1],p3[2],1)); 
           
           phi0=phi1;
       }
       z0=z1;
    }
    return points;
}

//create a unit sphere and return array of points
function unitSphere(){
    console.log("create unit sphere");
    var r0=1;
    var points=new Array();
    var theta0=0;
    var phi0=Math.PI/2;
    var M=25;
    var N=2*M;
    var delta=Math.PI/M;
    for (var j = 0; j < M; j++) {
        var theta1 = theta0 + delta;
        for (var i = 0; i < N; i++) {
            var phi1 = phi0 - delta;
            
            var p0 = sphericalToCartesian(r0, phi0, theta0);
            var p1 = sphericalToCartesian(r0, phi0, theta1);
            var p2 = sphericalToCartesian(r0, phi1, theta0);
            var p3 = sphericalToCartesian(r0, phi1, theta1);

            points.push(vec4(p0[0], p0[1], p0[2],1));
            points.push(vec4(p1[0], p1[1], p1[2],1));
            points.push(vec4(p2[0], p2[1], p2[2],1));
            points.push(vec4(p3[0], p3[1], p3[2],1));
            phi0 = phi1;
        }
        theta0=theta1;
    }
  return points;
}

function createCylinder(r0,x,z){
    this.r0=r0;
    this.x=x;
    this.z=z;
    console.log("createCylinder");
    if(cylinderPoints.length===0){
        cylinderPoints=unitCylinder();
    }
    this.render = function () {
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        var modelViewMatrix = mult(translate(x),scalem(r0,r0,z));
        var mLook=lookAt( eye, at, up )
        modelViewMatrix=mult(mLook,modelViewMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(fColor, flatten(red));
        var length=spherePoints.length+cylinderPoints.length;
        gl.drawArrays(gl.TRIANGLE_STRIP, spherePoints.length, cylinderPoints.length);
        gl.uniform4fv(fColor, flatten(black));
        
        for (var i = spherePoints.length; i < length; i += 4) {
            gl.drawArrays(gl.LINE_LOOP, i, 3);
            gl.drawArrays(gl.LINES, i, 2);
        }
        //push back identity matrix.
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mat4()));
    }
}

function createSphere(r0,x){
     this.r0=r0;
     this.x=x;
    console.log("create sphere r0: ",r0)
    if(spherePoints.length===0){
        spherePoints=unitSphere();
    }

    this.render = function () {
        var modelViewMatrix = mult(translate(x),scalem(r0,r0,r0));
        var mLook=lookAt( eye, at, up )
        modelViewMatrix=mult(mLook,modelViewMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, spherePoints.length);
        gl.uniform4fv(fColor, flatten(black));
        for (var i = 0; i < spherePoints.length; i += 4) {
            gl.drawArrays(gl.LINE_LOOP, i, 3);
            gl.drawArrays(gl.LINES, i, 2);
        }
        //push back identity matrix.
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mat4()));
    }
}

function updateTheta(value){
    lookTheta=value;
    eye = vec3( lookRad*Math.sin(lookTheta)*Math.cos(lookPhi),
                    lookRad*Math.sin(lookTheta)*Math.sin(lookPhi),
                    lookRad*Math.cos(lookTheta));
}

function updatePhi(value){
    lookPhi=value;
    eye = vec3( lookRad*Math.sin(lookTheta)*Math.cos(lookPhi),
                    lookRad*Math.sin(lookTheta)*Math.sin(lookPhi),
                    lookRad*Math.cos(lookTheta));
}

function updateRad(value){
    lookRad=value;
    eye = vec3( lookRad*Math.sin(lookTheta)*Math.cos(lookPhi),
                    lookRad*Math.sin(lookTheta)*Math.sin(lookPhi),
                    lookRad*Math.cos(lookTheta));
}

function render() {
   
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
   for(var i=0;i<renderingList.length;i++){
        renderingList[i].render();
   }
     requestAnimFrame(render);
   
}
