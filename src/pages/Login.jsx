
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogIn, Eye, EyeOff } from 'lucide-react'

import logo from '../assets/logo_getmidia.png'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
 
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao recuperar sessão:", sessionError.message);
          // Se houver erro de token inválido, limpamos para permitir novo login
          await supabase.auth.signOut();
          return;
        }

        if (session) {
          const admins = ['vignatecnologia@gmail.com', 'projeto.getmidia@gmail.com'];
          if (admins.includes(session.user.email)) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/minha-conta', { replace: true });
          }
        }
      } catch (err) {
        console.error("Erro inesperado na sessão:", err);
      }
    };
    checkSession();
  }, [navigate]);

  const translateAuthError = (msg) => {
    if (!msg) return "Ocorreu um erro inesperado.";
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes("email not confirmed")) {
      return "Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada ou pasta de spam.";
    }
    
    if (lowerMsg.includes("invalid login credentials") || lowerMsg.includes("invalid user")) {
      return "E-mail ou senha incorretos. Verifique suas credenciais.";
    }
    
    if (lowerMsg.includes("network error") || lowerMsg.includes("failed to fetch")) {
      return "Erro de conexão. Verifique sua internet.";
    }
    return msg;
  };

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error;

      const { user, session } = data;
      
      const admins = ['vignatecnologia@gmail.com', 'projeto.getmidia@gmail.com'];
      if (user && admins.includes(user.email)) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/minha-conta', { replace: true })
      }
    } catch (error) {
      setError(translateAuthError(error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <div className="flex justify-center">
              <img src={logo} alt="GetMidia" className="h-[90px] object-contain" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-white">Bem-vindo de volta</h2>
          <p className="mt-2 text-gray-400">Entre na sua conta para continuar</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-yellow-400 text-black font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>
        </form>

        {/* <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700/50 mt-6">
          Não tem uma conta? <Link to="/register" className="text-yellow-500 hover:text-yellow-400 hover:underline font-bold transition-colors">Cadastre-se agora</Link>
        </div> */}
      </div>
    </div>
  )
}

export default Login
