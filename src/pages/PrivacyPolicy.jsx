
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Shield, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const PrivacyPolicy = () => {
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
                                <Shield className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    Política de Privacidade
                                </h1>
                                <p className="text-gray-500 mt-1">Última atualização: 31 de março de 2026</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">1. Quem somos nós (Controlador de Dados)</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    A plataforma GetMídia (www.getmidia.com.br) é operada por <strong>Vigna Tecnologia Ltda - ME</strong>, inscrita no CNPJ sob o nº 51.071.457/0001-28, com sede na Rua Benedito Filipini, 761 - Artur Nogueira/SP. Para os fins da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), nós somos os Controladores dos seus dados pessoais.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">2. Quais dados coletamos e para qual finalidade</h2>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Para que você possa utilizar nossa inteligência artificial e gerenciar sua assinatura, coletamos as seguintes informações no momento do cadastro:
                                </p>
                                <ul className="space-y-4 list-none pl-0">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Dados de identificação e contato:</strong> Nome, Sobrenome, E-mail, CPF e Telefone celular. (Finalidade: Criação da conta, emissão de notas fiscais, prevenção a fraudes e comunicação de suporte).</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Dados de acesso:</strong> Senha (criptografada) e Módulo de acesso. (Finalidade: Autenticação segura na plataforma).</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Dados de marketing:</strong> "Como nos conheceu?". (Finalidade: Melhoria de nossas campanhas de comunicação).</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Imagens (Uploads):</strong> Fotos e imagens enviadas por você para o recorte e geração de novos fundos via IA. (Finalidade: Prestação direta do serviço contratado).</p>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">3. Como compartilhamos seus dados (Operadores)</h2>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    O GetMídia utiliza infraestrutura de terceiros de alta tecnologia e segurança para funcionar. Seus dados podem ser processados pelas seguintes empresas (Operadores):
                                </p>
                                <ul className="space-y-4 list-none pl-0">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Supabase e Hostinger:</strong> Utilizamos estes serviços para hospedagem, banco de dados (PostgreSQL) e armazenamento em nuvem (Storage) de arquivos e imagens.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <p className="text-gray-300"><strong className="text-white">Stripe:</strong> Nosso gateway de pagamento. O GetMídia não armazena os dados do seu cartão de crédito. Quando você realiza uma assinatura, o processamento financeiro e a coleta de dados de pagamento ocorrem integralmente no ambiente seguro do Stripe.</p>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-yellow-500 mb-4">4. Seus Direitos como Titular</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Você tem o direito de solicitar o acesso, a correção de dados incompletos ou a exclusão dos seus dados pessoais e imagens dos nossos servidores. Para exercer qualquer um desses direitos, envie um e-mail para: <a href="mailto:contato@vignatecnologia.com.br" className="text-yellow-500 hover:underline">contato@vignatecnologia.com.br</a>.
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

export default PrivacyPolicy
