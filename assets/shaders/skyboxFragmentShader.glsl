precision mediump float;

// --- Uniforms for texture ---
uniform samplerCube skyboxSampler;

// --- Fog uniforms ---
uniform vec4 u_fogColor;
uniform float u_fogNear;
uniform float u_fogFar;
uniform vec3 u_cameraPos;

// --- Varyings from vertex shader --
varying vec3 vTexCoords;

// --- Main fragment shader function ---
void main() {
    vec4 color = textureCube(skyboxSampler, vTexCoords);

    float depth = length(vTexCoords);
    float fogAmount = smoothstep(u_fogNear, u_fogFar, depth);
    
    gl_FragColor = mix(color, u_fogColor, fogAmount);
}
