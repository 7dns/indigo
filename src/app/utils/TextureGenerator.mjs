import { Color } from '../core/Color.mjs';

// Provides utility functions to generate textures

// Generates a noise texture with the specified size
export function generateNoiseTexture(gl, size = 256) {
	console.assert(gl instanceof WebGLRenderingContext, 'generateNoiseTexture(): gl must be a WebGLRenderingContext');
	console.assert(Number.isInteger(size) && size > 0, 'generateNoiseTexture(): size must be a positive integer');

	const data = new Uint8Array(size * size * 4); // RGBA format
	for (let i = 0; i < data.length; i += 4) {
		const gray = Math.floor(Math.random() * 255); // Random grayscale value
		data[i]		= gray;
		data[i + 1] = gray;
		data[i + 2] = gray;
		data[i + 3] = 255;
	}

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

	return texture;
}

// Generates a color texture with the specified color and size
export function generateColorTexture(gl, color = new Color(1, 1, 1, 1), size = 1) {
    console.assert(gl instanceof WebGLRenderingContext, 'generateColorTexture(): gl must be a WebGLRenderingContext');
    console.assert(color instanceof Color, 'generateColorTexture(): color must be a Color');
    console.assert(Number.isInteger(size) && size > 0, 'generateColorTexture(): size must be a positive integer');

    const data = new Uint8Array(size * size * 4); // RGBA format
    // Convert color components from [0, 1] to [0, 255]
    const r = Math.round(color[0] * 255);
    const g = Math.round(color[1] * 255);
    const b = Math.round(color[2] * 255);
    const a = Math.round(color[3] * 255);

    for (let i = 0; i < data.length; i += 4) {
        data[i]     = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = a;
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
}