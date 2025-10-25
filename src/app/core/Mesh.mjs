import { loadObj } from '../loaders/ObjLoader.mjs';
import { ShaderProgram } from './Shader.mjs';

// Handles a model's Mesh
// A Mesh is created with the WebGL context and a URI to an OBJ file
// Call initialize() after construction to load the mesh data

export class Mesh {

	#gl;
	#objUri;
	#vertexData;
	#vertexCount;
	#vertexBuffer;

	constructor(gl, uri) {
		console.assert(gl instanceof WebGLRenderingContext, 'Mesh constructor(): gl must be a WebGLRenderingContext');
		console.assert(typeof uri === 'string', 'Mesh constructor(): uri must be a string');

		this.#gl = gl;
		this.#objUri = uri;
		this.#vertexData = null;
		this.#vertexCount = 0;
		this.#vertexBuffer = null;
	}

	get vertexCount() { return this.#vertexCount; }

	// Initializes the mesh by loading the object and creating and binding the verteybuffer
	async initialize() {
		this.#vertexData = await loadObj(this.#objUri);
		this.#vertexCount = this.#vertexData.length / 8; // 3 position, 2 uv, 3 normal

		this.#vertexBuffer = this.#gl.createBuffer();
		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#vertexBuffer);
		this.#gl.bufferData(this.#gl.ARRAY_BUFFER, this.#vertexData, this.#gl.STATIC_DRAW);
	}

	// Handles the AttribLocations of aPosition, aTexture and aNormal and binds the buffer to them
	bind(shaderProgram) {
		console.assert(shaderProgram instanceof ShaderProgram, 'bind(): shaderProgram must be a ShaderProgram');

		const gl = this.#gl;
		const stride = 8 * Float32Array.BYTES_PER_ELEMENT;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer);

		const aPosition = shaderProgram.getAttribLocation('aPosition');
		if (aPosition !== -1) {
			gl.enableVertexAttribArray(aPosition);
			gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);
		}

		const aTexture = shaderProgram.getAttribLocation('aTexture');
		if (aTexture !== -1) {
			gl.enableVertexAttribArray(aTexture);
			gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
		}
        
		const aNormal = shaderProgram.getAttribLocation('aNormal');
		if (aNormal !== -1) {
			gl.enableVertexAttribArray(aNormal);
			gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, stride, 5 * Float32Array.BYTES_PER_ELEMENT);
		}
	}

	// Only handles the aPosition attribute for non-textured objects and binds the buffer to it
	bindNonTextureShader(shaderProgram) {
		console.assert(shaderProgram instanceof ShaderProgram, 'bindNonTextureShader(): shaderProgram must be a ShaderProgram');

		const gl = this.#gl;
		const stride = 8 * Float32Array.BYTES_PER_ELEMENT;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer);

		const aPosition = shaderProgram.getAttribLocation('aPosition');
		if (aPosition !== -1) {
			gl.enableVertexAttribArray(aPosition);
			gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);
		}
	}
}
