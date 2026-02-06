import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Users, Shield, LogOut, Search, Image, Edit2, Coins, Eye, Ticket as TicketIcon } from 'lucide-react';
import SiteGalleries from '../components/Admin/SiteGalleries';
import ReportedImages from '../components/Admin/ReportedImages';
import AdminUserDetail from '../components/Admin/AdminUserDetail';
import toast from 'react-hot-toast';

const TicketsTab = ({ users }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTickets = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Erro ao buscar tickets");
        } else {
            setTickets(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleResolve = async (id) => {
        if (!window.confirm("Marcar como resolvido?")) return;
        const { error } = await supabase.from('tickets').update({ status: 'resolved' }).eq('id', id);
        if (error) toast.error("Erro ao atualizar");
        else {
            toast.success("Ticket resolvido!");
            fetchTickets();
        }
    };

    const getUserName = (uid) => {
        const u = users.find(x => x.id === uid);
        return u ? `${u.full_name} (${u.email})` : uid;
    };

    if (isLoading) return <div className="p-8 text-center text-gray-400">Carregando solicitações...</div>;

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl m-8">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-700/50 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-4">Data</th>
                        <th className="p-4">Usuário</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {tickets.map(t => (
                        <tr key={t.id} className="hover:bg-gray-700/30">
                            <td className="p-4 text-sm text-gray-400">{new Date(t.created_at).toLocaleDateString()}</td>
                            <td className="p-4 text-white font-medium">{getUserName(t.user_id)}</td>
                            <td className="p-4 text-sm uppercase">{t.type}</td>
                            <td className="p-4 text-sm text-gray-300">{t.description}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.status === 'open' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                    }`}>
                                    {t.status}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                {t.status === 'open' && (
                                    <button
                                        onClick={() => handleResolve(t.id)}
                                        className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded transition-colors"
                                    >
                                        Resolver
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {tickets.length === 0 && (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">Nenhuma solicitação encontrada.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'galleries', 'reports'
    const [selectedUser, setSelectedUser] = useState(null); // New state for selected user detail view

    const [pendingReports, setPendingReports] = useState(0);
    const navigate = useNavigate();

    const ADMIN_EMAIL = 'vignatecnologia@gmail.com';

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            const allowedEmails = ['vignatecnologia@gmail.com', 'projeto.getmidia@gmail.com'];
            if (!session || !allowedEmails.includes(session.user.email)) {
                navigate('/');
                return;
            }

            fetchUsers();
            fetchReportCount();
        };

        checkAuth();
    }, [navigate]);

    const fetchReportCount = async () => {
        const { count } = await supabase
            .from('reported_images')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        if (count !== null) setPendingReports(count);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("No session token");

            // 1. Fetch Auth Users (Emails) from Edge Function
            const PROJECT_REF = 'qyruweidqlqniqdatnxx';
            const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/list-users`;

            let usersData = [];
            try {
                const response = await fetch(FUNCTION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        'X-Supabase-Auth': token
                    }
                });
                if (response.ok) {
                    usersData = await response.json();
                } else {
                    console.warn("Failed to fetch users from Edge Function", response.status);
                }
            } catch (err) {
                console.warn("Edge function fetch error:", err);
            }

            // 2. Fetch Profiles (Credits) directly from Database (Source of Truth)
            const { data: profilesData, error: profileError } = await supabase
                .from('profiles')
                .select('*');

            if (profileError) throw profileError;

            // 3. Merge Data
            let merged = [];

            if (usersData && usersData.length > 0) {
                merged = usersData.map(u => {
                    const profile = profilesData?.find(p => p.id === u.id);
                    return {
                        ...u,
                        credits: profile ? profile.credits : (u.credits || 0),
                        full_name: profile ? profile.full_name : u.full_name,
                        phone: profile ? profile.phone : u.phone,
                        cpf_cnpj: profile ? profile.cpf_cnpj : u.cpf_cnpj,
                        plan: profile ? profile.plan : u.plan,
                        allowed_features: profile ? profile.allowed_features : u.allowed_features,
                        whatsapp: profile ? profile.whatsapp : u.whatsapp,
                        subscription_status: profile ? profile.subscription_status : u.subscription_status,
                        subscription_start: profile ? profile.subscription_start : u.subscription_start,
                        current_period_end: profile ? profile.current_period_end : u.current_period_end,
                        payment_method: profile ? profile.payment_method : u.payment_method,
                    };
                });
            } else if (profilesData) {
                // Fallback: Show just profiles if Auth list fails
                merged = profilesData.map(p => ({
                    id: p.id,
                    email: p.email || 'Email não acessível',
                    full_name: p.full_name,
                    credits: p.credits,
                    phone: p.phone,
                    cpf_cnpj: p.cpf_cnpj,
                    created_at: p.updated_at
                }));
            }

            setUsers(merged);

        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.cpf_cnpj || '').includes(searchTerm) ||
        (user.phone || '').includes(searchTerm)
    );

    // Modal for Creating User
    const CreateUserModal = ({ onClose, onCreated }) => {
        const [formData, setFormData] = useState({
            email: '',
            password: '',
            full_name: '',
            phone: '',
            cpf_cnpj: '',
            credits: 0
        });
        const [creating, setCreating] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setCreating(true);
            try {
                // Determine function URL based on env
                const PROJECT_REF = 'qyruweidqlqniqdatnxx';
                const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/create-user`;

                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                const response = await fetch(FUNCTION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        'X-Supabase-Auth': token
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao criar usuário');
                }

                alert('Usuário criado com sucesso!');
                onCreated();
                onClose();
            } catch (error) {
                console.error('Error creating user:', error);
                alert('Erro ao criar usuário: ' + (error.message || 'Erro desconhecido'));
            } finally {
                setCreating(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Adicionar Novo Usuário</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Senha</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Telefone</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">CPF/CNPJ</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                                    value={formData.cpf_cnpj}
                                    onChange={e => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Créditos Iniciais</label>
                            <input
                                type="number"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm"
                                value={formData.credits}
                                onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="flex-1 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
                            >
                                {creating ? 'Criando...' : 'Criar Usuário'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p>Carregando painel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col z-20">
                <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-700">
                    <img src="/logo-new.png" alt="GetMídia" className="h-8 w-auto" />
                    <span className="font-bold text-base leading-tight">Painel de<br />Controle</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('users'); setSelectedUser(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users'
                            ? 'bg-primary/20 text-primary border border-primary/20'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Usuários</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('galleries'); setSelectedUser(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'galleries'
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <Image className="w-5 h-5" />
                        <div className="flex flex-col text-left">
                            <span className="font-medium">Galerias do Site</span>
                        </div>
                    </button>

                    <button
                        onClick={() => { setActiveTab('reports'); setSelectedUser(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <div className="relative">
                            <Shield className="w-5 h-5" />
                            {pendingReports > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {pendingReports}
                                </span>
                            )}
                        </div>
                        <span className="font-medium">Imagens Reportadas</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('tickets'); setSelectedUser(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tickets'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <TicketIcon className="w-5 h-5" />
                        <span className="font-medium">Solicitações</span>
                    </button>
                </nav>


                <div className="p-4 border-t border-gray-700">
                    <div className="px-4 py-2 mb-2">
                        <span className="text-xs text-gray-500 block">Logado como:</span>
                        <span className="text-xs text-gray-300 font-mono truncate block">{ADMIN_EMAIL}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-gray-900 overflow-hidden relative">

                {/* Top Header - Show only if NOT in selectedUser view (detail view has its own header) */}
                {!selectedUser && (
                    <header className="h-16 bg-gray-800/50 backdrop-blur-md border-b border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10">
                        <h1 className="text-xl font-bold">
                            {activeTab === 'users' ? 'Gerenciamento de Usuários' :
                                activeTab === 'galleries' ? 'Gerenciar Galerias' :
                                    'Imagens Reportadas'}
                        </h1>
                    </header>
                )}

                <div className="flex-1 overflow-y-auto p-0">
                    {/* Render Detail View if User Selected */}
                    {selectedUser ? (
                        <AdminUserDetail
                            user={selectedUser}
                            onBack={() => {
                                setSelectedUser(null);
                                fetchUsers(); // Refresh list on return
                            }}
                        />
                    ) : (
                        // Normal Routing
                        <div className="p-8">
                            {activeTab === 'galleries' ? (
                                <SiteGalleries />
                            ) : activeTab === 'reports' ? (
                                <ReportedImages users={users} />
                            ) : activeTab === 'tickets' ? (
                                <TicketsTab users={users} />
                            ) : (
                                // Users View
                                <>
                                    {/* Stats / Controls */}
                                    {isCreateModalOpen && (
                                        <CreateUserModal
                                            onClose={() => setIsCreateModalOpen(false)}
                                            onCreated={() => {
                                                fetchUsers();
                                            }}
                                        />
                                    )}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                        <div className="flex items-center gap-4 text-gray-300">
                                            <div className="bg-gray-800 p-2 rounded-lg">
                                                <Users className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="font-medium">{users.length} Usuários Cadastrados</span>
                                            <button
                                                onClick={() => setIsCreateModalOpen(true)}
                                                className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ml-4"
                                            >
                                                Adicionar Usuário
                                            </button>
                                        </div>

                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Buscar..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-700/50 text-gray-400 text-xs uppercase tracking-wider">
                                                        <th className="p-4 font-semibold">Nome Completo</th>
                                                        <th className="p-4 font-semibold">Email</th>
                                                        <th className="p-4 font-semibold text-center">Créditos</th>
                                                        <th className="p-4 font-semibold text-right">Cadastrado em</th>
                                                        <th className="p-4 font-semibold text-center">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {filteredUsers.length > 0 ? (
                                                        filteredUsers.map((user) => (
                                                            <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                                                                <td className="p-4">
                                                                    <div className="font-medium text-white">{user.full_name || 'Sem nome'}</div>
                                                                </td>
                                                                <td className="p-4 text-gray-300">
                                                                    {user.email || '-'}
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${(user.credits || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-700 text-gray-400'
                                                                        }`}>
                                                                        <Coins className="w-3 h-3" />
                                                                        {user.credits !== undefined ? user.credits : 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-right text-gray-400 text-sm">
                                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <button
                                                                        onClick={() => setSelectedUser(user)}
                                                                        className="p-1.5 hover:bg-gray-700 text-primary hover:text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                                                        title="Ver Detalhes e Editar"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                        <span className="text-xs font-medium">Editar</span>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="p-8 text-center text-gray-500">
                                                                Nenhum usuário encontrado.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
