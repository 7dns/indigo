// A 2-dimensional vector class extending Float32Array
export class Vector2 extends Float32Array {

    // Vector dimension
    static N = 2;

    static ORIGIN   = new Vector2([ 0.0,  0.0]);
    static UP       = new Vector2([ 0.0,  1.0]);
    static DOWN     = new Vector2([ 0.0, -1.0]);
    static RIGHT    = new Vector2([ 1.0,  0.0]);
    static LEFT     = new Vector2([-1.0,  0.0]);

    // Constructor: if an array of 2 elements is provided, use it.
    // Otherwise, initialize as an Vector with all elements set to 0.0
    constructor(v) {
        super(Vector2.N);

        if (Array.isArray(v) && v.length === Vector2.N) {
            this.set(v);
        } else {
            this.set([0.0, 0.0]);
        }
    }

    // Return a copy of this vector
    clone() {
        return new Vector2([this[0], this[1]]);
    }

    // Set vector elements directly from an array of 2 values
    set(values) {
        console.assert(Array.isArray(values) && values.length == Vector2.N, 'set(): argument must be an array of length 2');

        for (let i = 0; i < Vector2.N; i++) {
            this[i] = values[i];
        }

        return this;
    }

    // Add another Vector2 to this vector in-place and return the modified vector
    add(other) {
        console.assert(other instanceof Vector2, 'add(): argument must be a Vector2');

        for (let i = 0; i < Vector2.N; i++) {
            this[i] += other[i];
        }

        return this;
    }

    // Subtract another Vector2 from this vector in-place and return the modified vector
    subtract(other) {
        console.assert(other instanceof Vector2, 'subtract(): argument must be a Vector2');

        for (let i = 0; i < Vector2.N; i++) {
            this[i] -= other[i];
        }

        return this;
    }
    
    // Scales this vector in-place by factor
    scale(factor) {
        console.assert(!Number.isNaN(factor), 'scale(): argument must be a number');

        for (let i = 0; i < Vector2.N; i++) {
            this[i] *= factor;
        }

        return this;
    }
    
    // Normalizes this vector in-place and return it
    normalize() {
        let length = this.vectorLength();
        return length === 0 ? this.set([0, 0]) : this.scale(1 / length);
    }    

    // Return the length of this vector
    vectorLength() {
        return Math.hypot(this[0], this[1]);
    }

    // Return the dot product of this vector and other
    dot(other) {
        console.assert(other instanceof Vector2, 'dot(): argument must be a Vector2');

        let result = 0;
        for (let i = 0; i < Vector2.N; i++) {
            result += this[i] * other[i];
        }
        return result;
    }
    
    // Return string representation of this vector
    toString() {
        return `(${this[0].toFixed(2)}, ${this[1].toFixed(2)})`;
    }
    
}