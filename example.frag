precision mediump float;

varying vec2 pos;

uniform float millis;
uniform vec2 iResolution;
uniform vec2 iMouse;

const int marchingSteps = 80;
const float Power = 8.;

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

float DE(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    for(int i = 0; i < 80; i++) {
        r = length(z);
        if(r > 2.)
            break;

		// convert to polar coordinates
        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, Power - 1.0) * Power * dr + 1.0;

		// scale and rotate the point
        float zr = pow(r, Power);
        theta = theta * Power;
        phi = phi * Power;

		// convert back to cartesian coordinates
        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += pos;
    }
    return 0.5 * log(r) * r / dr;
}

float map(vec3 p) {
    vec3 bulbPosition = p - vec3(0., 1., 0.);
    float bulb = DE(bulbPosition);

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

    float t = 0.; // total distance travelled

    /* // vertical camera rotatuion
    rayOrigin.yz *= rotate2D(-m.y * 0.1);
    rayDirection.yz *= rotate2D(-m.y * 0.1);

    // camera rotation
    rayOrigin.xz *= rotate2D(-m.x * 0.1);
    rayDirection.xz *= rotate2D(-m.x * 0.1); */

    // Raymarching
    for(int i = 1; i < marchingSteps; i++) {

        vec3 p = rayOrigin + rayDirection * t; // position along the way

        float d = map(p); // current distance from the scene 

        t += d;

        if(d < 0.001 || t > 100.)
            break;

    }

    // coloring 
    col = vec3(t * 0.1);

    gl_FragColor = vec4(col, 1.);
}
