const OLETUS_VSRC = `#version 300 es
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

const OLETUS_FSRC = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tekstuuri0;
uniform float[49] uData;
out vec4 color;

void main(void) {
    color = texture(tekstuuri0, uv);
}
`;

function lisaaTeksti(teksti) {
    console.log(teksti);
}

export class Piirto{
    constructor() {
        this.fb = null;
        this.uniformPaikka = null;
        const gl = this.haeKonteksti();
        if(gl != null) {
            this.luoShader(OLETUS_VSRC, OLETUS_FSRC);
            this.fb = gl.createFramebuffer();
        }
    }

    haeKonteksti() {
        const canvas = document.querySelector("#piirtoalue");
        const gl = canvas.getContext("webgl2");
        return gl;
    }

    kaannaShader(tyyppi, src) {
        const gl = this.haeKonteksti();
        const tulos = gl.createShader(tyyppi);
        gl.shaderSource(tulos, src);
        gl.compileShader(tulos);
        if(!gl.getShaderParameter(tulos, gl.COMPILE_STATUS)) {
            if(tyyppi == gl.VERTEX_SHADER) {
                lisaaTeksti("Vertex shaderin kääntäminen epäonnistui:\n");
            }
            else if (tyyppi == gl.FRAGMENT_SHADER) {
                lisaaTeksti("Fragment shaderin kääntäminen epäonnistui:\n");
            }
            lisaaTeksti(gl.getShaderInfoLog(tulos));
            gl.deleteShader(tulos);
            return null;
        }
        return tulos;
    }

    luoShader(vsrc, fsrc) {
        const gl = this.haeKonteksti();
        const vShader = this.kaannaShader(gl.VERTEX_SHADER, vsrc);
        if(vShader == null) {
            return;
        }
        const fShader = this.kaannaShader(gl.FRAGMENT_SHADER, fsrc);
        if(fShader == null) {
            return;
        }
        const tulos = gl.createProgram();
        gl.attachShader(tulos, vShader);
        gl.attachShader(tulos, fShader);
        gl.linkProgram(tulos);
        if(!gl.getProgramParameter(tulos, gl.LINK_STATUS)) {
            lisaaTeksti("Shaderin linkitys epäonnistui:\n");
            lisaaTeksti(gl.getProgramInfoLog(tulos));
            return null;
        }
        this.kaytaShaderia(tulos);
        this.uniformPaikka = gl.getUniformLocation(tulos, "uData");
        return tulos;
    }

    kaytaShaderia(shader) {
        const gl = this.haeKonteksti();
        gl.useProgram(shader);
    }

    piirra() {
        const gl = this.haeKonteksti();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    generoiKuva() {
        const gl = this.haeKonteksti();
        const tekstuuri = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tekstuuri);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 256;
        const height = 256;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixels = new Uint8Array(256*256*4);
        let i = 0;
        for(let y=0; y<256; y++) {
            for(let x=0; x < 256; x++) {
                const f = x / width;
                let r = Math.pow(f, 0.5);
                let g = f;
                let b = 0.3 + Math.pow(0.7 * f, 1.5);
                const suola = 50;
                const pippuri = 50;
                //vähän suolaa
                if(Math.random()*suola < 1) {
                    r = 1;
                }
                if(Math.random()*100 < 1) {
                    g = 1;
                }
                if(Math.random()*100 < 1) {
                    b = 1;
                }
                //vähän pippuria
                if(Math.random()*pippuri < 1) {
                    r = 0;
                }
                if(Math.random()*100 < 1) {
                    g = 0;
                }
                if(Math.random()*100 < 1) {
                    b = 0;
                }
                pixels[i] = Math.floor(r*256);
                pixels[i+1] = Math.floor(g*256);
                pixels[i+2] = Math.floor(b*256);
                pixels[i+3] = 255;
                i+=4;
            }
        }
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixels
        );
        gl.texParameteri(
            gl.TEXTURE_2D, 
            gl.TEXTURE_WRAP_S, 
            gl.CLAMP_TO_EDGE
        );
        gl.texParameteri(
            gl.TEXTURE_2D, 
            gl.TEXTURE_WRAP_T, 
            gl.CLAMP_TO_EDGE
        );
        gl.texParameteri(
            gl.TEXTURE_2D, 
            gl.TEXTURE_MIN_FILTER, 
            gl.LINEAR
        );        
        return tekstuuri;
    }

    piirraKuva(kuva) {
        const gl = this.haeKonteksti();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, kuva);
        gl.viewport(0, 0, 640, 512);
        this.piirra();
    }

    piirraKuvaan(mista, mihin) {
        const gl = this.haeKonteksti();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
        const level = 0;
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            mihin,
            level
        );
        gl.bindTexture(gl.TEXTURE_2D, mista);
        gl.viewport(0, 0, 256, 256);
        this.piirra();
    }

    asetaUniform(uData) {
        const gl = this.haeKonteksti();
        gl.uniform1fv(this.uniformPaikka, uData);
    }
}