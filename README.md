# 🏪 Guardarropa Digital - Sistema de Almacenamiento Seguro en Sui

Un sistema descentralizado de almacenamiento seguro de coleccionables digitales donde los usuarios pueden almacenar artículos y retirar únicamente sus propios objetos usando un sistema de comprobantes de depósito.

## 🎬 Demo del Proyecto

[![Demo del Guardarropa Digital](https://img.youtube.com/vi/I5Gie7TNtfU/maxresdefault.jpg)](https://youtu.be/I5Gie7TNtfU)

👆 **[Ver Demo en YouTube](https://youtu.be/I5Gie7TNtfU)** - Funcionalidad completa del sistema en acción

*El video muestra: conexión de wallet, obtención de carnet, almacenamiento de artículos, retiro seguro y personalización de NFTs.*

---

## 🚀 **Acceso Directo al Contrato**

### 📁 **Ubicación del Contrato Move**

```bash
📂 packages/centro_trueque/sources/centro_trueque.move
```

### ⚡ **Comandos Rápidos para Revisar**

```bash
# 1. Clonar y acceder al contrato
git clone https://github.com/moises-cisneros/reto-sui.git
cd reto-sui/packages/centro_trueque

# 2. Ver el código fuente
cat sources/centro_trueque.move

# 3. Compilar
sui move build

# 4. Ejecutar tests
sui move test
```

### 📊 **Métricas del Contrato**

- **Líneas de código:** ~300+ líneas
- **Funciones públicas:** 5 funciones
- **Funciones de vista:** 7 funciones
- **Structs principales:** 5 objetos
- **Eventos:** 4 tipos de eventos
- **Validaciones:** 4 tipos de códigos de error
- **Sistema de objetos:** Struct, VecMap y VecSet

---

## 🎯 ¿Qué hace este proyecto?

**Guardarropa Digital** es un sistema de almacenamiento seguro descentralizado que funciona como un guardarropa público con control de acceso estricto donde:

- Los usuarios obtienen un **carnet de socio único** que les da acceso al sistema
- Pueden **almacenar artículos digitales** en el guardarropa compartido
- Por cada artículo almacenado, obtienen un **comprobante de depósito** en su carnet
- Pueden **retirar únicamente sus propios artículos** del guardarropa usando sus comprobantes
- Los artículos retirados se convierten en **coleccionables NFT** que pueden poseer y personalizar

### 🔒 Flujo del Usuario (Sistema de Seguridad)

1. **Conecta** su wallet de Sui
2. **Obtiene** su carnet de socio único
3. **Almacena** artículos digitales (obtiene comprobantes de depósito)
4. **Retira** únicamente sus propios artículos almacenados (consume el comprobante de ese depósito)
5. **Colecciona** y personaliza sus NFTs

## 🛠️ Tecnologías Utilizadas

- **Blockchain:** Sui Network (Testnet/Mainnet)
- **Lenguaje:** Move
- **Patrón:** Objetos compartidos + Registro único de usuarios + Control de acceso estricto
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + Sui SDK
- **Herramientas:** Yarn Workspaces (Monorepo)

## 📖 Arquitectura del Contrato

### Objetos Principales

- **`GuardarropaDigital`**: Objeto compartido que almacena todos los artículos
- **`RegistroDeSocios`**: Objeto compartido que controla carnets únicos por usuario
- **`CarnetDeSocio`**: Objeto personal con comprobantes de depósito del usuario
- **`Coleccionable`**: NFT final que posee el usuario

### Funciones Públicas

1. `crear_guardarropa()` - Crea el sistema completo
2. `obtener_carnet_de_socio()` - Obtiene carnet único
3. `almacenar_articulo()` - Deposita artículo y obtiene comprobante de depósito
4. `retirar_articulo()` - Retira únicamente el artículo propio usando su comprobante
5. `actualizar_nombre_coleccionable()` - Personaliza NFT

## 🚀 Información de Despliegue

### Testnet Sui

- **Package ID:** [`0x5770c49882bf1cc89daa586389727a689ec9d094fd9664274ed14a637e909dab`](https://suiscan.xyz/testnet/object/0x5770c49882bf1cc89daa586389727a689ec9d094fd9664274ed14a637e909dab/tx-blocks)

### Mainnet Sui

- **Package ID:** [`0xc5627e394d8c8dcf3591320dbac21fdb18ec737637c71b934009c1c6b2b5288e`](https://suiscan.xyz/mainnet/object/0xc5627e394d8c8dcf3591320dbac21fdb18ec737637c71b934009c1c6b2b5288e/tx-blocks)

---

## 🚀 Configuración y Uso del Proyecto

### 📋 **Prerrequisitos**

Para interactuar con el proyecto completo necesitas:

- Tener `sui` CLI instalado y configurado con una cuenta con fondos
- Fondos suficientes para pagar el gas (deploy y llamada inicial `crear_guardarropa`)
- Node.js y Yarn instalados

### 🏗️ **Estructura del Monorepo**

```bash
reto-sui/
├── packages/
│   └── centro_trueque/          # 📦 Contrato Move
│       ├── sources/
│       │   └── centro_trueque.move  # ← CÓDIGO PRINCIPAL DEL CONTRATO
│       ├── Move.toml
│       └── tests/
├── apps/
│   └── front_trueque/           # 🌐 Frontend Next.js
│       ├── src/
│       │   ├── components/      # Componentes React
│       │   ├── hooks/           # Hooks personalizados
│       │   ├── contexts/        # Contextos de estado
│       │   └── app/            # Páginas Next.js
│       ├── package.json
│       └── tailwind.config.js
├── package.json                 # Configuración del monorepo
└── yarn.lock
```

### 🔧 **Scripts del Monorepo**

```json
{
  "scripts": {
    "test": "yarn workspace centro_trueque exec sui move test",
    "build:move": "yarn workspace centro_trueque exec sui move build",
    "envs": "yarn workspace centro_trueque exec sui client envs",
    "balance": "yarn workspace centro_trueque exec sui client balance",
    "publish": "yarn workspace centro_trueque exec sui client publish",
    "deploy": "node scripts/deploy.mjs",
    "dev": "yarn workspace front_trueque dev",
    "build:next": "yarn workspace front_trueque build",
    "start": "yarn workspace front_trueque start"
  }
}
```

### 🚀 **Inicio Rápido**

#### 1) **Instalar dependencias del monorepo**

```bash
git clone https://github.com/moises-cisneros/reto-sui.git
cd reto-sui
yarn install
```

Esto instala tanto las dependencias del contrato como del frontend (Next.js incluidas).

#### 2) **Desplegar contrato y configurar variables del frontend**

```bash
# Testnet (alias soportado: --testnet)
yarn deploy:contract --testnet

# o Mainnet
yarn deploy:contract --mainnet
```

El script automatiza todo el proceso:

- Cambia el entorno de `sui client` a `testnet` o `mainnet`
- Publica el paquete Move en `packages/centro_trueque` y captura `packageId`
- Llama `crear_guardarropa` y captura `guardarropa_id` y `registro_id` del evento `GuardarropaCreatedEvent`
- Escribe `apps/front_trueque/.env.local` con:
  - `NEXT_PUBLIC_SUI_NETWORK`
  - `NEXT_PUBLIC_PACKAGE_ID`
  - `NEXT_PUBLIC_GUARDARROPA_ID`
  - `NEXT_PUBLIC_REGISTRO_SOCIOS_ID`
- Crea/actualiza `apps/front_trueque/.env.local.example` con la estructura esperada

#### 3) **Ejecutar el frontend en local**

```bash
yarn dev
# Abrir http://localhost:3000
```

En el header verás una banderita con la red activa (`testnet`/`mainnet`).

### 👨‍💻 **Para Desarrolladores del Contrato**

```bash
# Navegar al directorio del contrato
cd packages/centro_trueque

# Compilar contrato
sui move build

# Ejecutar tests
sui move test

# Desplegar manualmente en testnet
sui client switch --env testnet
sui client publish

# Crear el sistema después del deploy
sui client call \
  --package <PACKAGE_ID> \
  --module centro_trueque \
  --function crear_guardarropa \
  --gas-budget 10000000
```

### 🌐 **Para Desarrolladores del Frontend**

```bash
# Navegar al directorio del frontend
cd apps/front_trueque

# Ejecutar en desarrollo
yarn dev

# Compilar para producción
yarn build

# Ejecutar en producción
yarn start
```

---

## 🔐 Sistema de Seguridad

### Control de Acceso Estricto

- **Verificación de propiedad:** Solo el propietario del carnet puede usar sus comprobantes
- **Comprobantes únicos:** Cada artículo depositado genera un comprobante específico
- **Sin intercambio:** Los usuarios no pueden retirar artículos de otros usuarios
- **Registro único:** Un solo carnet por dirección de wallet

### Flujo de Seguridad

1. **Depósito:** Usuario A almacena "Artículo X" → Obtiene comprobante con clave única
2. **Almacenamiento:** "Artículo X" se guarda en el guardarropa compartido
3. **Retiro:** Solo Usuario A puede retirar "Artículo X" usando su comprobante
4. **Conversión:** "Artículo X" se convierte en NFT transferible para Usuario A

## 🎨 Características Únicas

- **Un carnet por usuario:** Sistema garantizado de carnet único usando registro compartido
- **Seguridad total:** Solo puedes retirar artículos que tú mismo depositaste
- **Comprobantes de depósito:** Cada artículo almacenado genera un comprobante único en tu carnet
- **Personalización:** Los NFTs pueden ser renombrados por su propietario
- **Transparencia:** Todos los eventos son públicos y rastreables

## 📊 Métricas del Sistema

El contrato incluye funciones para consultar:

- Total de artículos almacenados
- Total de socios registrados  
- Comprobantes de depósito activos por usuario
- Historial de transacciones via eventos

## 🎯 Casos de Uso

### ✅ **Permitido:**

- Almacenar tus propios artículos
- Retirar tus propios artículos almacenados
- Personalizar tus coleccionables NFT
- Transferir tus coleccionables a otros usuarios

### ❌ **No Permitido:**

- Retirar artículos de otros usuarios
- Intercambiar artículos entre usuarios
- Usar comprobantes de otros usuarios
- Acceder a artículos sin comprobante válido

## 👨‍💻 Autor

Desarrollado para la certificación en Move/Sui por [Moises Cisneros](https://github.com/moises-cisneros)

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) file para detalles
