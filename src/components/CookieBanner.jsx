
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('getmidia_cookie_consent')
        if (!consent) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('getmidia_cookie_consent', 'true')
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-500/20">
                                    <Cookie className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                                        Nós utilizamos cookies essenciais para garantir o funcionamento seguro da plataforma e processamento de pagamentos. 
                                        Ao continuar, você concorda com nossa{' '}
                                        <Link to="/politica-de-cookies" className="text-yellow-500 hover:text-yellow-400 font-medium underline underline-offset-4">Política de Cookies</Link>.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
                                >
                                    Entendi
                                </button>
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    className="p-3 text-gray-400 hover:text-white transition-colors"
                                    title="Fechar"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default CookieBanner
