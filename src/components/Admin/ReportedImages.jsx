import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ThumbsUp, ThumbsDown, Trash2, ExternalLink, Loader2, AlertTriangle, User } from 'lucide-react';

const ReportedImages = ({ users = [] }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [users]); // Re-run if users update (though unlikely to change often)

    const fetchReports = async () => {
        try {
            setLoading(true);
            // Fetch reports ordered by newest
            const { data, error } = await supabase
                .from('reported_images')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const merged = data.map(r => {
                // Find user in the passed users array
                const user = users.find(u => u.id === r.user_id);
                return {
                    ...r,
                    user: user ? {
                        full_name: user.full_name || 'Nome Desconhecido',
                        email: user.email || 'Email Desconhecido'
                    } : {
                        full_name: 'Usuário Desconhecido',
                        email: null
                    },
                    publicUrl: getImageUrl(r.image_path)
                };
            });

            setReports(merged);

        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        const { data } = supabase.storage
            .from('reported_images')
            .getPublicUrl(path);
        return data.publicUrl;
    };

    const handleRefund = async (report) => {
        if (!confirm(`Confirmar reembolso de ${report.cost} crédito(s) para ${report.user.full_name}?`)) return;

        setProcessingId(report.id);
        try {
            // 1. Give credits back
            // We can use the SAME rpc function 'consume_credits' with negative amount to ADD?
            // "consume_credits" logic:
            // "new_credits := current_credits - amount;"
            // So if amount is -1, it becomes current - (-1) = current + 1. YES.

            // Wait, we need to execute this AS THE USER? No, we are admin. 
            // The 'consume_credits' uses 'auth.uid()'. We cannot use it for OTHER users.

            // We need to use 'update_user_credits_sys' (the one from previous task) or direct update
            // Since we are Admin and have RLS bypass policy for updates (from previous task), we can use the RPC we made:
            // 'update_user_credits_sys(target_user_id, new_credits)' -> This SETS absolute value. Not add.

            // Better to just update the row directly: credits = credits + cost.

            // Fetch current credits first
            const { data: profile } = await supabase.from('profiles').select('credits').eq('id', report.user_id).single();
            const current = profile?.credits || 0;
            const newCredits = current + report.cost;

            // Use the sys RPC to set exact value to avoid RLS issues
            const { error: rpcError } = await supabase.rpc('update_user_credits_sys', {
                target_user_id: report.user_id,
                new_credits: newCredits
            });

            if (rpcError) throw rpcError;

            // 2. Update report status
            await supabase
                .from('reported_images')
                .update({ status: 'refunded' })
                .eq('id', report.id);

            // Update local state
            setReports(reports.map(r => r.id === report.id ? { ...r, status: 'refunded' } : r));
            alert("Reembolso efetuado com sucesso!");

        } catch (error) {
            console.error(error);
            alert("Erro ao reembolsar: " + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (report) => {
        if (!confirm("Rejeitar este reporte? O usuário não receberá créditos.")) return;

        setProcessingId(report.id);
        try {
            await supabase
                .from('reported_images')
                .update({ status: 'rejected' })
                .eq('id', report.id);

            setReports(reports.map(r => r.id === report.id ? { ...r, status: 'rejected' } : r));

        } catch (error) {
            console.error(error);
            alert("Erro: " + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (report) => {
        if (!confirm("Excluir este registro e a imagem permanentemente?")) return;

        setProcessingId(report.id);
        try {
            // Delete image from storage
            await supabase.storage
                .from('reported_images')
                .remove([report.image_path]);

            // Delete row
            await supabase
                .from('reported_images')
                .delete()
                .eq('id', report.id);

            setReports(reports.filter(r => r.id !== report.id));

        } catch (error) {
            console.error(error);
            alert("Erro ao excluir: " + error.message);
        } finally {
            setProcessingId(null);
        }
    }


    if (loading) {
        return <div className="p-8 text-center text-gray-400">Carregando reportes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        Imagens Reportadas
                        <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded-full">{reports.filter(r => r.status === 'pending').length}</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Gerencie reclamações de imagens geradas.</p>
                </div>
                <button onClick={fetchReports} className="text-sm text-primary hover:underline">Atualizar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                        {/* Status Bar */}
                        <div className={`h-1 w-full ${report.status === 'refunded' ? 'bg-green-500' :
                            report.status === 'rejected' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`} />

                        {/* Image Preview */}
                        <div className="relative aspect-square bg-gray-900 group">
                            <img
                                src={report.publicUrl}
                                alt="Reported"
                                className="w-full h-full object-cover"
                            />
                            <a
                                href={report.publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Ver Original
                            </a>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-gray-300 font-medium mb-1">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="truncate">{report.user.email || 'Email Desconhecido'}</span>
                                </div>
                                <div className="text-xs text-gray-500 font-mono pb-2 border-b border-gray-700">
                                    Criado em: {new Date(report.created_at).toLocaleDateString('pt-BR')}
                                </div>
                            </div>

                            <div className="bg-gray-900/50 p-2 rounded text-xs text-gray-400 flex justify-between">
                                <span>Custo: {report.cost} crédito(s)</span>
                                <span className={`uppercase font-bold ${report.status === 'refunded' ? 'text-green-500' :
                                    report.status === 'rejected' ? 'text-red-500' :
                                        'text-yellow-500'
                                    }`}>{report.status === 'pending' ? 'Pendente' : report.status === 'refunded' ? 'Reembolsado' : 'Rejeitado'}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-auto pt-2">
                                {report.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleRefund(report)}
                                            disabled={!!processingId}
                                            className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                            title="Reembolsar Créditos"
                                        >
                                            {processingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleReject(report)}
                                            disabled={!!processingId}
                                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                            title="Rejeitar (Manter Cobrança)"
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => handleDelete(report)}
                                    disabled={!!processingId}
                                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors ml-auto disabled:opacity-50"
                                    title="Excluir Registro"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {reports.length === 0 && (
                    <div className="col-span-full py-12 text-center flex flex-col items-center gap-3 text-gray-500">
                        <div className="bg-gray-800 p-4 rounded-full">
                            <AlertTriangle className="w-8 h-8 opacity-20" />
                        </div>
                        <p>Nenhum reporte encontrado.</p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ReportedImages;
