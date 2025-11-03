// Utility Functions for GLSL Shaders

// Remap a value from one range to another
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// Clamp and remap
float remapClamp(float value, float inMin, float inMax, float outMin, float outMax) {
    return clamp(remap(value, inMin, inMax, outMin, outMax), min(outMin, outMax), max(outMin, outMax));
}

// Smooth step with custom edge values
float smoothstep01(float edge0, float edge1, float x) {
    return smoothstep(edge0, edge1, x);
}

// Rotation matrix 2D
mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

// Rotation matrix 3D around X axis
mat3 rotateX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

// Rotation matrix 3D around Y axis
mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

// Rotation matrix 3D around Z axis
mat3 rotateZ(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, -s, 0.0,
        s, c, 0.0,
        0.0, 0.0, 1.0
    );
}

// Random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Random function for vec3
float random(vec3 st) {
    return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453123);
}

// Fractal Brownian Motion
float fbm(vec2 st, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < octaves; i++) {
        value += amplitude * random(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Distance functions
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float sdCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// UV manipulation
vec2 rotateUV(vec2 uv, float rotation) {
    float mid = 0.5;
    return vec2(
        cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
        cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
    );
}

vec2 scaleUV(vec2 uv, vec2 scale) {
    return (uv - 0.5) * scale + 0.5;
}

// Easing functions
float easeInQuad(float t) {
    return t * t;
}

float easeOutQuad(float t) {
    return 1.0 - (1.0 - t) * (1.0 - t);
}

float easeInOutQuad(float t) {
    return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0;
}

float easeInCubic(float t) {
    return t * t * t;
}

float easeOutCubic(float t) {
    return 1.0 - pow(1.0 - t, 3.0);
}

float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

// Palette generation
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}