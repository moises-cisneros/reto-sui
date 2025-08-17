export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;
export const GUARDARROPA_ID = process.env.NEXT_PUBLIC_GUARDARROPA_ID;
export const REGISTRO_SOCIOS_ID = process.env.NEXT_PUBLIC_REGISTRO_SOCIOS_ID;

// Módulo del contrato
export const MODULE_NAME = "centro_trueque";

// Funciones del contrato
export const CONTRACT_FUNCTIONS = {
    // Funciones principales
    CREAR_GUARDARROPA: `${PACKAGE_ID}::${MODULE_NAME}::crear_guardarropa`,
    OBTENER_CARNET_SOCIO: `${PACKAGE_ID}::${MODULE_NAME}::obtener_carnet_de_socio`,
    ALMACENAR_ARTICULO: `${PACKAGE_ID}::${MODULE_NAME}::almacenar_articulo`,
    RETIRAR_ARTICULO: `${PACKAGE_ID}::${MODULE_NAME}::retirar_articulo`,
    ACTUALIZAR_NOMBRE_COLECCIONABLE: `${PACKAGE_ID}::${MODULE_NAME}::actualizar_nombre_coleccionable`,
    
    // Funciones de consulta
    CONSULTAR_INFO_ARTICULO: `${PACKAGE_ID}::${MODULE_NAME}::consultar_info_articulo`,
    EXISTE_ARTICULO_EN_GUARDARROPA: `${PACKAGE_ID}::${MODULE_NAME}::existe_articulo_en_guardarropa`,
    OBTENER_TOTAL_ARTICULOS: `${PACKAGE_ID}::${MODULE_NAME}::obtener_total_articulos_almacenados`,
    CONSULTAR_SIGUIENTE_CLAVE: `${PACKAGE_ID}::${MODULE_NAME}::consultar_siguiente_clave`,
    CONTAR_CREDITOS_ACTIVOS: `${PACKAGE_ID}::${MODULE_NAME}::contar_creditos_activos`,
    ESTA_USUARIO_REGISTRADO: `${PACKAGE_ID}::${MODULE_NAME}::esta_usuario_registrado`,
    OBTENER_TOTAL_SOCIOS: `${PACKAGE_ID}::${MODULE_NAME}::obtener_total_socios`,
} as const;

// Tipos de objetos
export const OBJECT_TYPES = {
    GUARDARROPA_DIGITAL: `${PACKAGE_ID}::${MODULE_NAME}::GuardarropaDigital`,
    REGISTRO_DE_SOCIOS: `${PACKAGE_ID}::${MODULE_NAME}::RegistroDeSocios`,
    CARNET_DE_SOCIO: `${PACKAGE_ID}::${MODULE_NAME}::CarnetDeSocio`,
    ARTICULO_ALMACENADO: `${PACKAGE_ID}::${MODULE_NAME}::ArticuloAlmacenado`,
    COLECCIONABLE: `${PACKAGE_ID}::${MODULE_NAME}::Coleccionable`,
} as const;

// Eventos del contrato
export const EVENT_TYPES = {
    GUARDARROPA_CREADO: `${PACKAGE_ID}::${MODULE_NAME}::GuardarropaCreatedEvent`,
    CARNET_OBTENIDO: `${PACKAGE_ID}::${MODULE_NAME}::CarnetObtainedEvent`,
    ARTICULO_ALMACENADO: `${PACKAGE_ID}::${MODULE_NAME}::ArticuloAlmacenadoEvent`,
    ARTICULO_RETIRADO: `${PACKAGE_ID}::${MODULE_NAME}::ArticuloRetiradoEvent`,
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
    USER_ALREADY_REGISTERED: "Ya tienes un carnet de socio",
    NOT_CARNET_OWNER: "No eres el propietario del carnet de socio",
    ARTICLE_NOT_FOUND: "El artículo especificado no existe",
    ARTICLE_ALREADY_EXISTS: "El artículo ya existe",
} as const;