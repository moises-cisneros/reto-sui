"use client";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { OBJECT_TYPES } from "@/constants";

export function useUserColeccionables() {
    const account = useCurrentAccount();

    const { data, refetch, isLoading, error } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address || "",
            filter: { StructType: OBJECT_TYPES.COLECCIONABLE },
            options: { showContent: true, showType: true, showOwner: true },
        },
        { enabled: !!account?.address, refetchInterval: 3000 }
    );

    // Transformar datos para mejor uso
    const coleccionables = (data?.data || []).map((coleccionable: any) => ({
        objectId: coleccionable.data.objectId,
        version: coleccionable.data.version,
        nombre: coleccionable.data.content?.fields?.nombre || "Sin nombre",
        descripcion: coleccionable.data.content?.fields?.descripcion || "Sin descripción",
        fechaCreacion: coleccionable.data.content?.fields?.fecha_creacion || "0",
        propietarioOriginal: coleccionable.data.content?.fields?.propietario_original || "",
    }));

    return {
        coleccionables,
        totalColeccionables: coleccionables.length,
        isLoading,
        error,
        refetch,
    };
}
