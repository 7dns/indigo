precision mediump float;

// --- Vertex attributes ---
attribute vec2 aPosition;

// --- Varyings to fragment shader ---
varying vec2 vTexCoord;

// --- Main vertex shader function ---
void main() {
    vTexCoord = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
