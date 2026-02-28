import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { Coins, User, CreditCard, Calendar, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';

const UserDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getProfile = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('getmidia_user'));
                if (!userData) {
                    navigate('/login');
                    return;
                }

                const { data } = await apiClient.get('/api/profiles/me');
                setProfile({ ...data, email: userData.email });
                setNewName(data.full_name || '');
            } catch (error) {
                console.error("Unexpected error loading dashboard:", error);
                toast.error("Erro ao carregar dados do usuário.");
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('getmidia_token');
        localStorage.removeItem('getmidia_user');
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    const handleUpdateName = async () => {
        if (!newName.trim()) return;

        const updateToast = toast.loading('Atualizando nome...');

        try {
            await apiClient.patch('/api/profiles/me', {
                full_name: newName
            });

            setProfile(prev => ({ ...prev, full_name: newName }));
            setIsEditingName(false);
            toast.success('Nome atualizado com sucesso!', { id: updateToast });
        } catch (error) {
            console.error("Error updating name:", error);
            toast.error(`Erro ao atualizar nome`, { id: updateToast });
        }
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
            default: return 'Nenhum';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Simple Navbar for Dashboard */}
            <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo-new.png" alt="GetMídia Logo" className="h-[40px] w-auto" />
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
                                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Nome</label>
                                {isEditingName ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white flex-1"
                                        />
                                        <button onClick={handleUpdateName} className="text-green-400 font-bold hover:text-green-300">Salvar</button>
                                        <button onClick={() => setIsEditingName(false)} className="text-gray-500 hover:text-gray-400">Cancelar</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-lg">{profile?.full_name || 'Usuário'}</p>
                                        <button onClick={() => setIsEditingName(true)} className="text-xs text-yellow-500 hover:underline">Editar</button>
                                    </div>
                                )}
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
                                        <span className={new Date(profile?.current_period_end) < new Date() ? 'text-red-400' : 'text-green-400'}>
                                            {formatDate(profile?.current_period_end)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                                <div>
                                    <span className="text-sm text-gray-400 block mb-1">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${profile?.subscription_status === 'active'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-gray-700 text-gray-400'
                                        }`}>
                                        {profile?.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>

                                {profile?.subscription_status === 'active' && (
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("Deseja realmente cancelar sua assinatura?")) return;
                                            const tToast = toast.loading("Enviando solicitação...");
                                            try {
                                                await apiClient.post('/api/tickets/create', {
                                                    type: 'cancellation',
                                                    description: 'Solicitação de cancelamento enviada pelo usuário via painel.'
                                                });
                                                toast.success("Seu pedido de cancelamento foi enviado com sucesso! Aguarde o email de confirmação.", { id: tToast, duration: 5000 });
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Erro ao enviar solicitação.", { id: tToast });
                                            }
                                        }}
                                        className="text-xs text-red-400 hover:text-red-300 hover:underline"
                                    >
                                        Cancelar Assinatura
                                    </button>
                                )}
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
