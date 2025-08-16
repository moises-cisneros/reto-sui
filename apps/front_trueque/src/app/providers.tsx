"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import "@mysten/dapp-kit/dist/index.css";

// Configuración mejorada de redes
const { networkConfig, useNetworkVariable } = createNetworkConfig({
    devnet: {
        url: getFullnodeUrl("devnet"),
        variables: {
            myMovePackageId: "0x9efa4d7b8ccfdcb2100ff736768720c9198f3be1b2608ecc5b4fb84e638aafe5",
        },
    },
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: {
            myMovePackageId: "0x9efa4d7b8ccfdcb2100ff736768720c9198f3be1b2608ecc5b4fb84e638aafe5",
        },
    },
    mainnet: {
        url: getFullnodeUrl("mainnet"),
        variables: {
            myMovePackageId: "0x9efa4d7b8ccfdcb2100ff736768720c9198f3be1b2608ecc5b4fb84e638aafe5",
        },
    },
});

// Cliente de React Query con configuración mejorada
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 30000, // 30 segundos
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
                <WalletProvider
                    autoConnect
                >
                    {children}
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}