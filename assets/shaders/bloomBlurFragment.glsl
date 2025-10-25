precision mediump float;

// --- Uniforms for bloom blur ---
uniform sampler2D uTexture;
uniform vec2 uDirection;

// --- Varyings from vertex shader ---
varying vec2 vTexCoord;

// --- Main fragment shader function ---
void main() {
    float weights[5];
    weights[0] = 0.227027;
    weights[1] = 0.1945946;
    weights[2] = 0.1216216;
    weights[3] = 0.054054;
    weights[4] = 0.016216;

    vec3 color = texture2D(uTexture, vTexCoord).rgb * weights[0];

    for (int i = 1; i < 5; ++i) {
        color += texture2D(uTexture, vTexCoord + uDirection * float(i) * 0.005).rgb * weights[i];
        color += texture2D(uTexture, vTexCoord - uDirection * float(i) * 0.005).rgb * weights[i];
    }
    
    gl_FragColor = vec4(color, 1.0);
}