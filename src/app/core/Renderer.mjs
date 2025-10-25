import { Color } from './Color.mjs';
import { Model } from './Model.mjs';
import { Scene } from './Scene.mjs';
import { ShaderProgram } from './Shader.mjs';
import { Matrix4 } from '../math/Matrix4.mjs';

// Manages the Renderer
// The Renderer should be called once per frame via frame()
// It renders all objects in the given Scene:
// For each Model, it sets uniforms, calculates lighting, and binds textures
// It also updates Animations via the Scene

export class Renderer {

	#gl;

	constructor(gl) {
		console.assert(gl instanceof WebGLRenderingContext, 'Renderer constructor(): gl must be a WebGLRenderingContext');

		this.#gl = gl;
	}

	// Updated the scene and draws all models that were added to the scene.
	frame(scene, deltaTime) {
		console.assert(scene instanceof Scene, 'frame(): scene must be a Scene');
		console.assert(typeof deltaTime === 'number', 'frame(): deltaTime must be a number');

		scene.update(deltaTime);
		this.render(scene);
	}

	// Draws all models that were added to the scene.
	render(scene) {
		console.assert(scene instanceof Scene, 'render(): scene must be a Scene');

		const viewMatrix = scene.camera.getViewMatrix();
		const projectionMatrix = scene.camera.getProjectionMatrix();

		for (const model of scene.models) {
			this.drawModel(model, scene.lights, viewMatrix, projectionMatrix);
		}
	}

	prepareFrame(clearColor) {
		console.assert(clearColor instanceof Color, 'prepareFrame(): clearColor must be a Color');

		const gl = this.#gl;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(...clearColor);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
	}

	drawModel(model, lights, viewMatrix, projectionMatrix) {
		console.assert(model instanceof Model, 'drawModel(): model must be a Model');
		console.assert(viewMatrix instanceof Matrix4, 'drawModel(): viewMatrix must be a Matrix4');
		console.assert(projectionMatrix instanceof Matrix4, 'drawModel(): projectionMatrix must be a Matrix4');

		const gl = this.#gl;
		const shader = model.shader;
		shader.use();

		this.setMatrices(gl, shader, model.modelMatrix, viewMatrix, projectionMatrix);
		this.setLightUniforms(gl, shader, lights, viewMatrix);
		this.bindTexture(gl, shader, model.texture);

		let textureUnit = 1;

		this.applyExtraUniforms(model, shader);

		model.mesh.bind(shader);
		gl.drawArrays(gl.TRIANGLES, 0, model.mesh.vertexCount);
	}

	drawSkyBox(model, viewMatrix, projectionMatrix) {
		console.assert(model instanceof Model, 'drawSkyBox(): model must be a Model');
		console.assert(viewMatrix instanceof Matrix4, 'drawSkyBox(): viewMatrix must be a Matrix4');
		console.assert(projectionMatrix instanceof Matrix4, 'drawSkyBox(): projectionMatrix must be a Matrix4');

		const gl = this.#gl;
		const shader = model.shader;
		shader.use();

		this.setMatrices(gl, shader, model.modelMatrix, viewMatrix, projectionMatrix);
		this.bindTexture(gl, shader, model.texture);

		model.mesh.bind(shader);
		gl.drawArrays(gl.TRIANGLES, 0, model.mesh.vertexCount);
	}
	
	drawTransparent(model, viewMatrix, projectionMatrix) {
		console.assert(model instanceof Model, 'drawTransparent(): model must be a Model');
		console.assert(viewMatrix instanceof Matrix4, 'drawTransparent(): viewMatrix must be a Matrix4');
		console.assert(projectionMatrix instanceof Matrix4, 'drawTransparent(): projectionMatrix must be a Matrix4');

		const gl = this.#gl;
		const shader = model.shader;
		shader.use();

		this.setTransparentMatrices(gl, shader, model.modelMatrix, viewMatrix, projectionMatrix);

		model.mesh.bindNonTextureShader(shader);
		gl.drawArrays(gl.TRIANGLES, 0, model.mesh.vertexCount);
	}

	applyExtraUniforms(model, shader, textureUnit = 1) {
		if (!model.extraUniforms) return;
		for (const name in model.extraUniforms) {
			const value = model.extraUniforms[name];
			const location = shader.getUniformLocation(name);
			if (location === -1 || location == null) continue;

			if (typeof value === 'function') {
				const resolved = value(this.#gl);
				this.setUniform(location, resolved);
			} else if (value instanceof WebGLTexture) {
				this.#gl.activeTexture(this.#gl.TEXTURE0 + textureUnit);
				this.#gl.bindTexture(this.#gl.TEXTURE_2D, value);
				this.#gl.uniform1i(location, textureUnit);
				textureUnit++;
			} else {
				this.setUniform(location, value);
			}
		}
	}

	// Sets the matrices in the given shader needed for transparent objects (without normalmatrix)
	setTransparentMatrices(gl, shader, modelMatrix, viewMatrix, projectionMatrix) {
		console.assert(gl instanceof WebGLRenderingContext, 'setTransparentMatrices(): gl must be a WebGLRenderingContext');
		console.assert(shader instanceof ShaderProgram, 'setTransparentMatrices(): shader must be a ShaderProgram');
		console.assert(modelMatrix instanceof Matrix4, 'setTransparentMatrices(): modelMatrix must be a Matrix4');
		console.assert(viewMatrix instanceof Matrix4, 'setTransparentMatrices(): viewMatrix must be a Matrix4');
		console.assert(projectionMatrix instanceof Matrix4, 'setTransparentMatrices(): projectionMatrix must be a Matrix4');

		gl.uniformMatrix4fv(shader.getUniformLocation('uModel'), false, modelMatrix);
		gl.uniformMatrix4fv(shader.getUniformLocation('uView'), false, viewMatrix);
		gl.uniformMatrix4fv(shader.getUniformLocation('uProjection'), false, projectionMatrix);
	}

	setUniform(location, value) {
		const gl = this.#gl;

		if (typeof value === 'number') {
			gl.uniform1f(location, value);
		} else if (value instanceof Float32Array) {
			if (value.length === 2) gl.uniform2fv(location, value);
			else if (value.length === 3) gl.uniform3fv(location, value);
			else if (value.length === 4) gl.uniform4fv(location, value);
		} else if (Array.isArray(value)) {
			if (value.length === 2) gl.uniform2fv(location, value);
			else if (value.length === 3) gl.uniform3fv(location, value);
			else if (value.length === 4) gl.uniform4fv(location, value);
		}
	}

	// Sets the matrices in the given shader
	setMatrices(gl, shader, modelMatrix, viewMatrix, projectionMatrix) {
		console.assert(gl instanceof WebGLRenderingContext, 'setMatrices(): gl must be a WebGLRenderingContext');
		console.assert(shader instanceof ShaderProgram, 'setMatrices(): shader must be a ShaderProgram');
		console.assert(modelMatrix instanceof Matrix4, 'setMatrices(): modelMatrix must be a Matrix4');
		console.assert(viewMatrix instanceof Matrix4, 'setMatrices(): viewMatrix must be a Matrix4');
		console.assert(projectionMatrix instanceof Matrix4, 'setMatrices(): projectionMatrix must be a Matrix4');

		const modelViewMatrix = modelMatrix.multiplied(viewMatrix);
		const normalMatrix = Matrix4.getNormalMatrix(modelViewMatrix);

		gl.uniformMatrix4fv(shader.getUniformLocation('uModel'), false, modelMatrix);
		gl.uniformMatrix4fv(shader.getUniformLocation('uView'), false, viewMatrix);
		gl.uniformMatrix4fv(shader.getUniformLocation('uProjection'), false, projectionMatrix);
		gl.uniformMatrix3fv(shader.getUniformLocation('uNormal'), false, normalMatrix);
	}

	// Sets the light uniforms for the given shader.
	// Note: In this project there are two light sources.
	setLightUniforms(gl, shader, lights, viewMatrix) {
		console.assert(gl instanceof WebGLRenderingContext, 'setLightUniforms(): gl must be a WebGLRenderingContext');
		console.assert(shader instanceof ShaderProgram, 'setLightUniforms(): shader must be a ShaderProgram');
		console.assert(viewMatrix instanceof Matrix4, 'setLightUniforms(): viewMatrix must be a Matrix4');

		gl.uniform3fv(shader.getUniformLocation('light01'), viewMatrix.multiplyVector(lights[0].position));
		gl.uniform3fv(shader.getUniformLocation('ambient01'), lights[0].ambient);
		gl.uniform3fv(shader.getUniformLocation('diffuse01'), lights[0].diffuse);
		gl.uniform3fv(shader.getUniformLocation('specular01'), lights[0].specular);
		gl.uniform1f(shader.getUniformLocation('shininess01'), lights[0].shininess);

		gl.uniform3fv(shader.getUniformLocation('light02'), viewMatrix.multiplyVector(lights[1].position));
		gl.uniform3fv(shader.getUniformLocation('ambient02'), lights[1].ambient);
		gl.uniform3fv(shader.getUniformLocation('diffuse02'), lights[1].diffuse);
		gl.uniform3fv(shader.getUniformLocation('specular02'), lights[1].specular);
		gl.uniform1f(shader.getUniformLocation('shininess02'), lights[1].shininess);
	}

	// Binds the texture to the given shader
	bindTexture(gl, shader, texture) {
		console.assert(gl instanceof WebGLRenderingContext, 'bindTexture(): gl must be a WebGLRenderingContext');
		console.assert(shader instanceof ShaderProgram, 'bindTexture(): shader must be a ShaderProgram');
		if (!texture) return;
		texture.bind(gl, 0);
		gl.uniform1i(shader.getUniformLocation('uTexture'), 0);
	}

}
