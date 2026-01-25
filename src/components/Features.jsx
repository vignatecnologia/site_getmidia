import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, Type, Zap, Image as ImageIcon, Layout } from 'lucide-react'

const features = [
    {
        icon: <Sparkles className="w-8 h-8 text-primary" />,
        title: "Inteligência Artificial",
        description: "Crie imagens impressionantes do seu produto em cenários criativos com apenas um clique. Nossa IA cuida de toda a mágica."
    },
    {
        icon: <Calendar className="w-8 h-8 text-primary" />,
        title: "Temas Sazonais",
        description: "Escolha uma data comemorativa e deixe a IA montar o cenário: Black Friday, Natal, Dia das Mães e muito mais."
    },
    {
        icon: <Type className="w-8 h-8 text-primary" />,
        title: "Editor de Texto Ágil",
        description: "Altere preço, descrição, crie novas camadas de texto. Personalize fontes e cores para alinhar com sua marca."
    },
    {
        icon: <ImageIcon className="w-8 h-8 text-primary" />,
        title: "Alta Resolução",
        description: "Baixe suas criações em qualidade máxima, prontas para postar no Instagram, Facebook ou WhatsApp."
    },
    {
        icon: <Layout className="w-8 h-8 text-primary" />,
        title: "Foco no Produto",
        description: "Diferente de IAs genéricas, o GetMídia é treinado para destacar o SEU produto, mantendo a fidelidade real dele."
    },
    {
        icon: <Zap className="w-8 h-8 text-primary" />,
        title: "Geração Rápida",
        description: "Não perca tempo com designers ou ferramentas complexas. Tenha seu post pronto em segundos."
    }
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5
        }
    }
}

const Features = () => {
    return (
        <section id="features" className="py-24 bg-gray-900 overflow-hidden relative">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-4"
                    >
                        Tudo o que você precisa para <span className="text-primary">vender mais</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Uma suite completa de ferramentas de marketing impulsionada por IA, feita sob medida para empreendedores e lojistas.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl hover:border-primary/50 transition-colors group hover:-translate-y-1 duration-300"
                        >
                            <div className="bg-gray-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-700 group-hover:border-primary/30 shadow-lg shadow-black/20">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default Features
