import { Vector3 } from './Vector3.mjs';
import { Matrix3 } from './Matrix3.mjs';

// A 4x4 matrix class extending Float32Array
export class Matrix4 extends Float32Array {

	// Matrix dimension (4x4)
	static N = 4;
	static Nsquared = Matrix4.N * Matrix4.N;

	// Constructor: if an array of 16 elements is provided, use it.
	// Otherwise, initialize as identity matrix.
	constructor(m) {
		super(Matrix4.Nsquared);

		if (Array.isArray(m) && m.length === Matrix4.Nsquared) {
			this.set(m);
		} else {
			this.identity();
		}
	}

	// Return a copy of this matrix
	clone() {
		return new Matrix4().set(this);
	}

	// Set matrix elements directly from an array of 16 values in row-major order
	set(values) {
		console.assert(
			values instanceof Matrix4 ||
			(Array.isArray(values) && values.length == Matrix4.Nsquared),
			'set(): argument must be a Matrix4 or an array of length 16'
		);

		if (values instanceof Matrix4) {
			for (let i = 0; i < Matrix4.Nsquared; i++) {
				this[i] = values[i];
			}
			return this;
		}

		this[0] = values[0]; this[4] = values[1]; this[8] = values[2]; this[12] = values[3];
		this[1] = values[4]; this[5] = values[5]; this[9] = values[6]; this[13] = values[7];
		this[2] = values[8]; this[6] = values[9]; this[10] = values[10]; this[14] = values[11];
		this[3] = values[12]; this[7] = values[13]; this[11] = values[14]; this[15] = values[15];

		return this;
	}

	// Reset the matrix to the identity matrix
	identity() {
		this[0] = 1; this[4] = 0; this[8] = 0; this[12] = 0;
		this[1] = 0; this[5] = 1; this[9] = 0; this[13] = 0;
		this[2] = 0; this[6] = 0; this[10] = 1; this[14] = 0;
		this[3] = 0; this[7] = 0; this[11] = 0; this[15] = 1;
		return this;
	}

	// Multiply this matrix by another Matrix4 and return the modified matrix
	multiply(other) {
		console.assert(other instanceof Matrix4, 'multiply(): argument must be a Matrix4');

		const N = Matrix4.N;
		let result = new Matrix4();

		for (let col = 0; col < N; col++) {
			for (let row = 0; row < N; row++) {
				let sum = 0;
				for (let i = 0; i < N; i++) {
					sum += this[row + i * N] * other[i + col * N];
				}
				result[col * N + row] = sum;
			}
		}

		this.set(result);
		return this;
	}

	// Multiply this matrix by another Matrix4 and return the product as a new matrix
	multiplied(other) {
		console.assert(other instanceof Matrix4, 'multiplied(): argument must be a Matrix4');
		return this.clone().multiply(other);
	}

	// Multiply this matrix by a Vector3 and return the result as a new Vector3
	multiplyVector(v) {
		console.assert(v instanceof Vector3, 'multiplyVector(): v must be a Vector3');
		const x = v[0], y = v[1], z = v[2], w = 1.0;
		const m = this.clone();

		return new Vector3([
			m[0] * x + m[4] * y + m[8]  * z + m[12] * w,
			m[1] * x + m[5] * y + m[9]  * z + m[13] * w,
			m[2] * x + m[6] * y + m[10] * z + m[14] * w
		]);
	}

	// Creates a view matrix
	lookAt(eye, center, up = Vector3.UP) {
		console.assert(eye instanceof Vector3, 'lookAt(): eye must be a Vector3');
		console.assert(center instanceof Vector3, 'lookAt(): center must be a Vector3');
		console.assert(up instanceof Vector3, 'lookAt(): up must be a Vector3');

		const n = eye.clone().subtract(center).normalize();
		const u = up.clone().cross(n).normalize();
		const v = n.clone().cross(u).normalize();

		this[0] = u[0]; this[4] = u[1]; this[8] = u[2]; this[12] = -u.dot(eye);
		this[1] = v[0]; this[5] = v[1]; this[9] = v[2]; this[13] = -v.dot(eye);
		this[2] = n[0]; this[6] = n[1]; this[10] = n[2]; this[14] = -n.dot(eye);
		this[3] = 0.0; this[7] = 0.0; this[11] = 0.0; this[15] = 1.0;

		return this;
	}

	// Creates a perspective projection matrix
	perspective(fovy, aspect, near, far) {
		console.assert(!Number.isNaN(fovy), 'perspective(): fovy must be a number');
		console.assert(!Number.isNaN(aspect), 'perspective(): aspect must be a number');
		console.assert(!Number.isNaN(near), 'perspective(): near must be a number');
		console.assert(!Number.isNaN(far), 'perspective(): far must be a number');

		const f = 1.0 / Math.tan(fovy / 2.0);
		const nf = 1.0 / (near - far);

		this[0] = f / aspect; this[4] = 0.0; this[8] = 0.0; this[12] = 0.0;
		this[1] = 0.0; this[5] = f; this[9] = 0.0; this[13] = 0.0;
		this[2] = 0.0; this[6] = 0.0; this[10] = (far + near) * nf; this[14] = (2.0 * far * near) * nf;
		this[3] = 0.0; this[7] = 0.0; this[11] = -1.0; this[15] = 0.0;

		return this;
	}

	// Applies translation and return modified matrix
	translate(v) {
		console.assert(v instanceof Vector3, 'translate(): v must be a Vector3');

		let t = Matrix4.createTranslationMatrix(v);
		return this.multiply(t);
	}

	// Applies scale and return modified matrix
	scale(v) {
		console.assert(v instanceof Vector3, 'scale(): v must be a Vector3');

		let s = Matrix4.createScalingMatrix(v);
		return this.multiply(s);
	}

	// Applies scale equally on all axis
	scaleProportionally(f) {
		console.assert(!Number.isNaN(f), 'scaleProportionally(): argument must be a number');
		return this.scale(new Vector3([f, f, f]));
	}

	/**
	 * Applies rotation and return modified matrix.
	 * Rotation may be specified individually for each axis in radians.
	 * If only two values are specified, then the value around the z-axis is 0.
	 * If only one value is specified, then the value is the same for each axis.
	 */
	rotate(x = 0, y = 0, z = 0) {
		console.assert(!Number.isNaN(x), 'rotate(): x must be a number');
		console.assert(!Number.isNaN(y), 'rotate(): y must be a number');
		console.assert(!Number.isNaN(z), 'rotate(): z must be a number');

		if (arguments.length === 1) {
			x = y = z = arguments[0];
		} else if (arguments.length === 2) {
			z = 0;
		}

		let r = Matrix4.createXRotationMatrix(x)
			.multiplied(Matrix4.createYRotationMatrix(y))
			.multiplied(Matrix4.createZRotationMatrix(z));
		return this.multiply(r);
	}

	// Applies rotation around the x-axis in radians and return modified matrix
	rotateX(angle) {
		console.assert(!Number.isNaN(angle), 'rotateX(): angle must be a number');

		let r = Matrix4.createXRotationMatrix(angle);
		return this.multiply(r);
	}

	// Applies rotation around the y-axis in radians and return modified matrix
	rotateY(angle) {
		console.assert(!Number.isNaN(angle), 'rotateY(): angle must be a number');

		let r = Matrix4.createYRotationMatrix(angle);
		return this.multiply(r);
	}

	// Applies rotation around the z-axis in radians and return modified matrix
	rotateZ(angle) {
		console.assert(!Number.isNaN(angle), 'rotateZ(): angle must be a number');

		let r = Matrix4.createZRotationMatrix(angle);
		return this.multiply(r);
	}

	// Creates and return a translation matrix from vector v
	static createTranslationMatrix(v) {
		console.assert(v instanceof Vector3, 'createTranslationMatrix(): v must be a Vector3');

		let m = new Matrix4();
		m[12] = v[0];
		m[13] = v[1];
		m[14] = v[2];
		return m;
	}

	// Creates and return a scaling matrix from vector v
	static createScalingMatrix(v) {
		console.assert(v instanceof Vector3, 'createScalingMatrix(): v must be a Vector3');

		let m = new Matrix4();
		m[0] = v[0];
		m[5] = v[1];
		m[10] = v[2];
		return m;
	}

	// Creates and return a rotation matrix around the x-axis by angle (radians)
	static createXRotationMatrix(angle) {
		console.assert(!Number.isNaN(angle), 'createXRotationMatrix(): angle must be a number');

		const sine = Math.sin(angle);
		const cosine = Math.cos(angle);

		let m = new Matrix4();
		m[5] = cosine;
		m[6] = sine;
		m[9] = -sine;
		m[10] = cosine;
		return m;
	}

	// Creates and return a rotation matrix around the y-axis by angle (radians) 
	static createYRotationMatrix(angle) {
		console.assert(!Number.isNaN(angle), 'createYRotationMatrix(): angle must be a number');

		const sine = Math.sin(angle);
		const cosine = Math.cos(angle);

		let m = new Matrix4();
		m[0] = cosine;
		m[2] = -sine;
		m[8] = sine;
		m[10] = cosine;
		return m;
	}

	// Creates and return a rotation matrix around the z-axis by angle (radians)
	static createZRotationMatrix(angle) {
		console.assert(!Number.isNaN(angle), 'createZRotationMatrix(): angle must be a number');

		const sine = Math.sin(angle);
		const cosine = Math.cos(angle);

		let m = new Matrix4();
		m[0] = cosine;
		m[1] = sine;
		m[4] = -sine;
		m[5] = cosine;
		return m;
	}

	// Return the normal matrix (inverse transpose of upper-left 3x3 of given Matrix4)
	static getNormalMatrix(m4) {
		console.assert(m4 instanceof Matrix4, 'getNormalMatrix(): argument must be a Matrix4');

		let matrix3 = new Matrix3(m4);
		return matrix3.inverse().transposeInPlace();
	}

	// Returns a new matrix without translation
	removeTranslation() {
		const newMatrix = this.clone();
		newMatrix[12] = newMatrix[13] = newMatrix[14] = 0;

		return newMatrix;
	}

	// Return only the translation part of this matrix as a Vector3
	getTranslation() {
		return new Vector3([this[12], this[13], this[14]]);
	}

	// Print the matrix in row-major order
	printRowMajor() {
		const N = Matrix4.N;
		let string = '';

		for (let i = 0; i < N; i++) {
			for (let j = 0; j < N; j++) {
				string += this[j * N + i].toFixed(2) + ' ';
			}
			string += '\n';
		}

		return string;
	}

}