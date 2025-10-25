import { Matrix2 } from './Matrix2.mjs';
import { Matrix4 } from './Matrix4.mjs';

// A 3x3 matrix class extending Float32Array
export class Matrix3 extends Float32Array {

    // Matrix dimension (3x3)
    static N = 3;
    static Nsquared = Matrix3.N * Matrix3.N;

    // Constructor: if an array of 9 elements is provided, use it.
    // if an Matrix4 is provided, basically m.getMinor(3, 3)
    // Otherwise, initialize as identity matrix.
    constructor(m) {
        super(Matrix3.Nsquared);

        if (m instanceof Matrix4) {
            this.set([
                m[0], m[4], m[8],
                m[1], m[5], m[9],
                m[2], m[6], m[10]
            ]);
        } else if (Array.isArray(m) && m.length === Matrix3.Nsquared) {
            this.set(m);
        } else {
            this.identity();
        }
    }

    // Return a copy of this matrix
    clone() {
        return new Matrix3().set(this);
    }

    // Set matrix elements directly from an array of 9 values in row-major order
    set(values) {
        console.assert(
            values instanceof Matrix3 ||
            (Array.isArray(values) && values.length == Matrix3.Nsquared),
            'set(): argument must be a Matrix3 or an array of length 9'
        );

        if (values instanceof Matrix3) {
            for (let i = 0; i < Matrix3.Nsquared; i++) {
                this[i] = values[i];
            }
            return this;
        }

        this[0] = values[0];    this[3] = values[1];    this[6] = values[2];
        this[1] = values[3];    this[4] = values[4];    this[7] = values[5];
        this[2] = values[6];    this[5] = values[7];    this[8] = values[8];
        
        return this;
    }

    // Reset the matrix to the identity matrix
    identity() {
        this[0] = 1; this[3] = 0; this[6] = 0;
        this[1] = 0; this[4] = 1; this[7] = 0;
        this[2] = 0; this[5] = 0; this[8] = 1;
        return this;
    }
 
    // Multiply the matrix by a scalar and return the modified matrix
    scale(factor) {
        console.assert(!Number.isNaN(factor), 'scale(): argument must be a number');

        for (let i = 0; i < Matrix3.Nsquared; i++) {
            this[i] = this[i] * factor;
        }

        return this;
    }

    // Multiply this matrix by another Matrix3 and return the result as a new Matrix3
    multiply(other) {
        console.assert(other instanceof Matrix3, 'multiply(): argument must be a Matrix3');

        const N = Matrix3.N;
        let result = new Matrix3();
        
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

    // Multiply this matrix by another Matrix3 and return the product as a new matrix
    multiplied(other) {
        console.assert(other instanceof Matrix3, 'multiplied(): argument must be a Matrix3');
        return this.clone().multiply(other);
    }

    // Calculate the determinant using the Leibniz formula
    determinant() {
        return (
            this[0] * this[4] * this[8] +
            this[3] * this[7] * this[2] +
            this[6] * this[1] * this[5] -
            this[6] * this[4] * this[2] -
            this[3] * this[1] * this[8] -
            this[0] * this[7] * this[5]
        );
    }

    // Return a new matrix which is the transpose of this matrix
    transpose() {
        const N = Matrix3.N;
        let temp = new Matrix3();

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {    
                temp[c * N + r] = this[r * N + c];
            }
        }

        return temp;
    }

    // Transpose the matrix in-place
    transposeInPlace() {
        this.set(this.transpose());
        return this;
    }
    
    // Return the minor matrix after removing given row and column
    getMinor(row, column) {
        console.assert(!Number.isNaN(row), 'getMinor(): row must be a number');
        console.assert(!Number.isNaN(column), 'getMinor(): column must be a number');

        const N = Matrix3.N;
        let temp = [];
    
        for (let r = 0; r < N; r++) {
            if (r === row) { continue; }
            for (let c = 0; c < N; c++) {
                if (c === column) { continue; }
                temp.push(this[c * N + r]);
            }
        }
    
        return new Matrix2(temp);
    }

    // Return the cofactor matrix
    getCofactor() {
        const N = Matrix3.N;
        let temp = new Matrix3();

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                let minor = this.getMinor(r, c);
                let sign = ((r + c) % 2 === 0) ? 1 : -1;
                let cofactor = sign * minor.determinant();
    
                temp[c * N + r] = cofactor;
            }
        }

        return temp;
    }

    // Return the adjugate (transpose of cofactor) matrix
    getAdjugate() {
        return this.getCofactor().transpose();
    }

    // Check if the matrix is invertible
    isInvertible(epsilon = 1e-8) {
        console.assert(!Number.isNaN(epsilon), 'isInvertible(): argument must be a number');
        return Math.abs(this.determinant()) > epsilon;
    }

    // Return a new matrix which is the inverse of this matrix
    inverse() {
        console.assert(this.isInvertible(), 'inverse(): Matrix is not invertible (det ≈ 0)');
    
        const adjugate = this.getAdjugate();
        const det = this.determinant();
    
        adjugate.scale(1 / det);
    
        return adjugate;
    }

    // Print the matrix in row-major order
    printRowMajor() {
        const N = Matrix3.N;
        let string = '';
    
        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                string += this[col * N + row].toFixed(2) + ' ';
            }
            string = string.trim();
            string += '\n';
        }
    
        return string;
    }
    
}
