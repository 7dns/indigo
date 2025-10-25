import { Texture } from './Texture.mjs';
import { Color } from '../core/Color.mjs';
import { generateColorTexture } from '../utils/TextureGenerator.mjs';

// Creates a 2D texture filled with a solid color
// Generates a texture of given size using a Color instance
export class ColorTexture extends Texture {

	constructor(gl, color, size = 1) {
		console.assert(gl instanceof WebGLRenderingContext, 'ColorTexture constructor(): gl must be a WebGLRenderingContext');
		console.assert(color instanceof Color, 'ColorTexture constructor(): color must be a Color');
		console.assert(Number.isInteger(size) && size > 0, 'ColorTexture constructor(): size must be a positive integer');

		super();
		this.texture = generateColorTexture(gl, color, size);
	}

	// Binds the color texture to the specified texture unit
	bind(gl, textureUnit = 0) {
		console.assert(gl instanceof WebGLRenderingContext, 'bind(): gl must be a WebGLRenderingContext');
		console.assert(Number.isInteger(textureUnit) && textureUnit >= 0, 'bind(): textureUnit must be a non-negative integer');

		gl.activeTexture(gl.TEXTURE0 + textureUnit);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	}
}