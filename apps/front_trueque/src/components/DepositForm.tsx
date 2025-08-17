"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_FUNCTIONS, GUARDARROPA_ID } from "@/constants";
import { useTransactionHandler } from "@/hooks/useTransactionHandler";
import { useUserCarnet } from "@/hooks/useUserCarnet";

interface FormularioDepositoProps {
    tieneCarnet: boolean;
    onArticuloAlmacenado: () => void;
}

export function FormularioDeposito({ tieneCarnet, onArticuloAlmacenado }: FormularioDepositoProps) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const { showSuccess, showError, showLoading, showConfirmation, handleTransactionError, closeLoading } = useTransactionHandler();
    const { carnet, refetch: refetchCarnet } = useUserCarnet();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!GUARDARROPA_ID) {
            showError("Error", "ID del guardarropa no configurado");
            return;
        }

        if (!carnet?.objectId) {
            showError("Error", "No se pudo obtener el ID del carnet de socio");
            return;
        }

        if (!nombre.trim() || !descripcion.trim()) {
            showError("Error", "Por favor completa todos los campos");
            return;
        }

        // Mostrar confirmación antes de proceder
        const confirmed = await showConfirmation(
            "Confirmar Almacenamiento",
            `¿Estás seguro de que quieres almacenar el artículo "${nombre}"? Esto te dará 1 crédito para retirar otro artículo.`
        );

        if (!confirmed) return;

        setIsSubmitting(true);
        showLoading("Almacenando artículo...", "Preparando transacción...");

        try {
            const tx = new Transaction();

            // Llamar a almacenar_articulo con los parámetros correctos del contrato actual
            tx.moveCall({
                target: CONTRACT_FUNCTIONS.ALMACENAR_ARTICULO,
                arguments: [
                    tx.object(GUARDARROPA_ID),
                    tx.object(carnet.objectId),
                    tx.pure.string(nombre),
                    tx.pure.string(descripcion),
                ],
            });

            signAndExecuteTransaction(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        closeLoading();
                        showSuccess("¡Artículo almacenado!", "Tu artículo ha sido almacenado exitosamente y has ganado 1 crédito");
                        setNombre("");
                        setDescripcion("");

                        // Refrescar inmediatamente los datos del carnet para mostrar créditos actualizados
                        refetchCarnet();

                        // Notificar al componente padre para refrescar otros datos
                        onArticuloAlmacenado();

                        setIsSubmitting(false);
                    },
                    onError: (error) => {
                        closeLoading();
                        const errorMessage = handleTransactionError(error);
                        showError("Error al almacenar artículo", errorMessage);
                        setIsSubmitting(false);
                    },
                }
            );
        } catch (error) {
            closeLoading();
            const errorMessage = handleTransactionError(error);
            showError("Error de preparación", errorMessage);
            setIsSubmitting(false);
        }
    };

    if (!tieneCarnet) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Necesitas un Carnet de Socio
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300">
                        Para almacenar artículos, primero debes obtener tu carnet de socio en la pestaña "Mi Carnet".
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">📦 Almacenar Artículo</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Comparte un artículo digital y obtén 1 crédito para retirar otro artículo del guardarropa.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre del Artículo *
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        placeholder="Ej: Mi primer artículo digital"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="input-field"
                        required
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {nombre.length}/100 caracteres
                    </p>
                </div>

                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descripción *
                    </label>
                    <textarea
                        id="descripcion"
                        placeholder="Describe tu artículo... ¿Qué lo hace especial?"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={3}
                        className="textarea-field"
                        required
                        disabled={isSubmitting}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {descripcion.length}/500 caracteres
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400 dark:text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                ¿Cómo funciona el almacenamiento?
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Al almacenar un artículo, recibes 1 crédito en tu carnet de socio.
                                Este crédito te permitirá retirar otro artículo del guardarropa digital.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !nombre.trim() || !descripcion.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Almacenando...
                        </div>
                    ) : (
                        "📦 Almacenar Artículo"
                    )}
                </button>
            </form>
        </div>
    );
}
