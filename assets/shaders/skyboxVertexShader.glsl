// --- Attributes ---
attribute vec3 aPos;// Vertex position of the skybox cube

// --- Uniforms ---
uniform mat4 projection;
uniform mat4 view;

// --- Varyings for fragment shader --- 
varying vec3 vTexCoords;

// --- Main vertex shader function ---
void main() {
    vTexCoords = vec3(aPos.x, -aPos.y, aPos.z);
    mat4 rotView = mat4(mat3(view));
    gl_Position = projection * rotView * vec4(aPos, 1.0);
}