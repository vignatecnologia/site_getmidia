
import React, { useState } from 'react';
import { X, Coins, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const CreditPackageModal = ({ isOpen, onClose }) => {
    const [loadingPackage, setLoadingPackage] = useState(null);

    if (!isOpen) return null;

    const packages = [
        {
            id: 'credit_10',
            name: 'Pacote 10 Créditos',
            price: 'R$10,00',
            credits: '10 Créditos',
            icon: <Coins className="w-6 h-6 text-yellow-500" />,
            description: 'Ideal para um pequeno ajuste ou teste adicional.'
        },
        {
            id: 'credit_20',
            name: 'Pacote 20 Créditos',
            price: 'R$20,00',
            credits: '20 Créditos',
            icon: <Coins className="w-6 h-6 text-yellow-500" />,
            description: 'A dose certa para continuar suas criações.',
            popular: true
        },
        {
            id: 'credit_30',
            name: 'Pacote 30 Créditos',
            price: 'R$30,00',
            credits: '30 Créditos',
            icon: <Coins className="w-6 h-6 text-yellow-500" />,
            description: 'Melhor custo-benefício para quem precisa de mais.'
        }
    ];

    const handlePurchase = async (packageId) => {
        try {
            setLoadingPackage(packageId);
            
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                toast.error("Sessão expirada. Por favor, faça login novamente.");
                return;
            }

            const { data, error } = await supabase.functions.invoke('create-checkout', {
                body: { 
                    planId: packageId,
                    selectedModule: 'product' // Default
                }
            });

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("Link de pagamento não retornado.");
            }
        } catch (error) {
            console.error('Error creating package checkout:', error);
            toast.error(`Erro ao processar compra: ${error.message || error}`);
        } finally {
            setLoadingPackage(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="sticky top-0 z-20 flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Adquira Créditos Avulsos</h2>
                        <p className="text-gray-400 text-sm">Recarregue seu saldo para continuar criando imagens incríveis</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 md:p-10">
                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <div 
                                key={pkg.id}
                                className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
                                    pkg.popular 
                                    ? 'bg-gray-800 border-yellow-500/50 ring-1 ring-yellow-500/20' 
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                        RECOMENDADO
                                    </div>
                                )}

                                <div className="mb-4 bg-gray-900/50 w-fit p-3 rounded-xl border border-gray-700">
                                    {pkg.icon}
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                                <p className="text-2xl font-black text-yellow-500 mb-2">{pkg.price}</p>
                                <p className="text-xs text-gray-400 mb-6 flex-1">{pkg.description}</p>

                                <button
                                    onClick={() => handlePurchase(pkg.id)}
                                    disabled={loadingPackage !== null}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                        pkg.popular
                                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                        : 'bg-white text-black hover:bg-gray-200'
                                    } disabled:opacity-50 disabled:cursor-wait`}
                                >
                                    {loadingPackage === pkg.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Comprar Agora'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                        <div className="flex gap-3">
                            <Check className="w-5 h-5 text-yellow-500 shrink-0" />
                            <p className="text-sm text-gray-300">
                                <strong>Importante:</strong> Os créditos serão adicionados uma única vez ao seu saldo e não são acumulativos (expiram junto com o ciclo da sua assinatura atual).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditPackageModal;
