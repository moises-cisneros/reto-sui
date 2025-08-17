"use client";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { OBJECT_TYPES } from "@/constants";

export function useUserCarnet() {
    const account = useCurrentAccount();

    const { data, refetch, isLoading, error } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address || "",
            filter: { StructType: OBJECT_TYPES.CARNET_DE_SOCIO },
            options: { showContent: true, showType: true, showOwner: true },
        },
        { enabled: !!account?.address, refetchInterval: 3000 }
    );

    // Obtener el primer carnet (si existe)
    const carnet = data?.data?.[0];

    // Calcular créditos activos - CORREGIDO para VecMap
    const creditosActivos = (() => {
        if (!carnet?.data?.content) return 0;
        const content = carnet.data.content;
        const fields = content && typeof content === 'object' && 'fields' in content ? (content as any).fields : undefined;
        if (!fields || Array.isArray(fields)) return 0;

        const creditosActivosField = (fields as any).creditos_activos;
        if (!creditosActivosField || typeof creditosActivosField !== 'object') return 0;

        // VecMap tiene un campo 'contents' que es un array de Entry<u64, bool>
        const contents = creditosActivosField.fields?.contents;
        if (!Array.isArray(contents)) return 0;

        // Contar solo las entradas donde value es true (créditos activos)
        return contents.filter((entry: any) => entry.fields?.value === true).length;
    })();

    // Transformar datos para mejor uso
    const carnetTransformado = carnet ? {
        objectId: carnet.data?.objectId || "",
        version: carnet.data?.version ?? 0,
        creditosActivos: creditosActivos,
        propietario: (() => {
            const content = carnet.data?.content;
            const fields = content && typeof content === 'object' && 'fields' in content ? (content as any).fields : undefined;
            return fields?.propietario || "";
        })(),
    } : null;

    return {
        carnet: carnetTransformado,
        creditosActivos,
        tieneCarnet: !!carnet,
        isLoading,
        error,
        refetch,
    };
}
