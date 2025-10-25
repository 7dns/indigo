'use strict';

import { setupUI, syncCameraContainer } from './ui.js';

// Animations
import { createFollow as createLightFollow } from '../app/animations/LightAnimations.mjs';
import { createOrbitAndSpin, createFollow, createHoverY } from '../app/animations/ModelAnimations.mjs';

// Core
import { BloomRenderer } from '../app/core/BloomRenderer.mjs';
import { Camera } from '../app/core/Camera.mjs';
import { Color } from '../app/core/Color.mjs';
import { Light } from '../app/core/Light.mjs';
import { Mesh } from '../app/core/Mesh.mjs'
import { Model } from '../app/core/Model.mjs';
import { Renderer } from '../app/core/Renderer.mjs';
import { Scene } from '../app/core/Scene.mjs';
import { ShaderProgram } from '../app/core/Shader.mjs';
import { SkyBox } from '../app/core/SkyBox.mjs';

// Loaders
import { loadVideoTexture } from '../app/loaders/TextureLoader.mjs';

// Math
import { Matrix4 } from '../app/math/Matrix4.mjs';
import { Vector3 } from '../app/math/Vector3.mjs';

// Textures
import { ColorTexture } from '../app/textures/ColorTexture.mjs';
import { ImageTexture } from '../app/textures/ImageTexture.mjs';
import { MultiTexture } from '../app/textures/MultiTexture.mjs';

// Utils
import { generateNoiseTexture } from '../app/utils/TextureGenerator.mjs';

// --- Initializes the WebGL context, sets up the scene, and starts the render loop ---
async function init() {
	// --- Timing ---
	const startTime = Date.now();
	let lastTime = startTime;

	// --- WebGL Context ---
	const canvas = document.getElementById('cg1-canvas');
	const gl = canvas.getContext('webgl');
	if (!gl) {
		console.error('WebGL not supported!');
		return;
	}

	// --- Global Scene Settings ---
	const fogColor = [0.05, 0.05, 0.1, 1];
	let fogNear = 30;
	let fogFar = 150;

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CCW);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	// --- Scene & Renderer ---
	const scene = new Scene();
	const renderer = new Renderer(gl);

	// --- Camera ---
	const camera = new Camera(
		new Vector3([10.0, 10.0, 3.0]),
		new Vector3([0.0, 3.0, 0.0]),
		Vector3.UP,
		70 * (Math.PI / 180)
	);
	scene.setCamera(camera);

	// --- Shaders ---
	const shaderGeneral = new ShaderProgram(gl, 'vertexShader.glsl', 'fragmentShader.glsl');
	await shaderGeneral.initialize();
	const shaderSun = new ShaderProgram(gl, 'vertexShader.glsl', 'sunFragmentShader.glsl');
	await shaderSun.initialize();
	const shaderSkyBox = new ShaderProgram(gl, 'skyboxVertexShader.glsl', 'skyboxFragmentShader.glsl');
	await shaderSkyBox.initialize();
	const shaderProcedural = new ShaderProgram(gl, 'vertexShader.glsl', 'fireFragmentShader.glsl');
	await shaderProcedural.initialize();
	const shaderTransparent = new ShaderProgram(gl, 'ufoGlassVertexShader.glsl', 'ufoGlassFragmentShader.glsl');
	await shaderTransparent.initialize();
	const shaderReflection = new ShaderProgram(gl, 'reflectionVertexShader.glsl', 'reflectionFragmentShader.glsl');
	await shaderReflection.initialize();
	const shaderMultiTexture = new ShaderProgram(gl, 'vertexShader.glsl', 'multiTexFragmentShader.glsl');
	await shaderMultiTexture.initialize();

	// --- Textures ---
	const textureNoise = generateNoiseTexture(gl);
	const textureYellow = new ColorTexture(gl, Color.YELLOW, 1);
	const textureOrange = new ColorTexture(gl, Color.ORANGE, 1);
	const textureShrek = new ImageTexture('assets/textures/ShrekTextureFace.png');
	await textureShrek.initialize(gl);
	const textureSaturn = new ImageTexture('assets/textures/Saturn.jpg');
	await textureSaturn.initialize(gl);
	const textureSaturnRing = new ImageTexture('assets/textures/RainbowTexture.png');
	await textureSaturnRing.initialize(gl);
	const textureCookieMan = new ImageTexture('assets/textures/CookieManTexture.png');
	await textureCookieMan.initialize(gl);
	const texturesEarth = [
		'assets/textures/earth/earth_day.png',
		'assets/textures/earth/earth_ocean_mask.png',
		'assets/textures/earth/earth_clouds.png'
	];
	const textureMulti = new MultiTexture(texturesEarth);
	await textureMulti.initialize(gl);
	
	const videoTexture01 = loadVideoTexture(gl, 0, 'assets/videos/beeMovie.mp4');
	const videoTexture02 = loadVideoTexture(gl, 0, 'assets/videos/minecraft.mp4');
	const videoTexture03 = loadVideoTexture(gl, 0, 'assets/videos/shrek.mp4');

	// --- Meshes ---
	const meshBasicPlanet = new Mesh(gl, 'assets/models/BasicPlanet.obj');
	meshBasicPlanet.initialize();
	const meshShrek = new Mesh(gl, 'assets/models/ShrekPlanet.obj');
	meshShrek.initialize();
	const meshSaturn = new Mesh(gl, 'assets/models/SaturnPlanet.obj');
	meshSaturn.initialize();
	const meshSaturnRing = new Mesh(gl, 'assets/models/SaturnRing.obj');
	meshSaturnRing.initialize();
	const meshUfoShip = new Mesh(gl, 'assets/models/UfoShip.obj');
	meshUfoShip.initialize();
	const meshUfoGlass = new Mesh(gl, 'assets/models/UfoGlass.obj');
	meshUfoGlass.initialize();
	const meshCookieMan = new Mesh(gl, 'assets/models/CookieMan.obj');
	meshCookieMan.initialize();

	// --- Models ---
	const sun = new Model(meshBasicPlanet, shaderSun, textureYellow);
	sun.setExtraUniform('u_emission', 5.0);
	scene.addModel(sun);

	const ufoShip = new Model(meshUfoShip, shaderReflection, null);
	scene.addModel(ufoShip);
	const ufoGlass = new Model(meshUfoGlass, shaderTransparent, null);

	const cookieManModel = new Model(meshCookieMan, shaderGeneral, textureCookieMan);
	scene.addModel(cookieManModel);

	const planet01 = new Model(meshShrek, shaderGeneral, textureShrek);
	scene.addModel(planet01);

	const planet02 = new Model(meshBasicPlanet, shaderGeneral, textureOrange);
	scene.addModel(planet02);

	const planet03 = new Model(meshBasicPlanet, shaderMultiTexture, textureMulti);
	planet03.setExtraUniform('uTexDay', textureMulti.textures[0]);
	planet03.setExtraUniform('uTexOcean', textureMulti.textures[1]);
	planet03.setExtraUniform('uTexClouds', textureMulti.textures[2]);
	scene.addModel(planet03);

	const planet04 = new Model(meshBasicPlanet, shaderTransparent, null);

	const planet05 = new Model(meshBasicPlanet, shaderReflection, null);
	scene.addModel(planet05);

	const planet06 = new Model(meshBasicPlanet, shaderGeneral, videoTexture01);
	scene.addModel(planet06);

	const planet07 = new Model(meshSaturn, shaderGeneral, textureSaturn);
	planet07.modelMatrix.rotateX(Math.PI / 8);
	scene.addModel(planet07);
	const planet07ring = new Model(meshSaturnRing, shaderGeneral, textureSaturnRing);
	scene.addModel(planet07ring);

	const planet08 = new Model(meshBasicPlanet, shaderProcedural, null);
	planet08.setExtraUniform('time', () => (Date.now() - startTime) / 50_000);
	planet08.setExtraUniform('resolution', (gl) => [gl.canvas.width, gl.canvas.height]);
	planet08.setExtraUniform('texture', textureNoise);
	scene.addModel(planet08);

	// --- Skybox ---
	const imageArrayDay = [
		'assets/textures/skyboxDay/right.jpg',
		'assets/textures/skyboxDay/left.jpg',
		'assets/textures/skyboxDay/bottom.jpg',
		'assets/textures/skyboxDay/top.jpg',
		'assets/textures/skyboxDay/front.jpg',
		'assets/textures/skyboxDay/back.jpg'
	];

	const imageArrayNight = [
		'assets/textures/skyboxNight/px.png',
		'assets/textures/skyboxNight/nx.png',
		'assets/textures/skyboxNight/py.png',
		'assets/textures/skyboxNight/ny.png',
		'assets/textures/skyboxNight/pz.png',
		'assets/textures/skyboxNight/nz.png'
	];

	const imageArrayDawn = [
		'assets/textures/skyboxDawn/px.png',
		'assets/textures/skyboxDawn/nx.png',
		'assets/textures/skyboxDawn/ny.png',
		'assets/textures/skyboxDawn/py.png',
		'assets/textures/skyboxDawn/pz.png',
		'assets/textures/skyboxDawn/nz.png'
	];
	let skyboxProjection = new Matrix4();
	const skybox = new SkyBox(gl, shaderSkyBox.shaderProgram, imageArrayNight, imageArrayDawn, imageArrayDay);
	await skybox.ready;
	skybox.setCurrentTexture(1);

	// --- Fog Uniforms ---
	const modelsWithFogNoSun = [planet01, planet03, planet04, planet05, planet06, planet07, planet07ring, planet08].filter(m => m !== sun);
	modelsWithFogNoSun.forEach(model => {
		model.setExtraUniform('u_fogColor', () => fogColor);
		model.setExtraUniform('u_fogNear', () => fogNear);
		model.setExtraUniform('u_fogFar', () => fogFar);
		if (model !== sun) model.setExtraUniform('u_emission', 0.0);
	});

	// --- Light ---
	const light01 = new Light();
	scene.addLight(light01);

	const light02 = new Light();
	light02.diffuse = new Vector3([1.0, 0.5, 0.0]);
	scene.addLight(light02);

	// --- Animations ---
	const planets = [planet01, planet02, planet03, planet04, planet05, planet06, planet07, planet08];
	const planetsOffset = [7.5, 12.5, 17.5, 22.5, 27.5, 32.5, 37.5, 42.5];
	const initialAngles = [Math.PI * 5 / 4, Math.PI * 1 / 4, Math.PI * 7 / 4, Math.PI * 3 / 4, Math.PI * 4 / 4, Math.PI * 8 / 4, Math.PI * 6 / 4, Math.PI * 2 / 4];
	const orbitSpeeds = [0.004, 0.003, 0.0025, 0.002, 0.0012, 0.0008, 0.0005, 0.0003];
	orbitSpeeds.forEach((value, index, array) => {array[index] = value * 0.25;});
	const spinSpeed = 0.0025;
	for (let i = 0; i < planets.length; i++) {
		if (i === 6) {
			scene.addAnimation(createOrbitAndSpin(
				planets[i],
				planetsOffset[i],
				orbitSpeeds[i],
				spinSpeed,
				initialAngles[i],
				Math.PI / 8,
				'x'
			));
		} else {
			scene.addAnimation(createOrbitAndSpin(
				planets[i],
				planetsOffset[i],
				orbitSpeeds[i],
				spinSpeed,
				initialAngles[i]
			));
		}
	}

	scene.addAnimation(createLightFollow(light02, planet02)); // Light 02 follows Planet 02
	scene.addAnimation(createFollow(planet07ring, planet07)); // Saturn Ring follows Saturn
	scene.addAnimation(createHoverY(ufoShip, 1.5, 0.001, new Vector3([-15.0, 5.0, -15.0]))); // UFO Ship hovers 
	scene.addAnimation(createFollow(ufoGlass, ufoShip)); // UFO Glass follows UFO Ship
	scene.addAnimation(createHoverY(cookieManModel, 1.3, 0.0015, new Vector3([-15.0, -4.0, -15.0]))); // CookieMan hovers

	// --- Bloom Renderer ---
	const bloomExtractShader = new ShaderProgram(gl, 'screenQuadVertex.glsl', 'bloomExtractFragment.glsl');
	await bloomExtractShader.initialize();
	const bloomBlurShader = new ShaderProgram(gl, 'screenQuadVertex.glsl', 'bloomBlurFragment.glsl');
	await bloomBlurShader.initialize();
	const bloomCombineShader = new ShaderProgram(gl, 'screenQuadVertex.glsl', 'bloomCombineFragment.glsl');
	await bloomCombineShader.initialize();
	const bloomRenderer = new BloomRenderer(gl, gl.canvas.width, gl.canvas.height, {
		extract: bloomExtractShader,
		blur: bloomBlurShader,
		combine: bloomCombineShader
	}, {
		blurPasses: 6,
		bloomIntensity: 5.0
	});

	// --- Render Loop ---
	function draw() {
		const now = Date.now();
		const deltaTime = now - lastTime;
		lastTime = now;
		
		bloomRenderer.renderSunToFBO(() => {
			renderer.prepareFrame(scene.backgroundColor);
			renderer.drawModel(sun, scene.lights, scene.camera.getViewMatrix(), scene.camera.getProjectionMatrix());
		});

		bloomRenderer.extractBright();

		bloomRenderer.blurPass(bloomRenderer.bloomFBO1, bloomRenderer.bloomFBO2, [1.0, 0.0]);
		bloomRenderer.blurPass(bloomRenderer.bloomFBO2, bloomRenderer.bloomFBO1, [0.0, 1.0]);

		bloomRenderer.combineWithScene(() => {
			// Skybox
			skyboxProjection.perspective(Math.PI / 2, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.CULL_FACE);
			skybox.drawSkyBox(
				camera.getViewMatrix(),
				skyboxProjection,
				fogColor,
				fogNear,
				fogFar,
				camera.position
			);
			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.CULL_FACE);
			shaderSkyBox.use();

			renderer.frame(scene, deltaTime);

			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.depthMask(false);
			renderer.drawTransparent(ufoGlass, scene.camera.getViewMatrix(), scene.camera.getProjectionMatrix());
			renderer.drawTransparent(planet04, scene.camera.getViewMatrix(), scene.camera.getProjectionMatrix());
			gl.disable(gl.BLEND);
			gl.depthMask(true);
		});

		requestAnimationFrame(draw);
	}

	draw();

	// --- UI Setup ---
	const planetModels = [planet01, planet02, planet03, planet04, planet05, planet06, planet07, planet08];
	const videoTextures = [videoTexture01, videoTexture02, videoTexture03];
	setupUI({
		scene,
		camera,
		skybox,
		planetModels,
		videoTextures,
		setFog: (near, far) => { fogNear = near; fogFar = far; }
	});
	syncCameraContainer(camera);
}

window.onload = init;