"use client";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useCallback, useState, useEffect } from "react";
import { OBJECT_TYPES, GUARDARROPA_ID, REGISTRO_SOCIOS_ID } from "@/constants";

export interface CarnetDeSocio {
    data: {
        objectId: string;
        version: string;
        content?: {
            fields?: {
                creditos_activos?: {
                    fields?: Record<string, any>;
                };
                propietario?: string;
            };
        };
    };
}

export interface Coleccionable {
    data: {
        objectId: string;
        version: string;
        content?: {
            fields?: {
                nombre?: string;
                descripcion?: string;
                fecha_creacion?: string;
                propietario_original?: string;
            };
        };
    };
}

export function useCentroTrueque() {
    const account = useCurrentAccount();
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshData = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    // Obtener el guardarropa digital compartido
    const { data: guardarropa, isLoading: loadingGuardarropa, refetch: refetchGuardarropa } = useSuiClientQuery(
        "getObject",
        {
            id: GUARDARROPA_ID as string,
            options: { showContent: true, showOwner: true },
        },
        { enabled: !!GUARDARROPA_ID, refetchInterval: 5000 } // Refrescar cada 5 segundos
    );

    // Obtener el registro de socios compartido
    const { data: registroSocios, isLoading: loadingRegistroSocios, refetch: refetchRegistroSocios } = useSuiClientQuery(
        "getObject",
        {
            id: REGISTRO_SOCIOS_ID as string,
            options: { showContent: true, showOwner: true },
        },
        { enabled: !!REGISTRO_SOCIOS_ID, refetchInterval: 5000 } // Refrescar cada 5 segundos
    );

    // Verificar si el usuario está registrado como socio
    const { data: usuarioRegistrado, isLoading: loadingUsuarioRegistrado, refetch: refetchUsuarioRegistrado } = useSuiClientQuery(
        "getObject",
        {
            id: REGISTRO_SOCIOS_ID as string,
            options: { showContent: true },
        },
        { enabled: !!REGISTRO_SOCIOS_ID && !!account?.address, refetchInterval: 5000 } // Refrescar cada 5 segundos
    );

    // Obtener el carnet de socio del usuario (si existe)
    const { data: carnets, isLoading: loadingCarnets, refetch: refetchCarnets } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address || "",
            filter: { StructType: OBJECT_TYPES.CARNET_DE_SOCIO },
            options: { showContent: true, showType: true, showOwner: true },
        },
        { enabled: !!account?.address, refetchInterval: 3000 } // Refrescar cada 3 segundos
    );

    // Obtener coleccionables (los que el usuario ya retiró)
    const { data: coleccionables, isLoading: loadingColeccionables, refetch: refetchColeccionables } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address || "",
            filter: { StructType: OBJECT_TYPES.COLECCIONABLE },
            options: { showContent: true, showType: true, showOwner: true },
        },
        { enabled: !!account?.address, refetchInterval: 3000 } // Refrescar cada 3 segundos
    );

    // Calcular créditos activos del primer carnet (si existe)
    const creditosActivos = (() => {
        const first = carnets?.data?.[0];
        const content = first?.data?.content;
        const fields = content && typeof content === 'object' && 'fields' in content ? (content as any).fields : undefined;
        if (!fields || Array.isArray(fields)) return 0;
        const creditosActivosField = (fields as any).creditos_activos;
        const caFields = creditosActivosField && typeof creditosActivosField === 'object' && 'fields' in creditosActivosField ? (creditosActivosField as any).fields : undefined;
        if (!caFields || Array.isArray(caFields)) return 0;
        return Object.keys(caFields).length;
    })();

    // Verificar si el usuario está registrado (based on having a carnet)
    const estaRegistrado = (() => {
        return carnets?.data && carnets.data.length > 0;
    })();

    // Transformar datos para mejor uso
    const carnetsTransformados = (carnets?.data || []).map((carnet: any) => ({
        objectId: carnet.data.objectId,
        version: carnet.data.version,
        creditosActivos: creditosActivos,
        propietario: carnet.data.content?.fields?.propietario || "",
    }));

    const coleccionablesTransformados = (coleccionables?.data || []).map((coleccionable: any) => ({
        objectId: coleccionable.data.objectId,
        version: coleccionable.data.version,
        nombre: coleccionable.data.content?.fields?.nombre || "Sin nombre",
        descripcion: coleccionable.data.content?.fields?.descripcion || "Sin descripción",
        fechaCreacion: coleccionable.data.content?.fields?.fecha_creacion || "0",
        propietarioOriginal: coleccionable.data.content?.fields?.propietario_original || "",
    }));

    // Función para refrescar todos los datos después de una transacción
    const refreshAllData = useCallback(async () => {
        try {
            console.log("🔄 Refrescando todos los datos...");
            await Promise.all([
                refetchGuardarropa(),
                refetchRegistroSocios(),
                refetchUsuarioRegistrado(),
                refetchCarnets(),
                refetchColeccionables(),
            ]);
            refreshData();
            console.log("✅ Datos refrescados exitosamente");
        } catch (error) {
            console.error("❌ Error refreshing data:", error);
        }
    }, [refetchGuardarropa, refetchRegistroSocios, refetchUsuarioRegistrado, refetchCarnets, refetchColeccionables, refreshData]);

    // Refrescar datos automáticamente cuando cambie la cuenta
    useEffect(() => {
        if (account?.address) {
            refreshAllData();
        }
    }, [account?.address, refreshAllData]);

    return {
        guardarropa: guardarropa,
        registroSocios: registroSocios,
        carnets: carnetsTransformados,
        coleccionables: coleccionablesTransformados,
        creditosActivos: creditosActivos,
        estaRegistrado: estaRegistrado,
        tieneCarnet: carnets?.data && carnets.data.length > 0,
        isLoading: loadingGuardarropa || loadingRegistroSocios || loadingUsuarioRegistrado || loadingCarnets || loadingColeccionables,
        refreshData: refreshAllData,
        refreshKey,
    };
}