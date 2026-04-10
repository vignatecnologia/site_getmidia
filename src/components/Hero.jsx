import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Import all hero assets
import heroPet from '../assets/hero_pet_demo.png'
import heroAuto from '../assets/antes_depois_auto.png'
import heroFood from '../assets/antes_depois_food.png'
import heroFarma from '../assets/hero_farma_demo.png'
import heroOtica from '../assets/antes_depois_otica.png'
import heroProduto from '../assets/antes_depois_produto.png'
import heroModa from '../assets/hero_moda_demo.png'

const slideData = [
  { image: heroProduto, color: 'from-yellow-500', title: 'Produtos' },
  { image: heroFood, color: 'from-red-500', title: 'Gastronomia' },
  { image: heroAuto, color: 'from-blue-500', title: 'Automotivo' },
  { image: heroPet, color: 'from-green-500', title: 'Pets' },
  { image: heroOtica, color: 'from-cyan-500', title: 'Ótica' },
  { image: heroFarma, color: 'from-orange-500', title: 'Saúde' },
  { image: heroModa, color: 'from-purple-500', title: 'Moda' },
];

const Sparkle = ({ delay, style }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0, rotate: 0 }}
    animate={{ 
      scale: [0, 1.2, 0], 
      opacity: [0, 1, 0],
      rotate: [0, 180, 360],
      y: [0, -40, -80],
      x: [0, (Math.random() - 0.5) * 40]
    }}
    transition={{ 
      duration: 2, 
      repeat: Infinity, 
      delay: delay,
      ease: "easeInOut"
    }}
    className="absolute text-yellow-300 pointer-events-none"
    style={style}
  >
    <Star className="w-3 h-3 fill-current" />
  </motion.div>
);

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slideData.length);
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
                            Crie imagens <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">irresistíveis</span><br />
                            em segundos com IA
                        </h1>

                        <p className="max-w-xl text-lg text-gray-400 mb-10 leading-relaxed">
                            Transforme fotos simples em posts profissionais de alta conversão. Tecnologia alemã de ponta para todos os nichos do mercado.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <a
                                href="#pricing"
                                className="px-8 py-4 bg-primary text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 flex items-center gap-2"
                            >
                                Começar Agora
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
                        {/* Glow Brilliance Effect - Dynamic Color */}
                        <motion.div 
                          key={`glow-${currentIndex}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          className={`absolute inset-0 bg-gradient-to-tr ${slideData[currentIndex].color} to-transparent blur-[120px] rounded-full animate-pulse`} 
                        />
                        
                        <div className="relative w-full aspect-square max-w-[550px] flex items-center justify-center">
                            {/* Sparkles Layer */}
                            {[...Array(8)].map((_, i) => (
                              <Sparkle 
                                key={`sparkle-${currentIndex}-${i}`} 
                                delay={i * 0.2} 
                                style={{ 
                                  top: `${Math.random() * 80 + 10}%`, 
                                  left: `${Math.random() * 80 + 10}%` 
                                }} 
                              />
                            ))}

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 0.8, y: 20, rotateY: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                                    exit={{ opacity: 0, scale: 1.1, y: -20, filter: 'brightness(1.5) blur(5px)' }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="w-full h-full flex items-center justify-center relative p-8"
                                >
                                    <div className="relative group">
                                      {/* Floating Title over current slide */}
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase text-white/50"
                                      >
                                        Módulo {slideData[currentIndex].title}
                                      </motion.div>

                                      <img
                                          src={slideData[currentIndex].image}
                                          alt={slideData[currentIndex].title}
                                          className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)] scale-110"
                                      />
                                      
                                      {/* Secondary Decorative Glow */}
                                      <div className={`absolute inset-0 bg-gradient-to-t ${slideData[currentIndex].color} to-transparent opacity-20 blur-3xl -z-10 group-hover:opacity-40 transition-opacity`} />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aesthetic Floating Elements */}
            <div className="absolute top-0 right-0 w-[50%] h-full bg-primary/5 blur-[120px] rounded-l-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[50%] bg-purple-500/10 blur-[100px] rounded-r-full pointer-events-none" />
            
            {/* Animated background particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`bg-sparkle-${i}`}
                initial={{ opacity: 0.1, y: Math.random() * 1000 }}
                animate={{ 
                  y: [null, -100],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute w-1 h-1 bg-white rounded-full blur-[1px] pointer-events-none"
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
        </section>
    )
}

export default Hero
