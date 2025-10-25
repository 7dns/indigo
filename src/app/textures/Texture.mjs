// (abstract) base class for Textures in WebGL
// Subclasses must implement the bind()-method
export class Texture {

	constructor(gl) {
		this.gl = gl;
		this.texture = null;
	}

	bind(shader) {
		throw new Error('bind() must be implemented in subclass');
	}
    
}
