#!/usr/bin/env node
import { execSync } from "node:child_process";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import os from "node:os";

function run(command, options = {}) {
    const output = execSync(command, {
        stdio: ["ignore", "pipe", "pipe"],
        encoding: "utf-8",
        ...options,
    });
    return output.trim();
}

function parseJson(output, step) {
    try {
        return JSON.parse(output);
    } catch (err) {
        console.error(`\n[deploy] Error parseando JSON de '${step}':`);
        console.error(output);
        throw err;
    }
}

function ensureDirForFile(filePath) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

function getArgEnv(argv) {
    // Soportar --testnet, --tesnet (alias), --mainnet. Default: testnet
    const isTesnet = argv.includes("--tesnet");
    const isTestnet = argv.includes("--testnet") || isTesnet;
    const isMainnet = argv.includes("--mainnet");
    if (isMainnet && isTestnet) {
        throw new Error("No se puede usar --testnet y --mainnet a la vez");
    }
    return isMainnet ? "mainnet" : "testnet";
}

async function main() {
    const network = getArgEnv(process.argv.slice(2));
    const isWindows = process.platform === "win32";
    const isWSL = Boolean(process.env.WSL_DISTRO_NAME) || os.release().toLowerCase().includes("microsoft");
    const osLabel = isWSL ? "wsl" : isWindows ? "windows" : "linux";
    console.log(`[deploy] Iniciando despliegue a '${network}' en '${osLabel}'...`);

    // 1) Cambiar entorno del cliente Sui
    console.log(`[deploy] Cambiando entorno del cliente Sui...`);
    run(`yarn workspace centro_trueque exec sui client switch --env ${network}`);

    // 2) Publicar el paquete Move
    console.log(`[deploy] Publicando paquete Move (packages/centro_trueque)...`);
    // Ejecutar dentro del workspace para que el package_path sea el directorio actual
    const publishCmd = `yarn workspace centro_trueque exec sui client publish --gas-budget 100000000 --json .`;
    const publishOut = run(publishCmd);
    const publishJson = parseJson(publishOut, "publish");

    // Buscar packageId en objectChanges (type === 'published')
    let packageId = undefined;
    if (Array.isArray(publishJson.objectChanges)) {
        const published = publishJson.objectChanges.find((c) => c.type === "published");
        if (published && published.packageId) {
            packageId = published.packageId;
        }
    }
    // Fallback por si cambia la forma
    if (!packageId && publishJson.effects && publishJson.effects.created) {
        const publishedCap = publishJson.effects.created.find((o) => o.owner === "Immutable");
        if (publishedCap && publishedCap.reference && publishedCap.reference.objectId) {
            packageId = publishedCap.reference.objectId;
        }
    }
    if (!packageId) {
        console.error("[deploy] No se pudo extraer el packageId del resultado de publish.");
        console.error(publishOut);
        process.exit(1);
    }
    console.log(`[deploy] packageId: ${packageId}`);

    // 3) Ejecutar crear_guardarropa para obtener IDs compartidos
    console.log(`[deploy] Creando guardarropa digital...`);
    const callCmd = `yarn workspace centro_trueque exec sui client call --package ${packageId} --module centro_trueque --function crear_guardarropa --gas-budget 10000000 --json`;
    const callOut = run(callCmd);
    const callJson = parseJson(callOut, "call crear_guardarropa");

    let guardarropaId = undefined;
    let registroId = undefined;
    if (Array.isArray(callJson.events)) {
        const evt = callJson.events.find((e) =>
            typeof e.type === "string" && e.type.endsWith("::centro_trueque::GuardarropaCreatedEvent")
        );
        if (evt && evt.parsedJson) {
            guardarropaId = evt.parsedJson.guardarropa_id || evt.parsedJson.guardarropaId;
            registroId = evt.parsedJson.registro_id || evt.parsedJson.registroId;
        }
    }
    if (!guardarropaId || !registroId) {
        console.error("[deploy] No se pudieron extraer los IDs del evento GuardarropaCreatedEvent.");
        console.error(callOut);
        process.exit(1);
    }
    console.log(`[deploy] Guardarropa ID: ${guardarropaId}`);
    console.log(`[deploy] Registro Socios ID: ${registroId}`);

    // 4) Escribir .env.local para el frontend
    const envContent = `# Auto-generado por scripts/deploy.mjs\nNEXT_PUBLIC_SUI_NETWORK=${network}\nNEXT_PUBLIC_PACKAGE_ID=${packageId}\nNEXT_PUBLIC_GUARDARROPA_ID=${guardarropaId}\nNEXT_PUBLIC_REGISTRO_SOCIOS_ID=${registroId}\n`;
    const envPath = resolve("apps/front_trueque/.env.local");
    ensureDirForFile(envPath);
    writeFileSync(envPath, envContent, { encoding: "utf-8" });
    console.log(`[deploy] Escrito: ${envPath}`);

    // 5) Escribir .env.local.example (seguimiento en git)
    const exampleContent = `# Ejemplo de variables generadas en el deploy\nNEXT_PUBLIC_SUI_NETWORK=${network} # testnet | mainnet\nNEXT_PUBLIC_PACKAGE_ID=0x<package_id>\nNEXT_PUBLIC_GUARDARROPA_ID=0x<guardarropa_object_id>\nNEXT_PUBLIC_REGISTRO_SOCIOS_ID=0x<registro_object_id>\n`;
    const examplePath = resolve("apps/front_trueque/.env.local.example");
    ensureDirForFile(examplePath);
    writeFileSync(examplePath, exampleContent, { encoding: "utf-8" });
    console.log(`[deploy] Escrito: ${examplePath}`);

    console.log("[deploy] Listo ✅");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});


