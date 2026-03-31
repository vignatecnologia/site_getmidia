
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import heroModa from '../assets/hero_moda_demo.png'
import heroProduto from '../assets/hero_produto_demo.png'

const images = [heroProduto, heroModa];

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden bg-gray-900 leading-normal">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Text Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            <span>Inteligência Artificial para o seu Negócio</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-8">
                            Crie imagens <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">incríveis</span><br />
                            em segundos com IA
                        </h1>

                        <p className="max-w-xl text-lg text-gray-400 mb-10 leading-relaxed">
                            Transforme fotos simples em posts profissionais de alta conversão. Escolha um tema, edite com seus textos e compartilhe.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <a
                                href="#pricing"
                                className="px-8 py-4 bg-primary text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 flex items-center gap-2"
                            >
                                Ver Planos e Preços
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </a>
                            <a
                                href="#demo"
                                className="px-8 py-4 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-700 transition-all border border-gray-700 hover:border-primary/30"
                            >
                                Ver Demonstração
                            </a>
                        </div>
                    </motion.div>

                    {/* Slideshow Section */}
                    <div className="relative flex justify-center items-center">
                        {/* Glow Brilliance Effect */}
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse opacity-50" />
                        
                        <div className="relative w-full aspect-square max-w-[500px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
                                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, scale: 1.1, filter: 'brightness(2) blur(10px)' }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    <img
                                        src={images[currentIndex]}
                                        alt="Demonstração"
                                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(255,191,0,0.2)]"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aesthetic Floating Elements */}
            <div className="absolute top-0 right-0 w-[50%] h-full bg-primary/5 blur-[120px] rounded-l-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[50%] bg-purple-500/10 blur-[100px] rounded-r-full pointer-events-none" />
        </section>
    )
}

export default Hero
