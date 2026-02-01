import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Users, Shield, LogOut, Search, Image, Edit2, Coins, Eye } from 'lucide-react';
import SiteGalleries from '../components/Admin/SiteGalleries';
import ReportedImages from '../components/Admin/ReportedImages';
import AdminUserDetail from '../components/Admin/AdminUserDetail';

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
                            ) : (
                                // Users View
                                <>
                                    {/* Stats / Controls */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <div className="bg-gray-800 p-2 rounded-lg">
                                                <Users className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="font-medium">{users.length} Usuários Cadastrados</span>
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
