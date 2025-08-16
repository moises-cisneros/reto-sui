"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_FUNCTIONS, CENTRO_ID, getExplorerUrl } from "@/constants";

export function CentroSetup() {
    const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
    const [createdCentroId, setCreatedCentroId] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const handleCrearCentro = () => {
        try {
            const tx = new Transaction();

            tx.moveCall({
                target: CONTRACT_FUNCTIONS.CREAR_CENTRO,
                arguments: [],
            });

            console.log("🏗️ Creando centro de trueque...");

            signAndExecute(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log("✅ Centro creado exitosamente:", result);

                        // Buscar el objeto compartido creado
                        const effects = result.effects as any;
                        const sharedObject = (effects?.created && Array.isArray(effects.created)) 
                            ? effects.created.find(
                                (change: any) =>
                                    change.reference?.objectId &&
                                    change.reference?.objectType?.includes('CentroDeTrueque')
                            ) 
                            : null;

                        if (sharedObject) {
                            const centroId = sharedObject.reference.objectId;
                            setCreatedCentroId(centroId);
                            console.log("🎯 Centro ID creado:", centroId);

                            alert(
                                `¡Centro creado exitosamente!\n\n` +
                                `Centro ID: ${centroId}\n\n` +
                                `IMPORTANTE: Guarda este ID y actualiza tu archivo de constantes.`
                            );
                        }

                        setShowInstructions(true);
                    },
                    onError: (error) => {
                        console.error("❌ Error al crear el centro:", error);
                        alert(`Error: ${error.message || 'Error desconocido'}`);
                    },
                }
            );
        } catch (error) {
            console.error("❌ Error preparando transacción:", error);
            alert("Error al preparar la transacción");
        }
    };

    if (CENTRO_ID) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-green-800 mb-3">✅ Centro de Trueque Configurado</h3>
                <div className="space-y-2">
                    <p className="text-green-700">
                        <strong>Centro ID:</strong>
                        <code className="bg-white px-2 py-1 rounded text-sm ml-2 break-all">
                            {CENTRO_ID}
                        </code>
                    </p>
                    <p className="text-sm text-green-600">
                        Tu centro de trueque está listo para usar.
                    </p>
                    <a
                        href={getExplorerUrl(CENTRO_ID)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-green-600 hover:text-green-800 underline text-sm"
                    >
                        Ver en el explorador →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-3">⚠️ Configuración Inicial Requerida</h3>

            <div className="space-y-4">
                <p className="text-yellow-700">
                    Necesitas crear tu primer centro de trueque para obtener el <strong>CENTRO_ID</strong>.
                </p>

                <button
                    onClick={handleCrearCentro}
                    disabled={isPending}
                    className={`font-bold py-3 px-6 rounded transition-colors ${isPending
                            ? "bg-gray-400 cursor-not-allowed text-gray-700"
                            : "bg-yellow-500 hover:bg-yellow-600 text-white"
                        }`}
                >
                    {isPending ? "Creando Centro..." : "🏗️ Crear Mi Primer Centro"}
                </button>

                {showInstructions && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-semibold text-blue-800 mb-2">📋 Próximos pasos:</h4>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                            <li>Copia el Centro ID que apareció en el mensaje</li>
                            <li>Crea un archivo <code>.env.local</code> en tu frontend</li>
                            <li>Agrega: <code>NEXT_PUBLIC_CENTRO_ID=TU_CENTRO_ID_AQUI</code></li>
                            <li>Reinicia el servidor de desarrollo</li>
                        </ol>
                    </div>
                )}

                {createdCentroId && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-semibold text-green-800 mb-2">🎉 ¡Centro Creado!</h4>
                        <p className="text-green-700 text-sm mb-2">
                            <strong>Tu Centro ID:</strong>
                        </p>
                        <code className="bg-white p-2 rounded block text-xs break-all border">
                            {createdCentroId}
                        </code>
                        <div className="mt-3 space-x-2">
                            <button
                                onClick={() => navigator.clipboard.writeText(createdCentroId)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            >
                                📋 Copiar ID
                            </button>
                            <a
                                href={getExplorerUrl(createdCentroId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Ver en explorador
                            </a>
                        </div>
                    </div>
                )}

                <details className="mt-4">
                    <summary className="cursor-pointer text-yellow-700 hover:text-yellow-800">
                        ¿Por qué necesito esto?
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded border text-sm text-gray-700">
                        <p>
                            Tu función <code>crear_centro()</code> crea un <strong>objeto compartido</strong> que
                            actúa como el "hub" donde todos pueden depositar y retirar objetos. Este objeto
                            tiene un ID único que necesitas para todas las operaciones posteriores.
                        </p>
                        <p className="mt-2">
                            Una vez creado, este centro será accesible por cualquier usuario de la red,
                            pero solo tú (como creador) tendrás ciertos privilegios especiales si los
                            implementaste en tu contrato.
                        </p>
                    </div>
                </details>
            </div>
        </div>
    );
}