import { Texture } from './Texture.mjs';
import { loadCubeMapTexture } from '../loaders/TextureLoader.mjs';

// Loads and manages a cube map texture from six image URIs
export class CubeMapTexture extends Texture {

	constructor(uris) {
		super();
		this.uris = uris;
		this.texture = null;
	}

	// Loads the cube map texture asynchronously
	async initialize(gl) {
		this.texture = await loadCubeMapTexture(gl, this.uris);
	}

	// Binds the cube map texture to the specified texture unit
	bind(gl, textureUnit = 0) {
		gl.activeTexture(gl.TEXTURE0 + textureUnit);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
	}

	getTexture() {
		return this.texture;
	}
}
