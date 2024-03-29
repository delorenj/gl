$(document).ready(function () {
    // Initialize
        var c = document.getElementById("cube");
        var w = Math.floor(window.innerWidth * 0.9);
        var h = Math.floor(window.innerHeight * 0.9);

        //c = WebGLDebugUtils.makeLostContextSimulatingCanvas(c);
        // tell the simulator when to lose context.
        //c.loseContextInNCalls(15);

        c.addEventListener('webglcontextlost', handleContextLost, false);
        c.addEventListener('webglcontextrestored', handleContextRestored, false);

        c.width = w;
        c.height = h;

        var gl = init();
        if (!gl) {
          return;
        }
        currentAngle = 0;
        currentDistance = -100;
        incDist = 0.4;
        incAngle = 1.5;
        framerate = new Framerate("framerate");
        var f = function() {
            drawPicture(gl);
            requestId = window.requestAnimFrame(f, c);
        };
        f();

        function handleContextLost(e) {
            e.preventDefault();
            if (requestId !== undefined) {
                window.cancelAnimFrame(requestId);
                requestId = undefined;
            }
        }

        function handleContextRestored() {
            init();
            f();
        }
});


var g = {}; // globals

function init()
{
    // Initialize
    var gl = initWebGL(
        // The id of the Canvas Element
        "cube");
    if (!gl) {
      return;
    }
    g.program = simpleSetup(
        gl,
        // The ids of the vertex and fragment shaders
        "vshader", "fshader",
        // The vertex attribute names used by the shaders.
        // The order they appear here corresponds to their index
        // used later.
        [ "vNormal", "vColor", "vPosition"],
        // The clear color and depth values
        [ 0, 0, 0, 1 ], 10000);

    // Set up a uniform variable for the shaders
    gl.uniform3f(gl.getUniformLocation(g.program, "lightDir"), 0, 0, 1);
    gl.uniform1i(gl.getUniformLocation(g.program, "sampler2d"), 0);
    // Create a box. On return 'gl' contains a 'box' property with
    // the BufferObjects containing the arrays for vertices,
    // normals, texture coords, and indices.
    g.box = makeBox(gl);

    // Set up the array of colors for the cube's faces
    chewyTexture = loadImageTexture(gl, "./img/tex.jpg");

    // Create some matrices to use later and save their locations in the shaders
    g.mvMatrix = new J3DIMatrix4();
    g.u_normalMatrixLoc = gl.getUniformLocation(g.program, "u_normalMatrix");
    g.normalMatrix = new J3DIMatrix4();
    g.u_modelViewProjMatrixLoc =
            gl.getUniformLocation(g.program, "u_modelViewProjMatrix");
    g.mvpMatrix = new J3DIMatrix4();

    // Enable all of the vertex attribute arrays.
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    // Set up all the vertex attributes for vertices, normals and texCoords
    gl.bindBuffer(gl.ARRAY_BUFFER, g.box.vertexObject);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, g.box.normalObject);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, g.box.texCoordObject);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    // Bind the index array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.box.indexObject);

    return gl;
}

width = -1;
height = -1;
var requestId;

function reshape(gl)
{
    var canvas = document.getElementById('cube');
    var windowWidth = window.innerWidth - 20;
    var windowHeight = window.innerHeight - 40;
    if (windowWidth == width && windowHeight == height)
        return;

    width = windowWidth;
    height = windowHeight;
    canvas.width = width;
    canvas.height = height;

    // Set the viewport and projection matrix for the scene
    gl.viewport(0, 0, width, height);
    g.perspectiveMatrix = new J3DIMatrix4();
    g.perspectiveMatrix.perspective(30, width/height, 1, 10000);
    g.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
}

function drawPicture(gl)
{
    // Make sure the canvas is sized correctly.
    reshape(gl);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Make a model/view matrix.
    g.mvMatrix.makeIdentity();
    g.mvMatrix.translate(0,0,currentDistance);
    g.mvMatrix.rotate(currentAngle, 0.5,1.2,0.8);

    // Construct the normal matrix from the model-view matrix and pass it in
    g.normalMatrix.load(g.mvMatrix);
    g.normalMatrix.invert();
    g.normalMatrix.transpose();
    g.normalMatrix.setUniform(gl, g.u_normalMatrixLoc, false);

    // Construct the model-view * projection matrix and pass it in
    g.mvpMatrix.load(g.perspectiveMatrix);
    g.mvpMatrix.multiply(g.mvMatrix);
    g.mvpMatrix.setUniform(gl, g.u_modelViewProjMatrixLoc, false);

   // Bind the texture to use
    gl.bindTexture(gl.TEXTURE_2D, chewyTexture);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, g.box.numIndices, gl.UNSIGNED_BYTE, 0);

    // Show the framerate
    framerate.snapshot();

    currentAngle += incAngle;
    if (currentAngle > 360)
        currentAngle -= 360;

    currentDistance += incDist;
    if( currentDistance > 20)   
        incDist *=-1;

}
