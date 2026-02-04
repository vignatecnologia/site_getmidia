import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const PaymentSuccess = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full text-center border border-green-500/30">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Pagamento Confirmado!</h1>
                <p className="text-gray-300 mb-8">
                    Seus créditos foram adicionados à sua conta com sucesso.
                </p>
                <Link
                    to="/admin"
                    className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                    Ir para o Painel
                </Link>
            </div>
        </div>
    )
}

export const PaymentFailure = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full text-center border border-red-500/30">
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Pagamento Falhou</h1>
                <p className="text-gray-300 mb-8">
                    Houve um problema ao processar seu pagamento. Nenhuma cobrança foi feita.
                </p>
                <Link
                    to="/#pricing"
                    className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                    Tentar Novamente
                </Link>
            </div>
        </div>
    )
}

export const PaymentPending = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full text-center border border-yellow-500/30">
                <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Pagamento Pendente</h1>
                <p className="text-gray-300 mb-8">
                    Estamos processando seu pagamento (ex: Boleto bancário). Assim que confirmado, seus créditos serão liberados.
                </p>
                <Link
                    to="/admin"
                    className="block w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-colors"
                >
                    Voltar ao Painel
                </Link>
            </div>
        </div>
    )
}
