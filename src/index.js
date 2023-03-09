import {Piirto} from "./Piirto.js";

function main() {
    const P = new Piirto();
    const kuva1 = P.generoiKuva();
    const kuva2 = P.generoiKuva();
    P.piirraKuvaan(kuva2, kuva1);
    P.piirraKuva(kuva1);
}

main();