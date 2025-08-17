"use client";

import { useState, useEffect } from "react";
import { useCentroTrueque } from "@/hooks/useCentroTrueque";
import { useUserCarnet } from "@/hooks/useUserCarnet";
import { useUserColeccionables } from "@/hooks/useUserColeccionables";
import { GaleriaObjetos } from "./ObjectGallery";
import { FormularioDeposito } from "./DepositForm";
import { DashboardUsuario } from "./UserDashboard";
import { GestionColeccionables } from "./CollectiblesManagement";

export function CentroTruequeDigital() {
    const { guardarropa, registroSocios, isLoading: loadingSistema, refreshData } = useCentroTrueque();
    const { carnet, tieneCarnet, creditosActivos, refetch: refetchCarnet } = useUserCarnet();
    const { coleccionables, refetch: refetchColeccionables } = useUserColeccionables();
    const [activeTab, setActiveTab] = useState<"galeria" | "almacenar" | "mi-carnet" | "coleccionables">("galeria");

    // Función para refrescar datos después de transacciones exitosas
    const handleRefresh = async () => {
        console.log("🔄 Refrescando datos desde CentroTruequeDigital...");
        await Promise.all([
            refreshData(),
            refetchCarnet(),
            refetchColeccionables(),
        ]);
    };

    // Función para actualizar el estado del sistema en el layout
    useEffect(() => {
        if (guardarropa && registroSocios) {
            // Actualizar Guardarropa ID
            const guardarropaIdElement = document.getElementById('guardarropa-id');
            if (guardarropaIdElement) {
                guardarropaIdElement.textContent = `${guardarropa.data?.objectId?.slice(0, 16)}...`;
            }

            // Actualizar Registro ID
            const registroIdElement = document.getElementById('registro-id');
            if (registroIdElement) {
                registroIdElement.textContent = `${registroSocios.data?.objectId?.slice(0, 16)}...`;
            }

            // Actualizar Estado del Usuario
            const userStatusElement = document.getElementById('user-status');
            if (userStatusElement) {
                userStatusElement.textContent = tieneCarnet ? "✅ Con carnet" : "❌ Sin carnet";
            }

            // Actualizar Créditos Activos
            const creditosElement = document.getElementById('creditos-activos');
            if (creditosElement) {
                creditosElement.textContent = creditosActivos.toString();
            }
        }
    }, [guardarropa, registroSocios, tieneCarnet, creditosActivos]);

    // Refrescar datos automáticamente cada 10 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            if (guardarropa && registroSocios) {
                console.log("🔄 Refresco automático de datos...");
                handleRefresh();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [guardarropa, registroSocios]);

    if (loadingSistema) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-lg text-gray-600">Cargando guardarropa digital...</span>
            </div>
        );
    }

    if (!guardarropa || !registroSocios) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Guardarropa Digital no disponible
                </h3>
                <p className="text-gray-500">
                    El guardarropa digital no está configurado en esta red.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Navegación por pestañas */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { key: "galeria", label: "🎨 Galería", count: null },
                        { key: "almacenar", label: "📦 Almacenar", count: null },
                        { key: "mi-carnet", label: "🎫 Mi Carnet", count: tieneCarnet ? "1" : "0" },
                        { key: "coleccionables", label: "🎁 Coleccionables", count: coleccionables.length.toString() }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                        >
                            {tab.label}
                            {tab.count && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contenido de las pestañas */}
            <div>
                {activeTab === "galeria" && (
                    <GaleriaObjetos
                        tieneCarnet={tieneCarnet}
                        creditosActivos={creditosActivos}
                    />
                )}

                {activeTab === "almacenar" && (
                    <FormularioDeposito
                        tieneCarnet={tieneCarnet}
                        onArticuloAlmacenado={handleRefresh}
                    />
                )}

                {activeTab === "mi-carnet" && (
                    <DashboardUsuario
                        onCarnetObtenido={handleRefresh}
                    />
                )}

                {activeTab === "coleccionables" && (
                    <GestionColeccionables
                        onActualizacionExitosa={handleRefresh}
                    />
                )}
            </div>

            {/* Footer informativo */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-2">💡 Consejos para usar el guardarropa digital:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <strong>1. Obtener Carnet:</strong> Primero obtén tu carnet de socio para participar
                        </div>
                        <div>
                            <strong>2. Almacenar:</strong> Comparte artículos y gana créditos para retirar
                        </div>
                        <div>
                            <strong>3. Retirar:</strong> Usa tus créditos para llevarte artículos únicos
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
