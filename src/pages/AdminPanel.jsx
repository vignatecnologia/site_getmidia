import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Users, Shield, LogOut, Search, Image, Edit2, Check, X, Loader2, Coins } from 'lucide-react';
import SiteGalleries from '../components/Admin/SiteGalleries';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'galleries'
    const navigate = useNavigate();

    const [editingId, setEditingId] = useState(null);
    const [editCredits, setEditCredits] = useState(0);
    const [updating, setUpdating] = useState(false);

    const ADMIN_EMAIL = 'vignatecnologia@gmail.com';

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session || session.user.email !== ADMIN_EMAIL) {
                // Not authorized
                navigate('/');
                return;
            }

            // Only fetch users if needed/initially
            fetchUsers();
        };

        checkAuth();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            // Fetch users via Edge Function
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error("No session token");

            const PROJECT_REF = 'qyruweidqlqniqdatnxx';
            const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/list-users`;

            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'X-Supabase-Auth': token
                }
            });

            if (!response.ok) {
                // Function might fail if RLS or other things changed, handle gracefully?
                console.warn("Function error, falling back to empty list if authorized.");
                // In a real app we might show error, but keeping existing logic flow
            } else {
                const data = await response.json();
                setUsers(data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            // alert('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleEditClick = (user) => {
        setEditingId(user.id);
        setEditCredits(user.credits || 0);
    };

    const handleSaveCredits = async (userId) => {
        setUpdating(true);
        try {
            // Attempt direct database update first
            const { error, count } = await supabase
                .from('profiles')
                .update({ credits: parseInt(editCredits) })
                .eq('id', userId)
                .select('', { count: 'exact' });

            if (error) throw error;

            // If RLS blocks update, count might be 0 without error
            if (count === 0) {
                throw new Error("Permissão negada (RLS) ou usuário não encontrado.");
            }

            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? { ...u, credits: parseInt(editCredits) } : u
            ));
            setEditingId(null);
            alert('Créditos atualizados com sucesso!');

        } catch (error) {
            console.error('Error updating credits:', error);
            alert('Erro ao atualizar créditos: ' + error.message);
        } finally {
            setUpdating(false);
        }
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
                <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-700">
                    <div className="bg-yellow-500/20 p-1.5 rounded-lg text-yellow-500">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users'
                            ? 'bg-primary/20 text-primary border border-primary/20'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Usuários</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('galleries')}
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

                {/* Top Header */}
                <header className="h-16 bg-gray-800/50 backdrop-blur-md border-b border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h1 className="text-xl font-bold">
                        {activeTab === 'users' ? 'Gerenciamento de Usuários' : 'Gerenciar Galerias'}
                    </h1>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'galleries' ? (
                        <SiteGalleries />
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
                                                <th className="p-4 font-semibold">CPF / CNPJ</th>
                                                <th className="p-4 font-semibold">Telefone</th>
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
                                                            <div className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{user.id}</div>
                                                        </td>
                                                        <td className="p-4 text-gray-300">
                                                            {user.email || '-'}
                                                        </td>
                                                        <td className="p-4 text-gray-300">
                                                            {user.cpf_cnpj || '-'}
                                                        </td>
                                                        <td className="p-4 text-gray-300">
                                                            {user.phone || '-'}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {editingId === user.id ? (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        value={editCredits}
                                                                        onChange={(e) => setEditCredits(e.target.value)}
                                                                        className="w-20 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center font-bold text-yellow-500 focus:border-yellow-500 outline-none"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${(user.credits || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-700 text-gray-400'
                                                                    }`}>
                                                                    <Coins className="w-3 h-3" />
                                                                    {user.credits !== undefined ? user.credits : 'N/A'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-right text-gray-400 text-sm">
                                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {editingId === user.id ? (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        onClick={() => handleSaveCredits(user.id)}
                                                                        disabled={updating}
                                                                        className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                                                                        title="Salvar"
                                                                    >
                                                                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingId(null)}
                                                                        disabled={updating}
                                                                        className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                                                                        title="Cancelar"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEditClick(user)}
                                                                    className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                                    title="Editar Créditos"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center text-gray-500">
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
            </main>
        </div>
    );
};

export default AdminPanel;
