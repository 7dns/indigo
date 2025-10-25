import { VideoTexture } from '../textures/VideoTexture.mjs';
// Loads a 2D image texture into the given texture unit
// Applies mipmaps if the image dimensions are power of two
export function loadImageTexture(gl, textureUnitIndex, uri) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			const texture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
			gl.bindTexture(gl.TEXTURE_2D, texture);

			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

			if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			} else {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}

			resolve(texture);
		};
		image.onerror = reject;
		image.src = uri;
	});
}

// Loads a cube map texture from six image URIs (once per face)
export async function loadCubeMapTexture(gl, uris) {
	console.assert(Array.isArray(uris) && uris.length === 6, 'loadCubeMapTexture(): uris must be an array of 6 images');

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

	const targets = [
		gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
	];

	await Promise.all(targets.map(async (target, i) => {
		const image = await loadImage(uris[i]);
		gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	}));

	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

	return texture;
}

// Creates and returns a video texture that updates each frame
export function loadVideoTexture(gl, textureUnit, uri) {
    const video = document.createElement('video');
    video.src = uri;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    const videoTexture = new VideoTexture(video);

    video.addEventListener('canplay', () => {
        videoTexture.initialize(gl, textureUnit);
    });

    return videoTexture;
}

// Loads an image from URI
function loadImage(uri) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = uri;
    });
}

// Checks if a number is a power of two
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}