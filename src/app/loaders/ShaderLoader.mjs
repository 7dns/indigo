// Loads and returns shader source code from a given URI
export async function loadShaderSource(uri) {
    console.assert(typeof uri === 'string', 'loadShaderSource(): uri must be a string');
    const response = await fetch(`assets/shaders/${uri}`);
    console.log(response.status, response.headers.get('content-type'));
    const text = await response.text();
    console.log(text);
    return text;
}