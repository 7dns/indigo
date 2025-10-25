// Handles rendering of bloom effects in a WebGL scene.
// Manages framebuffers for sun extraction, bloom passes, and combines the bloom with the main scene.

export class BloomRenderer {

	constructor(gl, width, height, shaders) {
		this.gl = gl;
		this.width = width;
		this.height = height;
		this.shaders = shaders;

		// Framebuffers & Textures
		this.sceneFBO = this.createFBO();
		this.bloomFBO1 = this.createFBO();
		this.bloomFBO2 = this.createFBO();

		// Fullscreen quad
		this.quadVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1, -1, 1, -1, -1, 1,
			-1, 1, 1, -1, 1, 1
		]), gl.STATIC_DRAW);
	}

	// Creates a framebuffer with a texture attachment
	createFBO() {
		const gl = this.gl;
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		const fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		return { fbo, tex };
	}

	// Render a fullscreen quad using the provided shader
	renderQuad(shader) {
		const gl = this.gl;
		shader.use();
		const posLoc = shader.getAttribLocation('aPosition');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		gl.disableVertexAttribArray(posLoc);
	}

	// Render the sun to the scene framebuffer
	renderSunToFBO(drawSunFunc) {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO.fbo);
		gl.viewport(0, 0, this.width, this.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		drawSunFunc();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	// Extract bright areas
	extractBright() {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFBO1.fbo);
		gl.viewport(0, 0, this.width, this.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		this.shaders.extract.use();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.tex);
		gl.uniform1i(this.shaders.extract.getUniformLocation('uScene'), 0);
		gl.uniform1f(this.shaders.extract.getUniformLocation('uThreshold'), 0.5);
		this.renderQuad(this.shaders.extract);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	// Horizontal and vertical blur
	blurPass(inputFBO, outputFBO, direction) {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, outputFBO.fbo);
		gl.viewport(0, 0, this.width, this.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		this.shaders.blur.use();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputFBO.tex);
		gl.uniform1i(this.shaders.blur.getUniformLocation('uTexture'), 0);
		gl.uniform2fv(this.shaders.blur.getUniformLocation('uDirection'), direction);
		this.renderQuad(this.shaders.blur);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	// Combine bloom with scene
	combineWithScene(drawSceneFunc) {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, this.width, this.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Draw scene normally
		drawSceneFunc();

		// Additive bloom effect
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		this.shaders.combine.use();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.tex);
		gl.uniform1i(this.shaders.combine.getUniformLocation('uScene'), 0);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.bloomFBO1.tex);
		gl.uniform1i(this.shaders.combine.getUniformLocation('uBloom'), 1);
		this.renderQuad(this.shaders.combine);
		gl.disable(gl.BLEND);
	}
}
