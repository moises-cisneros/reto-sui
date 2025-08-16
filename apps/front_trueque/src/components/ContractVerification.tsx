"use client";

import { useState } from "react";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID } from "@/constants";

export function ContractVerification() {
    const suiClient = useSuiClient();
    const account = useCurrentAccount();
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [customPackageId, setCustomPackageId] = useState(PACKAGE_ID);

    const verifyContract = async (packageId: string) => {
        setLoading(true);
        try {
            console.log(`🔍 Verificando contrato: ${packageId}`);

            // Verificar si el paquete existe
            const packageInfo = await suiClient.getObject({
                id: packageId,
                options: {
                    showContent: true,
                    showOwner: true,
                    showType: true,
                },
            });

            console.log("📦 Información del paquete:", packageInfo);

            // Obtener módulos del paquete
            let modules = null;
            try {
                const moduleNames = await suiClient.getNormalizedMoveModulesByPackage({
                    package: packageId,
                });
                modules = Object.keys(moduleNames);
                console.log("📋 Módulos encontrados:", modules);
            } catch (moduleError) {
                console.warn("⚠️ No se pudieron obtener los módulos:", moduleError);
            }

            // Verificar conexión a la red
            const networkInfo = await suiClient.getRpcApiVersion();
            console.log("🌐 Versión de la red:", networkInfo);

            setVerificationResult({
                packageExists: packageInfo.data !== null,
                packageInfo: packageInfo.data,
                modules,
                networkInfo,
                error: null,
            });

        } catch (error: any) {
            console.error("❌ Error verificando contrato:", error);
            setVerificationResult({
                packageExists: false,
                packageInfo: null,
                modules: null,
                networkInfo: null,
                error: error.message || error.toString(),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = () => {
        verifyContract(customPackageId);
    };

    const checkAllNetworks = async () => {
        setLoading(true);
        const networks = ["devnet", "testnet", "mainnet"];
        const results: any = {};

        for (const network of networks) {
            try {
                // Crear cliente temporal para cada red
                const tempClient = new (await import("@mysten/sui/client")).SuiClient({
                    url: `https://fullnode.${network}.sui.io:443`,
                });

                const packageInfo = await tempClient.getObject({
                    id: customPackageId,
                    options: { showContent: true },
                });

                results[network] = {
                    exists: packageInfo.data !== null,
                    data: packageInfo.data,
                };
            } catch (error: any) {
                results[network] = {
                    exists: false,
                    error: error.message,
                };
            }
        }

        setVerificationResult({
            ...verificationResult,
            networkResults: results,
        });
        setLoading(false);
    };

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-4">🔧 Verificación de Contrato</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package ID a verificar:
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customPackageId}
                            onChange={(e) => setCustomPackageId(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                            placeholder="0x..."
                        />
                        <button
                            onClick={handleVerify}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {loading ? "Verificando..." : "Verificar"}
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={checkAllNetworks}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                        Verificar en todas las redes
                    </button>
                </div>

                {verificationResult && (
                    <div className="mt-4 p-4 bg-white rounded border">
                        <h4 className="font-semibold mb-2">Resultados de verificación:</h4>

                        {verificationResult.error ? (
                            <div className="text-red-600">
                                <p><strong>❌ Error:</strong> {verificationResult.error}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p>
                                    <strong>Paquete existe:</strong>{" "}
                                    <span className={verificationResult.packageExists ? "text-green-600" : "text-red-600"}>
                                        {verificationResult.packageExists ? "✅ Sí" : "❌ No"}
                                    </span>
                                </p>

                                {verificationResult.modules && (
                                    <p>
                                        <strong>Módulos:</strong> {verificationResult.modules.join(", ")}
                                    </p>
                                )}

                                {verificationResult.networkInfo && (
                                    <p>
                                        <strong>Versión de red:</strong> {verificationResult.networkInfo}
                                    </p>
                                )}

                                {verificationResult.packageInfo && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-blue-600">Ver detalles del paquete</summary>
                                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                            {JSON.stringify(verificationResult.packageInfo, null, 2)}
                                        </pre>
                                    </details>
                                )}

                                {verificationResult.networkResults && (
                                    <div className="mt-4">
                                        <h5 className="font-medium mb-2">Resultados por red:</h5>
                                        {Object.entries(verificationResult.networkResults).map(([network, result]: [string, any]) => (
                                            <p key={network} className="text-sm">
                                                <strong>{network}:</strong>{" "}
                                                <span className={result.exists ? "text-green-600" : "text-red-600"}>
                                                    {result.exists ? "✅ Encontrado" : "❌ No encontrado"}
                                                </span>
                                                {result.error && <span className="text-gray-500"> ({result.error})</span>}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">💡 Posibles soluciones:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>1. Verifica que el Package ID sea correcto</li>
                        <li>2. Asegúrate de estar conectado a la red correcta (devnet/testnet/mainnet)</li>
                        <li>3. Confirma que el contrato se desplegó exitosamente</li>
                        <li>4. Revisa que tu billetera esté en la misma red que el contrato</li>
                    </ul>
                </div>

                {account && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                        <h5 className="font-medium mb-2">Información de tu cuenta:</h5>
                        <p className="text-sm text-gray-600 break-all">
                            <strong>Dirección:</strong> {account.address}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}