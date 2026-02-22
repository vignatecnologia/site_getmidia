
import React from 'react'
import { Check, Star, Zap, Crown, Coins } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

const Pricing = () => {
    const [loadingPlan, setLoadingPlan] = useState(null)
    const [error, setError] = useState(null)
    const [session, setSession] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })
    }, [])

    const handleSubscribe = async (planId) => {
        setError(null)
        if (!session) {
            navigate('/login')
            return
        }

        try {
            setLoadingPlan(planId)
            const { data, error } = await supabase.functions.invoke('create-checkout', {
                body: { planId }
            })

            if (error) throw error

            console.log("Checkout response:", data);

            if (data?.url) {
                window.location.href = data.url
            } else if (data?.init_point) {
                // Fallback
                window.location.href = data.init_point
            } else {
                throw new Error("Link de pagamento não retornado.")
            }
        } catch (error) {
            console.error('Error creating checkout:', error)
            setError(`Erro: ${error.message || error}`)
        } finally {
            setLoadingPlan(null)
        }
    }

    const plans = [
        {
            id: 'essential',
            name: 'Plano Essencial',
            price: 'R$89,90',
            period: '/mês',
            credits: '80 Créditos',
            features: [
                'Gerar imagem: Somente do Produto',
                'Gerar imagem: Produto + Modelo',
                'Logotipo da empresa',
                'Edição dos textos fácil',
                'Alta Resolução das imagens',
                'Suporte Técnico'
            ],
            icon: <Star className="w-6 h-6 text-gray-400" />,
            color: 'bg-gray-800',
            button: 'Assinar Agora',
            popular: false
        },
        {
            id: 'advanced',
            name: 'Plano Avançado',
            price: 'R$129,90',
            period: '/mês',
            credits: '120 Créditos',
            features: [
                'Gerar imagem: Somente do Produto',
                'Gerar imagem: Produto + Modelo',
                'Logotipo da empresa',
                'Edição dos textos fácil',
                'Alta Resolução das imagens',
                'Suporte Técnico'
            ],
            icon: <Zap className="w-6 h-6 text-yellow-400" />,
            color: 'bg-gray-800 border-primary/50 ring-1 ring-primary/50',
            button: 'Assinar Agora',
            popular: true
        },
        {
            id: 'professional',
            name: 'Plano Profissional',
            price: 'R$189,90',
            period: '/mês',
            credits: '200 Créditos',
            features: [
                'Gerar imagem: Somente do Produto',
                'Gerar imagem: Produto + Modelo',
                'Logotipo da empresa',
                'Edição dos textos fácil',
                'Alta Resolução das imagens',
                'Suporte Técnico'
            ],
            icon: <Crown className="w-6 h-6 text-purple-400" />,
            color: 'bg-gray-800',
            button: 'Assinar Agora',
            popular: false
        }
    ]

    return (
        <section id="pricing" className="py-24 bg-gray-900 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Planos para todos os tamanhos
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Escolha o pacote de créditos ideal para sua demanda. Sem contratos de longo prazo.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {error && (
                        <div className="md:col-span-3 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-center mb-4">
                            {error}
                        </div>
                    )}
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl p-8 flex flex-col ${plan.popular ? 'bg-gray-800/80 border-primary/50 border' : 'bg-gray-800/50 border border-gray-700'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-yellow-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                    MAIS POPULAR
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-xl ${plan.popular ? 'bg-primary/20' : 'bg-gray-700/50'}`}>
                                    {plan.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-white">{plan.price}</span>
                                        <span className="text-sm text-gray-400">{plan.period}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                                <p className="text-center font-bold text-white flex items-center justify-center gap-2">
                                    <Coins className="w-5 h-5 text-yellow-400" />
                                    {plan.credits}
                                </p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loadingPlan === plan.id}
                                className={`w-full py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 ${plan.popular
                                    ? 'bg-primary text-black hover:bg-yellow-400 shadow-lg shadow-primary/20'
                                    : 'bg-white text-black hover:bg-gray-200'
                                    } ${loadingPlan === plan.id ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {loadingPlan === plan.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    plan.button
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>Os créditos não são acumulativos.</p>
                </div>
            </div>
        </section>
    )
}

export default Pricing
