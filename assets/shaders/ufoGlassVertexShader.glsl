precision mediump float;

// --- Vertex attributes ---
attribute vec4 aPosition;

// --- Uniforms ---
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

// --- Main fragment shader function ---
void main() {
    gl_Position = uProjection * uView * uModel * aPosition;
}
