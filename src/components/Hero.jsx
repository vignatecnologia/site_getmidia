
import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

const Hero = () => {
    return (
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in-up">
                    <Sparkles className="w-4 h-4" />
                    <span>Inteligência Artificial para o seu Negócio</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 animate-fade-in-up delay-100">
                    Crie imagens <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">incríveis</span><br />
                    em segundos com IA
                </h1>

                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10 animate-fade-in-up delay-200">
                    Transforme fotos simples em posts profissionais de alta conversão. Escolha um tema, edite com seus textos e compartilhe.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
                    <Link
                        to="/register"
                        className="px-8 py-4 bg-primary text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 flex items-center gap-2"
                    >
                        Começar Agora
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a
                        href="#demo"
                        className="px-8 py-4 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-700 transition-all border border-gray-700"
                    >
                        Ver Demonstração
                    </a>
                </div>
            </div>

            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30 mix-blend-screen animate-pulse-slow" />
                <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30 mix-blend-screen animate-pulse-slow delay-700" />
            </div>
        </div>
    )
}

export default Hero
