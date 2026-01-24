
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { UserPlus } from 'lucide-react'

const Register = () => {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) throw error
            // Usually redirects to confirmation or logs in immediately if no confirmation required
            alert('Cadastro realizado! Verifique seu email para confirmar.')
            navigate('/login')
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <div className="text-center">
                    <Link to="/" className="inline-block mb-6">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto">
                            <span className="text-black font-bold text-2xl">G</span>
                        </div>
                    </Link>
                    <h2 className="text-3xl font-bold text-white">Criar Conta</h2>
                    <p className="mt-2 text-gray-400">Comece a criar imagens incríveis hoje</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-yellow-400 text-black font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
