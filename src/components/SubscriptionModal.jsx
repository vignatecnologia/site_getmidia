
import React from 'react';
import { X } from 'lucide-react';
import Pricing from './Pricing';

const SubscriptionModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-gray-900 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="sticky top-0 z-20 flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Adquira mais créditos</h2>
                        <p className="text-gray-400 text-sm">Escolha o melhor plano para sua necessidade</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Reusing Pricing component */}
                <div className="p-2 md:p-8">
                    <Pricing isModal={true} />
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
