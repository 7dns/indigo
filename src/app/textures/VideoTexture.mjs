import { Texture } from './Texture.mjs';

// A texture that streams video frames onto a 2D texture
// Inherits from Texture and supports real-time updates
export class VideoTexture extends Texture {

    constructor(videoElement) {
        super();
        this.video = videoElement;
        this.texture = null;
    }

    // Initializes the video texture and sets texture parameters
    initialize(gl, textureUnit = 0) {
        this.texture = gl.createTexture();
        this.unit = textureUnit;

        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        }
    }

    // Updates the texture with the current video frame
    update(gl) {
        if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
            gl.activeTexture(gl.TEXTURE0 + this.unit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        }
    }

    // Binds the texture to the specified texture unit
    bind(gl, unit = this.unit ?? 0) {
        this.update(gl);
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
}
