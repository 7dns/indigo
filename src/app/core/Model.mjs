import { Mesh } from './Mesh.mjs';
import { Texture } from '../textures/Texture.mjs';
import { ShaderProgram } from './Shader.mjs';
import { Matrix4 } from '../math/Matrix4.mjs';

// Represents a Model
// A Model is created with a mesh, a shader, and optionally a texture
// Its model matrix is initialized during construction

export class Model {

	#mesh;
	#shader;
	#texture;
	#modelMatrix;
	#extraUniforms = {};

	constructor(mesh, shader, texture = null) {
		console.assert(mesh instanceof Mesh, 'Model constructor(): mesh must be a Mesh');
		console.assert(shader instanceof ShaderProgram, 'Model constructor(): shader must be a ShaderProgram');

		this.#mesh = mesh;
		this.#shader = shader;
		this.#texture = texture;
		this.#modelMatrix = new Matrix4();
		this.#extraUniforms = {};
	}

	get mesh() { return this.#mesh; }
    get shader() { return this.#shader; }
    get texture() { return this.#texture; }
    get modelMatrix() { return this.#modelMatrix; }
    get extraUniforms() { return this.#extraUniforms; }

	set texture(newTexture) {
		console.assert(newTexture instanceof Texture || newTexture === null, 'set texture(): newTexture must be a Texture or null');
		this.#texture = newTexture;
	}

	// Sets extra uniforms that are needed for different shaders
	setExtraUniform(name, value) {
		console.assert(typeof name === 'string', 'setExtraUniform(): name must be a string');

		this.#extraUniforms[name] = value;
	}
	
}
