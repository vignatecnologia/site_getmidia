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
        question: "Como funcionam os créditos?",
        answer: "Cada imagem gerada consome créditos. O aplicativo possui duas opções: 1 Crédito = Produto e 2 Créditos = Produto + Modelo. O GetMídia - Moda, tem somente a opção de 2 créditos por sempre gerar uma imagem com modelo. Créditos não utilizados expiram ao final do ciclo mensal."
    },
    {
        question: "Posso comprar créditos extras?",
        answer: "Sim, dentro do painel do usuário você terá opções para adquirir pacotes de créditos avulsos caso sua cota mensal acabe."
    },
    {
        question: "Terei acesso à todos os GetMídias?",
        answer: "Sim! Sua assinatura garante acesso total a todas as ferramentas: Produto, Moda, Food, Auto, Ótica e Pet, podendo usar seus créditos livremente entre elas."
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Perguntas Frequentes
                    </h2>
                    <p className="text-gray-400">
                        Tire suas dúvidas sobre o GetMídia
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        {faqs.slice(0, 4).map((faq, index) => (
                            <div key={index} className="border border-gray-800 rounded-xl bg-gray-900/50 overflow-hidden h-fit">
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

                    {/* Column 2 */}
                    <div className="space-y-4">
                        {faqs.slice(4, 8).map((faq, index) => {
                            const actualIndex = index + 4;
                            return (
                                <div key={actualIndex} className="border border-gray-800 rounded-xl bg-gray-900/50 overflow-hidden h-fit">
                                    <button
                                        onClick={() => setActiveIndex(activeIndex === actualIndex ? null : actualIndex)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800 transaction-colors"
                                    >
                                        <span className="font-medium text-white text-lg pr-8">{faq.question}</span>
                                        {activeIndex === actualIndex ? (
                                            <ChevronUp className="w-5 h-5 text-primary min-w-[20px]" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 min-w-[20px]" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {activeIndex === actualIndex && (
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
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQ
