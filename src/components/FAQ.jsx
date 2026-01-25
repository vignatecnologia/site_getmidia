import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
    {
        question: "Como funciona a geração de imagens?",
        answer: "Nossa IA analisa a foto enviada e a insere em cenários profissionais criados digitalmente."
    },
    {
        question: "Preciso de conhecimentos em design?",
        answer: "Não! A plataforma foi feita para ser extremamente intuitiva. Se você sabe tirar uma foto com o celular, você consegue usar o GetMídia."
    },
    {
        question: "Posso cancelar minha assinatura quando quiser?",
        answer: "Sim, sem contratos de fidelidade. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel do usuário."
    },
    {
        question: "Os créditos acumulam para o mês seguinte?",
        answer: "Não, os créditos são renovados mensalmente de acordo com seu plano. Recomendamos utilizar todos os créditos dentro do mês vigente."
    },
    {
        question: "Qual a qualidade das imagens geradas?",
        answer: "As imagens são geradas em alta resolução, perfeitas para Instagram, Facebook, LinkedIn, WhatsApp e materiais impressos."
    }
]

const FAQ = () => {
    const [activeIndex, setActiveIndex] = React.useState(null)

    return (
        <section id="faq" className="py-24 bg-gray-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Perguntas Frequentes
                    </h2>
                    <p className="text-gray-400">
                        Tire suas dúvidas sobre o GetMídia
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-800 rounded-xl bg-gray-900/50 overflow-hidden">
                            <button
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800 transaction-colors"
                            >
                                <span className="font-medium text-white text-lg pr-8">{faq.question}</span>
                                {activeIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-primary min-w-[20px]" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 min-w-[20px]" />
                                )}
                            </button>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-6 text-gray-400 border-t border-gray-800">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FAQ
