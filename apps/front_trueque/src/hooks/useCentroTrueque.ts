import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { OBJECT_TYPES, CENTRO_ID } from "@/constants";

export function useCentroTrueque() {
    const account = useCurrentAccount();

    // Obtener el centro de trueque compartido específico
    const { data: centro, isLoading: loadingCentro } = useSuiClientQuery(
        "getObject",
        {
            id: CENTRO_ID,
            options: {
                showContent: true,
                showOwner: true,
            },
        },
        {
            enabled: !!CENTRO_ID,
        }
    );

    // Obtener todos los recibos del usuario
    const { data: recibos, isLoading: loadingRecibos } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address || "",
            filter: {
                StructType: OBJECT_TYPES.RECIBO,
            },
            options: {
                showContent: true,
                showOwner: true,
            },
        },
        {
            enabled: !!account?.address,
        }
    );

    // Obtener coleccionables transferibles (los que el usuario ya retiró)
    const { data: coleccionables, isLoading: loadingColeccionables } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address || "",
            filter: {
                StructType: OBJECT_TYPES.COLECCIONABLE_TRANSFERIBLE,
            },
            options: {
                showContent: true,
                showOwner: true,
            },
        },
        {
            enabled: !!account?.address,
        }
    );

    return {
        centro: centro, // El centro compartido único
        recibos: recibos?.data || [],
        coleccionables: coleccionables?.data || [], // Solo ColeccionableTransferible
        isLoading: loadingCentro || loadingRecibos || loadingColeccionables,
    };
}