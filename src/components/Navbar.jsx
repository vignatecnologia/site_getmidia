
import React from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [session, setSession] = React.useState(null)

    React.useEffect(() => {
        // Get initial session
        import('../lib/supabaseClient').then(({ supabase }) => {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session)
            })

            // Listen for changes
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session)
            })
            return () => subscription.unsubscribe()
        })
    }, [])

    const handleLogout = async () => {
        const { supabase } = await import('../lib/supabaseClient')
        await supabase.auth.signOut()
    }

    return (
        <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo-new.png" alt="GetMídia Logo" className="h-[60px] w-auto" />
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Início</Link>
                            <Link to="/como-funciona" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Como funciona</Link>
                            <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Recursos</a>
                            <a href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Preços</a>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center gap-4">
                            {session ? (
                                <>
                                    <span className="text-sm text-gray-300">
                                        Olá, {session.user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}
                                    </span>
                                    <Link
                                        to="/minha-conta"
                                        className="bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Minha Conta
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-400 hover:text-red-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Entrar</Link>
                                    <a href="#pricing" className="bg-primary text-black hover:bg-yellow-400 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:shadow-lg hover:shadow-primary/20">
                                        Assinar Agora
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-gray-900 border-b border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Início</Link>
                        <Link to="/como-funciona" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Como funciona</Link>
                        <a href="#features" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Recursos</a>
                        <a href="#pricing" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Preços</a>
                        {session ? (
                            <>
                                <Link to="/minha-conta" className="text-yellow-500 hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium">Minha Conta</Link>
                                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium">Sair</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Entrar</Link>
                                <a href="#pricing" className="text-primary hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium">Assinar Agora</a>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
