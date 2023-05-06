// https://www.youtube.com/watch?v=kB0ZVUrI4Aw&ab_channel=IndigoCode

var vertexShaderText = 
[
    'precision mediump float;',
    '',
    'attribute vec2 vertPosition;',
    'attribute vec3 color;',
    'varying vec3 fragColor;',
    '',
    'void main()',
    '{',
    '   fragColor = color;',
    '   gl_Position = vec4(vertPosition, 0.0, 1.0);',
    '}'
].join('\n');

var fragShaderText = 
[
    'precision mediump float;',
    '',
    'varying vec3 fragColor;',
    'void main() {',
    '   gl_FragColor = vec4(fragColor, 1.0);',
    '}',
].join('\n');

var Init = function() {

    console.log("running...");

    var canvas = document.getElementById('out');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log("WebGL is not supported by this browser! Attempting to use experimental-webgl.");
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        console.log("WebGL and experimental-webgl not supported.");
    }

    // If we want the canvas to be the size of the screen
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    // gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    gl.clearColor(0.5, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Creating shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragShader, fragShaderText);


    // Compiles shaders
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('error compiling vertex shader.', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        console.error('error compiling fragment shader.', gl.getShaderInfoLog(fragShader));
        return;
    }

    // Creates program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);

    // Links program
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('error linking program.', gl.getProgramInfoLog(program));
        return;
    }

    // Validates the program +++ dont include this in release as this is computationally expensive!
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('error validating program.', gl.getProgramInfoLog(program));
        return;
    }
    
    // Create compute buffer
    // vert = [X, Y, R, G, B]
    var vertices = [
        0.0, 0.5, 1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.0, 0.0, 1.0
    ];

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // uses float32Array as all numbers in js are 64bit double precision fps, and gl expects a float
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttributeLocation, // location of attr in function
        2, // number of elements per attr (vec2)
        gl.FLOAT, // type
        gl.FALSE,
        20, // sizeof element (5 floats)
        0 // offset from berginning of a vertex to this attr
    );
    gl .enableVertexAttribArray(positionAttributeLocation);
    
    var colorAttributeLocation = gl.getAttribLocation(program, 'color');
    gl.vertexAttribPointer(
        colorAttributeLocation, // location of attr in function
        3, // number of elements per attr (vec2)
        gl.FLOAT, // type
        gl.FALSE,
        20, // sizeof element (5 floats)
        8 // offset from berginning of a vertex to this attr
    );
    gl.enableVertexAttribArray(colorAttributeLocation);

    // main loop
    gl.useProgram(program);

    // uses bound buffer
    gl.drawArrays(
        gl.TRIANGLES, // drawing mode
        0, // how many elements to skip
        3 // how many elements to draw
    );
};
