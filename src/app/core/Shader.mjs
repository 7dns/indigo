import { loadShaderSource } from '../loaders/ShaderLoader.mjs';

// Manages a Shader Program
// A Shader is created with the WebGL context and the vertex/fragment shader sources
// Call initialize() after construction to compile and link the program

export class ShaderProgram {

	#gl;
	#vertexShaderUri;
	#fragmentShaderUri;
	#shaderProgram;

	constructor(gl, vertexShaderUri, fragmentShaderUri) {
		console.assert(gl instanceof WebGLRenderingContext, 'ShaderProgram constructor(): gl must be a WebGLRenderingContext');
		console.assert(typeof vertexShaderUri === 'string', 'ShaderProgram constructor(): vertexShaderUri must be a string');
		console.assert(typeof fragmentShaderUri === 'string', 'ShaderProgram constructor(): fragmentShaderUri must be a string');

		this.#gl = gl;
		this.#vertexShaderUri = vertexShaderUri;
		this.#fragmentShaderUri = fragmentShaderUri;
		this.#shaderProgram = null;
	}

	get shaderProgram() { return this.#shaderProgram; }

	// Loads, compiles and adds the vertex- and fragmentshader and attaches the program to the webgl-scene.
	async initialize() {
		const vertexShaderText = await loadShaderSource(this.#vertexShaderUri);
		const fragmentShaderText = await loadShaderSource(this.#fragmentShaderUri);

		const vertexShader = this.compileShader(vertexShaderText, this.#gl.VERTEX_SHADER);
		const fragmentShader = this.compileShader(fragmentShaderText, this.#gl.FRAGMENT_SHADER);

		this.#shaderProgram = this.#gl.createProgram();
		this.#gl.attachShader(this.#shaderProgram, vertexShader);
		this.#gl.attachShader(this.#shaderProgram, fragmentShader);
		this.#gl.linkProgram(this.#shaderProgram);

		if (!this.#gl.getProgramParameter(this.#shaderProgram, this.#gl.LINK_STATUS)) {
			console.error('Shader link error:', this.#gl.getProgramInfoLog(this.#shaderProgram));
			return;
		}
	}

	// Call this function to use the program.
	use() {
		this.#gl.useProgram(this.#shaderProgram);
	}

	getAttribLocation(name) {
		console.assert(typeof name === 'string', 'getAttribLocation(): name must be a string');
		return this.#gl.getAttribLocation(this.#shaderProgram, name);
	}

	getUniformLocation(name) {
		console.assert(typeof name === 'string', 'getUniformLocation(): name must be a string');
		return this.#gl.getUniformLocation(this.#shaderProgram, name);
	}

	// Creates the shader from the given source and compiles it.
	compileShader(source, type) {
		console.assert(typeof source === 'string', 'compileShader(): source must be a string');
		console.assert(type === this.#gl.VERTEX_SHADER || type === this.#gl.FRAGMENT_SHADER, 'compileShader(): type must be VERTEX_SHADER or FRAGMENT_SHADER');

		let shader = this.#gl.createShader(type);
		this.#gl.shaderSource(shader, source);
		this.#gl.compileShader(shader);

		if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
			console.error(`Shader compile error:`, this.#gl.getShaderInfoLog(shader));
			return null;
		}
        
		return shader;
	}
}
