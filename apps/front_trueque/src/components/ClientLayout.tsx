"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import { useTheme } from "@/contexts/ThemeContext";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header Principal */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                🏪 Guardarropa Digital
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Tu guardarropa digital para intercambiar artículos únicos en Sui blockchain
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Botón de cambio de tema */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
                            >
                                {theme === 'light' ? (
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </button>

                            {/* Estado de conexión */}
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-300 rounded-full" id="connection-status"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400" id="connection-text">Desconectado</span>
                            </div>

                            {/* Botón de conexión */}
                            <ConnectButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Estado del Sistema */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <div className="font-medium text-blue-800 dark:text-blue-200">Guardarropa ID</div>
                            <div className="font-mono text-blue-600 dark:text-blue-400 text-xs" id="guardarropa-id">
                                Cargando...
                            </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <div className="font-medium text-green-800 dark:text-green-200">Registro ID</div>
                            <div className="font-mono text-green-600 dark:text-green-400 text-xs" id="registro-id">
                                Cargando...
                            </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <div className="font-medium text-purple-800 dark:text-purple-200">Estado del Usuario</div>
                            <div className="text-purple-600 dark:text-purple-400" id="user-status">
                                Cargando...
                            </div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                            <div className="font-medium text-yellow-800 dark:text-yellow-200">Créditos Activos</div>
                            <div className="text-yellow-600 dark:text-yellow-400 font-semibold" id="creditos-activos">
                                Cargando...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>🏪 Guardarropa Digital - Powered by Sui Blockchain</p>
                        <p className="mt-1">
                            <a
                                href="https://docs.sui.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                                Documentación de Sui
                            </a>
                            {" • "}
                            <a
                                href="https://suiexplorer.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
