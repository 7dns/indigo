import { Camera } from './Camera.mjs';
import { Model } from './Model.mjs';
import { Light } from './Light.mjs';

// Represents an Animation
// An Animation is created with a target (e.g. a model) and an animation function
// It should be added to a Scene and is updated each frame via the Renderer
export class Animation {

	#target;
	#updateFunction;

	constructor(target, updateFunction) {
		console.assert(target instanceof Model || target instanceof Camera || target instanceof Light, 'Animation constructor(): target must be a Model, Camera or Light');
		console.assert(updateFunction, 'Animation constructor(): updateFunction is required');

		this.#target = target;
		this.#updateFunction = updateFunction;
	}

	get target() { return this.#target; }

	// Updates the Animation per deltatime with deltatime being the duration from one frame to the next
	update(deltaTime) {
		this.#updateFunction(this.#target, deltaTime);
	}
}