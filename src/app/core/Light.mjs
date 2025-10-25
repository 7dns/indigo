import { Vector3 } from '../math/Vector3.mjs';

// Represents a Light source

export class Light {

	#position;
	#ambient;
	#diffuse;
	#specular;
	#shininess;

	constructor(
		position = Vector3.ORIGIN,
		ambient = new Vector3([0.2, 0.2, 0.2]),
		diffuse = new Vector3([0.8, 0.8, 0.8]),
		specular = new Vector3([0.05, 0.05, 0.05]),
		shininess = 32.0
	) {
		console.assert(position instanceof Vector3, 'Light constructor(): position must be a Vector3');
		console.assert(ambient instanceof Vector3, 'Light constructor(): ambient must be a Vector3');
		console.assert(diffuse instanceof Vector3, 'Light constructor(): diffuse must be a Vector3');
		console.assert(specular instanceof Vector3, 'Light constructor(): specular must be a Vector3');
		console.assert(typeof shininess === 'number', 'Light constructor(): shininess must be a number');

		this.#position = position;
		this.#ambient = ambient;
		this.#diffuse = diffuse;
		this.#specular = specular;
		this.#shininess = shininess;
	}

	get position() { return this.#position; }
	get ambient() { return this.#ambient; }
	get diffuse() { return this.#diffuse; }
	get specular() { return this.#specular; }
	get shininess() { return this.#shininess; }

	set position(value) {
		console.assert(value instanceof Vector3, 'position(): value must be a Vector3');
		this.#position = value;
	}

	set ambient(value) {
		console.assert(value instanceof Vector3, 'ambient(): value must be a Vector3');
		this.#ambient = value;
	}

	set diffuse(value) {
		console.assert(value instanceof Vector3, 'diffuse(): value must be a Vector3');
		this.#diffuse = value;
	}

	set specular(value) {
		console.assert(value instanceof Vector3, 'specular(): value must be a Vector3');
		this.#specular = value;
	}

	set shininess(value) {
		console.assert(typeof value === 'number', 'shininess(): value must be a number');
		this.#shininess = value;
	}

}
