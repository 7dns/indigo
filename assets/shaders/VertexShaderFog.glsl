// --- Uniforms ---
uniform mat4 u_matrix;

// --- Attributes ---
attribute vec4 a_position;
attribute vec2 a_texcoord;

// --- Varyings ---
varying vec2 v_texcoord;
varying vec4 v_position;

// --- Main vertex shader function ---
void main() {
	v_texcoord = a_texcoord;
	v_position = gl_Position;

	gl_Position = u_matrix * a_position;
}