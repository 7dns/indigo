import { Vector3 } from "../math/Vector3.mjs";
import { Matrix4 } from "../math/Matrix4.mjs";

// Represents a Camera
// Manages the view and projection matrices

export class Camera {

	#position;
	#target;
	#up;
	#fov;
	#aspect;
	#near;
	#far;
	#viewMatrix;
	#projectionMatrix;

	constructor(
		position = new Vector3([0, 0, 5]),
		target = Vector3.ORIGIN,
		up = Vector3.UP,
		fov = Math.PI / 2,
		aspect = 1.0,
		near = 0.1,
		far = 100.0
	) {
		console.assert(position instanceof Vector3, 'Camera constructor(): position must be a Vector3');
		console.assert(target instanceof Vector3, 'Camera constructor(): target must be a Vector3');
		console.assert(up instanceof Vector3, 'Camera constructor(): up must be a Vector3');
		console.assert(typeof fov === 'number', 'Camera constructor(): fov must be a number');
		console.assert(typeof aspect === 'number', 'Camera constructor(): aspect must be a number');
		console.assert(typeof near === 'number', 'Camera constructor(): near must be a number');
		console.assert(typeof far === 'number', 'Camera constructor(): far must be a number');

		this.#position = position;
		this.#target = target;
		this.#up = up;
		this.#fov = fov;
		this.#aspect = aspect;
		this.#near = near;
		this.#far = far;

		this.#viewMatrix = new Matrix4();
		this.#projectionMatrix = new Matrix4();

		this.updateProjectionMatrix();
	}

	get position() { return this.#position; }
	get target() { return this.#target; }
	get up() { return this.#up; }
	get fov() { return this.#fov; }

	set position(newPosition) {
		console.assert(newPosition instanceof Vector3, 'set position(): newPosition must be a Vector3');
		this.#position = newPosition;
	}

	set target(newTarget) {
		console.assert(newTarget instanceof Vector3, 'set target(): newTarget must be a Vector3');
		this.#target = newTarget;
	}

	set up(newUp) {
		console.assert(newUp instanceof Vector3, 'set up(): newUp must be a Vector3');
		this.#up = newUp;
	}

	set fov(newFov) {
		console.assert(typeof newFov === 'number', 'set fov(): newFov must be a number');
		this.#fov = newFov;
		this.updateProjectionMatrix();
	}

	set near(newNear) {
		console.assert(typeof newNear === 'number', 'set near(): newNear must be a number');
		this.#near = newNear;
		this.updateProjectionMatrix();
	}

	set far(newFar) {
		console.assert(typeof newFar === 'number', 'set far(): newFar must be a number');
		this.#far = newFar;
		this.updateProjectionMatrix();
	}

	getViewMatrix() {
		this.#viewMatrix.lookAt(this.#position, this.#target, this.#up);
		return this.#viewMatrix;
	}

	getProjectionMatrix() {
		return this.#projectionMatrix;
	}

	// Updates the projectionmatrix with the local attributes fov, aspect, near and far
	updateProjectionMatrix() {
		this.#projectionMatrix.perspective(this.#fov, this.#aspect, this.#near, this.#far);
	}
}
