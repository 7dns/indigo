// The Skybox class is responsible for creating and drawing a cubemap.
// It also loads the textures.
// It can have up to three textures that can be changed while running the program.

export class SkyBox {
	constructor(gl, program, imageArray1, imageArray2, imageArray3) {
		this.gl = gl;
		this.program = program;
		this.currenttexture = null;
		this.texture1 = null;
		this.texture2 = null;
		this.texture3 = null;
		this.vbo = null;

		this.ready = this.init(imageArray1, imageArray2, imageArray3);
	}

	// Loads the three textures and the cube vertices.
	async init(imageArray1, imageArray2, imageArray3) {
		this.texture1 = await this.loadCubeTexture(imageArray1);
		this.texture2 = await this.loadCubeTexture(imageArray2);
		this.texture3 = await this.loadCubeTexture(imageArray3);
		this.loadCubeVertices();
	}

	// Loads the cube vertices and binds a buffer.
	loadCubeVertices() {

		const gl = this.gl;
		const vertices = new Float32Array([
			-10,  10, -10, -10, -10, -10,  10, -10, -10,
			 10, -10, -10,  10,  10, -10, -10,  10, -10,
			-10, -10,  10, -10, -10, -10, -10,  10, -10,
			-10,  10, -10, -10,  10,  10, -10, -10,  10,
			 10, -10, -10,  10, -10,  10,  10,  10,  10,
			 10,  10,  10,  10,  10, -10,  10, -10, -10,
			-10, -10,  10, -10,  10,  10,  10,  10,  10,
			 10,  10,  10,  10, -10,  10, -10, -10,  10,
			-10,  10, -10,  10,  10, -10,  10,  10,  10,
			 10,  10,  10, -10,  10,  10, -10,  10, -10,
			-10, -10, -10, -10, -10,  10,  10, -10, -10,
			 10, -10, -10, -10, -10,  10,  10, -10,  10
		]);

		this.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	}

	// Loads the six textures from a given array.
	loadCubeTexture(imageArray) {
		const gl = this.gl;

		return new Promise((resolve, reject) => {
			if (imageArray.length !== 6) {
				reject("CubeMap requires exactly 6 images.");
				return;
			}

			const targets = [
				gl.TEXTURE_CUBE_MAP_POSITIVE_X,
				gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
				gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
				gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
				gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
				gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
			];

			const tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

			let loaded = 0;

			imageArray.forEach((src, i) => {
				const image = new Image();
				image.crossOrigin = ""; // important for local servers

				image.onload = () => {
					gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
					gl.texImage2D(targets[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
					loaded++;

					if (loaded === 6) {
						gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
						gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
						gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);				
						
						gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
						resolve(tex);
					}
				};

				image.onerror = () => reject(`Error loading image: ${src}`);
				image.src = src;
			});
		});
	}

	drawSkyBox(viewMatrix, projectionMatrix, fogColor = [0,0,0,0], fogNear = 0, fogFar = 0, cameraPos = [0,0,0]) {
		const gl = this.gl;

		gl.useProgram(this.program);

		const view = viewMatrix.clone();
		view[12] = view[13] = view[14] = 0;

		const uView = gl.getUniformLocation(this.program, "view");
		const uProjection = gl.getUniformLocation(this.program, "projection");
		const aPos = gl.getAttribLocation(this.program, "aPos");
		const uSampler = gl.getUniformLocation(this.program, "skyboxSampler");

		const uFogColor = gl.getUniformLocation(this.program, "u_fogColor");
		const uFogNear = gl.getUniformLocation(this.program, "u_fogNear");
		const uFogFar = gl.getUniformLocation(this.program, "u_fogFar");
		const uCameraPos = gl.getUniformLocation(this.program, "u_cameraPos");

		gl.uniformMatrix4fv(uView, false, view);
		gl.uniformMatrix4fv(uProjection, false, projectionMatrix);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.currenttexture);
		gl.uniform1i(uSampler, 0);

		if (uFogColor) gl.uniform4fv(uFogColor, fogColor);
		if (uFogNear) gl.uniform1f(uFogNear, fogNear);
		if (uFogFar) gl.uniform1f(uFogFar, fogFar);
		if (uCameraPos) gl.uniform3fv(uCameraPos, cameraPos);

		gl.drawArrays(gl.TRIANGLES, 0, 36);
	}

	setCurrentTexture(numberoftexture) {
		console.assert(typeof numberoftexture === 'number', 'setCurrentTexture(): numberoftexture must be a number');
		console.assert(numberoftexture !== null, 'setCurrentTexture(): numberoftexture is empty');
		
		switch(numberoftexture) {
			case 1:
				this.currenttexture = this.texture1;
				break;
			case 2:
				this.currenttexture = this.texture2;
				break;
			case 3:
				this.currenttexture = this.texture3;
				break;
			default:
				this.currenttexture = this.texture1;
		}
		
	}

	async getCubeMapTexture(imageArray) {
		const newtexture = await this.loadCubeTexture(imageArray);
		return newtexture;
	}
}
