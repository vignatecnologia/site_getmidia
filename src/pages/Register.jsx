import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { UserPlus, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Register = () => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        cpfCnpj: '',
        howDidYouKnow: '',
        selectedModule: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null)
    const navigate = useNavigate()

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'phone') {
            formattedValue = formatPhone(value);
        } else if (name === 'cpfCnpj') {
            formattedValue = formatCpfCnpj(value);
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: formattedValue
        }));
    };

    const translateAuthError = (msg) => {
        if (!msg) return "Ocorreu um erro inesperado.";
        const lowerMsg = msg.toLowerCase();
        
        if (lowerMsg.includes("row-level security") || lowerMsg.includes("policy")) {
            return "Erro de permissão no banco de dados. Verifique as políticas de RLS.";
        }
        if (lowerMsg.includes("user already registered") || lowerMsg.includes("already registered") || lowerMsg.includes("email already exists")) {
            return "Este e-mail já está cadastrado. Tente fazer login.";
        }
        if (lowerMsg.includes("invalid format") || lowerMsg.includes("invalid email")) {
            return "Formato de e-mail inválido.";
        }
        if (lowerMsg.includes("weak password") || lowerMsg.includes("at least 6 characters")) {
            return "A senha deve ter pelo menos 6 caracteres.";
        }
        if (lowerMsg.includes("rate limit exceeded")) {
            return "Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos e tente novamente.";
        }
        return msg;
    };

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error("As senhas não coincidem.");
            }

            if (!formData.firstName.trim()) throw new Error("Por favor, informe seu nome.");
            if (!formData.lastName.trim()) throw new Error("Por favor, informe seu sobrenome.");
            if (!formData.email.trim()) throw new Error("Por favor, informe seu e-mail.");
            if (!formData.phone.trim()) throw new Error("Por favor, informe seu celular.");
            if (!formData.cpfCnpj.trim()) throw new Error("Por favor, informe seu CPF/CNPJ.");
            if (!formData.password.trim()) throw new Error("Por favor, escolha uma senha.");
            if (!formData.confirmPassword.trim()) throw new Error("Por favor, confirme sua senha.");
            if (!formData.howDidYouKnow) throw new Error("Por favor, selecione como nos conheceu.");
            if (!formData.selectedModule) throw new Error("Por favor, selecione qual módulo deseja usar.");

            // 1. Sign Up in Supabase Auth with metadata and redirect
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: window.location.origin + '/minha-conta',
                    data: {
                        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                        phone: formData.phone,
                        cpf_cnpj: formData.cpfCnpj,
                        how_did_you_know: formData.howDidYouKnow,
                        selected_module: formData.selectedModule
                    }
                }
            });

            if (authError) throw authError;

            // 1.1 Create Profile Record in the database
            // This ensures the user choice is preserved even before payment
            if (authData.user) {
                try {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: authData.user.id,
                            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                            phone: formData.phone,
                            cpf_cnpj: formData.cpfCnpj,
                            how_did_you_know: formData.how_did_you_know,
                            selected_module: formData.selectedModule,
                            updated_at: new Date().toISOString()
                        });
                    
                    if (profileError) {
                        console.error("Erro ao criar perfil inicial:", profileError);
                        // We don't throw here to avoid blocking registration if RLS fails or profile exists,
                        // but ideally RLS should allow this.
                    }
                } catch (err) {
                    console.error("Falha silenciosa ao criar perfil:", err);
                }
            }

            // No Supabase, se 'identities' vier vazio, significa que o usuário já existe
            if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
                setError("Este e-mail já está cadastrado. Tente fazer login.");
                toast.error("Este e-mail já está cadastrado.");
                setLoading(false);
                return;
            }

            // Detect if email confirmation is disabled (session exists immediately)
            if (authData.session) {
                toast.success("Parabéns! Sua conta foi criada e logada com sucesso.", {
                    duration: 4000,
                });
                
                // Redirection to account dashboard
                setTimeout(() => navigate('/minha-conta'), 2000);
            } else {
                // Confirmation is required
                toast.success("Conta criada com sucesso! Verifique seu e-mail.", {
                    duration: 6000,
                });
                
                setError("CADASTRO REALIZADO: Enviamos um link de ativação para o seu e-mail. Por favor, acesse sua caixa de entrada (e spam) para ativar sua conta antes de entrar.");
                
                // Redirection to login
                setTimeout(() => navigate('/login'), 5000);
            }

        } catch (error) {
            console.error("Erro no cadastro:", error);
            const translatedMessage = translateAuthError(error.message);
            setError(translatedMessage)
            toast.error(translatedMessage);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-20 mt-10">
            <div className="max-w-xl w-full space-y-8 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <div className="text-center">
                    <Link to="/" className="inline-block mb-6">
                        <img src="/logo-new.png" alt="GetMídia Logo" className="h-[50px] w-auto mx-auto" />
                    </Link>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Crie sua conta</h2>
                    <p className="mt-2 text-gray-400">Preencha os dados abaixo para começar</p>
                </div>

                {error && (
                    <div className={`${error.includes('CADASTRO REALIZADO') ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-red-500/10 border-red-500/50 text-red-500'} p-4 rounded-lg text-sm text-center`}>
                        {error}
                    </div>
                )}

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleRegister}>
                    {/* Nome e Sobrenome */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Nome <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="firstName"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all placeholder:text-gray-700"
                            placeholder="João"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Sobrenome <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="lastName"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all placeholder:text-gray-700"
                            placeholder="Silva"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">E-mail <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all placeholder:text-gray-700"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* CPF e Telefone */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">CPF <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="cpfCnpj"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all placeholder:text-gray-700 font-mono"
                            placeholder="000.000.000-00"
                            maxLength={14}
                            value={formData.cpfCnpj}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">CeluLar <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all placeholder:text-gray-700 font-mono"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Senha e Confirmação */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Senha <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all placeholder:text-gray-700 pr-12"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Repetir Senha <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                required
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all placeholder:text-gray-700 pr-12"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Dropdowns */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Como nos conheceu? <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                name="howDidYouKnow"
                                required
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                                value={formData.howDidYouKnow}
                                onChange={handleChange}
                            >
                                <option value="">Selecione...</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Instagram">Instagram</option>
                                <option value="Google">Google</option>
                                <option value="Indicação">Indicação</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Módulo de Acesso <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                name="selectedModule"
                                required
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                                value={formData.selectedModule}
                                onChange={handleChange}
                            >
                                <option value="">Selecione o módulo...</option>
                                <option value="product">Produto</option>
                                <option value="fashion">Moda</option>
                                <option value="food">Food</option>
                                <option value="auto">Auto</option>
                                <option value="optical">Ótica</option>
                                <option value="pet">Pet</option>
                                <option value="farma">Farma</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="md:col-span-2 w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all hover:shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-95"
                    >
                        {loading ? 'Criando sua conta...' : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Criar Minha Conta
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-700/50">
                    Já tem uma conta? <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-bold hover:underline transition-colors">Fazer Login</Link>
                </div>
            </div>
        </div>
    )
}

export default Register
