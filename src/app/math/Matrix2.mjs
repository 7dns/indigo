// A 2x2 matrix class extending Float32Array
export class Matrix2 extends Float32Array {

    // Matrix dimension (2x2)
    static N = 2;
    static Nsquared = Matrix2.N * Matrix2.N;

    // Constructor: if an array of 4 elements is provided, use it.
    // Otherwise, initialize as identity matrix.
    constructor(m) { 
        super(Matrix2.Nsquared);

        if (m && m.length === Matrix2.Nsquared) {
            this.set(m);
        } else {
            this.identity();
        }
    }

    // Return a copy of this matrix
    clone() {
        return new Matrix2().set(this);
    }

    // Set matrix elements directly from an array of 4 values in row-major order
    set(values) {
        console.assert(
            values instanceof Matrix2 ||
            (Array.isArray(values) && values.length === Matrix2.Nsquared),
            'set(): argument must be a Matrix2 or an array of length 4'
        );

        if (values instanceof Matrix2) {
            for (let i = 0; i < Matrix2.Nsquared; i++) {
                this[i] = values[i];
            }
            return this;
        }

        this[0] = values[0];    this[2] = values[1];
        this[1] = values[2];    this[3] = values[3];
        return this;
    }

    // Reset the matrix to the identity matrix
    identity() {
        this[0] = 1; this[2] = 0;
        this[1] = 0; this[3] = 1;
        return this;
    }

    // Multiply the matrix by a scalar and return the modified matrix
    scale(factor) {
        console.assert(!Number.isNaN(factor), 'scale(): argument must be a number');

        for (let i = 0; i < Matrix2.Nsquared; i++) {
            this[i] *= factor;
        }
        return this;
    }

    // Multiply this matrix by another Matrix2 and return the result as a new Matrix2
    multiply(other) {
        console.assert(other instanceof Matrix2, 'multiply(): argument must be a Matrix2');

        const N = Matrix2.N;
        let result = new Matrix2();
        
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

    // Multiply this matrix by another Matrix2 and return the product as a new matrix
    multiplied(other) {
        console.assert(other instanceof Matrix2, 'multiplied(): argument must be a Matrix2');
        return this.clone().multiply(other);
    }

    // Calculate the determinant using the Leibniz formula
    determinant() {
        return (
            this[0] * this[3] -
            this[1] * this[2]
        );
    }

    // Print the matrix in row-major order
    printRowMajor() {
        const N = Matrix2.N;
        let string = '';
        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                string += this[col * N + row].toFixed(2) + ' ';
            }
            string += '\n';
        }
        return string;
    }

}
