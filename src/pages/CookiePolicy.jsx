
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Cookie, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const CookiePolicy = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />
            
            <main className="flex-grow pt-32 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors mb-8 group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Voltar para o Início
                    </Link>

                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                                <Cookie className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    Política de Cookies
                                </h1>
                                <p className="text-gray-500 mt-1">Última atualização: 31 de março de 2026</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">1. O que são Cookies?</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Cookies são pequenos arquivos de texto armazenados no seu navegador quando você acessa o GetMídia (www.getmidia.com.br). Eles ajudam a plataforma a funcionar corretamente e a lembrar de suas configurações.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">2. Como utilizamos os Cookies</h2>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Nossa arquitetura (baseada em React e Supabase) utiliza predominantemente Cookies Essenciais / Estritamente Necessários. Sem eles, o aplicativo não funciona. Nós os utilizamos para:
                                </p>
                                <ul className="space-y-4 list-none pl-0">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Autenticação e Segurança (Supabase):</strong> Para manter a sua sessão ativa enquanto você navega entre as telas do aplicativo e para proteger sua conta contra acessos não autorizados.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Transações Financeiras (Stripe):</strong> O ambiente de pagamento do Stripe utiliza cookies próprios para garantir a segurança da transação durante a assinatura e prevenção contra fraudes financeiras.</p>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">3. Gestão de Cookies</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Como utilizamos apenas cookies essenciais para o funcionamento do painel e segurança de pagamentos, não é possível desativá-los sem comprometer o acesso à sua conta. Ao utilizar o GetMídia, você concorda com o uso destes cookies técnicos.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default CookiePolicy
