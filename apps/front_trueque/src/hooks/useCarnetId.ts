"use client";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { OBJECT_TYPES } from "@/constants";

export function useCarnetId() {
    const account = useCurrentAccount();

    const { data: carnets, isLoading, refetch } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address || "",
            filter: { StructType: OBJECT_TYPES.CARNET_DE_SOCIO },
            options: { showContent: true, showType: true, showOwner: true },
        },
        { enabled: !!account?.address }
    );

    // Obtener el ID del primer carnet (si existe)
    const carnetId = carnets?.data?.[0]?.data?.objectId;

    return {
        carnetId,
        isLoading,
        refetch,
        tieneCarnet: !!carnetId,
    };
}
