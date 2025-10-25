import { Animation } from './Animation.mjs';
import { Camera } from './Camera.mjs';
import { Color } from './Color.mjs';
import { Light } from './Light.mjs';
import { Model } from './Model.mjs';

// Represents a Scene
// A Scene serves as a container for all assets in a composition
// On construction, it creates lists for Models, Animations, and Lights
// Only one Camera is allowed per Scene
// The Renderer calls update() to update all animations

export class Scene {

	#models;
	#animations;
	#lights;
	#camera;
	#backgroundColor;

	constructor(camera = null, backgroundColor = new Color()) {
		console.assert(camera === null || camera instanceof Camera, 'Scene constructor(): camera must be a Camera or null');
		console.assert(backgroundColor instanceof Color, 'Scene constructor(): backgroundColor must be a Color');

		this.#models = [];
		this.#animations = [];
		this.#lights = [];
		this.#camera = camera;
		this.#backgroundColor = backgroundColor;
	}

	get models() { return this.#models; }
	get animations() { return this.#animations; }
	get lights() { return this.#lights; }
	get camera() { return this.#camera; }
	get backgroundColor() { return this.#backgroundColor; }

	// Adds a model to the scene that later gets drawn in by the Renderer.
	addModel(model) {
		console.assert(model instanceof Model, 'addModel(): model must be an instance of Model');
        this.#models.push(model);
    }

	// Adds an animation to the scene.
	addAnimation(animation) {
		console.assert(animation instanceof Animation, 'addAnimation(): animation must be an instance of Animation');
		this.#animations.push(animation);
	}

	// Removes the animation that was applied to the camera of the scene.
	removeAnimationsOfCamera(camera) {
		console.assert(camera instanceof Camera, 'removeAnimationsOfCamera(): camera must be an instance of Camera');
		this.#animations = this.#animations.filter(anim => anim.target !== camera);
	}

	// Adds a light to the scene.
	addLight(light) {
		console.assert(light instanceof Light, 'addLight(): light must be an instance of Light');
        this.#lights.push(light);
    }

	setCamera(camera) {
		console.assert(camera instanceof Camera, 'setCamera(): camera must be an instance of Camera');
        this.#camera = camera;
    }

	// Updates the Animations of the scene.
	update(deltaTime) {
		console.assert(typeof deltaTime === 'number', 'update(): deltaTime must be a number');

		for (const animation of this.#animations) {
			animation.update(deltaTime);
		}
	}

}
