"use client";

import { useCallback } from "react";
import Swal from "sweetalert2";

export function useTransactionHandler() {
    // Configuración base para SweetAlert2 con tema adaptativo
    const getSwalConfig = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');

        return {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827',
            confirmButtonColor: isDarkMode ? '#3b82f6' : '#2563eb',
            cancelButtonColor: isDarkMode ? '#6b7280' : '#6b7280',
            iconColor: isDarkMode ? '#10b981' : '#059669',
            popup: {
                background: isDarkMode ? '#1f2937' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#111827',
            },
            title: {
                color: isDarkMode ? '#f9fafb' : '#111827',
            },
            html: {
                color: isDarkMode ? '#d1d5db' : '#374151',
            },
            confirmButton: {
                background: isDarkMode ? '#3b82f6' : '#2563eb',
                color: '#ffffff',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
            },
            cancelButton: {
                background: isDarkMode ? '#6b7280' : '#6b7280',
                color: '#ffffff',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
            },
        };
    };

    const showSuccess = useCallback((title: string, message: string, digest?: string) => {
        const config = getSwalConfig();

        Swal.fire({
            title,
            html: `
                <div class="text-center">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p class="text-lg mb-3">${message}</p>
                    ${digest ? `
                        <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Hash de la transacción:</p>
                            <code class="text-xs text-gray-800 dark:text-gray-200 break-all">${digest}</code>
                        </div>
                    ` : ''}
                </div>
            `,
            icon: 'success',
            confirmButtonText: '¡Perfecto!',
            background: config.background,
            color: config.color,
            confirmButtonColor: config.confirmButtonColor,
            customClass: {
                popup: 'dark:bg-gray-800 dark:text-white',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-gray-300',
            },
        });
    }, []);

    const showError = useCallback((title: string, message: string) => {
        const config = getSwalConfig();

        Swal.fire({
            title,
            html: `
                <div class="text-center">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <p class="text-lg">${message}</p>
                </div>
            `,
            icon: 'error',
            confirmButtonText: 'Entendido',
            background: config.background,
            color: config.color,
            confirmButtonColor: config.confirmButtonColor,
            customClass: {
                popup: 'dark:bg-gray-800 dark:text-white',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-gray-300',
            },
        });
    }, []);

    const showLoading = useCallback((title: string, message: string) => {
        const config = getSwalConfig();

        Swal.fire({
            title,
            html: `
                <div class="text-center">
                    <div class="mb-4">
                        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                    <p class="text-lg">${message}</p>
                </div>
            `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            background: config.background,
            color: config.color,
            customClass: {
                popup: 'dark:bg-gray-800 dark:text-white',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-gray-300',
            },
            didOpen: () => {
                Swal.showLoading();
            },
        });
    }, []);

    const showConfirmation = useCallback((title: string, message: string): Promise<boolean> => {
        const config = getSwalConfig();

        return Swal.fire({
            title,
            html: `
                <div class="text-center">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <div class="text-left text-base leading-relaxed">
                        ${message.split('\n').map(line => `<p class="mb-2">${line}</p>`).join('')}
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            background: config.background,
            color: config.color,
            confirmButtonColor: config.confirmButtonColor,
            cancelButtonColor: config.cancelButtonColor,
            customClass: {
                popup: 'dark:bg-gray-800 dark:text-white',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-gray-300',
            },
        }).then((result) => {
            return result.isConfirmed;
        });
    }, []);

    const showValidationError = useCallback((title: string, message: string, creditosDisponibles: string[]) => {
        const config = getSwalConfig();

        Swal.fire({
            title,
            html: `
                <div class="text-center">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <p class="text-lg mb-4">${message}</p>
                    ${creditosDisponibles.length > 0 ? `
                        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p class="text-sm text-blue-800 dark:text-blue-200 mb-2">Tienes créditos disponibles para estos artículos:</p>
                            <div class="flex flex-wrap gap-2 justify-center">
                                ${creditosDisponibles.map(clave =>
                `<span class="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">#${clave}</span>`
            ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `,
            icon: 'warning',
            confirmButtonText: 'Entendido',
            background: config.background,
            color: config.color,
            confirmButtonColor: config.confirmButtonColor,
            customClass: {
                popup: 'dark:bg-gray-800 dark:text-white',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-gray-300',
            },
        });
    }, []);

    const closeLoading = useCallback(() => {
        Swal.close();
    }, []);

    const handleTransactionError = useCallback((error: any): string => {
        console.error("Transaction error:", error);

        if (error?.message?.includes("User rejected") || error?.message?.includes("User rejected the transaction")) {
            return "Transacción cancelada por el usuario";
        }

        if (error?.message?.includes("dApp.signTransactionBlock")) {
            return "Error al firmar la transacción. Verifica tu wallet.";
        }

        if (error?.message?.includes("insufficient funds")) {
            return "Fondos insuficientes para la transacción";
        }

        if (error?.message?.includes("gas")) {
            return "Error de gas. Verifica que tengas suficiente SUI para la transacción";
        }

        if (error?.message?.includes("network")) {
            return "Error de conexión. Verifica tu red.";
        }

        return error?.message || "Error desconocido en la transacción";
    }, []);

    return {
        showSuccess,
        showError,
        showLoading,
        showConfirmation,
        showValidationError,
        closeLoading,
        handleTransactionError,
    };
}
