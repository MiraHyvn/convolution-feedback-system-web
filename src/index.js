import {Piirto} from "./Piirto.js";

function main() {
    const P = new Piirto();
    const kuva1 = P.generoiKuva();
    P.piirraKuva(kuva1);
}

main();