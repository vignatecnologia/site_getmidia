import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Users, Shield, LogOut, ArrowLeft, Search } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const ADMIN_EMAIL = 'vignatecnologia@gmail.com';

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session || session.user.email !== ADMIN_EMAIL) {
                // Not authorized
                navigate('/');
                return;
            }

            fetchUsers();
        };

        checkAuth();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            // Fetch users via Edge Function (using fetch to bypass potential invoke/gateway issues)
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error("No session token");

            // Assuming standard Supabase Functions URL structure based on project ID
            // We can try to get the project URL from supabase client or hardcode/construct it.
            // Since we don't have the URL easily in the client object public property usually:
            // Let's use the 'invoke' but simpler? No, invoke forces Auth header.

            // Constructing URL using the project URL form env or similar is tricky without direct access.
            // BUT, supabase.functions.url gives the base URL? No.
            // Let's rely on the relative path? '/functions/v1/list-users' often proxies in local dev, but in prod?
            // "https://qyruweidqlqniqdatnxx.supabase.co/functions/v1/list-users" was seen in the error logs.

            const PROJECT_REF = 'qyruweidqlqniqdatnxx'; // Extracted from previous error logs
            const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/list-users`;

            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'X-Supabase-Auth': token // Custom header to pass token
                }
            });

            if (!response.ok) {
                const errBody = await response.text();
                console.error("Function error body:", errBody);
                throw new Error(`Function returned ${response.status}: ${errBody}`);
            }

            const data = await response.json();

            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Erro ao carregar usuários.');
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
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg text-primary">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Painel Administrativo</h1>
                            <p className="text-xs text-gray-400">Gerenciamento de Usuários</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400 hidden sm:block">Admin: {ADMIN_EMAIL}</span>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="Sair"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
                            placeholder="Buscar nome, CPF ou telefone..."
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(user.credits || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-700 text-gray-400'
                                                    }`}>
                                                    {user.credits !== undefined ? user.credits : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-gray-400 text-sm">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
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
            </main>
        </div>
    );
};

export default AdminPanel;
