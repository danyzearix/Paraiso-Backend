// config/epayco.mjs
import epaycoSDK from "epayco-sdk-node";

const epayco = epaycoSDK({
    apiKey: "f676497fb0ae3dc53a0fddccb8c53535",
    privateKey: "3452a52ea4405dd278a585f87dddc861",
    lang: "ES", // Idioma
    test: true  // Cambiar a false en producción
});

export default epayco;
