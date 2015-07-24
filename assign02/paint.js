"use strict";


//  GL Context Stuff
var canvas;
var gl;
var vBuffer;
var cBuffer;

//  Geometry Stuff
var recording = false;
var maxVertices = 2000;
//var vertices = [ ];
var curvesArray = [[]];

//  Geometry Stuff
var cIndex = 0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var colorsArray = [[]];

function initListener() {

    canvas.addEventListener("mousedown", function(ev) {
        recording = true;
        var index = curvesArray.length - 1;
        curvesArray[index] = [];
        colorsArray[index] = [];
    });

    canvas.addEventListener("mouseup", function(ev) {
        if (recording) {
            drawScreen();
        }
        curvesArray.push([]);
        recording = false;
    });

    canvas.addEventListener("mousemove", function(ev) {
        if (recording) {
            var t = vec2(-1 + 2*ev.clientX/canvas.width, 
                         -1 + 2*(canvas.height-ev.clientY)/canvas.height);
            var c = colors[cIndex];
            var index = curvesArray.length - 1;
            curvesArray[index].push(t);
            colorsArray[index].push(c);
            drawScreen();
        }
    });

    var m = document.getElementById("mymenu");

    m.addEventListener("click", function() {
       cIndex = m.selectedIndex;
     });

}


function initWebGL()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );



    // Load the data into the GPU
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten([]), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten([]), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);



    gl.drawArrays( gl.LINE_STRIP, 0, 0 );

    // Initialize our Event listener
    initListener(); 

    render();
};

window.onload = initWebGL;

function drawCurve(index) {
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray[index]), gl.STATIC_DRAW );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(curvesArray[index]), gl.STATIC_DRAW );

    gl.drawArrays( gl.LINE_STRIP, 0, curvesArray[index].length );
};

function drawScreen() {
//    gl.clear( gl.COLOR_BUFFER_BIT );
    for (var i=0;i<curvesArray.length;i++) {
        drawCurve(i);
    }
}

function render() {
    window.requestAnimFrame(render);
}
