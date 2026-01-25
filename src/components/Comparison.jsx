import React from 'react'
import { motion } from 'framer-motion'
import { Check, X, DollarSign, Clock, Zap } from 'lucide-react'

const Comparison = () => {
    return (
        <section className="py-24 bg-gray-900 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Por que escolher o <span className="text-primary">GetMídia</span>?
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Compare e veja como você pode economizar tempo e dinheiro enquanto escala suas vendas.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Designer Option */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-full bg-gray-700 text-gray-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-300">Designer Profissional</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                                <span className="text-gray-400">Custo por imagem</span>
                                <span className="text-xl font-bold text-white">R$ 50 - R$ 80</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                                <span className="text-gray-400">Prazo de entrega</span>
                                <span className="text-xl font-bold text-white">2 - 5 dias</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                                <span className="text-gray-400">Alterações</span>
                                <span className="text-xl font-bold text-white">Limitadas / Pagas</span>
                            </div>

                            <div className="pt-4">
                                <p className="text-center text-gray-500 text-sm">Custo mensal estimado (30 posts)</p>
                                <p className="text-center text-3xl font-bold text-red-500 mt-2">R$ 1.500,00+</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* GetMídia Option */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-primary/5 rounded-2xl p-8 border border-primary/30 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                            RECOMENDADO
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-full bg-primary/20 text-primary">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary">GetMídia</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                                <span className="text-gray-300">Custo por imagem</span>
                                <span className="text-xl font-bold text-white">~ R$ 1,50</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                                <span className="text-gray-300">Prazo de entrega</span>
                                <span className="text-xl font-bold text-white">Segundos</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                                <span className="text-gray-300">Alterações</span>
                                <span className="text-xl font-bold text-white">Ilimitadas</span>
                            </div>

                            <div className="pt-4">
                                <p className="text-center text-primary/70 text-sm">Custo mensal estimado (30 posts)</p>
                                <p className="text-center text-3xl font-bold text-primary mt-2">R$ 45,00</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Comparison
