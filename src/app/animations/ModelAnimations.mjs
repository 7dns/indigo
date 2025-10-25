import { Animation } from '../core/Animation.mjs';
import { Model } from '../core/Model.mjs';
import { Vector3 } from '../math/Vector3.mjs';

// Model animation presets for use with the Animation model

// Creates an animation that makes a model orbit around a point and spin on its Y-axis
export function createOrbitAndSpin(target, radius, orbitSpeed, spinSpeed, initialAngle = 0, tiltAngle = 0, tiltAxis = 'x') {
	console.assert(target instanceof Model, 'createOrbitAndSpin(): target must be a Model');
	console.assert(typeof radius === 'number' && radius > 0, 'createOrbitAndSpin(): radius must be a positive number');
	console.assert(typeof orbitSpeed === 'number' && orbitSpeed > 0, 'createOrbitAndSpin(): orbitSpeed must be a positive number');
	console.assert(typeof spinSpeed === 'number' && spinSpeed > 0, 'createOrbitAndSpin(): spinSpeed must be a positive number');
	console.assert(typeof initialAngle === 'number', 'createOrbitAndSpin(): initialAngle must be a number');
	console.assert(typeof tiltAngle === 'number', 'createOrbitAndSpin(): tiltAngle must be a number');
	console.assert(['x', 'y', 'z'].includes(tiltAxis), 'createOrbitAndSpin(): tiltAxis must be "x", "y", or "z"');

	let angleOrbit = initialAngle;
	let angleSpin = 0;

	return new Animation(target, (model, deltaTime) => {
		angleOrbit += deltaTime * orbitSpeed;
		angleSpin += deltaTime * spinSpeed;

		const x = Math.cos(-angleOrbit) * radius;
		const z = Math.sin(-angleOrbit) * radius;

		model.modelMatrix.identity();
		model.modelMatrix.translate(new Vector3([x, 0.0, z]));
		if (tiltAngle !== 0) {
			if (tiltAxis === 'x') model.modelMatrix.rotateX(tiltAngle);
			else if (tiltAxis === 'y') model.modelMatrix.rotateY(tiltAngle);
			else if (tiltAxis === 'z') model.modelMatrix.rotateZ(tiltAngle);
		}
		model.modelMatrix.rotateY(angleSpin);
	});
}

// Creates an animation that makes a model follow another model's transform
export function createFollow(follower, target, extraTransform = null) {
	console.assert(follower instanceof Model, 'createFollow(): follower must be a Model');
	console.assert(target instanceof Model, 'createFollow(): target must be a Model');

	return new Animation(follower, () => {
		follower.modelMatrix.set(target.modelMatrix);

		if (typeof extraTransform === 'function') {
			extraTransform(follower.modelMatrix);
		}
	});
}

// Creates a vertical hovering animation for a model along the Y-axis
export function createHoverY(target, amplitude = 0.5, speed = 1.0, basePosition = new Vector3([-15.0, 5.0, -15.0])) {
	console.assert(target instanceof Model, 'createHoverY(): target must be a Model');
	console.assert(basePosition instanceof Vector3, 'createHoverY(): basePosition must be a Vector3');

	let elapsed = 0;

	return new Animation(target, (model, deltaTime) => {
		elapsed += deltaTime * speed;
		const y = basePosition[1] + Math.sin(elapsed) * amplitude;
		model.modelMatrix.identity();
		model.modelMatrix.translate(new Vector3([basePosition[0], y, basePosition[2]]));
	});
}