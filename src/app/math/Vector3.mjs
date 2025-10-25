// A 3-dimensional vector class extending Float32Array

export class Vector3 extends Float32Array {

    // Vector dimension
    static N = 3;

    static ORIGIN   = new Vector3([ 0.0,  0.0,  0.0]);
    static UP       = new Vector3([ 0.0,  1.0,  0.0]);
    static DOWN     = new Vector3([ 0.0, -1.0,  0.0]);
    static RIGHT    = new Vector3([ 1.0,  0.0,  0.0]);
    static LEFT     = new Vector3([-1.0,  0.0,  0.0]);
    static FORWARD  = new Vector3([ 0.0,  0.0,  1.0]);
    static BACKWARD = new Vector3([ 0.0,  0.0, -1.0]);

    // Constructor: if an array of 3 elements is provided, use it.
    // Otherwise, initialize as an Vector with all elements set to 0.0
    constructor(v) {
        super(Vector3.N);

        if (Array.isArray(v) && v.length === Vector3.N) {
            this.set(v);
        } else {
            this.set([0.0, 0.0, 0.0]);
        }
    }

    // Return a copy of this vector
    clone() {
        return new Vector3([this[0], this[1], this[2]]);
    }

    // Set vector elements directly from an array of 3 values
    set(values) {
        console.assert(Array.isArray(values) && values.length == Vector3.N, 'set(): argument must be an array of length 3');

        for (let i = 0; i < Vector3.N; i++) {
            this[i] = values[i];
        }

        return this;
    }

    // Add another Vector3 to this vector in-place and return the modified vector
    add(other) {
        console.assert(other instanceof Vector3, 'add(): argument must be a Vector3');

        for (let i = 0; i < Vector3.N; i++) {
            this[i] += other[i];
        }

        return this;
    }

    // Subtract another Vector3 from this vector in-place and return the modified vector
    subtract(other) {
        console.assert(other instanceof Vector3, 'subtract(): argument must be a Vector3');

        for (let i = 0; i < Vector3.N; i++) {
            this[i] -= other[i];
        }

        return this;
    }

    // Scales this vector in-place by factor
    scale(factor) {
        console.assert(!Number.isNaN(factor), 'scale(): argument must be a number');

        for (let i = 0; i < Vector3.N; i++) {
            this[i] *= factor;
        }

        return this;
    }

    // Normalizes this vector in-place and return it
    normalize() {
        let length = this.vectorLength();
        return length === 0 ? this.set([0.0, 0.0, 0.0]) : this.scale(1 / length);
    }

    // Return the length of this vector
    vectorLength() {
        return Math.hypot(this[0], this[1], this[2]);
    }

    // Return the dot product of this vector and other
    dot(other) {
        console.assert(other instanceof Vector3, 'dot(): argument must be a Vector3');

        let result = 0;
        for (let i = 0; i < Vector3.N; i++) {
            result += this[i] * other[i];
        }
        return result;
    }

    // Return the cross product of this vector and other
    cross(other) {
        console.assert(other instanceof Vector3, 'cross(): argument must be a Vector3');

        return new Vector3([
            this[1] * other[2] - this[2] * other[1],
            this[2] * other[0] - this[0] * other[2],
            this[0] * other[1] - this[1] * other[0]
        ]);
    }

    // Linearly interpolate between vectors a and b by t
    static lerp(a, b, t) {
        console.assert(a instanceof Vector3, 'lerp(): a must be a Vector3');
        console.assert(b instanceof Vector3, 'lerp(): b must be a Vector3');
        console.assert(!Number.isNaN(t) && 0.0 <= t && t <= 1.0, 'lerp(): t must be >= 0.0 and <= 1.0');

        return a.clone().scale(1.0 - t).add(b.clone().scale(t));
    }

    // Return string representation of this vector
    toString() {
        return `(${this[0].toFixed(2)}, ${this[1].toFixed(2)}, ${this[2].toFixed(2)})`;
    }
    
}