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
    vec4 t = vec4(-1, -1, 1, 1);
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

const FSRC_CONVOLUTION = `#version 300 es
precision highp float;
uniform float[49] uData;
in vec2 uv;
uniform sampler2D tekstuuri0;
out vec4 color;

void main(void) {
    float value = 0.0;
    vec4 color0 = texture(tekstuuri0, uv);
    for(int i=0; i<49; i++) {
        int y = i / 7;
        int x = i % 7;
        float yf = float(y);
        float xf = float(x);
        vec2 d = vec2( (xf-3.0)/(1024.0), (yf-3.0)/(1024.0));
        value += texture(tekstuuri0, uv + d).r * uData[i];
    }
    color = mix(color0, vec4(value, value, value, 1), 0.5);
}
`;

export class ConvolutionFeedbackSystem {
    constructor(){
        this.tx_front = null;
        this.tx_back = null;
        this.convolutionMatrix = new Float32Array(49);
        this.shader_default = null;
        this.shader_convolution = null;
        this.piirto = null;
        this.kaanto = 1;
        this.setup();
    }

    setup() {
        this.piirto = new Piirto();
        this.tx_front = this.piirto.generoiKuva();
        this.tx_back = this.piirto.generoiKuva();
        this.shader_default = this.piirto.luoShader(VSRC, FSRC);
        this.shader_convolution = this.piirto.luoShader(
            VSRC, 
            FSRC_CONVOLUTION
        );
        this.randomizeConvolution();
        this.piirto.asetaUniform(this.convolutionMatrix);
    }

    randomizeConvolution() {
        for(let f of this.convolutionMatrix) {
            for(let i = 0; i < this.convolutionMatrix.length; i++) {
                this.convolutionMatrix[i] = Math.random() * 4 - 2;
            }
            this.normalizeConvolution();
        }
        console.log(this.convolutionMatrix);
    }

    normalizeConvolution() {
        let sum = 0;
        for(const f of this.convolutionMatrix) {
            sum += f;
        }
        let factor = 1 / sum;
        for(let i = 0; i < this.convolutionMatrix.length; i++) {
            this.convolutionMatrix[i] *= factor;
        }
    }

    update() {
        this.randomChangeConvolution();
        this.piirto.kaytaShaderia(this.shader_convolution);
        this.piirto.asetaUniform(this.convolutionMatrix);
        if(this.kaanto == 1) {
            this.piirto.piirraKuvaan(this.tx_back, this.tx_front);
            this.kaanto = 0;
        }
        else {
            this.piirto.piirraKuvaan(this.tx_front, this.tx_back);
            this.kaanto = 1;
        }
        this.piirto.kaytaShaderia(this.shader_default);
        this.piirto.piirraKuva(this.tx_front);
    }

    randomChangeConvolution() {
        const changeN = Math.floor(Math.random()*4) + 1;
        for(let j = 0; j < changeN; j++) {
            const i = Math.floor(Math.random()*49);
            this.convolutionMatrix[i] += Math.random()*0.05 - 0.025;
            if(this.convolutionMatrix[i] < -1) {
                this.convolutionMatrix[i] = -1;
            }
            if(this.convolutionMatrix[i] > 1) {
                this.convolutionMatrix[i] = 1;
            }
        }
        this.normalizeConvolution();
    }
}
