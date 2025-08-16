// apps/front-trueque/src/constants/index.ts

// Tu Package ID del contrato desplegado
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0x9efa4d7b8ccfdcb2100ff736768720c9198f3be1b2608ecc5b4fb84e638aafe5";

export const CENTRO_ID = process.env.NEXT_PUBLIC_CENTRO_ID || "0x01faf1bc6f5bcfb8266e767eb86246ec89b5e37946d26a25cf48be6b52193714";

// Módulo del contrato
export const MODULE_NAME = "centro_trueque";

// Funciones del contrato con la estructura correcta
export const CONTRACT_FUNCTIONS = {
    CREAR_CENTRO: `${PACKAGE_ID}::${MODULE_NAME}::crear_centro`,
    CREAR_COLECCIONABLE_CON_RECIBO: `${PACKAGE_ID}::${MODULE_NAME}::crear_coleccionable_con_recibo`,
    DEPOSITAR_OBJETO: `${PACKAGE_ID}::${MODULE_NAME}::depositar_objeto`,
    RETIRAR_OBJETO: `${PACKAGE_ID}::${MODULE_NAME}::retirar_objeto`,
    ACTUALIZAR_NOMBRE_OBJETO: `${PACKAGE_ID}::${MODULE_NAME}::actualizar_nombre_objeto`,
    // Funciones de consulta
    OBTENER_INFO_OBJETO: `${PACKAGE_ID}::${MODULE_NAME}::obtener_info_objeto`,
    EXISTE_COLECCIONABLE: `${PACKAGE_ID}::${MODULE_NAME}::existe_coleccionable`,
    OBTENER_TOTAL_OBJETOS: `${PACKAGE_ID}::${MODULE_NAME}::obtener_total_objetos`,
    OBTENER_SIGUIENTE_CLAVE: `${PACKAGE_ID}::${MODULE_NAME}::obtener_siguiente_clave`,
    OBTENER_RECIBOS_ACTIVOS: `${PACKAGE_ID}::${MODULE_NAME}::obtener_recibos_activos`,
} as const;

// Tipos de objetos con la estructura correcta
export const OBJECT_TYPES = {
    CENTRO_DE_TRUEQUE: `${PACKAGE_ID}::${MODULE_NAME}::CentroDeTrueque`,
    RECIBO: `${PACKAGE_ID}::${MODULE_NAME}::Recibo`,
    COLECCIONABLE: `${PACKAGE_ID}::${MODULE_NAME}::Coleccionable`,
    COLECCIONABLE_TRANSFERIBLE: `${PACKAGE_ID}::${MODULE_NAME}::ColeccionableTransferible`,
} as const;

// Eventos del contrato
export const EVENT_TYPES = {
    CENTRO_CREADO: `${PACKAGE_ID}::${MODULE_NAME}::CentroCreadoEvent`,
    OBJETO_DEPOSITADO: `${PACKAGE_ID}::${MODULE_NAME}::ObjetoDepositadoEvent`,
    OBJETO_RETIRADO: `${PACKAGE_ID}::${MODULE_NAME}::ObjetoRetiradoEvent`,
} as const;

// Configuración de red
export const NETWORK_CONFIG = {
    devnet: "devnet",
    testnet: "testnet",
    mainnet: "mainnet",
} as const;

// URLs de exploradores
export const EXPLORER_URLS = {
    devnet: "https://suiexplorer.com",
    testnet: "https://suiexplorer.com",
    mainnet: "https://suiexplorer.com",
} as const;

// Helper para obtener la URL del explorador actual
export const getExplorerUrl = (objectId: string, network: string = "testnet") => {
    return `${EXPLORER_URLS.testnet}/object/${objectId}?network=${network}`;
};

// Mensajes de error personalizados
export const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: "Conecta tu billetera para continuar",
    TRANSACTION_FAILED: "Error en la transacción. Inténtalo de nuevo.",
    INSUFFICIENT_FUNDS: "Fondos insuficientes para la transacción",
    NETWORK_ERROR: "Error de conexión. Verifica tu red.",
} as const;