// Loads and returns shader source code from a given URI
export async function loadShaderSource(uri) {
    console.assert(typeof uri === 'string', 'loadShaderSource(): uri must be a string');
    const response = await fetch(`assets/shaders/${uri}`);
    return await response.text();
}