"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;

var theta = 0; 
var thetaLoc; 
var polygon = 0; 
var polygonArray = ["triangle", "square", "penta"]; 

var bufferId;

// Color stuff
var cBuffer;
var colors = [];
var cBack  = vec4(1.0,1.0,1.0,1.0);
var cFront = vec4(1.0,0.0,0.0,1.0); 

function changeColor(current) {
    if (current === cBack) {
        return cFront;
    }
    return cBack;
}

var motifs = false;

function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(5, 9), gl.STATIC_DRAW );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten([]), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
   
    // Load the data into the GPU
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(5, 9), gl.STATIC_DRAW );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten([]), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


    thetaLoc = gl.getUniformLocation(program, "theta");

    document.getElementById("slider1").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
        render();
    };

    document.getElementById("slider2").onchange = function(event) {
        var coeff = parseInt(event.target.value);
        theta = 2*Math.PI * (coeff / 6.0);
        render();
    };

    var w = document.getElementById("polygon");
    w.addEventListener("click", function() {
        polygon = w.selectedIndex;
        console.log(polygon);
        render();
    });

    var mo = document.getElementById("motifs");
    mo.addEventListener("click", function() {
        if (mo.selectedIndex === 1) {
            motifs = true;
        } else {
            motifs = false;
        }
        render();
    });

    render();
};


function triangle( a, b, c, co) {
    points.push( a, b, c );
    colors.push( co, co, co);
}

function divideTriangle( a, b, c, co, count ) {

    // check for end of recursion
    if ( count == 0 ) {
        triangle( a, b, c, co);
    }
    else {

        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles
        divideTriangle( a, ab, ac, co, count );
        divideTriangle( c, ac, bc, co, count );
        divideTriangle( b, bc, ab, co, count );
        if (motifs) {
            divideTriangle( ab, bc, ac, changeColor(co), count );
        }
    }
}


function divideSquare( a, b, c, d, co, count ) {
    // check for end of recursion
    if ( count == 0 ) {
        triangle( a, b, c, co );
        triangle( c, d, a, co );
    }
    else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;

        // three new triangles
        divideTriangle( a, ab, ad, co, count );
        divideTriangle( b, ab, bc, co, count );
        divideTriangle( c, bc, cd, co, count );
        divideTriangle( d, cd, ad, co, count );
        if (motifs) {
            divideSquare( ab, bc, cd, ad, changeColor(co), count );
        }
    }
}

function dividePenta( a, b, c, d, e, co, count ) {
    // check for end of recursion
    if ( count == 0 ) {
        triangle( a, b, c, co );
        triangle( a, c, d, co );
        triangle( a, d, e, co );
    }
    else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ae = mix( a, e, 0.5 );
        var bc = mix( b, c, 0.5 );
        var cd = mix( c, d, 0.5 );
        var de = mix( d, e, 0.5 );

        --count;

        // three new triangles
        divideTriangle( a, ab, ae, co, count );
        divideTriangle( b, ab, bc, co, count );
        divideTriangle( c, bc, cd, co, count );
        divideTriangle( d, cd, de, co, count );
        divideTriangle( e, de, ae, co, count );
        if (motifs) {
            dividePenta( ab, bc, cd, de, ae, changeColor(co), count );
        }
    }
}

window.onload = init;

function render() {
    points = [];
    colors = [];

    switch(polygonArray[polygon]) {
        case "triangle":
            var vertices = [
                vec2(  0.0000,  0.9428 ),
                vec2( -0.8165, -0.4714 ),
                vec2(  0.8165, -0.4714 )
            ];
            divideTriangle( vertices[0], vertices[1], vertices[2], cFront,
                            numTimesToSubdivide);
            break;

        case "square":
            var vertices = [
                vec2( -0.7,  0.7 ),
                vec2( -0.7, -0.7 ),
                vec2(  0.7, -0.7 ),
                vec2(  0.7,  0.7 )
            ];
            divideSquare( vertices[0], vertices[1], vertices[2], vertices[3], cFront,
                            numTimesToSubdivide);
            break;

        case "penta":
            var vertices = [];
            var rad = 0.8;
            var da   = 6.2832 / 5.0;   // da is central angle between vertices in radians
            for (var v = 0; v < 5; v++)  {                  
                vertices.push(vec2( rad*Math.cos (v*da), rad*Math.sin (v*da) ));
            }   
            dividePenta( vertices[0], vertices[1], vertices[2], vertices[3],
                         vertices[4],  cFront, numTimesToSubdivide);
            break;

        default:
            alert("nothing work");
            break;
    }

    gl.uniform1f(thetaLoc, theta);

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
    colors = [];
}
