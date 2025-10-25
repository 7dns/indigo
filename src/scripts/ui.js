import { Vector3 } from '../app/math/Vector3.mjs';
import { createMovementTo } from '../app/animations/CameraAnimations.mjs';

// Manages the UI setup

const ANIMATION_DURATION_IN_MS = 2000;

// Sets up the UI elements
export function setupUI({ scene, camera, skybox, planetModels, videoTextures, setFog }) {
	setupSunCloseUpButton(scene, camera);
	setupPlanetButtons(scene, camera, planetModels);
	setupWideShotButton(scene, camera);
	setupSkyboxButtons(skybox);
	setupFogSlider(setFog);
	setupVideoButtons(planetModels, videoTextures);
	setupCameraPanelToggle();
	setupCameraForm(camera);
}

// Synchronizes the camera container with the current camera state
export function syncCameraContainer(camera) {
	updateCameraContainer(camera);
}

// Updates the camera container with the current camera position, target, up vector, and other properties
function updateCameraContainer(camera) {
	document.getElementById("cameraPositionX").value = camera.position[0].toFixed(2);
	document.getElementById("cameraPositionY").value = camera.position[1].toFixed(2);
	document.getElementById("cameraPositionZ").value = camera.position[2].toFixed(2);

	document.getElementById("cameraTargetX").value = camera.target[0].toFixed(2);
	document.getElementById("cameraTargetY").value = camera.target[1].toFixed(2);
	document.getElementById("cameraTargetZ").value = camera.target[2].toFixed(2);

	document.getElementById("cameraUpX").value = camera.up[0].toFixed(2);
	document.getElementById("cameraUpY").value = camera.up[1].toFixed(2);
	document.getElementById("cameraUpZ").value = camera.up[2].toFixed(2);

	document.getElementById("cameraNear").value = camera.near?.toFixed(2) ?? 0.1;
	document.getElementById("cameraNearValue").value = camera.near?.toFixed(2) ?? 0.1;
	document.getElementById("cameraFar").value = camera.far?.toFixed(2) ?? 100.0;
	document.getElementById("cameraFarValue").value = camera.far?.toFixed(2) ?? 100.0;
	document.getElementById("cameraFovy").value = camera.fov?.toFixed(2) ?? (Math.PI / 2).toFixed(2);
	document.getElementById("cameraFovyValue").value = camera.fov?.toFixed(2) ?? (Math.PI / 2).toFixed(2);
}

// Sets up the button to animate the camera to a medium close-up view of the sun
function setupSunCloseUpButton(scene, camera) {
	setupButton("button0", () => {
		animateCameraTo(
			scene,
			camera,
			new Vector3([10.0, 10.0, 3.0]),
			new Vector3([0.0, 3.0, 0.0]),
			Vector3.UP,
			ANIMATION_DURATION_IN_MS,
			[
				() => syncCameraContainer(camera),
				() => scene.removeAnimationsOfCamera(camera) // Remove any existing animations after the camera has moved
			]
		);
	});
}

// Sets up buttons for each planet model to animate the camera to a close-up view of that planet
function setupPlanetButtons(scene, camera, planetModels) {
    planetModels.forEach((model, i) => {
        setupButton(`button${i + 1}`, () => {
            animateCameraTo(
                scene,
                camera,
                new Vector3([0.0, 0.0, 0.0]),
                model,
                Vector3.UP,
                ANIMATION_DURATION_IN_MS,
                [() => syncCameraContainer(camera)]
            );
        });
    });
}

// Sets up the button to animate the camera to a wide top-down shot view of the scene
function setupWideShotButton(scene, camera) {
	setupButton("button9", () => {
		animateCameraTo(
			scene,
			camera,
			new Vector3([0.0, 75.0, 0.0]),
			Vector3.ORIGIN,
			Vector3.FORWARD,
			ANIMATION_DURATION_IN_MS,
			[
				() => syncCameraContainer(camera),
				() => scene.removeAnimationsOfCamera(camera) // Remove any existing animations after the camera has moved
			]
		);
	});
}

// Sets up buttons for the skybox to change its texture
function setupSkyboxButtons(skybox) {
	setupButton("buttonDay", () => skybox.setCurrentTexture(3));
	setupButton("buttonDawn", () => skybox.setCurrentTexture(2));
	setupButton("buttonNight", () => skybox.setCurrentTexture(1));
}

// Sets up a slider to control the fog effect in the scene
function setupFogSlider(setFog) {
	const fogSlider = document.getElementById("fogSlider");
	if (!fogSlider) { return; }

	const minNear = 1;
	const maxNear = 100;

	const minSlider = parseFloat(fogSlider.min) || 30;
	const maxSlider = parseFloat(fogSlider.max) || 150;

	const updateFog = () => {
		const sliderVal = parseFloat(fogSlider.value);

		const inverted = maxSlider - (sliderVal - minSlider);
		const near = minNear;
		const far = inverted;
		if (typeof setFog === "function") setFog(near, far);
	};

	updateFog();
	fogSlider.addEventListener("input", updateFog);
}

// Sets up buttons to change the video textures on a specific planet model (planet06)
function setupVideoButtons(planetModels, videoTextures) {
    const planet06 = planetModels[5];
	const audio = document.getElementById("audio");

    setupButton("video1", () => {
		planet06.texture = videoTextures[0];
		audio.pause(); // Pause audio when switching videos
	});
    setupButton("video2", () => {
        planet06.texture = videoTextures[1];
		audio.pause(); // Pause audio when switching videos
    });
	setupButton("video3", () => {
		let texture = videoTextures[2];
		planet06.texture = texture;

		audio.currentTime = texture.video.currentTime; // Sync audio with video
		audio.play();
	});
}

// Sets up the toggle button to show/hide the camera control panel
function setupCameraPanelToggle() {
	const cameraContainer = document.getElementById("cameraContainer");
	const toggleButton = document.getElementById("toggleCameraContainerButton");
	if (!toggleButton || !cameraContainer) { return; }

	toggleButton.addEventListener("click", () => {
		cameraContainer.classList.toggle("hidden");
	});
}

// Sets up the camera control form to allow manual adjustments of camera properties
function setupCameraForm(camera) {
	const cameraForm = document.getElementById("cameraForm");
	if (!cameraForm) { return; }

	setupSlider("cameraFovy", val => camera.fov = val);
	setupSlider("cameraNear", val => camera.near = val);
	setupSlider("cameraFar", val => camera.far = val);

	cameraForm.addEventListener("submit", function (e) {
		e.preventDefault();
		function safeParseFloat(val, fallback) {
			const num = parseFloat(val);
			return isNaN(num) ? fallback : num;
		}

		camera.position = new Vector3([
			safeParseFloat(document.getElementById("cameraPositionX").value, camera.position[0]),
			safeParseFloat(document.getElementById("cameraPositionY").value, camera.position[1]),
			safeParseFloat(document.getElementById("cameraPositionZ").value, camera.position[2])
		]);

		camera.target = new Vector3([
			safeParseFloat(document.getElementById("cameraTargetX").value, camera.target[0]),
			safeParseFloat(document.getElementById("cameraTargetY").value, camera.target[1]),
			safeParseFloat(document.getElementById("cameraTargetZ").value, camera.target[2])
		]);

		camera.up = new Vector3([
			safeParseFloat(document.getElementById("cameraUpX").value, camera.up[0]),
			safeParseFloat(document.getElementById("cameraUpY").value, camera.up[1]),
			safeParseFloat(document.getElementById("cameraUpZ").value, camera.up[2])
		]);

		camera.fov = safeParseFloat(document.getElementById("cameraFovy").value, camera.fov);
		camera.near = safeParseFloat(document.getElementById("cameraNear").value, camera.near);
		camera.far = safeParseFloat(document.getElementById("cameraFar").value, camera.far);
	});
}

// Sets up a slider input to handle changes and call the provided callback function
function setupSlider(id, onChange) {
    const slider = document.getElementById(id);
    if (!slider) { return }
	slider.addEventListener("input", function () {
		const val = parseFloat(slider.value);
		if (!isNaN(val)) onChange(val);
	});
}

// Sets up a button to handle click events and call the provided callback function
function setupButton(id, onClick) {
	const button = document.getElementById(id);
	if (!button) { return; }

	button.addEventListener("click", onClick);
}

// Remove any existing animations before adding the new one
// Animates the camera to a specified position, target, and up vector over a given duration
// Calls the provided callback functions after the animation completes
function animateCameraTo(scene, camera, position, target, up, duration, afterCallbacks) {
    scene.removeAnimationsOfCamera(camera);
    scene.addAnimation(
        createMovementTo(camera, position, target, up, duration)
    );
    setTimeout(() => {
        if (Array.isArray(afterCallbacks)) {
            afterCallbacks.forEach(fn => typeof fn === "function" && fn());
        } else if (typeof afterCallbacks === "function") {
            afterCallbacks();
        }
    }, duration);
}