import {Piirto} from "./Piirto.js";
const VSRC = `#version 300 es
out vec2 uv;

const vec4 kulmat[4] = vec4[4](
    vec4(-1, -1, 0, 1),
    vec4( 1, -1, 0, 1),
    vec4(-1,  1, 0, 1),
    vec4( 1,  1, 0, 1)
);

const vec2 kulmat_uv[4] = vec2[4](
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 1)
);

void main() {
    vec4 t = vec4(0.9, 0.9, 1, 1);
    gl_Position = t * kulmat[gl_VertexID];
    uv = kulmat_uv[gl_VertexID];
}
`;

const FSRC = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tekstuuri0;
out vec4 color;

void main(void) {
    color = texture(tekstuuri0, uv);
}
`;

const FSRC_KAANTEINEN = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tekstuuri0;
uniform float uData[49];
out vec4 color;

void main(void) {
    vec4 c = vec4(1, 1, 1, 1) - texture(tekstuuri0, uv);
    c.a = 1.0;
    color = c;
}
`;

function main() {
    const P = new Piirto();
    const kuva1 = P.generoiKuva();
    const kuva2 = P.generoiKuva();
    const shader_oletus = P.luoShader(VSRC, FSRC);
    const shader_kaanteinen = P.luoShader(VSRC, FSRC_KAANTEINEN);
    P.kaytaShaderia(shader_kaanteinen);
    P.asetaUniform(new Float32Array(49));
    P.piirraKuvaan(kuva2, kuva1);
    P.kaytaShaderia(shader_oletus);
    P.asetaUniform(new Float32Array(49));
    P.piirraKuva(kuva1);
}

main();