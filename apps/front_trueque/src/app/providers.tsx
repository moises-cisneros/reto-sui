"use client";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@mysten/dapp-kit/dist/index.css";

const networkConfig = {
    devnet: {
        url: "https://fullnode.devnet.sui.io:443",
    },
    testnet: {
        url: "https://fullnode.testnet.sui.io:443",
    },
    mainnet: {
        url: "https://fullnode.mainnet.sui.io:443",
    }
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
                <WalletProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}