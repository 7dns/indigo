precision mediump float;

// --- Uniforms ---
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform mat3 uNormal;

// --- Attributes ---
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexture;

// --- Varyings ---
varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexture;
varying float v_depth;

// --- Main vertex shader function ---
void main() {
	mat4 modelView = uView * uModel;
	vec4 viewPosition = modelView * vec4(aPosition, 1.0);

	vec3 N = normalize(uNormal * aNormal);

	fPosition = viewPosition.xyz / viewPosition.w;
	fNormal = N;
	fTexture = aTexture;

	v_depth = abs(viewPosition.z);
	gl_Position = uProjection * viewPosition;
}
