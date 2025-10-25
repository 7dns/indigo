precision mediump float;

// --- Uniforms for scene texture and brightness threshold ---
uniform sampler2D uScene;
uniform float uThreshold;

// --- Varyings from vertex shader ---
varying vec2 vTexCoord;

// --- Main fragment shader function ---
void main() {
    // Sample the scene color
    vec4 color = texture2D(uScene, vTexCoord);

    // Calculate perceived brightness using luminance formula
    float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    gl_FragColor = (brightness > uThreshold) ? color : vec4(0.0);
}
