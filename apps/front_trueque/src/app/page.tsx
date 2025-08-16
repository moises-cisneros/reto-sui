"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { CentroTruequeManager } from "@/components/CentroTruequeManager";
import { ContractVerification } from "@/components/ContractVerification";
import { CentroSetup } from "@/components/CentroSetup";

export default function HomePage() {
  const account = useCurrentAccount();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Centro de Trueque
              </h1>
              <p className="text-sm text-gray-600">
                Intercambia objetos digitales en Sui blockchain
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verificadores siempre visibles */}

        <ContractVerification />
        <CentroSetup />

        {account ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Billetera Conectada
                </h2>
              </div>
              <p className="text-gray-600 break-all">
                {account.address}
              </p>
            </div>

            <CentroTruequeManager />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl text-gray-700 mb-4">
                Conecta tu billetera para empezar
              </h2>
              <p className="text-gray-500 mb-6">
                Necesitas conectar una billetera compatible con Sui para usar el centro de trueque
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Billeteras recomendadas:</p>
                <div className="flex justify-center space-x-4 text-xs text-gray-500">
                  <span>• Sui Wallet</span>
                  <span>• Ethos Wallet</span>
                  <span>• Suiet</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>Centro de Trueque - Powered by Sui Blockchain</p>
            <p className="mt-1">
              <a
                href="https://docs.sui.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Documentación de Sui
              </a>
              {" • "}
              <a
                href="https://suiexplorer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Sui Explorer
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}