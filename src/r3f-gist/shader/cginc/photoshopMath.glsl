// Photoshop Math Functions for GLSL
// Common blend modes and color operations used in digital art

// RGB to HSV conversion
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// HSV to RGB conversion  
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Blend modes
vec3 blendMultiply(vec3 base, vec3 blend) {
    return base * blend;
}

vec3 blendScreen(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) * (1.0 - blend);
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
    vec3 c1 = 2.0 * base * blend + base * base * (1.0 - 2.0 * blend);
    vec3 c2 = sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
    return mix(c1, c2, step(0.5, blend));
}

vec3 blendHardLight(vec3 base, vec3 blend) {
    return blendOverlay(blend, base);
}

// Color dodge
vec3 blendColorDodge(vec3 base, vec3 blend) {
    return mix(min(base / (1.0 - blend), 1.0), 1.0, step(1.0, blend));
}

// Color burn
vec3 blendColorBurn(vec3 base, vec3 blend) {
    return mix(max((1.0 - ((1.0 - base) / blend)), 0.0), 0.0, step(0.0, blend));
}

// Darken
vec3 blendDarken(vec3 base, vec3 blend) {
    return min(base, blend);
}

// Lighten
vec3 blendLighten(vec3 base, vec3 blend) {
    return max(base, blend);
}

// Linear burn
vec3 blendLinearBurn(vec3 base, vec3 blend) {
    return max(base + blend - 1.0, 0.0);
}

// Linear dodge (add)
vec3 blendLinearDodge(vec3 base, vec3 blend) {
    return min(base + blend, 1.0);
}

// Vivid light
vec3 blendVividLight(vec3 base, vec3 blend) {
    return mix(blendColorBurn(base, 2.0 * blend), blendColorDodge(base, 2.0 * (blend - 0.5)), step(0.5, blend));
}

// Pin light
vec3 blendPinLight(vec3 base, vec3 blend) {
    return mix(blendDarken(base, 2.0 * blend), blendLighten(base, 2.0 * (blend - 0.5)), step(0.5, blend));
}

// Difference
vec3 blendDifference(vec3 base, vec3 blend) {
    return abs(base - blend);
}

// Exclusion
vec3 blendExclusion(vec3 base, vec3 blend) {
    return base + blend - 2.0 * base * blend;
}

// Luminosity blend mode helper
float luminosity(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
}

// Saturation helper
float saturation(vec3 c) {
    return max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b);
}