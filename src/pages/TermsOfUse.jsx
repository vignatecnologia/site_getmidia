
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FileText, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const TermsOfUse = () => {
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
                                <FileText className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    Termos de Uso
                                </h1>
                                <p className="text-gray-500 mt-1">Última atualização: 31 de março de 2026</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">1. Aceitação e Objeto</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Ao se cadastrar no GetMídia, você concorda com estes Termos de Uso. O GetMídia é um software como serviço (SaaS) que disponibiliza uma ferramenta de Inteligência Artificial para edição de imagens, recorte e geração de cenários temáticos.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">2. Assinaturas, Pagamentos e Cancelamento</h2>
                                <ul className="space-y-4 list-none pl-0">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Ambiente de Pagamento:</strong> Todas as assinaturas são processadas pelo gateway de pagamento Stripe.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento através do seu painel de usuário.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Regra de Uso após Cancelamento:</strong> O cancelamento interrompe a renovação automática para o próximo ciclo. Não realizamos reembolsos ou estornos proporcionais por cancelamentos feitos antes do fim do ciclo vigente. Seus créditos e o acesso ao módulo contratado permanecerão disponíveis para uso até o último dia do período já pago.</p>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">3. Propriedade Intelectual e Responsabilidade pelo Uso da IA</h2>
                                <p className="text-gray-300 leading-relaxed mb-4 font-medium italic">
                                    Esta é a condição fundamental para o uso do GetMídia:
                                </p>
                                <ul className="space-y-4 list-none pl-0">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Direitos sobre o Upload:</strong> Você declara e garante que possui todos os direitos autorais e de imagem sobre as fotos e produtos que envia para a nossa plataforma. É estritamente proibido o upload de imagens ilícitas, ofensivas ou que infrinjam direitos de terceiros.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Uso dos Resultados Gerados:</strong> As imagens finais, geradas a partir da interação da nossa IA com o seu upload, são de sua inteira responsabilidade.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Isenção de Responsabilidade:</strong> A Vigna Tecnologia Ltda - ME atua exclusivamente como provedora da ferramenta tecnológica. Isentamo-nos de qualquer responsabilidade civil, criminal, autoral ou comercial decorrente do mau uso, comercialização indevida ou infração de direitos de terceiros causados pelas imagens que você gerar e exportar utilizando o GetMídia. Você concorda em manter a Vigna Tecnologia indene de quaisquer disputas ou litígios gerados pelo seu uso da plataforma.</p>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">4. Foro</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Fica eleito o foro da comarca de Artur Nogueira - SP para dirimir quaisquer controvérsias oriundas destes Termos.
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

export default TermsOfUse
