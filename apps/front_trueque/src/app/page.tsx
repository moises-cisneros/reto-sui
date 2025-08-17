"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { CentroTruequeDigital } from "@/components/DigitalBarterCenter";
import { useEffect } from "react";

export default function HomePage() {
  const account = useCurrentAccount();

  // Función para actualizar el estado de conexión en el layout
  useEffect(() => {
    const statusElement = document.getElementById('connection-status');
    const textElement = document.getElementById('connection-text');

    if (statusElement && textElement) {
      if (account) {
        statusElement.className = 'w-3 h-3 bg-green-500 rounded-full';
        textElement.textContent = 'Conectado';
        textElement.className = 'text-sm text-green-600';
      } else {
        statusElement.className = 'w-3 h-3 bg-red-500 rounded-full';
        textElement.textContent = 'Desconectado';
        textElement.className = 'text-sm text-red-600';
      }
    }
  }, [account]);

  if (!account) {
    return (
      <div className="text-center py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            Conecta tu billetera para empezar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Necesitas conectar una billetera compatible con Sui para usar el guardarropa digital
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-500">Billeteras recomendadas:</p>
            <div className="flex justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>• Sui Wallet</span>
              <span>• Ethos Wallet</span>
              <span>• Suiet</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CentroTruequeDigital />
    </div>
  );
}