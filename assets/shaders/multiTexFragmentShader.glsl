precision mediump float;

// --- Uniforms for lighting ---
uniform vec3 light01;
uniform vec3 ambient01;
uniform vec3 diffuse01;
uniform vec3 specular01;
uniform float shininess01;

uniform vec3 light02;
uniform vec3 ambient02;
uniform vec3 diffuse02;
uniform vec3 specular02;
uniform float shininess02;

// --- Uniforms for textures ---
uniform sampler2D uTexDay;
uniform sampler2D uTexOcean;
uniform sampler2D uTexClouds;

// --- Uniforms for fog ---
uniform vec4 u_fogColor;    // Fog color
uniform float u_fogNear;    // Fog start distance
uniform float u_fogFar;     // Fog end distance

// --- Varyings from vertex shader ---
varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexture;
varying float v_depth;

// --- Function to calculate lighting ---
void calcLighting (in vec3 N, in vec3 P, in vec3 l, in vec3 a, in vec3 d, in vec3 s, in float shine, out vec3 lighting, out float diff, out float spec) {
    vec3 L = normalize(l - P); 
    vec3 V = normalize(-P);
    vec3 R = reflect(-L, N);

    diff = max(dot(N, L), 0.0);
    spec = pow(max(dot(R, V), 0.0), shine);

    lighting = a + (d * diff) + (s * spec);
}

// --- Main fragment shader function ---
void main() {
    vec3 N = normalize(fNormal);
    vec3 P = fPosition;

    vec3 lighting01; float diff01; float spec01;
    calcLighting(N, P, light01, ambient01, diffuse01, specular01, shininess01, lighting01, diff01, spec01);

    vec3 lighting02; float diff02; float spec02;
    calcLighting(N, P, light02, ambient02, diffuse02, specular02, shininess02, lighting02, diff02, spec02);

    vec3 lighting = lighting01 + lighting02;
    float diff = mix(diff01, diff02, 0.5);
    float spec = mix(spec01, spec02, 0.5);

    vec4 dayTexture   = texture2D(uTexDay, fTexture);
    vec4 oceanTexture = texture2D(uTexOcean, fTexture);
    vec4 cloudTexture = texture2D(uTexClouds, fTexture);
   
    vec4 base = vec4(dayTexture.rgb * diff, dayTexture.a);
    base.rgb = mix(base.rgb, cloudTexture.rgb, cloudTexture.a * 0.3);

    vec4 litColor = vec4(lighting * base.rgb, 1.0);
    float fogFactor = smoothstep(u_fogNear, u_fogFar, v_depth);
    vec4 finalColor = mix(litColor, u_fogColor, fogFactor);     // Apply fog effect

    gl_FragColor = finalColor;
}