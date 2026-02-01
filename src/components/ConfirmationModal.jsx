import React from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "info", // info, success, warning, error
    singleButton = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
            case 'error': return <AlertTriangle className="w-12 h-12 text-red-500" />;
            default: return <Info className="w-12 h-12 text-primary" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all scale-100 p-6 text-center space-y-4">

                <div className="flex justify-center">
                    <div className="p-3 bg-gray-800/50 rounded-full">
                        {getIcon()}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <div className={`text-gray-400 text-sm leading-relaxed max-h-[60vh] overflow-y-auto ${type === 'info' ? 'text-left bg-gray-800/50 p-3 rounded-lg' : ''}`}>
                        {message}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    {!singleButton && (
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            if (singleButton) onClose();
                        }}
                        className={`flex-1 py-2.5 px-4 font-bold text-white rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 ${type === 'error' ? 'bg-red-600 hover:bg-red-500' :
                            type === 'success' ? 'bg-green-600 hover:bg-green-500' :
                                'bg-primary hover:bg-primary-hover'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
