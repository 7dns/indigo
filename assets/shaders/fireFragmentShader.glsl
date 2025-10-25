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

// --- Uniforms for procedural texture ---
uniform vec2 resolution;   // Viewport resolution (width, height)
uniform float time;        // Animation time
uniform sampler2D texture; // Noise texture

// --- Uniforms for fog ---
uniform vec4 u_fogColor;   // Fog color
uniform float u_fogNear;   // Fog start distance
uniform float u_fogFar;    // Fog end distance

// --- Varyings from vertex shader ---
varying vec3 fPosition;
varying vec3 fNormal;
varying float v_depth;     // Depth value for fog

// --- Hash function for pseudo-randomness ---
void hash(in vec2 coordinates, out float result) {
    result = fract(sin(dot(coordinates, vec2(12.0, 4.0))) * 42000.0);
}

// --- 2D rotation matrix ---
void createRotationMatrix(in float angle, out mat2 result) {
    float cosine = cos(angle);
    float sinus = sin(angle);
    result = mat2(cosine, -sinus, sinus, cosine);
}

// --- Compute gradient of the noise field at a point ---
void computeNoiseGradient(in vec2 point, out vec2 gradient) {
    float epsilon = 0.1;
    float dx, dy;
    float s1, s2;

    s1 = texture2D(texture, vec2(point.x + epsilon, point.y) * 0.01).x;
    s2 = texture2D(texture, vec2(point.x - epsilon, point.y) * 0.01).x;
    dx = s1 - s2;

    s1 = texture2D(texture, vec2(point.x, point.y + epsilon) * 0.01).x;
    s2 = texture2D(texture, vec2(point.x, point.y - epsilon) * 0.01).x;
    dy = s1 - s2;

    gradient = vec2(dx, dy);
}

// --- Main algorithm ---
// Uses multiple layers of noise and gradients to create animated movement
void computeFlowField(in vec2 positionIn, out float flowValue) {
    float layerScale = 2.0;
    flowValue = 0.0;
    vec2 basePosition = positionIn;
    vec2 position = positionIn;

    for (int i = 1; i < 4; i++) {
        position += time * 0.5;
        basePosition += time * 2.0;

        // Get the noise gradient and rotate it for more dynamic flow
        vec2 gradient;
        computeNoiseGradient(float(i) * position * 0.25 + time, gradient);
        mat2 rotation;
        createRotationMatrix(time * 5.0 - (0.05 * position.x + 0.025 * position.y) * 45.0, rotation);
        gradient *= rotation;
        position += gradient * 0.5;

        // Layer intensity modulates the brightness
        float noiseValue = texture2D(texture, position * 0.01).x;
        float layerIntensity = sin(noiseValue * 7.0) * 0.5 + 0.5;
        flowValue += layerIntensity / layerScale;

        // Blend base and current position for organic movement
        position = mix(basePosition, position, 0.75);
        layerScale *= 1.5;
        position *= 2.0;
        basePosition *= 2.0;
    }
}

// --- Render the texture and apply fog ---
void renderFlowImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalize coordinates to [-0.5, 0.5] and correct aspect ratio
    vec2 uv = fragCoord / resolution - 0.5;
    uv.x *= resolution.x / resolution.y;
    uv *= 5.0; // Zoom in for more detail

    // Compute the field value
    float flowField;
    computeFlowField(uv, flowField);

    // Base fire color, then modulate by flow field for brightness
    vec3 baseColor = vec3(0.25, 0.075, 0.05);
    vec3 color = pow(baseColor / flowField, vec3(1.5));

    fragColor = vec4(color, 1.0);
}

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
    vec4 baseColor;
    renderFlowImage(baseColor, gl_FragCoord.xy);

    vec3 N = normalize(fNormal);
    vec3 P = fPosition;

    vec3 lighting01;
    calcLighting(N, P, light01, ambient01, diffuse01, specular01, shininess01, lighting01);

    vec3 lighting02;
    calcLighting(N, P, light02, ambient02, diffuse02, specular02, shininess02, lighting02);

    vec3 lighting = lighting01 + lighting02;
    
    vec4 litColor = vec4(lighting * baseColor.rgb, 1.0);
    float fogFactor = smoothstep(u_fogNear, u_fogFar, v_depth);
    vec4 finalColor = mix(litColor, u_fogColor, fogFactor);     // Apply fog effect

    gl_FragColor = finalColor;
}
