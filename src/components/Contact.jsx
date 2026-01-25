import React from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare } from 'lucide-react'

const Contact = () => {
    return (
        <section id="contact" className="py-24 bg-gray-950 border-t border-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Fale Conosco
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Estamos aqui para ajudar você a transformar seu negócio.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <motion.a
                        href="mailto:contato@getmidia.com.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-primary/50 hover:bg-gray-800 transition-all group"
                    >
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">E-mail</h3>
                        <p className="text-gray-400">contato@getmidia.com.br</p>
                    </motion.a>

                    <motion.a
                        href="https://wa.me/5511999999999" // TODO: Update with real number if available
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-green-500/50 hover:bg-gray-800 transition-all group"
                    >
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">WhatsApp</h3>
                        <p className="text-gray-400">Falar com suporte</p>
                    </motion.a>
                </div>
            </div>
        </section>
    )
}

export default Contact
