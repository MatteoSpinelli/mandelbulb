precision mediump float;

varying vec2 pos;

uniform float millis;
uniform vec2 iResolution;
uniform vec2 dir;
uniform vec2 iMouse;

const int marchingSteps = 80;
const int marchingStepsShadow = 50;

vec3 originTrap = vec3(0.0, 0.0, 0.0);
float planeTrapX = 0.0;
float planeTrapY = 0.0;
float planeTrapZ = 0.0;

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

    float power = 8.;

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
        dr = pow(r, power - 1.0) * power * dr + 1.0;

        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;

        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += pos;
    }
    return 0.5 * log(r) * r / dr;
}

float map(vec3 p, out float minDistToOrigin, out float minDistToPlaneX, out float minDistToPlaneY, out float minDistToPlaneZ) {
    vec3 bulbPosition = p - vec3(0., 1., 0.);
    float scale = 1.;

    float bulb = DE(bulbPosition * scale, minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ) / scale;

    return bulb;
}

float softshadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    float minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ;
    for(int i = 0; i < marchingStepsShadow; i++) {
        float h = map(ro + rd * t, minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ);
        if(h < 0.000009)
            return 0.0;
        res = min(res, k * h / t);
        t += h;
        if(t >= maxt)
            break;
    }
    return res;
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy * 2. - 1.;
    uv.x = uv.x * (iResolution.x / iResolution.y);
    vec2 m = iMouse.xy / iResolution.xy;
    m.x = m.x * (iResolution.x / iResolution.y);

    vec3 lightSource = vec3(-3., 0., -10.);

    // initialization step
    vec3 rayOrigin = vec3(dir.x, 1., dir.y); // ray origin, aka camera position
    vec3 rayDirection = normalize(vec3(uv, 1));
    vec3 col = vec3(0.);

    rayOrigin.xz *= rotate2D(iMouse.x / 100.);
    rayDirection.xz *= rotate2D(iMouse.x / 100.);
    rayOrigin.yz *= rotate2D(iMouse.y / 100.);
    rayDirection.yz *= rotate2D(iMouse.y / 100.);

    float t = 0.; // total distance travelled
    float minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ;

    // Raymarching
    int steps = 0;
    vec3 p;
    for(int i = 0; i < marchingSteps; i++) {
        steps += 1;
        p = rayOrigin + rayDirection * t; // position along the way

        float d = map(p, minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ);

        t += d;

        if(d < 0.00008 || t > 100.)
            break;

    }
    float shadow = 1.;
    if(t < 100.) {
        rayOrigin = p;
        rayDirection = normalize(lightSource - rayOrigin);
        shadow = softshadow(rayOrigin, rayDirection, 0.001, 100., 8.);
    }

    // coloring 

    if(t > 100.) {
        // paint background
        col = exp(uv.y - 2.0) * vec3(0.4, 1.6, 1.0);
    } else {

        vec3 baseColor = vec3(0.91, 0.69, 0.11); // Some arbitrary base color
        baseColor = mix(baseColor, vec3(0.28, 0.24, 0.14), clamp(minDistToPlaneX, 0.01, 0.6));
        baseColor = mix(baseColor, vec3(0.74, 0.25, 0.25), clamp(minDistToPlaneY, 0.01, 0.6));
        baseColor = mix(baseColor, vec3(0.84, 0.68, 0.42), clamp(minDistToPlaneZ, 0.01, 0.6));
        float ambientFactor = clamp(minDistToOrigin, 0.01, 1.3); // Simulating ambient occlusion
        col = baseColor;
        col *= ambientFactor + 0.1; // Apply ambient occlusion effect
        col *= shadow; // Apply shadow
    }

    gl_FragColor = vec4(col, 1.);
}
