
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { UserPlus } from 'lucide-react'

const Register = () => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        cpfCnpj: ''
    });
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error("As senhas não coincidem.");
            }

            // Using Edge Function to create user (Auth + Profile)
            const { data, error: invokeError } = await supabase.functions.invoke('create-user', {
                body: {
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.fullName,
                    phone: formData.phone,
                    cpf_cnpj: formData.cpfCnpj
                }
            });

            if (invokeError) throw invokeError;

            // Auto login after registration
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (loginError) throw loginError;

            navigate('/minha-conta')
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <div className="text-center">
                    <Link to="/" className="inline-block mb-6">
                        <img src="/logo-new.png" alt="GetMídia Logo" className="h-[50px] w-auto mx-auto" />
                    </Link>
                    <h2 className="text-3xl font-bold text-white">Criar Conta</h2>
                    <p className="mt-2 text-gray-400">Comece a criar imagens incríveis hoje</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Seu Nome"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                            <input
                                type="text"
                                name="phone"
                                required
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">CPF/CNPJ</label>
                            <input
                                type="text"
                                name="cpfCnpj"
                                required
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="000.000.000-00"
                                value={formData.cpfCnpj}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Senha</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-yellow-400 text-black font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Criando conta...' : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Criar Conta
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-500">
                    Já tem uma conta? <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
                </div>
            </div>
        </div>
    )
}

export default Register
