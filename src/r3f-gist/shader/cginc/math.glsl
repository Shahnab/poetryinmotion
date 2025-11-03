// Mathematical Functions for GLSL Shaders

#ifndef PI
#define PI 3.14159265359
#endif

#ifndef TWO_PI
#define TWO_PI 6.28318530718
#endif

#ifndef HALF_PI
#define HALF_PI 1.5707963267949
#endif

#ifndef INV_PI
#define INV_PI 0.31830988618
#endif

// Constants
const float EPSILON = 1e-6;
const float GOLDEN_RATIO = 1.618033988749895;
const float EULER = 2.718281828459045;

// Extended math functions
float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

vec2 saturate(vec2 x) {
    return clamp(x, 0.0, 1.0);
}

vec3 saturate(vec3 x) {
    return clamp(x, 0.0, 1.0);
}

vec4 saturate(vec4 x) {
    return clamp(x, 0.0, 1.0);
}

// Lerp functions
float lerp(float a, float b, float t) {
    return a + (b - a) * t;
}

vec2 lerp(vec2 a, vec2 b, float t) {
    return a + (b - a) * t;
}

vec3 lerp(vec3 a, vec3 b, float t) {
    return a + (b - a) * t;
}

vec4 lerp(vec4 a, vec4 b, float t) {
    return a + (b - a) * t;
}

// Inverse lerp
float invLerp(float a, float b, float v) {
    return (v - a) / (b - a);
}

// Power functions
float pow2(float x) {
    return x * x;
}

float pow3(float x) {
    return x * x * x;
}

float pow4(float x) {
    float x2 = x * x;
    return x2 * x2;
}

float pow5(float x) {
    float x2 = x * x;
    return x2 * x2 * x;
}

// Safe operations
float safeDivide(float a, float b) {
    return a / (b + EPSILON);
}

float safeAcos(float x) {
    return acos(clamp(x, -1.0, 1.0));
}

float safeAsin(float x) {
    return asin(clamp(x, -1.0, 1.0));
}

float safeSqrt(float x) {
    return sqrt(max(0.0, x));
}

// Angle functions
float normalizeAngle(float angle) {
    return mod(angle + PI, TWO_PI) - PI;
}

float angleDifference(float a, float b) {
    return normalizeAngle(a - b);
}

// Vector operations
vec3 perpendicular(vec3 v) {
    return abs(v.z) < 0.9 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
}

vec3 tangent(vec3 v) {
    return normalize(cross(v, perpendicular(v)));
}

vec3 bitangent(vec3 v, vec3 t) {
    return cross(v, t);
}

// Matrix operations
mat3 lookAt(vec3 forward, vec3 up) {
    vec3 right = normalize(cross(forward, up));
    up = cross(right, forward);
    return mat3(right, up, -forward);
}

// Spherical coordinates
vec3 sphericalToCartesian(float radius, float theta, float phi) {
    float sinPhi = sin(phi);
    return vec3(
        radius * sinPhi * cos(theta),
        radius * cos(phi),
        radius * sinPhi * sin(theta)
    );
}

vec3 cartesianToSpherical(vec3 cart) {
    float radius = length(cart);
    float theta = atan(cart.z, cart.x);
    float phi = acos(cart.y / radius);
    return vec3(radius, theta, phi);
}

// Quaternion operations
vec4 quatFromAxisAngle(vec3 axis, float angle) {
    float halfAngle = angle * 0.5;
    float sinHalf = sin(halfAngle);
    return vec4(axis * sinHalf, cos(halfAngle));
}

vec3 quatRotate(vec4 q, vec3 v) {
    vec3 qvec = q.xyz;
    vec3 uv = cross(qvec, v);
    vec3 uuv = cross(qvec, uv);
    return v + ((uv * q.w) + uuv) * 2.0;
}

// Hash functions
float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
}