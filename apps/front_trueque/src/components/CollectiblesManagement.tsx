"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_FUNCTIONS } from "@/constants";
import { useTransactionHandler } from "@/hooks/useTransactionHandler";
import { useUserColeccionables } from "@/hooks/useUserColeccionables";

interface GestionColeccionablesProps {
    onActualizacionExitosa: () => void;
}

export function GestionColeccionables({ onActualizacionExitosa }: GestionColeccionablesProps) {
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const { showSuccess, showError, showLoading, showConfirmation, handleTransactionError, closeLoading } = useTransactionHandler();
    const { coleccionables, refetch: refetchColeccionables } = useUserColeccionables();

    const handleEditarNombre = (coleccionable: any) => {
        setEditandoId(coleccionable.objectId);
        setNuevoNombre(coleccionable.nombre);
    };

    const handleCancelarEdicion = () => {
        setEditandoId(null);
        setNuevoNombre("");
    };

    const handleGuardarNombre = async (coleccionable: any) => {
        if (!nuevoNombre.trim()) {
            showError("Error", "El nombre no puede estar vacío");
            return;
        }

        if (nuevoNombre === coleccionable.nombre) {
            setEditandoId(null);
            setNuevoNombre("");
            return;
        }

        setIsSubmitting(true);
        showLoading("Actualizando nombre...", "Preparando transacción...");

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: CONTRACT_FUNCTIONS.ACTUALIZAR_NOMBRE_COLECCIONABLE,
                arguments: [
                    tx.object(coleccionable.objectId),
                    tx.pure.string(nuevoNombre),
                ],
            });

            signAndExecuteTransaction(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        closeLoading();
                        showSuccess("¡Nombre actualizado!", "El nombre del coleccionable ha sido actualizado exitosamente");

                        // Refrescar inmediatamente los coleccionables
                        refetchColeccionables();

                        // Notificar al componente padre
                        onActualizacionExitosa();

                        setEditandoId(null);
                        setNuevoNombre("");
                        setIsSubmitting(false);
                    },
                    onError: (error) => {
                        closeLoading();
                        const errorMessage = handleTransactionError(error);
                        showError("Error al actualizar nombre", errorMessage);
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

    if (coleccionables.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No tienes coleccionables aún
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Para obtener coleccionables, retira artículos del guardarropa digital usando tus créditos.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>💡 Cómo obtener coleccionables:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                                <li>Obtén tu carnet de socio</li>
                                <li>Almacena un artículo para ganar 1 crédito</li>
                                <li>Usa el crédito para retirar otro artículo</li>
                                <li>El artículo retirado se convierte en tu coleccionable</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">🎁 Mis Coleccionables</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Gestiona y personaliza los artículos que has retirado del guardarropa digital.
                </p>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Total: <span className="font-semibold">{coleccionables.length}</span> coleccionable{coleccionables.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coleccionables.map((coleccionable) => (
                    <div
                        key={coleccionable.objectId}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    ID: {coleccionable.objectId.slice(0, 8)}...
                                </span>
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                    v{coleccionable.version}
                                </span>
                            </div>

                            {editandoId === coleccionable.objectId ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        className="input-field text-sm"
                                        placeholder="Nuevo nombre"
                                        maxLength={100}
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleGuardarNombre(coleccionable)}
                                            disabled={isSubmitting}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors"
                                        >
                                            {isSubmitting ? "Guardando..." : "Guardar"}
                                        </button>
                                        <button
                                            onClick={handleCancelarEdicion}
                                            disabled={isSubmitting}
                                            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs py-1 px-2 rounded transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                        {coleccionable.nombre}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {coleccionable.descripcion}
                                    </p>
                                    <button
                                        onClick={() => handleEditarNombre(coleccionable)}
                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                    >
                                        ✏️ Editar nombre
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <div>
                                    <span className="font-medium">Creado:</span> {new Date(parseInt(coleccionable.fechaCreacion)).toLocaleDateString()}
                                </div>
                                <div>
                                    <span className="font-medium">Propietario original:</span> {coleccionable.propietarioOriginal.slice(0, 8)}...
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
