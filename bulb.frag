precision mediump float;

varying vec2 pos;

uniform float millis;
uniform vec2 iResolution;
uniform vec2 dir;
uniform vec2 iMouse;

const int marchingSteps = 80;

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

float DE(vec3 pos, out float minDistToOrigin, out float minDistToPlaneX, out float minDistToPlaneY, out float minDistToPlaneZ) {
    vec3 z = pos;
    float dr = 1.;
    float r = 0.0;

    float power = 8.;

    for(int i = 0; i < 120; i++) {
        r = length(z);
        if(r > 2.)
            break;

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
    float scale = 0.37;

    float bulb = DE(bulbPosition * scale, minDistToOrigin, minDistToPlaneX, minDistToPlaneY, minDistToPlaneZ) / scale;

    return bulb;
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy * 2. - 1.;
    uv.x = uv.x * (iResolution.x / iResolution.y);
    vec2 m = iMouse.xy / iResolution.xy;
    m.x = m.x * (iResolution.x / iResolution.y);

    // initialization step
    vec3 rayOrigin = vec3(dir.x, 1., dir.y); // ray origin, aka camera position
    vec3 rayDirection = normalize(vec3(uv, 1));
    vec3 col = vec3(0.);

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

        if(d < 0.0000008 || t > 100.)
            break;

    }

    // coloring 

    if(t > 100.) {
        // paint background
        col = exp(uv.y - 2.0) * vec3(0.4, 1.6, 1.0);
    } else {
         // color based on distance to steps
        col = vec3(1.);
        col *= 1. - float(steps) / float(marchingSteps);
    }

    gl_FragColor = vec4(col, 1.);
}
