import React from 'react'
import { Sparkles } from 'lucide-react'

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-950 items-center justify-center p-4">
            <div className="text-center animate-fade-in-up">
                <img
                    src="/logo-new.png"
                    alt="GetMídia Logo"
                    className="h-24 w-auto mx-auto mb-8"
                />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span>Novidades a caminho</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    Em breve...
                </h1>
                <p className="text-gray-400 text-lg max-w-md mx-auto">
                    Estamos preparando algo incrível para você. <br />
                    Volte em breve para conferir!
                </p>
            </div>
        </div>
    )
}

export default Home
