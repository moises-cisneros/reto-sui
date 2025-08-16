module centro_trueque::centro_trueque {
    use std::string::String;
    use sui::vec_map::{Self, VecMap};
    use sui::vec_set::{Self, VecSet};
    use sui::event;

    // --- Eventos ---
    
    /// Evento emitido cuando se crea un nuevo guardarropa digital
    public struct GuardarropaCreatedEvent has copy, drop {
        guardarropa_id: ID,
        registro_id: ID,
        creador: address,
    }

    /// Evento emitido cuando un usuario obtiene su carnet de socio
    public struct CarnetObtainedEvent has copy, drop {
        carnet_id: ID,
        propietario: address,
    }

    /// Evento emitido cuando se almacena un artículo en el guardarropa
    public struct ArticuloAlmacenadoEvent has copy, drop {
        guardarropa_id: ID,
        clave: u64,
        depositante: address,
        nombre_articulo: String,
    }

    /// Evento emitido cuando se retira un artículo del guardarropa
    public struct ArticuloRetiradoEvent has copy, drop {
        guardarropa_id: ID,
        clave: u64,
        retirador: address,
        nombre_articulo: String,
    }

    // --- Códigos de Error ---
    
    #[error]
    const E_CLAVE_NO_EXISTE: vector<u8> = b"La clave especificada no existe";
    #[error]
    const E_CLAVE_YA_EXISTE: vector<u8> = b"La clave ya existe";
    #[error]
    const E_NO_ES_PROPIETARIO_CARNET: vector<u8> = b"No eres el propietario del carnet de socio";
    #[error]
    const E_YA_TIENE_CARNET: vector<u8> = b"El usuario ya tiene un carnet de socio";

    // --- Definición de Objetos ---

    /// Un artículo almacenado internamente en el guardarropa digital
    /// Solo existe como registro interno mientras el artículo está depositado
    public struct ArticuloAlmacenado has copy, drop, store {
        nombre: String,
        descripcion: String,
        fecha_creacion: u64,
        propietario_original: address,
    }

    /// Carnet de socio que permite depositar y retirar artículos del guardarropa
    /// Funciona como un sistema de créditos: depositas un artículo, obtienes un crédito
    /// Solo puede existir uno por usuario (controlado por el RegistroDeSocios)
    public struct CarnetDeSocio has key, store {
        id: UID,
        creditos_activos: VecMap<u64, bool>,
        propietario: address,
    }

    /// Registro compartido que mantiene la lista de todos los socios registrados
    /// Actúa como guardia de seguridad: verifica que cada usuario tenga un solo carnet
    public struct RegistroDeSocios has key {
        id: UID,
        socios_registrados: VecSet<address>,
        total_socios: u64,
        creador: address,
    }

    /// El guardarropa digital principal donde se almacenan temporalmente los artículos
    /// Es un objeto compartido accesible por todos los usuarios
    public struct GuardarropaDigital has key {
        id: UID,
        articulos_almacenados: VecMap<u64, ArticuloAlmacenado>,
        siguiente_clave: u64,
        total_articulos: u64,
        creador: address,
    }

    /// Un coleccionable digital que puede ser poseído y transferido libremente
    /// Es el objeto final que obtiene el usuario al retirar un artículo
    public struct Coleccionable has key, store {
        id: UID,
        nombre: String,
        descripcion: String,
        fecha_creacion: u64,
        propietario_original: address,
    }

    // --- Lógica de las Funciones ---

    /// Crea un nuevo sistema de guardarropa digital completo
    /// Incluye tanto el guardarropa principal como el registro de socios
    /// Ambos objetos se comparten para acceso público
    public fun crear_guardarropa(ctx: &mut TxContext) {
        // Crear el guardarropa principal
        let guardarropa = GuardarropaDigital {
            id: object::new(ctx),
            articulos_almacenados: vec_map::empty(),
            siguiente_clave: 0,
            total_articulos: 0,
            creador: ctx.sender(),
        };
        
        // Crear el registro de socios
        let registro = RegistroDeSocios {
            id: object::new(ctx),
            socios_registrados: vec_set::empty(),
            total_socios: 0,
            creador: ctx.sender(),
        };
        
        let guardarropa_id = object::uid_to_inner(&guardarropa.id);
        let registro_id = object::uid_to_inner(&registro.id);

        // Emitir evento de creación
        event::emit(GuardarropaCreatedEvent {
            guardarropa_id,
            registro_id,
            creador: ctx.sender(),
        });
        
        // Compartir ambos objetos para acceso público
        transfer::share_object(guardarropa);
        transfer::share_object(registro);
    }

    /// Obtiene un carnet de socio único para el usuario
    /// Verifica en el registro que el usuario no tenga ya un carnet
    /// Solo se permite un carnet por dirección de usuario
    #[allow(lint(self_transfer))]
    public fun obtener_carnet_de_socio(
        registro: &mut RegistroDeSocios, 
        ctx: &mut TxContext
    ) {
        let usuario = ctx.sender();
        
        // Verificar que el usuario no esté ya registrado
        assert!(!registro.socios_registrados.contains(&usuario), E_YA_TIENE_CARNET);
        
        // Registrar al usuario en la lista de socios
        registro.socios_registrados.insert(usuario);
        registro.total_socios = registro.total_socios + 1;
        
        // Crear el carnet de socio
        let carnet = CarnetDeSocio {
            id: object::new(ctx),
            creditos_activos: vec_map::empty(),
            propietario: usuario,
        };
        
        // Emitir evento
        event::emit(CarnetObtainedEvent {
            carnet_id: object::uid_to_inner(&carnet.id),
            propietario: usuario,
        });
        
        // Transferir el carnet al solicitante
        transfer::transfer(carnet, usuario);
    }

    /// Almacena un nuevo artículo en el guardarropa y registra un crédito en el carnet
    /// El usuario debe poseer un carnet de socio válido para realizar esta operación
    public fun almacenar_articulo(
        guardarropa: &mut GuardarropaDigital,
        carnet: &mut CarnetDeSocio,
        nombre: String,
        descripcion: String,
        ctx: &mut TxContext
    ) {
        // Verificar que el carnet pertenece al usuario
        assert!(carnet.propietario == ctx.sender(), E_NO_ES_PROPIETARIO_CARNET);

        // Generar nueva clave única para el artículo
        let clave = guardarropa.siguiente_clave;
        guardarropa.siguiente_clave = clave + 1;
        guardarropa.total_articulos = guardarropa.total_articulos + 1;

        // Crear el registro interno del artículo
        let articulo = ArticuloAlmacenado {
            nombre,
            descripcion,
            fecha_creacion: ctx.epoch_timestamp_ms(),
            propietario_original: ctx.sender(),
        };

        // Verificar que la clave no existe
        assert!(!guardarropa.articulos_almacenados.contains(&clave), E_CLAVE_YA_EXISTE);

        // Almacenar el artículo en el guardarropa
        guardarropa.articulos_almacenados.insert(clave, articulo);
        
        // Registrar el crédito en el carnet del usuario
        carnet.creditos_activos.insert(clave, true);

        // Emitir evento de almacenamiento
        event::emit(ArticuloAlmacenadoEvent {
            guardarropa_id: object::uid_to_inner(&guardarropa.id),
            clave,
            depositante: ctx.sender(),
            nombre_articulo: nombre,
        });
    }

    /// Retira un artículo del guardarropa usando un crédito del carnet
    /// Convierte el artículo interno en un coleccionable transferible
    #[allow(lint(self_transfer))]  
    public fun retirar_articulo(
        guardarropa: &mut GuardarropaDigital,
        carnet: &mut CarnetDeSocio,
        clave_articulo: u64,
        ctx: &mut TxContext
    ) {
        // Verificar que el carnet pertenece al usuario
        assert!(carnet.propietario == ctx.sender(), E_NO_ES_PROPIETARIO_CARNET);
        
        // Verificar que el artículo existe en el guardarropa
        assert!(guardarropa.articulos_almacenados.contains(&clave_articulo), E_CLAVE_NO_EXISTE);
        
        // Verificar que el carnet tiene crédito para este artículo
        assert!(carnet.creditos_activos.contains(&clave_articulo), E_CLAVE_NO_EXISTE);

        // Remover el artículo del guardarropa
        let (_, articulo_almacenado) = guardarropa.articulos_almacenados.remove(&clave_articulo);
        guardarropa.total_articulos = guardarropa.total_articulos - 1;
        
        // Consumir el crédito del carnet
        carnet.creditos_activos.remove(&clave_articulo);

        // Crear el coleccionable transferible
        let coleccionable = Coleccionable {
            id: object::new(ctx),
            nombre: articulo_almacenado.nombre,
            descripcion: articulo_almacenado.descripcion,
            fecha_creacion: articulo_almacenado.fecha_creacion,
            propietario_original: articulo_almacenado.propietario_original,
        };

        // Emitir evento de retiro
        event::emit(ArticuloRetiradoEvent {
            guardarropa_id: object::uid_to_inner(&guardarropa.id),
            clave: clave_articulo,
            retirador: ctx.sender(),
            nombre_articulo: articulo_almacenado.nombre,
        });

        // Transferir el coleccionable al usuario
        transfer::transfer(coleccionable, ctx.sender());
    }

    /// Actualiza el nombre de un coleccionable que ya posee el usuario
    /// Solo el propietario actual puede modificar sus coleccionables
    public fun actualizar_nombre_coleccionable(coleccionable: &mut Coleccionable, nuevo_nombre: String) {
        coleccionable.nombre = nuevo_nombre;
    }

    // --- Funciones de Consulta (View Functions) ---

    /// Obtiene información completa de un artículo almacenado en el guardarropa
    /// Retorna: (nombre, descripción, fecha_creación, propietario_original)
    public fun consultar_info_articulo(guardarropa: &GuardarropaDigital, clave: u64): (String, String, u64, address) {
        assert!(guardarropa.articulos_almacenados.contains(&clave), E_CLAVE_NO_EXISTE);
        let articulo = guardarropa.articulos_almacenados.get(&clave);
        (articulo.nombre, articulo.descripcion, articulo.fecha_creacion, articulo.propietario_original)
    }

    /// Verifica si existe un artículo con la clave especificada en el guardarropa
    public fun existe_articulo_en_guardarropa(guardarropa: &GuardarropaDigital, clave: u64): bool {
        guardarropa.articulos_almacenados.contains(&clave)
    }

    /// Obtiene el número total de artículos actualmente almacenados
    public fun obtener_total_articulos_almacenados(guardarropa: &GuardarropaDigital): u64 {
        guardarropa.total_articulos
    }

    /// Obtiene la siguiente clave que será asignada al próximo artículo
    public fun consultar_siguiente_clave(guardarropa: &GuardarropaDigital): u64 {
        guardarropa.siguiente_clave
    }

    /// Cuenta cuántos créditos activos tiene un carnet de socio
    /// Cada crédito representa un artículo que el usuario puede retirar
    public fun contar_creditos_activos(carnet: &CarnetDeSocio): u64 {
        vec_map::size(&carnet.creditos_activos)
    }

    /// Verifica si un usuario ya está registrado como socio
    /// Útil para el frontend antes de intentar obtener un carnet
    public fun esta_usuario_registrado(registro: &RegistroDeSocios, usuario: address): bool {
        registro.socios_registrados.contains(&usuario)
    }

    /// Obtiene el número total de socios registrados en el sistema
    public fun obtener_total_socios(registro: &RegistroDeSocios): u64 {
        registro.total_socios
    }
}