"use client";

import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { useMemo } from "react";
import { GUARDARROPA_ID } from "@/constants";

const package_id = process.env.NEXT_PUBLIC_PACKAGE_ID;

interface ArticuloValidationResult {
    puedeRetirar: boolean;
    razon: string;
    creditosDisponibles: string[];
    isLoading: boolean;
    error: string | null;
}

export function useArticuloValidation(articuloClave: string | null) {
    const account = useCurrentAccount();

    // Obtener el estado actual del guardarropa para validar
    const { data: guardarropaData, isLoading: isLoadingGuardarropa, error: errorGuardarropa } = useSuiClientQuery(
        "getObject",
        {
            id: GUARDARROPA_ID || "",
            options: { showContent: true, showType: true },
        },
        { enabled: !!GUARDARROPA_ID }
    );

    // Obtener los créditos del usuario para validar
    const { data: carnetData, isLoading: isLoadingCarnet, error: errorCarnet } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address || "",
            filter: { StructType: `${package_id}::centro_trueque::CarnetDeSocio` },
            options: { showContent: true, showType: true },
        },
        { enabled: !!account?.address }
    );

    const validationResult = useMemo((): ArticuloValidationResult => {
        if (!articuloClave) {
            return {
                puedeRetirar: false,
                razon: "No se especificó un artículo",
                creditosDisponibles: [],
                isLoading: false,
                error: null,
            };
        }

        if (isLoadingGuardarropa || isLoadingCarnet) {
            return {
                puedeRetirar: false,
                razon: "Cargando información...",
                creditosDisponibles: [],
                isLoading: true,
                error: null,
            };
        }

        if (errorGuardarropa || errorCarnet) {
            return {
                puedeRetirar: false,
                razon: "Error al cargar información del sistema",
                creditosDisponibles: [],
                isLoading: false,
                error: errorGuardarropa?.message || errorCarnet?.message || "Error desconocido",
            };
        }

        try {
            // Verificar si el artículo existe en el guardarropa
            const guardarropa = guardarropaData?.data?.content;
            if (!guardarropa || typeof guardarropa !== 'object' || !('fields' in guardarropa)) {
                return {
                    puedeRetirar: false,
                    razon: "No se pudo obtener información del guardarropa",
                    creditosDisponibles: [],
                    isLoading: false,
                    error: "Error al leer el guardarropa",
                };
            }

            const fields = (guardarropa as any).fields;
            const articulosAlmacenados = fields?.articulos_almacenados;
            
            if (!articulosAlmacenados) {
                return {
                    puedeRetirar: false,
                    razon: "El guardarropa no tiene artículos almacenados",
                    creditosDisponibles: [],
                    isLoading: false,
                    error: null,
                };
            }

            // Verificar si el artículo específico existe
            const articuloExiste = articulosAlmacenados.fields?.contents?.some((entry: any) => 
                entry.fields?.key === articuloClave
            );

            if (!articuloExiste) {
                return {
                    puedeRetirar: false,
                    razon: `El artículo con clave #${articuloClave} no existe en el guardarropa`,
                    creditosDisponibles: [],
                    isLoading: false,
                    error: null,
                };
            }

            // Verificar créditos del usuario
            const carnet = carnetData?.data?.[0];
            if (!carnet) {
                return {
                    puedeRetirar: false,
                    razon: "No tienes un carnet de socio activo",
                    creditosDisponibles: [],
                    isLoading: false,
                    error: null,
                };
            }

            const carnetContent = carnet.data?.content;
            if (!carnetContent || typeof carnetContent !== 'object' || !('fields' in carnetContent)) {
                return {
                    puedeRetirar: false,
                    razon: "No se pudo leer tu carnet de socio",
                    creditosDisponibles: [],
                    isLoading: false,
                    error: "Error al leer el carnet",
                };
            }

            const carnetFields = (carnetContent as any).fields;
            const creditosActivos = carnetFields?.creditos_activos?.fields?.contents || [];
            
            if (creditosActivos.length === 0) {
                return {
                    puedeRetirar: false,
                    razon: "No tienes créditos disponibles para retirar artículos",
                    creditosDisponibles: [],
                    isLoading: false,
                    error: null,
                };
            }

            // Verificar si el usuario tiene crédito para este artículo específico
            const tieneCreditoParaArticulo = creditosActivos.some((credito: any) => 
                credito.fields?.key === articuloClave && credito.fields?.value === true
            );

            if (!tieneCreditoParaArticulo) {
                const creditosDisponibles = creditosActivos
                    .filter((credito: any) => credito.fields?.value === true)
                    .map((credito: any) => credito.fields?.key);

                return {
                    puedeRetirar: false,
                    razon: `No tienes un crédito válido para el artículo #${articuloClave}`,
                    creditosDisponibles: creditosDisponibles,
                    isLoading: false,
                    error: null,
                };
            }

            // Si llegamos aquí, el usuario puede retirar el artículo
            return {
                puedeRetirar: true,
                razon: `Puedes retirar el artículo #${articuloClave}`,
                creditosDisponibles: [articuloClave],
                isLoading: false,
                error: null,
            };

        } catch (error) {
            console.error("Error validando artículo:", error);
            return {
                puedeRetirar: false,
                razon: "Error al validar el artículo",
                creditosDisponibles: [],
                isLoading: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }, [articuloClave, guardarropaData, carnetData, isLoadingGuardarropa, isLoadingCarnet, errorGuardarropa, errorCarnet]);

    return validationResult;
}
