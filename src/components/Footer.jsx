
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img src="/logo-new.png" alt="GetMídia Logo" className="h-[55px] w-auto" />
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            O GetMída transforma fotos dos seus produtos em imagens profissionais de alta qualidade, prontas para postar nas suas redes sociais.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4">Produto</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#features" className="hover:text-primary transition-colors">Recursos</a></li>
                            <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Casos de Uso</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4">Empresa</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} GetMídia. Todos os direitos reservados.
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                            Um produto da empresa Vigna Tecnologia - CNPJ: 51.071.457/0001-28
                        </p>
                    </div>

                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-gray-800 hover:bg-primary hover:text-black text-white p-3 rounded-full transition-all group"
                        title="Voltar ao topo"
                    >
                        <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </footer>
    )
}

export default Footer
