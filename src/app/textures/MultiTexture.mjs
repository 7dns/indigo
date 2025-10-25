import { Texture } from './Texture.mjs';
import { loadImageTexture } from '../loaders/TextureLoader.mjs';

// Loads and binds multiple 2D textures from an array of image URIs
// Useful for shader that use texture arrays or multitexturing
export class MultiTexture extends Texture {
    static texUnit = 0;
    constructor(uri) {
        super();
        this.uri = uri;
        this.textures = [];
    }

    // Loads all textures asynchronously and stores them
    async initialize(gl, textureUnit = 0 ) {
        for (let i = 0 ; i < this.uri.length; i++) {
            this.textures[i] = await loadImageTexture(gl, textureUnit, this.uri[i]);
            textureUnit++;
            
        }
    }

    // Binds all loaded textures to consecutive texture units
    bind(gl, textureUnit = 0) {
        for (let i = 0 ; i < this.uri.length; i++) {
		    gl.activeTexture(gl.TEXTURE0 + textureUnit);
		    gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            
            textureUnit++;
        }
	}
}