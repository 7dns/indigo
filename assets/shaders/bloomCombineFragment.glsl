precision mediump float;

// --- Uniforms for input textures ---
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uBloomIntensity;

// --- Varyings from vertex shader ---
varying vec2 vTexCoord;

// ---  Main fragment shader function --- 
void main() {
    // Sample the scene and bloom textures
    vec3 sceneColor = texture2D(uScene, vTexCoord).rgb;
    vec3 bloomColor = texture2D(uBloom, vTexCoord).rgb * 1.0;

    gl_FragColor = vec4(sceneColor + bloomColor, 1.0);
}
