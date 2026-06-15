
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        // 1. Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .maybeSingle();
            
            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error("Error fetching profile for navbar:", err);
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        // Clear legacy storage if any
        localStorage.removeItem('getmidia_token');
        localStorage.removeItem('getmidia_user');
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
                            <a href="/#como-funciona" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Como funciona</a>
                            <a href="/#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Recursos</a>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center gap-4">
                            {session ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
                                        <User className="w-4 h-4 text-yellow-500" />
                                        <span>
                                            Olá, {profile?.full_name?.split(' ')[0] || session.user.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <Link
                                        to="/minha-conta"
                                        className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-yellow-500/10"
                                    >
                                        Minha Conta
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-400 hover:text-red-400 text-sm font-medium transition-colors px-2"
                                    >
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className="text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors border border-gray-700 hover:border-gray-500"
                                    >
                                        Entrar
                                    </Link>
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
                <div className="md:hidden bg-gray-900 border-b border-gray-800 animate-in slide-in-from-top duration-300">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Início</Link>
                        <a href="/#como-funciona" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Como funciona</a>
                        <a href="/#features" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Recursos</a>
                        
                        <div className="pt-4 mt-4 border-t border-gray-800">
                            {session ? (
                                <>
                                    <Link to="/minha-conta" onClick={() => setIsOpen(false)} className="text-yellow-500 hover:text-yellow-400 block px-3 py-2 rounded-md text-base font-medium font-bold">Minha Conta</Link>
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-red-400 hover:text-red-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium">Sair</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Entrar</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
