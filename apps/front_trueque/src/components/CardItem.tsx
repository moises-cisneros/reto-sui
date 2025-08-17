"use client";

import { useState } from "react";
import { useArticuloValidation } from "@/hooks/useArticuloValidation";
import { useTransactionHandler } from "@/hooks/useTransactionHandler";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_FUNCTIONS, GUARDARROPA_ID } from "@/constants";
import { useUserCarnet } from "@/hooks/useUserCarnet";
import Swal from "sweetalert2";

interface ArticuloEnGuardarropa {
    clave: string;
    nombre: string;
    descripcion: string;
    objectId: string;
}

interface ArticuloCardProps {
    articulo: ArticuloEnGuardarropa;
    tieneCarnet: boolean;
    creditosActivos: number;
    onArticuloRetirado: () => void;
}

export function ArticuloCard({ articulo, tieneCarnet, creditosActivos, onArticuloRetirado }: ArticuloCardProps) {
    const [isRetirando, setIsRetirando] = useState(false);
    const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
    const { showSuccess, showError, showLoading, showConfirmation, showValidationError, handleTransactionError } = useTransactionHandler();
    const { carnet, refetch: refetchCarnet } = useUserCarnet();

    // Validación en tiempo real del artículo
    const validacion = useArticuloValidation(articulo.clave);

    const handleRetirarArticulo = async () => {
        if (!tieneCarnet || creditosActivos <= 0) {
            showError(
                "No puedes retirar artículos",
                "Necesitas un carnet de socio activo y créditos disponibles para retirar artículos"
            );
            return;
        }

        // Verificar que tenemos el ID del guardarropa
        if (!GUARDARROPA_ID) {
            showError(
                "Error de Configuración",
                "ID del guardarropa no configurado. Contacta al administrador."
            );
            return;
        }

        // Verificar que tenemos el carnet
        if (!carnet?.objectId) {
            showError(
                "Error de Carnet",
                "No se pudo obtener el ID del carnet de socio. Por favor, verifica tu conexión."
            );
            return;
        }

        // VALIDACIÓN PREVIA: Verificar si el usuario puede retirar este artículo específico
        if (validacion.isLoading) {
            showLoading("Validando artículo", "Verificando si puedes retirar este artículo...");
            return;
        }

        if (!validacion.puedeRetirar) {
            // Mostrar error de validación con información sobre créditos disponibles
            showValidationError(
                "No puedes retirar este artículo",
                validacion.razon,
                validacion.creditosDisponibles
            );
            return;
        }

        // VALIDACIÓN ADICIONAL: Mostrar alerta específica sobre créditos por artículo
        const confirmed = await showConfirmation(
            "⚠️ Confirmar Retiro de Artículo",
            `Estás a punto de retirar el artículo "${articulo.nombre}" (clave #${articulo.clave}).
            Esto consumirá 1 crédito de tu carnet de socio.
            ¿Estás seguro de que quieres continuar?`
        );

        if (!confirmed) return;

        try {
            setIsRetirando(true);
            const tx = new Transaction();

            // Llamada a la función retirar_articulo
            tx.moveCall({
                target: CONTRACT_FUNCTIONS.RETIRAR_ARTICULO,
                arguments: [
                    tx.object(GUARDARROPA_ID),
                    tx.object(carnet.objectId),
                    tx.pure.u64(parseInt(articulo.clave)),
                ],
            });

            showLoading("Retirando Artículo", "Preparando transacción...");

            signAndExecute(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log("✅ Artículo retirado exitosamente:", result);

                        // Cerrar loading
                        Swal.close();

                        // Mostrar éxito
                        showSuccess(
                            "¡Artículo Retirado!",
                            `El artículo "${articulo.nombre}" ha sido retirado exitosamente. Ahora es tuyo y puedes personalizarlo.`,
                            result.digest
                        );

                        // Refrescar datos
                        refetchCarnet();
                        onArticuloRetirado();
                    },
                    onError: (error) => {
                        console.error("❌ Error al retirar el artículo:", error);

                        // Cerrar loading
                        Swal.close();

                        // Mostrar error
                        const errorMessage = handleTransactionError(error);
                        showError(
                            "Error al Retirar Artículo",
                            errorMessage
                        );
                    },
                }
            );
        } catch (error) {
            console.error("❌ Error preparando transacción:", error);
            Swal.close();
            showError(
                "Error de Preparación",
                "Error al preparar la transacción. Por favor, inténtalo de nuevo."
            );
        } finally {
            setIsRetirando(false);
        }
    };

    // Determinar el estado del botón basado en la validación
    const getButtonState = () => {
        if (validacion.isLoading) {
            return {
                disabled: true,
                text: "Validando...",
                className: "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            };
        }

        if (!tieneCarnet) {
            return {
                disabled: true,
                text: "Necesitas carnet",
                className: "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            };
        }

        if (creditosActivos <= 0) {
            return {
                disabled: true,
                text: "Sin créditos",
                className: "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            };
        }

        if (!validacion.puedeRetirar) {
            return {
                disabled: true,
                text: "Sin crédito válido",
                className: "bg-orange-300 dark:bg-orange-600 text-orange-800 dark:text-orange-200 cursor-not-allowed"
            };
        }

        if (isRetirando || isPending) {
            return {
                disabled: true,
                text: "Retirando...",
                className: "bg-blue-600 dark:bg-blue-500 text-white cursor-not-allowed"
            };
        }

        return {
            disabled: false,
            text: `🎁 Retirar (1 crédito)`,
            className: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
        };
    };

    const buttonState = getButtonState();

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {articulo.nombre}
                </h3>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                    #{articulo.clave}
                </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
                {articulo.descripcion}
            </p>

            {/* Estado de validación */}
            {validacion.isLoading && (
                <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                    🔍 Validando artículo...
                </div>
            )}

            {!validacion.isLoading && !validacion.puedeRetirar && (
                <div className="mb-4 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs text-orange-700 dark:text-orange-300">
                    ⚠️ {validacion.razon}
                </div>
            )}

            <button
                onClick={handleRetirarArticulo}
                disabled={buttonState.disabled}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${buttonState.className}`}
            >
                {buttonState.text}
            </button>
        </div>
    );
}
