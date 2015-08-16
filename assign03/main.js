/* globals: vec4 */
var gl;
var program;

var BUF_SIZE = 64*1000;

var vBuffer;
var cBuffer;
var points = [];
var colors = [];

//
// Color stuff
//
var cWhite   = vec4(1.0,1.0,1.0,1.0);
var cBlack   = vec4(0.0,0.0,0.0,1.0); 
var cRed     = vec4(1.0,0.0,0.0,1.0);
var cGreen   = vec4(0.0,1.0,0.0,1.0);
var cBlue    = vec4(0.0,0.0,1.0,1.0);
var cYellow  = vec4(1.0,1.0,0.0,1.0);
var cMagenta = vec4(1.0,0.0,1.0,1.0);

//
// Transformation
//
var theta = [ 0, 0, 0 ];
var thetaLoc;

var axis  = 1;

var xaxis = 0;
var yaxis = 1;
var zaxis = 2;

var animate = false;

//
// Utilities
//
//function reference = { name: "", start:0, length:0};
var references = [];

var cos = Math.cos;
var sin = Math.sin;
var pi  = Math.PI;

function hPoint (x, y, z) {
    return vec4 (x, y, z, 1.0);
}

function addReference(name, offset, len) {
    var ref = {};
    var num = references.length;
    ref.name   = name + num;
    ref.start  = offset;
    ref.length = len;
    references.push(ref);
}

function findName(name) {
    var names = [];
    references.forEach(function (ref) {
        names.push(ref.name);
    });
    return references[names.indexOf(name)];
}


function initEvents() { 
    document.getElementById("Xaxis").onclick = function () {
        if (!animate) {
            animate = true;
            axis = xaxis;
            render();
        } else {
            axis = xaxis;
        }
    };
    document.getElementById("Yaxis").onclick = function () {
        if (!animate) {
            animate = true;
            axis = yaxis;
            render();
        } else {
            axis = yaxis;
        }
    };
    document.getElementById("Zaxis").onclick = function () {
        if (!animate) {
            animate = true;
            axis = zaxis;
            render();
        } else {
            axis = zaxis;
        }
    };

    document.getElementById("Clear").onclick = function () {
        animate = false;
        theta   = [0,0,0];
        axis    = 1;
        cl();
        render();
    };

    document.getElementById("Animate").onclick = function () {
        animate = !animate;
        render();
    };

    document.getElementById("Cone").onclick = function () {
        cl();
        buildCone(32, 0.5,0.8);
        render();
    };

    document.getElementById("Sphere").onclick = function () {
        cl();
        buildSphere(32, 0.5);
        render();
    };

    document.getElementById("Cylinder").onclick = function () {
        cl();
        buildCylinder(32, 0.3, 1.2);
        render();
    };

}

function initColorsBuffer( program ) {
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, BUF_SIZE, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
}

function initVertexBuffer( program ) {
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, BUF_SIZE, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

function initUniformLocal( program ) {
    thetaLoc = gl.getUniformLocation(program, "theta");
}

function init() {
    var canvas = document.getElementById( "gl-canvas" );

    initEvents();

    //  Configure WebGL
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    initUniformLocal( program );

    initVertexBuffer( program );
    initColorsBuffer( program );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLES, 0, this.points.length );
}


window.onload = init;

function cl() {
    colors = [];
    points = [];
}

function bindData(offset) {
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, flatten(this.colors));

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, flatten(this.points));
}

function render() {
    bindData(0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLES, 0, this.points.length );

    if (animate) {
        theta[axis] += 2.0;
        requestAnimFrame( render );
    }
}

function buildCone(n, r, h) {
    var cone = [];

    function initCone(n, r, h) {
        cone.push( vec4(0.0, h, 0.0, 1.0) );
        for (var i=0; i<n; i++) {
            cone.push( vec4( r*cos(2*i*pi/n), 0.0, r*sin(2*i*pi/n), 1.0 ) );
        }
    }

    var offset = this.points.length;
    initCone(n, r, h);
    for (var i=1; i<n; i++) {
        this.points.push( cone[i] );
        this.colors.push( cBlue );
        this.points.push( cone[i+1] );
        this.colors.push( cBlue );
        this.points.push( cone[0] );
        this.colors.push( cRed );
    }
    this.points.push( cone[n] );
    this.colors.push( cBlue );
    this.points.push( cone[1] );
    this.colors.push( cBlue );
    this.points.push( cone[0] );
    this.colors.push( cRed );
    addReference("Cone", offset, 3*n);
}

function buildSphere(n, r) {
    var phi = 0.0;
    var ohm = 0.0;

    var dataP = [];
    var dataC = [];

    for (var j=8; j<25; j++) {
        phi = 2*j*pi/n;
        for (var i=0; i<n; i++) {
            ohm = 2*i*pi/n;
            dataP[i+(j-8)*n] = vec4( r*cos(phi)*cos(ohm), r*sin(phi), r*cos(phi)*sin(ohm), 1.0 );
            dataC[i+(j-8)*n] = cRed;
        }
    }

    for (var line=0; line<16; line++) {
        for (var pts=0; pts<31; pts++) {
            this.points.push(dataP[(line+1)*32+pts]);
            this.colors.push( cGreen );
            this.points.push(dataP[line*32+pts]);
            this.colors.push( cRed );
            this.points.push(dataP[(line+1)*32+pts+1]);
            this.colors.push( cBlue );
            this.points.push(dataP[line*32+pts]);
            this.colors.push( cRed );
            this.points.push(dataP[(line+1)*32+pts+1]);
            this.colors.push( cBlue );
            this.points.push(dataP[line*32+pts+1]);
            this.colors.push( cGreen );
        }
            this.points.push(dataP[(line+1)*32+31]);
            this.colors.push( cGreen );
            this.points.push(dataP[line*32+31]);
            this.colors.push( cRed );
            this.points.push(dataP[(line+1)*32]);
            this.colors.push( cBlue );
            this.points.push(dataP[line*32+31]);
            this.colors.push( cRed );
            this.points.push(dataP[(line+1)*32]);
            this.colors.push( cBlue );
            this.points.push(dataP[line*32]);
            this.colors.push( cGreen );
    }
}
   
function buildCylinder(n, r, h) {
    var cyl = [];

    function initCylinder(n, r, h) {
        // Top circle
        for (var i=0; i<n; i++) {
            cyl.push( vec4( r*cos(2*i*pi/n), h/2, r*sin(2*i*pi/n), 1.0 ) );
        }
        // floor circle
        for (var j=0; j<n; j++) {
            cyl.push( vec4( r*cos(2*j*pi/n), -h/2, r*sin(2*j*pi/n), 1.0 ) );
        }
    }

    var offset = this.points.length;
    initCylinder(n, r, h);

    // meshing 
    for (var i=1; i<n; i++) {
        this.points.push( cyl[i-1] );
        this.colors.push( cBlue );
        this.points.push( cyl[n+i] );
        this.colors.push( cRed );
        this.points.push( cyl[i] );
        this.colors.push( cBlue );
    }
    this.points.push( cyl[n-1] );
    this.colors.push( cBlue );
    this.points.push( cyl[0] );
    this.colors.push( cBlue );
    this.points.push( cyl[n] );
    this.colors.push( cRed );

    for (var j=1; j<n; j++) {
        this.points.push( cyl[n+j-1] );
        this.colors.push( cRed );
        this.points.push( cyl[j-1] );
        this.colors.push( cBlue );
        this.points.push( cyl[n+j] );
        this.colors.push( cRed );
    }
    this.points.push( cyl[2*n-1] );
    this.colors.push( cRed );
    this.points.push( cyl[n-1] );
    this.colors.push( cBlue );
    this.points.push( cyl[n] );
    this.colors.push( cRed );
}
