precision mediump float;

// --- Uniforms for light 01 ---
uniform vec3 light01;
uniform vec3 ambient01;
uniform vec3 diffuse01;
uniform vec3 specular01;
uniform float shininess01;

// --- Uniforms for light 02 ---
uniform vec3 light02;
uniform vec3 ambient02;
uniform vec3 diffuse02;
uniform vec3 specular02;
uniform float shininess02;

// --- Uniforms Uniforms for surface ---
uniform sampler2D uTexture;
uniform float u_emission;

// --- Varyings from vertex shader ---
varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexture;

// --- Lighting calculation helper function ---
void calcLighting (in vec3 N, in vec3 P, in vec3 l, in vec3 a, in vec3 d, in vec3 s, in float shine, out vec3 lighting) {
    vec3 L = normalize(l - P); 
    vec3 V = normalize(-P);
    vec3 R = reflect(-L, N);

    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(R, V), 0.0), shine);

    lighting = a + (d * diff) + (s * spec);
}

// --- Main fragment shader function ---
void main() {
    vec3 N = normalize(fNormal);
    vec3 P = fPosition;

    // Calculate lighting contributions from both lights
    vec3 lighting01;
    calcLighting(N, P, light01, ambient01, diffuse01, specular01, shininess01, lighting01);

    vec3 lighting02;
    calcLighting(N, P, light02, ambient02, diffuse02, specular02, shininess02, lighting02);

    // Total lighting plus emission
    vec3 lighting = lighting01 + lighting02;
    lighting += u_emission;

    // Sample surface texture
    vec2 texCoords = vec2(fTexture.x, fTexture.y);
    vec4 textureColor = texture2D(uTexture, texCoords);

    // Edge alpha falloff (distance-based)
    float dist = length(P);
    float radius = 1.0;
    float edgeSoftness = 1.0;

    // Compute smooth alpha falloff near edge
    float alpha = 1.0 - smoothstep(radius * (1.0 - edgeSoftness), radius, dist);
    gl_FragColor = vec4(lighting * textureColor.rgb, alpha);
}