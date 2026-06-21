
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Coins, User, CreditCard, Calendar, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SubscriptionModal from '../components/SubscriptionModal';
import CreditPackageModal from '../components/CreditPackageModal';
import { toast } from 'react-hot-toast';

const UserDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        full_name: '',
        phone: '',
        cpf_cnpj: '',
        how_did_you_know: '',
        selected_module: ''
    });
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [isCreditPackageModalOpen, setIsCreditPackageModalOpen] = useState(false);
    const navigate = useNavigate();
    
    const formatPhone = (value) => {
        if (!value) return '';
        const v = value.replace(/\D/g, '');
        if (v.length > 11) return v.slice(0, 11);
        return v
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d)(\d{4})$/, '$1-$2');
    };

    const formatCpfCnpj = (value) => {
        if (!value) return '';
        const v = value.replace(/\D/g, '');
        if (v.length <= 11) {
            return v
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                .slice(0, 14);
        } else {
            return v
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .slice(0, 18);
        }
    };

    useEffect(() => {
        const getProfileData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }

                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (error) throw error;

                // 3. Prepare display data (using database record or fallback to Auth metadata)
                const metadata = user.user_metadata || {};
                const finalProfile = {
                    ...profileData,
                    email: user.email,
                    full_name: profileData?.full_name || metadata.full_name || 'Usuário',
                    phone: formatPhone(profileData?.phone || metadata.phone || ''),
                    cpf_cnpj: formatCpfCnpj(profileData?.cpf_cnpj || metadata.cpf_cnpj || ''),
                    how_did_you_know: profileData?.how_did_you_know || metadata.how_did_you_know || '',
                    selected_module: profileData?.selected_module || metadata.selected_module || ''
                };
                
                setProfile(finalProfile);
                setEditData({
                    full_name: finalProfile.full_name,
                    phone: finalProfile.phone,
                    cpf_cnpj: finalProfile.cpf_cnpj,
                    how_did_you_know: finalProfile.how_did_you_know,
                    selected_module: finalProfile.selected_module
                });
            } catch (error) {
                console.error("Unexpected error loading dashboard:", error);
                toast.error("Erro ao carregar dados do usuário.");
                // Se o erro não for apenas a falta do perfil, voltamos pro login
                if (error.message && !error.message.includes("profiles")) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchInvoices = async () => {
            setLoadingInvoices(true);
            try {
                const { data, error } = await supabase.functions.invoke('get-invoices');
                if (error) throw error;
                setInvoices(data?.invoices || []);
            } catch (e) {
                console.error("Error fetching invoices:", e);
            } finally {
                setLoadingInvoices(false);
            }
        };

        getProfileData();
        fetchInvoices();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleUpdateProfile = async () => {
        if (!editData.full_name.trim()) return;

        const updateToast = toast.loading('Atualizando dados...');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editData.full_name,
                    phone: editData.phone,
                    cpf_cnpj: editData.cpf_cnpj,
                    how_did_you_know: editData.how_did_you_know,
                    selected_module: editData.selected_module
                })
                .eq('id', user.id);

            if (error) throw error;

            setProfile(prev => ({ ...prev, ...editData }));
            setIsEditing(false);
            toast.success('Dados atualizados com sucesso!', { id: updateToast });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(`Erro ao atualizar dados`, { id: updateToast });
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
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-700 p-3 rounded-xl">
                                    <User className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Dados Pessoais</h2>
                                    <p className="text-gray-400 text-sm">Suas informações de cadastro</p>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-yellow-500 hover:text-yellow-400 font-bold"
                                >
                                    Editar Perfil
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Nome Completo</label>
                                            <input
                                                type="text"
                                                value={editData.full_name}
                                                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-yellow-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Telefone</label>
                                            <input
                                                type="text"
                                                value={editData.phone}
                                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-yellow-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">CPF</label>
                                            <input
                                                type="text"
                                                value={editData.cpf_cnpj}
                                                onChange={(e) => setEditData({ ...editData, cpf_cnpj: formatCpfCnpj(e.target.value) })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-yellow-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Módulo Principal</label>
                                            <select
                                                value={editData.selected_module}
                                                onChange={(e) => setEditData({ ...editData, selected_module: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-yellow-500"
                                            >
                                                <option value="product">Produto</option>
                                                <option value="fashion">Moda</option>
                                                <option value="food">Food</option>
                                                <option value="auto">Auto</option>
                                                <option value="optical">Ótica</option>
                                                <option value="pet">Pet</option>
                                                <option value="farma">Farma</option>
                                                <option value="credito">Crédito</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Como nos conheceu?</label>
                                            <select
                                                value={editData.how_did_you_know}
                                                onChange={(e) => setEditData({ ...editData, how_did_you_know: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-yellow-500"
                                            >
                                                <option value="Facebook">Facebook</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="Google">Google</option>
                                                <option value="Indicação">Indicação</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg transition-colors"
                                        >
                                            Salvar Alterações
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditData({
                                                    full_name: profile.full_name || '',
                                                    phone: profile.phone || '',
                                                    cpf_cnpj: profile.cpf_cnpj || '',
                                                    how_did_you_know: profile.how_did_you_know || '',
                                                    selected_module: profile.selected_module || ''
                                                });
                                            }}
                                            className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Nome Completo</label>
                                        <p className="font-semibold text-lg">{profile?.full_name || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">E-mail</label>
                                        <p className="font-medium text-gray-300">{profile?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Telefone</label>
                                        <p className="font-semibold">{profile?.phone || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">CPF</label>
                                        <p className="font-semibold">{profile?.cpf_cnpj || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Módulo Selecionado</label>
                                        <p className="font-bold text-yellow-500 uppercase text-sm">
                                            {profile?.selected_module || 'Nenhum'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Origem</label>
                                        <p className="font-semibold">{profile?.how_did_you_know || 'Não informado'}</p>
                                    </div>
                                </div>
                            )}
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
                            {profile?.subscription_status === 'canceled' && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-pulse">
                                    <strong>Atenção:</strong> Sua assinatura está cancelada.
                                </div>
                            )}
                            <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Créditos Disponíveis</label>
                                    <div className="flex items-center gap-2">
                                        <Coins className="w-5 h-5 text-yellow-500" />
                                        <span className="text-2xl font-bold text-white">{profile?.credits || 0}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (profile?.subscription_status === 'active') {
                                            setIsCreditPackageModalOpen(true);
                                        } else {
                                            setIsSubscriptionModalOpen(true);
                                        }
                                    }}
                                    className="text-sm text-yellow-500 hover:text-yellow-400 font-medium bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg transition-all hover:border-yellow-500"
                                >
                                    {profile?.subscription_status === 'active' ? 'Comprar Mais' : 'Assinar um plano'}
                                </button>
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
                                        : profile?.subscription_status === 'canceled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700 text-gray-400'
                                        }`}>
                                        {profile?.subscription_status === 'active' ? 'Ativo' : (profile?.subscription_status === 'canceled' ? 'Cancelado' : 'Inativo')}
                                    </span>
                                </div>
                                {(profile?.subscription_status === 'active' || profile?.subscription_status === 'canceled') && (
                                    <button
                                        onClick={async () => {
                                            const tToast = toast.loading("Redirecionando para o portal de pagamento...");
                                            try {
                                                const { data, error } = await supabase.functions.invoke('create-portal');
                                                if (error) throw error;
                                                
                                                if (data?.url) {
                                                    window.location.href = data.url;
                                                } else {
                                                    throw new Error("URL do portal não retornada.");
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Erro ao abrir portal. Tente novamente mais tarde.", { id: tToast });
                                            }
                                        }}
                                        className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
                                    >
                                        <span>{profile?.subscription_status === 'active' ? 'Gerenciar ou Cancelar Assinatura' : 'Gerenciar ou Reativar Assinatura'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* INVOICE HISTORY SECTION */}
                <div className="mt-12 bg-gray-800 rounded-2xl p-8 border border-gray-700">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-semibold">Histórico de Faturas</h2>
                            <p className="text-gray-400 text-sm">Acesse seus pagamentos e recibos</p>
                        </div>
                    </div>

                    {loadingInvoices ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700">
                                        <th className="pb-4 font-bold">Data</th>
                                        <th className="pb-4 font-bold">Plano / Descrição</th>
                                        <th className="pb-4 font-bold">Valor</th>
                                        <th className="pb-4 font-bold text-center">Status</th>
                                        <th className="pb-4 font-bold text-right">Recibo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="text-sm">
                                            <td className="py-4 text-gray-300">{formatDate(inv.date)}</td>
                                            <td className="py-4">
                                                <div className="font-medium text-white">{inv.plan_name}</div>
                                                <div className="text-xs text-gray-500">{inv.number}</div>
                                            </td>
                                            <td className="py-4 font-semibold text-white">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: inv.currency.toUpperCase() }).format(inv.amount)}
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                                                    inv.status === 'paid' 
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                    {inv.status === 'paid' ? 'Paga' : inv.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                {inv.pdf && (
                                                    <a 
                                                        href={inv.pdf} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                                                    >
                                                        PDF
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-dashed border-gray-700">
                            <p className="text-gray-500">Nenhuma fatura encontrada.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            
            <SubscriptionModal 
                isOpen={isSubscriptionModalOpen} 
                onClose={() => setIsSubscriptionModalOpen(false)} 
            />

            <CreditPackageModal 
                isOpen={isCreditPackageModalOpen} 
                onClose={() => setIsCreditPackageModalOpen(false)} 
            />
        </div>
    );
};

export default UserDashboard;
