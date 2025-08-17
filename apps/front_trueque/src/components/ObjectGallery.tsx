"use client";

import { useState, useEffect } from "react";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { EVENT_TYPES } from "@/constants";
import { ArticuloCard } from "./CardItem";

interface ArticuloEnGuardarropa {
    clave: string;
    nombre: string;
    descripcion: string;
    objectId: string;
}

interface GaleriaObjetosProps {
    tieneCarnet: boolean;
    creditosActivos: number;
}

export function GaleriaObjetos({ tieneCarnet, creditosActivos }: GaleriaObjetosProps) {
    const [articulos, setArticulos] = useState<ArticuloEnGuardarropa[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Obtener eventos de artículos almacenados y retirados para construir el estado actual
    const { data: eventosAlmacenados } = useSuiClientQuery(
        "queryEvents",
        {
            query: {
                MoveEventType: EVENT_TYPES.ARTICULO_ALMACENADO,
            },
            limit: 100,
        }
    );

    const { data: eventosRetirados } = useSuiClientQuery(
        "queryEvents",
        {
            query: {
                MoveEventType: EVENT_TYPES.ARTICULO_RETIRADO,
            },
            limit: 100,
        }
    );

    // Construir el estado actual de artículos en el guardarropa
    useEffect(() => {
        if (eventosAlmacenados?.data && eventosRetirados?.data) {
            const articulosAlmacenados = new Map<string, ArticuloEnGuardarropa>();
            const articulosRetirados = new Set<string>();

            // Procesar eventos de almacenamiento
            eventosAlmacenados.data.forEach((evento) => {
                if (evento.parsedJson) {
                    const { clave, nombre_articulo } = evento.parsedJson as any;
                    articulosAlmacenados.set(clave, {
                        clave,
                        nombre: nombre_articulo,
                        descripcion: "Descripción del artículo",
                        objectId: "",
                    });
                }
            });

            // Procesar eventos de retiro
            eventosRetirados.data.forEach((evento) => {
                if (evento.parsedJson) {
                    const { clave } = evento.parsedJson as any;
                    articulosRetirados.add(clave);
                }
            });

            // Filtrar solo artículos que están actualmente en el guardarropa
            const articulosActuales = Array.from(articulosAlmacenados.values())
                .filter((art) => !articulosRetirados.has(art.clave));

            setArticulos(articulosActuales);
            setIsLoading(false);
        }
    }, [eventosAlmacenados, eventosRetirados]);

    const handleArticuloRetirado = () => {
        // Esta función se llama cuando un artículo es retirado exitosamente
        console.log("Artículo retirado, actualizando galería...");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-lg text-gray-600 dark:text-gray-400">Cargando galería...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    🎨 Galería de Artículos
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {articulos.length} artículo{articulos.length !== 1 ? 's' : ''} disponible{articulos.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Estado del usuario */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${tieneCarnet ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            {tieneCarnet ? 'Carnet de Socio Activo' : 'Sin Carnet de Socio'}
                        </span>
                    </div>
                    {tieneCarnet && (
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                            Créditos disponibles: <span className="font-semibold">{creditosActivos}</span>
                        </div>
                    )}
                </div>
                {!tieneCarnet && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                        Para retirar artículos, primero obtén tu carnet de socio en la pestaña "Mi Carnet".
                    </p>
                )}
            </div>

            {/* Lista de artículos */}
            {articulos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No hay artículos disponibles
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        El guardarropa digital está vacío. ¡Sé el primero en almacenar un artículo!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articulos.map((articulo) => (
                        <ArticuloCard
                            key={articulo.clave}
                            articulo={articulo}
                            tieneCarnet={tieneCarnet}
                            creditosActivos={creditosActivos}
                            onArticuloRetirado={handleArticuloRetirado}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
