import React from 'react'
import { motion } from 'framer-motion'
import { Star, User } from 'lucide-react'

const testimonials = [
    {
        name: "Mariana Silva",
        role: "Loja de Roupas",
        content: "O GetMídia revolucionou meu Instagram. Antes eu gastava horas tentando fazer fotos bonitas, agora faço posts incríveis em segundos.",
    },
    {
        name: "Carlos Eduardo",
        role: "Dropshipping",
        content: "A qualidade das imagens é impressionante. Meus anúncios converteram 3x mais depois que comecei a usar as imagens do GetMídia.",
    },
    {
        name: "Fernanda Costa",
        role: "Artesanato",
        content: "Perfeito para quem não sabe design. Os temas sazonais me ajudam muito a manter minhas redes sociais sempre ativas.",
    }
]

const Testimonials = () => {
    return (
        <section className="py-24 bg-gray-900 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        O que dizem nossos clientes
                    </h2>
                    <p className="text-gray-400">
                        Junte-se a centenas de lojistas que já transformaram suas vendas
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-800 p-8 rounded-2xl relative"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>

                            <p className="text-gray-300 mb-8 leading-relaxed">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                                    <span className="text-primary text-sm">{testimonial.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
