import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Coins, User, CreditCard, Calendar, LogOut } from 'lucide-react';
import { Navbar } from '../components/Navbar'; // Adjust import if necessary
import Footer from '../components/Footer';

const UserDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
            setLoading(false);
        };

        getProfile();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return ' - ';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getPlanName = (planId) => {
        switch (planId) {
            case 'essential': return 'Plano Essencial';
            case 'advanced': return 'Plano Avançado';
            case 'professional': return 'Plano Profissional';
            default: return 'Plano Gratuito / Nenhum';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Simple Navbar for Dashboard */}
            <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        GetMídia
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </nav>

            <main className="flex-1 container mx-auto px-6 py-24">
                <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* User Info Card */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gray-700 p-3 rounded-xl">
                                <User className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Dados Pessoais</h2>
                                <p className="text-gray-400 text-sm">Suas informações de cadastro</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Nome</label>
                                <p className="font-medium text-lg">{profile?.full_name || 'Usuário'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                                <p className="font-medium text-gray-300">{profile?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Card */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="bg-gray-700 p-3 rounded-xl">
                                <CreditCard className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Assinatura e Créditos</h2>
                                <p className="text-gray-400 text-sm">Status do seu plano atual</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Créditos Disponíveis</label>
                                    <div className="flex items-center gap-2">
                                        <Coins className="w-5 h-5 text-yellow-500" />
                                        <span className="text-2xl font-bold text-white">{profile?.credits || 0}</span>
                                    </div>
                                </div>
                                <Link to="/#pricing" className="text-sm text-yellow-500 hover:text-yellow-400 font-medium">
                                    Comprar Mais
                                </Link>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Plano Atual</label>
                                <p className="font-medium text-lg text-white">{getPlanName(profile?.plan_id)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Início</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{formatDate(profile?.subscription_start)}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Validade</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className={new Date(profile?.subscription_end) < new Date() ? 'text-red-400' : 'text-green-400'}>
                                            {formatDate(profile?.subscription_end)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                                <span className="text-sm text-gray-400">Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${profile?.subscription_status === 'active'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}>
                                    {profile?.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default UserDashboard;
