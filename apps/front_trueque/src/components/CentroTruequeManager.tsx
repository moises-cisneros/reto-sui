"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCentroTrueque } from "@/hooks/useCentroTrueque";
import { CONTRACT_FUNCTIONS } from "@/constants";

export function CentroTruequeManager() {
    const { centro, recibos, coleccionables, isLoading } = useCentroTrueque();
    const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
    const [activeTab, setActiveTab] = useState<"centro" | "recibos" | "coleccionables">("centro");

    const handleCrearCentro = () => {
        try {
            const tx = new Transaction();

            // Llamada a la función crear_centro
            tx.moveCall({
                target: CONTRACT_FUNCTIONS.CREAR_CENTRO,
                arguments: [],
            });

            console.log("Enviando transacción para crear centro...");

            signAndExecute(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log("✅ Centro creado exitosamente:", result);
                        alert(`¡Centro de trueque creado! Transacción: ${result.digest}`);
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

    const handleCrearRecibo = (nombre: string, descripcion: string) => {
        try {
            const tx = new Transaction();

            // Llamada a la función crear_coleccionable_con_recibo
            tx.moveCall({
                target: CONTRACT_FUNCTIONS.CREAR_COLECCIONABLE_CON_RECIBO,
                arguments: [
                    tx.pure.string(nombre),
                    tx.pure.string(descripcion),
                ],
            });

            console.log("Enviando transacción para crear recibo...", { nombre, descripcion });

            signAndExecute(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log("✅ Recibo creado exitosamente:", result);
                        alert(`¡Recibo creado! Transacción: ${result.digest}`);
                    },
                    onError: (error) => {
                        console.error("❌ Error al crear el recibo:", error);
                        alert(`Error: ${error.message || 'Error desconocido'}`);
                    },
                }
            );
        } catch (error) {
            console.error("❌ Error preparando transacción:", error);
            alert("Error al preparar la transacción");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-lg text-gray-600">Cargando datos...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Debug info */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <h3 className="font-semibold mb-2">Estado de la conexión:</h3>
                <p>Centro: {centro ? "✅ Conectado" : "❌ No encontrado"} | Recibos: {recibos.length} | Coleccionables: {coleccionables.length}</p>
                {isPending && <p className="text-blue-600">⏳ Transacción en proceso...</p>}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {["centro", "recibos", "coleccionables"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {tab} ({tab === "centro" ? (centro ? "1" : "0") : tab === "recibos" ? recibos.length : coleccionables.length})
                        </button>
                    ))}
                </nav>
            </div>

            {/* Centro Tab */}
            {activeTab === "centro" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Centro de Trueque Compartido</h2>
                        {!centro && (
                            <button
                                onClick={handleCrearCentro}
                                disabled={isPending}
                                className={`font-bold py-2 px-4 rounded transition-colors ${isPending
                                    ? "bg-gray-400 cursor-not-allowed text-gray-700"
                                    : "bg-blue-500 hover:bg-blue-700 text-white"
                                    }`}
                            >
                                {isPending ? "Creando..." : "Crear Centro"}
                            </button>
                        )}
                    </div>

                    {!centro ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-4">El centro de trueque no está disponible.</p>
                            <p className="text-sm text-gray-400">Crea el centro para comenzar a intercambiar objetos.</p>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow border">
                            <h3 className="font-semibold text-lg mb-2">Centro de Trueque</h3>
                            <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">ID:</span> {centro.data?.objectId?.slice(0, 16)}...
                            </p>
                            <p className="text-xs text-gray-400 mb-2">
                                Versión: {centro.data?.version}
                            </p>
                            {centro.data?.content && 'fields' in centro.data.content && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm">
                                        <span className="font-medium">Total de objetos:</span> {(centro.data.content.fields as any)?.total_objetos || 0}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium">Siguiente clave:</span> {(centro.data.content.fields as any)?.siguiente_clave || 0}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Recibos Tab */}
            {activeTab === "recibos" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Mis Recibos</h2>
                        <CrearReciboForm onSubmit={handleCrearRecibo} isPending={isPending} />
                    </div>

                    {recibos.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-4">No tienes recibos aún.</p>
                            <p className="text-sm text-gray-400">Crea un recibo para depositar objetos en los centros de trueque.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recibos.map((recibo) => (
                                <div key={recibo.data?.objectId} className="bg-white p-6 rounded-lg shadow border">
                                    <h3 className="font-semibold text-lg mb-2">Recibo</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">ID:</span> {recibo.data?.objectId?.slice(0, 8)}...
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Versión: {recibo.data?.version}
                                    </p>
                                    {recibo.data?.content && 'fields' in recibo.data.content && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500">
                                                Recibos activos: {Object.keys((recibo.data.content.fields as any)?.recibos_activos?.fields || {}).length}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Coleccionables Tab */}
            {activeTab === "coleccionables" && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Mis Coleccionables</h2>

                    {coleccionables.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-4">No tienes coleccionables aún.</p>
                            <p className="text-sm text-gray-400">Los coleccionables aparecerán aquí cuando retires objetos de los centros.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coleccionables.map((coleccionable) => (
                                <div key={coleccionable.data?.objectId} className="bg-white p-6 rounded-lg shadow border">
                                    <h3 className="font-semibold text-lg mb-2">Coleccionable</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">ID:</span> {coleccionable.data?.objectId?.slice(0, 8)}...
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Versión: {coleccionable.data?.version}
                                    </p>
                                    {coleccionable.data?.content && 'fields' in coleccionable.data.content && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm">
                                                <span className="font-medium">Nombre:</span> {(coleccionable.data.content.fields as any)?.nombre || "Sin nombre"}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-medium">Descripción:</span> {(coleccionable.data.content.fields as any)?.descripcion || "Sin descripción"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Componente auxiliar para crear recibos
function CrearReciboForm({
    onSubmit,
    isPending
}: {
    onSubmit: (nombre: string, descripcion: string) => void;
    isPending: boolean;
}) {
    const [showForm, setShowForm] = useState(false);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre.trim() && descripcion.trim()) {
            onSubmit(nombre.trim(), descripcion.trim());
            setNombre("");
            setDescripcion("");
            setShowForm(false);
        }
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                disabled={isPending}
                className={`font-bold py-2 px-4 rounded transition-colors ${isPending
                    ? "bg-gray-400 cursor-not-allowed text-gray-700"
                    : "bg-green-500 hover:bg-green-700 text-white"
                    }`}
            >
                Crear Recibo
            </button>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow border">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del objeto
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: Mi primer coleccionable"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isPending}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                    </label>
                    <textarea
                        placeholder="Describe tu objeto..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                        disabled={isPending}
                    />
                </div>
                <div className="flex space-x-2">
                    <button
                        type="submit"
                        disabled={isPending || !nombre.trim() || !descripcion.trim()}
                        className={`font-bold py-2 px-4 rounded transition-colors ${isPending || !nombre.trim() || !descripcion.trim()
                            ? "bg-gray-400 cursor-not-allowed text-gray-700"
                            : "bg-green-500 hover:bg-green-700 text-white"
                            }`}
                    >
                        {isPending ? "Creando..." : "Crear"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={isPending}
                        className="font-bold py-2 px-4 rounded bg-gray-500 hover:bg-gray-700 text-white disabled:bg-gray-400"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}