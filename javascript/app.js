"use strict";

window.InitDemo = async function() {
	try {
		const vertexShader = await loadTextResource("./Shaders/shader.vs.glsl");
		const fragmentShader = await loadTextResource("./Shaders/shader.fs.glsl");
		const diffuseShader = await loadTextResource("./Shaders/diffuseShader.glsl");
		const rimLightShader = await loadTextResource("./Shaders/rimLightingShader.glsl");
		const modelData = await loadJSONResource("./models/json_models/blancDeChine.json");
		runDemo(vertexShader, fragmentShader, diffuseShader, rimLightShader, modelData);
	}
	catch(e){
		alert(e);
	}
};

window.runDemo = function (vertShadertext, fragShadertext, diffuseShadertext, rimLightShadertext, modelText) {
	const scene = new renderScene(vertShadertext, fragShadertext, diffuseShadertext, rimLightShadertext, modelText);
};

var renderScene = function(vertShadertext, fragShadertext, diffuseShadertext, rimLightShadertext, modelText) {
	const self = this;

	// Intermediate matrices that calculate rotation
	let xRotationMatrix = mat4.create();
	let yRotationMatrix = mat4.create();
	let rotationMatrix = mat4.create();
	 
	// vm matrix to manipulate diffuse lighting in fragment shader
	const vmMatrix = mat4.create();
	// pvm matrix to set the vertices in of object in correct position
	const pvmMatrix = mat4.create();

	// Initialize empty array
	const modelMatrix = mat4.create();
	const viewMatrix = mat4.create();
	const projMatrix = mat4.create();

	const identityMatrix = mat4.create();
	mat4.identity(identityMatrix);

	//create a scale matrix
	let scaleMatrix = mat4.create();
	mat4.scale(scaleMatrix, identityMatrix, [1,1,1]);

	// Translation matrices
	let translationMatrix1 = mat4.create();
	mat4.translate(translationMatrix1, identityMatrix, [0, 0, 0]);
	let translationMatrix2 = mat4.create();
	mat4.translate(translationMatrix2, identityMatrix, [-3, -1, 1]);

	// Public variables that will possibly be used or changed by event handlers.
	self.angleX = 0.0;
	self.angleY = 0.0;

	// Threshold for toon shader
	self.threshold = 0.5;
	// Rim Lighting Threshold for toon shader
	self.rimLight = 0.5;

	// Toggle tracker for which view to render
	self.toggleRender = true;
	self.toggleBackground = true;
	self.renderOption = 0;

	//get vertex and fragment shader from html file
    //I've also written these in a separate file, but since js can't access locally with a webserver, this is the alt solution.
    const vertShaderSource = vertShadertext;
	const fragShaderSource = fragShadertext;

	// Get the canvas and get the webGL context object
	self.canvas = document.getElementById('game-surface');
	var gl = self.canvas.getContext('webgl');

	//-----------------------------------------------------------------------
	self.render = function () {

		// Toggle background between balck and white
		if (self.toggleBackground) {
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
		}
		else {
			gl.clearColor(1.0, 1.0, 1.0, 1.0);
		}
		// Clear the color buffer and depth buffer so program can do hidden surface removal
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
		 // Set the model, view, projection matrices
		 mat4.identity(modelMatrix);
		 mat4.lookAt(viewMatrix, [5, 4, 0], [0, 0, 0], [1, 1, 0]);
		 mat4.perspective(projMatrix, glMatrix.toRadian(45), self.canvas.clientWidth / self.canvas.clientHeight, 0.1, 1000.0);		 
 
		 // The final pre-processing step is to get the location of the variable in your shader program that will access the texture map.
		 mat4.rotate(xRotationMatrix, identityMatrix, self.angleX, [1.0, 0, 0]);
		 mat4.rotate(yRotationMatrix, identityMatrix, self.angleY, [0, 1.0, 0]);
		 mat4.mul(rotationMatrix, yRotationMatrix, xRotationMatrix);

		 mat4.mul(modelMatrix,scaleMatrix, rotationMatrix);
		 mat4.mul(modelMatrix, modelMatrix, translationMatrix1);
		 mat4.multiply(vmMatrix, viewMatrix, modelMatrix);
		 mat4.multiply(pvmMatrix, projMatrix, vmMatrix);
		 
		 // Redner depending on which option is clicked
		 switch (self.renderOption) {
			case 0:
				objectInScene.render(gl, program, model, pvmMatrix, vmMatrix, light, self.threshold, self.rimLight);
				mat4.mul(modelMatrix, modelMatrix, translationMatrix2);
				mat4.multiply(vmMatrix, viewMatrix, modelMatrix);
				mat4.multiply(pvmMatrix, projMatrix, vmMatrix);
				object2.render(gl, program, model, pvmMatrix, vmMatrix, light, self.threshold, self.rimLight);
				break;
			case 1:
				objectInScene.render(gl, program_diffuse, model, pvmMatrix, vmMatrix, light, self.threshold, self.rimLight);
				mat4.mul(modelMatrix, modelMatrix, translationMatrix2);
				mat4.multiply(vmMatrix, viewMatrix, modelMatrix);
				mat4.multiply(pvmMatrix, projMatrix, vmMatrix);
				object2.render(gl, program_diffuse, model, pvmMatrix, vmMatrix, light, self.threshold, self.rimLight);
				break;
			case 2:
				objectInScene.render(gl, program_rimLight, model, pvmMatrix, vmMatrix, light, self.threshold, self.rimLight);
				mat4.mul(modelMatrix, modelMatrix, translationMatrix2);
				mat4.multiply(vmMatrix, viewMatrix, modelMatrix);
				mat4.multiply(pvmMatrix, projMatrix, vmMatrix);
				object2.render(gl, program_rimLight, model, pvmMatrix, vmMatrix, light, self.threshold, self.rimLight);
				break;
		 }
	}

	// Compile the given shader and validate with correct error message
	self.compileShaderAndValidate = function(shader, errMsgValue) {
		gl.compileShader(shader);
		let errMsg ='err';
		switch (errMsgValue) {
			case 0:
				errMsg = 'ERROR compiling vertex shader!';
				break;
			case 1:
				errMsg = 'ERROR compiling bw fragment shader!';
				break;
			case 2:
				errMsg = 'ERROR compiling diffuse fragment shader!';
				break;
			case 4:
				errMsg = 'ERROR compiling rim light fragment shader!'
				break;
		}

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(errMsgValue, gl.getShaderInfoLog(shader));
			return;
		}
	}

	// Link the shader and validate
	self.ValidateLinkedShader = function(program) {
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('ERROR linking program!', gl.getProgramInfoLog(program));
			return;
		}
	
		gl.validateProgram(program);
		if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', gl.getProgramInfoLog(program));
			return;
		}
	}

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = self.canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	// Clear the color buffer and depth buffer so program can do hidden surface removal
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST); // Enable hidden surface removel
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// Determine how many texture units there are
	console.log(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	let diffShader = gl.createShader(gl.FRAGMENT_SHADER);
	let rimShader = gl.createShader(gl.FRAGMENT_SHADER);

	// Set the source of the shaders, in html file
	gl.shaderSource(vertexShader, vertShaderSource);
	gl.shaderSource(fragmentShader, fragShaderSource);
	gl.shaderSource(diffShader, diffuseShadertext);
	gl.shaderSource(rimShader, rimLightShadertext);

	// Compile all the vertex and fragment shaders, and validate the correctness.
	self.compileShaderAndValidate(vertexShader, 0);
	self.compileShaderAndValidate(fragmentShader, 1);
	self.compileShaderAndValidate(diffShader, 2);
	self.compileShaderAndValidate(rimShader, 3);

	// Create diffuse shader program alternative, attach vertex and fragment shader to program
	let program_diffuse = gl.createProgram();
	gl.attachShader(program_diffuse, vertexShader);
	gl.attachShader(program_diffuse, diffShader);
	gl.linkProgram(program_diffuse); // Link the program

	// Validate if linking worked
	self.ValidateLinkedShader(program_diffuse);

	let program_rimLight = gl.createProgram();
	gl.attachShader(program_rimLight, vertexShader);
	gl.attachShader(program_rimLight, rimShader);
	gl.linkProgram(program_rimLight); // Link the program

	// Validate if linking worked
	self.ValidateLinkedShader(program_rimLight);

	// create the current webGL BW Program, attach vertex and fragment shader to program
	let program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program); // Link the program

	// Validate if linking worked
	self.ValidateLinkedShader(program);

	// Create a model with ll buffer objects available.
	const model = createModel(modelText);
	// Create light model
	const light = createLight();

	// Create a render object for the objects in the scene
	const objectInScene = new Render(model);
	const object2 = new Render(model);

	const events = new eventHandler(self);
	events.animate();
}
