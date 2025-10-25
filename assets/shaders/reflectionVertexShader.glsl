// --- Vertex attributes ---
attribute vec3 aPosition;
attribute vec3 aNormal;

//--- Uniforms ---
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform mat3 uNormal;

// --- Varyings to fragment shader ---
varying vec3 fPosition;
varying vec3 fNormal;

varying float v_depth; // Depth value for fog


// --- Main vertex shader function ---
void main() {
	mat4 modelView = uView * uModel;
	vec4 viewPosition = modelView * vec4(aPosition, 1.0);

	fPosition = viewPosition.xyz / viewPosition.w;
	fNormal = normalize(uNormal * aNormal);

	v_depth = abs(viewPosition.z);
	gl_Position = uProjection * viewPosition;
}