precision mediump float;

// --- Uniforms ---
uniform sampler2D u_texture;

// --- Uniforms for fog ---
uniform vec4 u_fogColor;
uniform float u_fogAmount;

// --- Varyings from vertex shader ---
varying vec2 v_texcoord;
varying vec4 v_position;

// --- Main fragment shader function ---
void main() {
    vec4 color = texture2D(u_texture, v_texcoord);

    float depth = abs(v_position.z);

    // Calculate fog factor based on depth
    float fogNear = 2.0;
    float fogFar = 10.0;
    float fogFactor = clamp((depth - fogNear) / (fogFar - fogNear), 0.0, 1.0);
    fogFactor *= u_fogAmount;

    // Mix the color with the fog color
    gl_FragColor = mix(color, u_fogColor, fogFactor);
}