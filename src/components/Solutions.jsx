import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'

const solutions = [
    {
        id: 'produto',
        name: 'GetMídia Produto',
        logo: '/logos/logo-produto-v2.png',
        description: 'Crie fotos incríveis dos seus produtos para e-commerce e redes sociais.',
        status: 'active',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20'
    },
    {
        id: 'moda',
        name: 'GetMídia Moda',
        logo: '/logos/logo-moda-v2.png',
        description: 'Vista suas roupas em modelos reais com inteligência artificial.',
        status: 'active',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20'
    },
    {
        id: 'food',
        name: 'GetMídia Food',
        logo: '/logos/logo-food-v2.png',
        description: 'Dê vida ao seu cardápio com imagens de dar água na boca, criadas instantaneamente.',
        status: 'active',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20'
    },
    {
        id: 'auto',
        name: 'GetMídia Auto',
        logo: '/logos/logo-auto-v2.png',
        description: 'Automação de fotos para revendas e concessionárias de veículos.',
        status: 'active',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
    },
    {
        id: 'otica',
        name: 'GetMídia Ótica',
        logo: '/logos/logo-otica-v2.png',
        description: 'Prove óculos virtualmente em rostos variados para seu catálogo.',
        status: 'active',
        color: 'text-teal-500',
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/20'
    },
    {
        id: 'pet',
        name: 'GetMídia PET',
        logo: '/logos/logo-pet-v2.png',
        description: 'Transforme fotos dos seus pets em modelos profissionais para produtos pets.',
        status: 'active',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20'
    }
]

const Solutions = () => {
    return (
        <section id="solutions" className="py-24 bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Um ecossistema completo
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Conheça as soluções especializadas que estamos preparando para revolucionar cada setor.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions.map((solution, index) => (
                        <motion.div
                            key={solution.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-2xl p-8 border ${solution.status === 'active' ? 'border-primary/30 bg-gray-900' : 'border-gray-800 bg-gray-900/50 grayscale hover:grayscale-0 transition-all duration-500'}`}
                        >
                            <div className="h-20 mb-6 flex items-center justify-start">
                                <img
                                    src={solution.logo}
                                    alt={solution.name}
                                    className="h-full w-auto object-contain"
                                />
                            </div>

                            <p className="text-gray-400 mb-8 min-h-[3rem]">
                                {solution.description}
                            </p>

                            <div className="flex items-center justify-between">
                                {solution.status === 'active' ? (
                                    <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                        Saiba mais <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-2 text-gray-500 text-sm font-medium px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                                        <Clock className="w-4 h-4" /> Em Breve
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Solutions
