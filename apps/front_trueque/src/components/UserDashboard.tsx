"use client";

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_FUNCTIONS, REGISTRO_SOCIOS_ID } from "@/constants";
import { useTransactionHandler } from "@/hooks/useTransactionHandler";
import { useUserCarnet } from "@/hooks/useUserCarnet";

interface DashboardUsuarioProps {
    onCarnetObtenido: () => void;
}

export function DashboardUsuario({ onCarnetObtenido }: DashboardUsuarioProps) {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError, showLoading, showConfirmation, handleTransactionError, closeLoading } = useTransactionHandler();
    const { carnet, tieneCarnet, refetch: refetchCarnet } = useUserCarnet();

    const handleObtenerCarnet = async () => {
        if (!REGISTRO_SOCIOS_ID) {
            showError("Error", "ID del registro de socios no configurado");
            return;
        }

        setIsLoading(true);
        showLoading("Obteniendo carnet de socio...", "Preparando transacción...");

        try {
            const tx = new Transaction();

            // Llamar a obtener_carnet_de_socio con solo el registro y ctx
            tx.moveCall({
                target: CONTRACT_FUNCTIONS.OBTENER_CARNET_SOCIO,
                arguments: [
                    tx.object(REGISTRO_SOCIOS_ID), // registro: &mut RegistroDeSocios
                    // ctx se pasa automáticamente
                ],
            });

            signAndExecuteTransaction(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        closeLoading();
                        showSuccess("¡Carnet obtenido!", "Tu carnet de socio ha sido creado exitosamente");

                        // Refrescar inmediatamente los datos del carnet
                        refetchCarnet();

                        // Notificar al componente padre
                        onCarnetObtenido();

                        setIsLoading(false);
                    },
                    onError: (error) => {
                        closeLoading();
                        const errorMessage = handleTransactionError(error);
                        showError("Error al obtener carnet", errorMessage);
                        setIsLoading(false);
                    },
                }
            );
        } catch (error) {
            closeLoading();
            const errorMessage = handleTransactionError(error);
            showError("Error de preparación", errorMessage);
            setIsLoading(false);
        }
    };

    if (tieneCarnet && carnet) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">🎫 Mi Carnet de Socio</h2>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">ID del Carnet</div>
                            <div className="font-mono text-blue-600 dark:text-blue-400 text-xs break-all">
                                {carnet.objectId}
                            </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="text-sm font-medium text-green-800 dark:text-green-200">Créditos Activos</div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {carnet.creditosActivos}
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Estado</div>
                        <div className="text-purple-600 dark:text-purple-400">
                            ✅ Socio activo con {carnet.creditosActivos} crédito{carnet.creditosActivos !== 1 ? 's' : ''} disponible{carnet.creditosActivos !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>💡 <strong>¿Cómo funciona?</strong></p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Almacena un artículo = Obtienes 1 crédito</li>
                            <li>Retira un artículo = Consumes 1 crédito</li>
                            <li>Los créditos son únicos para cada artículo</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Necesitas un Carnet de Socio
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Para participar en el guardarropa digital, primero debes obtener tu carnet de socio único.
                </p>

                <button
                    onClick={handleObtenerCarnet}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                    {isLoading ? "Obteniendo..." : "🎫 Obtener Carnet de Socio"}
                </button>

                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <p>✅ Solo se permite un carnet por usuario</p>
                    <p>✅ El carnet es tu identificación única en el sistema</p>
                    <p>✅ Necesario para almacenar y retirar artículos</p>
                </div>
            </div>
        </div>
    );
}
