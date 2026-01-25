import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'
import { Monitor, Palette, Sparkles, Download, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
    {
        icon: <Monitor className="w-8 h-8 text-primary" />,
        title: "1. Escolha o Produto",
        description: "Navegue pelo nosso ecossistema e selecione a ferramenta ideal para sua necessidade: Produto, Moda, Food, Auto, etc."
    },
    {
        icon: <Palette className="w-8 h-8 text-primary" />,
        title: "2. Selecione o Tema",
        description: "Explore nossa vasta biblioteca de temas sazonais e estilos. De Black Friday a datas comemorativas específicas."
    },
    {
        icon: <Sparkles className="w-8 h-8 text-primary" />,
        title: "3. Personalize com IA",
        description: "Faça upload da sua foto e deixe nossa Inteligência Artificial criar o cenário perfeito, mantendo a fidelidade do seu produto."
    },
    {
        icon: <Download className="w-8 h-8 text-primary" />,
        title: "4. Edite e Baixe",
        description: "Ajuste textos, cores e elementos finais no nosso editor integrado e baixe em alta resolução para suas redes."
    }
]

const HowItWorks = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                        >
                            Como a mágica <br />
                            <span className="text-primary">acontece?</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-400"
                        >
                            Um processo simples e intuitivo para transformar suas fotos simples em campanhas de marketing profissionais em segundos.
                        </motion.p>
                    </div>

                    {/* Steps Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent z-0" />

                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className="relative z-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl hover:border-primary/50 transition-all hover:-translate-y-2"
                            >
                                <div className="w-16 h-16 bg-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center mb-6 shadow-lg shadow-black/30 group-hover:scale-110 transition-transform">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-20 text-center"
                    >
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-black rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105"
                        >
                            Começar Agora <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default HowItWorks
