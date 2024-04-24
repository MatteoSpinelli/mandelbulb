precision mediump float;

varying vec2 pos;

uniform float millis;
uniform vec2 iResolution;
uniform vec2 iMouse;

const int marchingSteps = 80;
const float Power = 8.;

vec3 originTrap = vec3(0.0, 0.0, 0.0);
float planeTrapX = 0.0;
float planeTrapY = 0.0;
float planeTrapZ = 0.0;

float sdSphere(vec3 p, float radius) {
    return length(p) - radius; // distance to a sphere of radius r  
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

vec3 rotate3D(vec3 p, vec3 axis, float angle) {
    return mix(dot(axis, p) * axis, p, cos(angle) + cross(axis, p) * sin(angle));
}

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

float DE(vec3 pos, out float minDistToOrigin, out float minDistToPlaneX, out float minDistToPlaneY, out float minDistToPlaneZ) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;

    minDistToOrigin = 1e20;
    minDistToPlaneX = 1e20;
    minDistToPlaneY = 1e20;
    minDistToPlaneZ = 1e20;

    for(int i = 0; i < 80; i++) {
        r = length(z);
        if(r > 2.)
            break;

        minDistToOrigin = min(minDistToOrigin, length(z - originTrap));
        minDistToPlaneX = min(minDistToPlaneX, abs(z.x - planeTrapX));
        minDistToPlaneY = min(minDistToPlaneY, abs(z.y - planeTrapY));
        minDistToPlaneZ = min(minDistToPlaneZ, abs(z.z - planeTrapZ));

        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, Power - 1.0) * Power * dr + 1.0;

        float zr = pow(r, Power);
        theta = theta * Power;
        phi = phi * Power;

        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += pos;
    }
    return 0.5 * log(r) * r / dr;
}

float map(vec3 p, out float minDistToOrigin, out float minDistToPlaneX, out float minDistToPlaneY, out float minDistToPlaneZ) {
    vec3 bulbPosition = p - vec3(0., 1., 0.);
    bulbPosition.xz *= rotate2D(sin(millis * 0.1));
    bulbPosition.yz *= rotate2D(sin(millis * 0.1));
    float scale = sin(millis * 0.5) * 0.1 + .47;

    float bulb = DE(bulbPosition * scale, minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ) / scale;

    return bulb;
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy * 2. - 1.;
    uv.x = uv.x * (iResolution.x / iResolution.y);
    vec2 m = iMouse.xy / iResolution.xy * 2. - 1.;
    m.x = m.x * (iResolution.x / iResolution.y);

    // initialization step
    vec3 rayOrigin = vec3(0., 1., -3.); // ray origin, aka camera position
    vec3 rayDirection = normalize(vec3(uv, 1));
    vec3 col = vec3(0.);

    rayOrigin.xz *= rotate2D(millis * 0.1);
    rayDirection.xz *= rotate2D(millis * 0.1);

    float t = 0.; // total distance travelled
    float minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ;

    // Raymarching
    int steps = 0;
    for(int i = 0; i < marchingSteps; i++) {
        steps += 1;
        vec3 p = rayOrigin + rayDirection * t; // position along the way

        float d = map(p, minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ);

        t += d;

        if(d < 0.0008 || t > 100.)
            break;

    }

    // coloring 

    if(t > 100.) {
        // paint background
        col = vec3(0.82, 0.9, 0.93);
    } else {

        vec3 baseColor = vec3(0.91, 0.69, 0.11); // Some arbitrary base color

        baseColor = mix(baseColor, vec3(0.28, 0.24, 0.14), clamp(0.1, 0.6, minDistToPlaneX));
        baseColor = mix(baseColor, vec3(0.74, 0.25, 0.25), clamp(0.1, 0.6, minDistToPlaneY));
        baseColor = mix(baseColor, vec3(0.84, 0.68, 0.42), clamp(0.1, 0.6, minDistToPlaneZ));
        float ambientFactor = minDistToOrigin; // Simulating ambient occlusion
        col = baseColor;
        col *= ambientFactor; // Apply ambient occlusion effect
    }

    gl_FragColor = vec4(col, 1.);
}
