import { Texture } from './Texture.mjs';
import { loadImageTexture } from '../loaders/TextureLoader.mjs';

// Loads and manages a single 2D texture from an image URI
export class ImageTexture extends Texture {

	constructor(uri) {
		super();
		this.uri = uri;
		this.texture = null;
	}

	// Loads the image texture asynchronously
	async initialize(gl, textureUnit = 0) {
		this.texture = await loadImageTexture(gl, textureUnit, this.uri);
	}

	// Binds the texture to the specified texture unit
	bind(gl, textureUnit = 0) {
		gl.activeTexture(gl.TEXTURE0 + textureUnit);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	}
	
}
