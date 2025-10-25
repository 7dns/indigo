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

// --- Uniforms for cubemap reflection ---
uniform samplerCube uCubemap;

// --- Uniforms for fog ---
uniform vec4 u_fogColor;    // Fog color
uniform float u_fogNear;    // Fog start distance
uniform float u_fogFar;     // Fog end distance

// --- Varyings from vertex shader ---
varying vec3 fPosition;
varying vec3 fNormal;
varying float v_depth;

// --- Function to calculate lighting ---
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
    vec3 V = normalize(-P);

    vec3 lighting01;
    calcLighting(N, P, light01, ambient01, diffuse01, specular01, shininess01, lighting01);

    vec3 lighting02;
    calcLighting(N, P, light02, ambient02, diffuse02, specular02, shininess02, lighting02);

    vec3 lighting = lighting01 + lighting02;
    vec3 reflected = reflect(-V, N);
    vec3 reflectedColor = textureCube(uCubemap, reflected).rgb;
    vec3 finalColor = reflectedColor * lighting;

    float fogFactor = smoothstep(u_fogNear, u_fogFar, v_depth);
    finalColor = mix(finalColor, u_fogColor.rgb, fogFactor);     // Apply fog effect

    gl_FragColor = vec4(finalColor, 1.0);
}