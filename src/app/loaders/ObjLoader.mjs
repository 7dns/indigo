import { Vector2 }  from '../math/Vector2.mjs';
import { Vector3 }  from '../math/Vector3.mjs';

// Loads a Wavefront OBJ file and returns interleaved vertex data as a Float32Array
// Supports positions (v), UVs (vt), and normals (vn)
export async function loadObj(uri) {
    console.assert(typeof uri === 'string', 'loadObj(): uri must be a string');

    let vboData = [];
    let geometricVertices = [];     // v
    let textureCoordinates = [];    // vt
    let vertexNormals = [];         // vn

    // Read OBJ file
    let response = await fetch(uri);
    let text = await response.text();

    // Convert text file into a list of lines
    let lines = text.split(/\r*\n/);

    // Split each line into its components
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim().split(/\s+/);
        
        switch (line[0]) {
            // For lines starting with v, vn, or vt, store the data in separate lists
            case 'v':
                geometricVertices.push(
                    new Vector3([parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])])
                );
                break;
            case 'vt':
                textureCoordinates.push(
                    new Vector2([parseFloat(line[1]), parseFloat(line[2])])
                );
                break;
            case 'vn':
                vertexNormals.push(
                    new Vector3([parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])])
                );
                break;
            // For lines starting with f, use the respective indices to read data
            // from the separate lists and write it into a VBO
            case 'f':
                for (let i = 0; i < 3; i++) {
                    let idx = line[1 + i].split('/');
                    let v = geometricVertices[parseInt(idx[0]) - 1];
                    let vt = textureCoordinates[parseInt(idx[1]) - 1];
                    let vn = vertexNormals[parseInt(idx[2]) - 1];

                    vboData.push(v[0], v[1], v[2]);
                    vboData.push(vt[0], vt[1]);
                    vboData.push(vn[0], vn[1], vn[2]);
                }
                break;
            default:
                continue;
        }
    }

    return new Float32Array(vboData);
}