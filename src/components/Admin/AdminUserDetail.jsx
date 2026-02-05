import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Coins, Save, Check, X, Image as ImageIcon, Store, Trash2, Plus, Upload, ZoomIn, ZoomOut, Loader2, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../lib/cropUtils';
import toast from 'react-hot-toast';
import ConfirmationModal from '../ConfirmationModal';

const AdminUserDetail = ({ user, onBack }) => {
    if (!user) return null;

    const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'store', 'logo', 'security'
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState(user.credits || 0);

    // --- Modal State ---
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const openModal = ({ title, message, type = 'info', onConfirm }) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: () => {
                onConfirm();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    // --- Store Images State ---
    const [storeImages, setStoreImages] = useState([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [storeImageSrc, setStoreImageSrc] = useState(null);
    const [storeCrop, setStoreCrop] = useState({ x: 0, y: 0 });
    const [storeZoom, setStoreZoom] = useState(1);
    const [storeCroppedAreaPixels, setStoreCroppedAreaPixels] = useState(null);

    // --- Store Config State (Whatsapp) ---
    const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');

    // --- Plan State ---
    const [plan, setPlan] = useState(user.plan || 'testando');
    const PLAN_LIMITS = {
        'testando': 50,
        'essencial': 80,
        'avancado': 120,
        'profissional': 200
    };

    // --- Features State ---
    const ALL_FEATURES = ['product', 'food', 'fashion', 'optical', 'pet', 'auto'];
    const FEATURE_LABELS = {
        'product': 'Produto (Padrão)',
        'food': 'Food',
        'fashion': 'Moda',
        'optical': 'Ótica',
        'pet': 'Veterinário / Pet',
        'auto': 'Automóveis',

    };

    const [allowedFeatures, setAllowedFeatures] = useState(user.allowed_features || ALL_FEATURES);

    const handleToggleFeature = (feature) => {
        setAllowedFeatures(prev => {
            if (prev.includes(feature)) {
                return prev.filter(f => f !== feature);
            } else {
                return [...prev, feature];
            }
        });
    };

    const handleSaveFeatures = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ allowed_features: allowedFeatures })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Permissões de acesso atualizadas!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar permissões');
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };


    const handleSavePlan = async (newPlan) => {
        openModal({
            title: 'Alterar Plano',
            message: `Deseja alterar o plano para "${newPlan.toUpperCase()}"?\nIsso atualizará o plano no cadastro do usuário.`,
            type: 'warning',
            onConfirm: async () => {
                setLoading(true);
                try {
                    // Update plan in DB
                    const { error } = await supabase
                        .from('profiles')
                        .update({ plan: newPlan })
                        .eq('id', user.id);

                    if (error) throw error;

                    setPlan(newPlan);

                    // Ask to update credits to plan limit
                    openModal({
                        title: 'Atualizar Créditos',
                        message: `Deseja atualizar o saldo de créditos do usuário para ${PLAN_LIMITS[newPlan]} (Valor do plano)?`,
                        type: 'info',
                        onConfirm: async () => {
                            const { error: creditError } = await supabase.rpc('update_user_credits_sys', {
                                target_user_id: user.id,
                                new_credits: PLAN_LIMITS[newPlan]
                            });
                            if (creditError) throw creditError;
                            setCredits(PLAN_LIMITS[newPlan]);
                            toast.success('Plano e créditos atualizados!');
                        }
                    });

                    toast.success('Plano atualizado!');

                } catch (error) {
                    console.error(error);
                    toast.error('Erro ao atualizar plano');
                } finally {
                    if (isMounted.current) setLoading(false);
                }
            }
        });
    };

    // --- Logo State ---
    const [logoImage, setLogoImage] = useState(null); // The new image file/object selected for upload
    const [existingLogoUrl, setExistingLogoUrl] = useState(null);
    const [logoAspectRatio, setLogoAspectRatio] = useState(1);
    const [logoScale, setLogoScale] = useState(1);
    const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });
    const [logoBgColor, setLogoBgColor] = useState('transparent');
    const [logoIsPng, setLogoIsPng] = useState(false);

    const logoCanvasRef = useRef(null); // Ref for the canvas
    const logoContainerRef = useRef(null);
    const lastPos = useRef({ x: 0, y: 0 }); // For dragging logic
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (activeTab === 'store') {
            fetchStoreImages();
            fetchWhatsapp();
        } else if (activeTab === 'logo') {
            fetchLogo();
        } else if (activeTab === 'finance') {
            fetchSubscriptionHistory();
        }
    }, [activeTab, user.id]);

    // =================================================================================
    // GENERAL TAB LOGIC
    // =================================================================================
    const handleSaveCredits = async () => {
        setLoading(true);
        try {
            const { error: rpcError } = await supabase.rpc('update_user_credits_sys', {
                target_user_id: user.id,
                new_credits: parseInt(credits)
            });

            if (rpcError) throw new Error(rpcError.message);

            // Update user object in local scope (parent list won't auto-update unless refreshed, but that's ok)
            toast.success('Créditos atualizados com sucesso!');
        } catch (error) {
            console.error('Error updating credits:', error);
            toast.error('Erro ao atualizar créditos: ' + error.message);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const fetchWhatsapp = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('whatsapp')
                .eq('id', user.id)
                .single();
            if (data && isMounted.current) {
                setWhatsapp(formatPhone(data.whatsapp));
            }
        } catch (error) {
            console.error(error);
        }
    }

    const formatPhone = (value) => {
        if (!value) return '';
        const v = value.replace(/\D/g, '');
        if (v.length > 11) return value;
        return v
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d)(\d{4})$/, '$1-$2');
    };

    const handleWhatsappChange = (e) => {
        setWhatsapp(formatPhone(e.target.value));
    };

    const handleSaveWhatsapp = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ whatsapp: whatsapp })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('WhatsApp atualizado!');
        } catch (error) {
            toast.error('Erro ao salvar WhatsApp');
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    // =================================================================================
    // STORE IMAGES TAB LOGIC
    // =================================================================================
    const fetchStoreImages = async () => {
        if (isMounted.current) setIsLoadingImages(true);
        try {
            const { data, error } = await supabase.storage
                .from('store-images')
                .list(user.id + '/', {
                    limit: 4,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) throw error;

            if (data && isMounted.current) {
                const images = data.map(file => ({
                    name: file.name,
                    url: supabase.storage.from('store-images').getPublicUrl(user.id + '/' + file.name).data.publicUrl
                }));
                // Filter out placeholder/empty folder objects if any
                setStoreImages(images.filter(img => img.name !== '.emptyFolderPlaceholder'));
            } else if (isMounted.current) {
                setStoreImages([]);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            if (isMounted.current) setStoreImages([]);
        } finally {
            if (isMounted.current) setIsLoadingImages(false);
        }
    };

    const handleStoreFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                if (isMounted.current) setStoreImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStoreUpload = async () => {
        if (!storeCroppedAreaPixels || !storeImageSrc) return;
        setLoading(true);

        try {
            const croppedBase64 = await getCroppedImg(storeImageSrc, storeCroppedAreaPixels);
            const res = await fetch(croppedBase64);
            const croppedBlob = await res.blob();

            const fileName = `${Date.now()}.jpg`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('store-images')
                .upload(filePath, croppedBlob, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            if (isMounted.current) setStoreImageSrc(null);
            fetchStoreImages();
            toast.success('Imagem da loja salva!');

        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Erro ao enviar imagem.');
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const handleDeleteStoreImage = async (fileName) => {
        openModal({
            title: 'Excluir Imagem',
            message: 'Tem certeza que deseja remover esta imagem da loja? Esta ação não pode ser desfeita.',
            type: 'error',
            onConfirm: async () => {
                try {
                    const { error } = await supabase.storage
                        .from('store-images')
                        .remove([`${user.id}/${fileName}`]);

                    if (error) throw error;
                    fetchStoreImages();
                    toast.success('Imagem removida.');
                } catch (error) {
                    console.error('Error deleting:', error);
                    toast.error('Erro ao excluir imagem.');
                }
            }
        });
    };

    // --- Finance State ---
    const [subStatus, setSubStatus] = useState(user.subscription_status || 'inactive');
    const [subStart, setSubStart] = useState(user.subscription_start ? new Date(user.subscription_start).toISOString().split('T')[0] : '');
    const [periodEnd, setPeriodEnd] = useState(user.current_period_end ? new Date(user.current_period_end).toISOString().split('T')[0] : '');
    const [paymentMethod, setPaymentMethod] = useState(user.payment_method || 'mercado_pago');

    // --- Registration Data State ---
    const [fullName, setFullName] = useState(user.full_name || '');
    const [cpfCnpj, setCpfCnpj] = useState(user.cpf_cnpj || '');

    const formatCpfCnpj = (value) => {
        const v = value.replace(/\D/g, '');
        if (v.length <= 11) {
            // CPF: 000.000.000-00
            return v
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // CNPJ: 00.000.000/0000-00
            return v
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .slice(0, 18); // Limit length
        }
    };

    const handleCpfCnpjChange = (e) => {
        setCpfCnpj(formatCpfCnpj(e.target.value));
    };

    // --- History State ---
    const [subscriptionHistory, setSubscriptionHistory] = useState([]);

    const fetchSubscriptionHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('subscription_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (isMounted.current && data) {
                setSubscriptionHistory(data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleSaveRegistration = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName, cpf_cnpj: cpfCnpj })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Dados cadastrais atualizados!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar dados cadastrais');
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const handleSaveFinance = async () => {
        setLoading(true);
        try {
            const updates = {
                subscription_status: subStatus,
                subscription_start: subStart || null,
                current_period_end: periodEnd || null,
                payment_method: paymentMethod
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Dados financeiros atualizados!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar financeiro');
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const handleManualRenewal = async () => {
        openModal({
            title: 'Renovação Manual',
            message: `Isso resetará os créditos do usuário para o limite do plano (${PLAN_LIMITS[plan]}) e avançará a data de renovação em 1 mês. Deseja continuar?`,
            type: 'warning',
            onConfirm: async () => {
                setLoading(true);
                try {
                    const { data, error } = await supabase.rpc('handle_manual_subscription_renewal', {
                        target_user_id: user.id
                    });

                    if (error) throw error;

                    if (data && isMounted.current) {
                        setCredits(data.new_credits);
                        setPeriodEnd(new Date(data.new_period_end).toISOString().split('T')[0]);
                        setSubStatus('active');
                        fetchSubscriptionHistory();
                        toast.success(`Renovado! Créditos: ${data.new_credits}, Próx: ${new Date(data.new_period_end).toLocaleDateString()}`);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Erro na renovação manual: ' + error.message);
                } finally {
                    if (isMounted.current) setLoading(false);
                }
            }
        });
    };

    // =================================================================================
    // LOGO TAB LOGIC
    // =================================================================================
    const fetchLogo = async () => {
        if (isMounted.current) setExistingLogoUrl(null); // Clear previous

        try {
            // Bypass list() which might be restricted by RLS for admins on other users' folders
            // Directly attempt to load the expected path
            const path = `${user.id}/logos/logo.png`;
            const { data } = supabase.storage.from('gallery').getPublicUrl(path);

            if (data?.publicUrl) {
                const url = `${data.publicUrl}?t=${Date.now()}`;

                // Verify existence by loading it as an Image
                const img = new Image();
                img.onload = () => {
                    if (isMounted.current) setExistingLogoUrl(url);
                };
                img.onerror = () => {
                    // 404 or other error - assume no logo
                    // console.log("Logo not found for user", user.id);
                };
                img.src = url;
            }
        } catch (error) {
            console.error("Error checking logo:", error);
        }
    };

    const handleLogoFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type === 'image/png') {
            setLogoIsPng(true);
        } else {
            setLogoIsPng(false);
            setLogoBgColor('transparent');
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (isMounted.current) {
                    setLogoImage(img);
                    setLogoScale(1);
                    setLogoPosition({ x: 0, y: 0 });
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Canvas drawing effect for Logo
    useEffect(() => {
        if (!logoImage || !logoCanvasRef.current) return;

        const canvas = logoCanvasRef.current;
        const ctx = canvas.getContext('2d');

        const outputWidth = 500;
        const outputHeight = outputWidth / logoAspectRatio;

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        // Fill Background
        ctx.fillStyle = logoBgColor === 'transparent' ? '#ffffff00' : logoBgColor;
        if (logoBgColor === 'transparent') {
            ctx.clearRect(0, 0, outputWidth, outputHeight);
        } else {
            ctx.fillRect(0, 0, outputWidth, outputHeight);
        }

        // Draw Image
        const imgRatio = logoImage.width / logoImage.height;
        let drawWidth, drawHeight;

        if (imgRatio > logoAspectRatio) {
            drawHeight = outputHeight * logoScale;
            drawWidth = drawHeight * imgRatio;
        } else {
            drawWidth = outputWidth * logoScale;
            drawHeight = drawWidth / imgRatio;
        }

        const centerX = outputWidth / 2;
        const centerY = outputHeight / 2;

        const x = centerX - (drawWidth / 2) + logoPosition.x;
        const y = centerY - (drawHeight / 2) + logoPosition.y;

        ctx.drawImage(logoImage, x, y, drawWidth, drawHeight);

    }, [logoImage, logoScale, logoPosition, logoAspectRatio, logoBgColor]);


    // Logo Dragging Handlers
    const handlePointerDown = (e) => {
        setIsDraggingLogo(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
        if (!isDraggingLogo) return;
        const deltaX = e.clientX - lastPos.current.x;
        const deltaY = e.clientY - lastPos.current.y;
        setLogoPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
        setIsDraggingLogo(false);
    };


    const handleSaveLogo = async () => {
        if (!logoImage) return;
        setLoading(true);

        try {
            const canvas = logoCanvasRef.current;
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((b) => {
                    if (b) resolve(b);
                    else reject(new Error('Falha ao gerar imagem do canvas'));
                }, 'image/png');
            });

            const path = `${user.id}/logos/logo.png`;

            // Try delete first (might fail if permissions restricted, but upsert should handle overwrite mostly)
            try {
                await supabase.storage.from('gallery').remove([path]);
            } catch (e) { /* ignore delete error */ }

            const { error } = await supabase.storage
                .from('gallery')
                .upload(path, blob, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) throw error;

            fetchLogo();
            if (isMounted.current) setLogoImage(null);
            toast.success('Logotipo salvo com sucesso!');

        } catch (error) {
            console.error('Error saving logo:', error);
            toast.error('Erro ao salvar logotipo: ' + error.message);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const handleDeleteLogo = async () => {
        openModal({
            title: 'Excluir Logotipo',
            message: 'Tem certeza que deseja excluir o logotipo do usuário?',
            type: 'warning',
            onConfirm: async () => {
                setLoading(true);
                try {
                    const { error } = await supabase.storage
                        .from('gallery')
                        .remove([`${user.id}/logos/logo.png`]);

                    if (error) throw error;
                    if (isMounted.current) {
                        setExistingLogoUrl(null);
                        setLogoImage(null);
                    }
                    toast.success('Logotipo excluído.');
                } catch (error) {
                    console.error('Error deleting logo:', error);
                    toast.error('Erro ao excluir logotipo.');
                } finally {
                    if (isMounted.current) setLoading(false);
                }
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 w-full animate-fade-in relative z-0">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
            />

            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">{user.email}</h2>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 px-6">
                <button
                    onClick={() => setActiveTab('plan')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'plan' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Plano & Acessos
                </button>
                <button
                    onClick={() => setActiveTab('store')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'store' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Loja
                </button>
                <button
                    onClick={() => setActiveTab('logo')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'logo' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Logotipo
                </button>
                <button
                    onClick={() => setActiveTab('finance')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'finance' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Financeiro
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Segurança
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* --- PLAN TAB --- */}
                {activeTab === 'plan' && (
                    <div className="max-w-2xl space-y-6">

                        {/* Plan Selector */}
                        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Store className="w-5 h-5 text-purple-500" />
                                Tipo de Plano
                            </h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {Object.entries(PLAN_LIMITS).map(([key, limit]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleSavePlan(key)}
                                        disabled={loading}
                                        className={`p-3 rounded-lg border text-left transition-all ${plan === key
                                            ? 'bg-primary/20 border-primary text-primary'
                                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                    >
                                        <div className="font-bold capitalize">{key}</div>
                                        <div className="text-xs">{limit} créditos</div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Features Selection */}
                        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-blue-400" />
                                    Acessos Liberados (GetMídias)
                                </h3>
                                <button
                                    onClick={handleSaveFeatures}
                                    disabled={loading}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    Salvar Acessos
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ALL_FEATURES.map((feature) => (
                                    <label
                                        key={feature}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${allowedFeatures.includes(feature)
                                            ? 'bg-blue-600/10 border-blue-500/50'
                                            : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allowedFeatures.includes(feature)
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-gray-500'
                                                }`}>
                                                {allowedFeatures.includes(feature) && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-medium ${allowedFeatures.includes(feature) ? 'text-white' : 'text-gray-400'}`}>
                                                    {FEATURE_LABELS[feature] || feature}
                                                </span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={allowedFeatures.includes(feature)}
                                            onChange={() => handleToggleFeature(feature)}
                                        />
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-3 ml-1">
                                Marque as opções para liberar o acesso no aplicativo do usuário.
                            </p>
                        </section>


                        <section className="bg-red-500/10 rounded-xl p-6 border border-red-500/20 mt-8">
                            <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" />
                                Zona de Perigo
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Ações nesta área são irreversíveis e devem ser realizadas com cautela.
                            </p>
                            <button
                                onClick={() => {
                                    openModal({
                                        title: 'Excluir Usuário',
                                        message: `Tem certeza ABSOLUTA que deseja excluir o usuário ${user.email}? Todos os dados, imagens e histórico serão apagados permanentemente.`,
                                        type: 'error',
                                        onConfirm: async () => {
                                            setLoading(true);
                                            try {
                                                const PROJECT_REF = 'qyruweidqlqniqdatnxx';
                                                const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/delete-user`;
                                                const { data: { session } } = await supabase.auth.getSession();

                                                console.log("Attempting to delete user:", user.id);

                                                const response = await fetch(FUNCTION_URL, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${session.access_token}`
                                                    },
                                                    body: JSON.stringify({ user_id: user.id })
                                                });

                                                const respText = await response.text();
                                                console.log("Delete response status:", response.status);
                                                console.log("Delete response body:", respText);

                                                let errData = {};
                                                try {
                                                    errData = JSON.parse(respText);
                                                } catch (e) {
                                                    errData = { error: respText || "Unknown error" };
                                                }

                                                if (!response.ok) {
                                                    throw new Error(errData.error || `Erro ${response.status}: ${respText}`);
                                                }

                                                toast.success("Usuário excluído com sucesso.");
                                                onBack(); // Go back to list
                                            } catch (error) {
                                                console.error("Delete user error:", error);
                                                toast.error(`Falha: ${error.message}`);
                                            } finally {
                                                if (isMounted.current) setLoading(false);
                                            }
                                        }
                                    });
                                }}
                                className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 hover:border-transparent rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir Usuário Permanentemente
                            </button>
                        </section>

                        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Coins className="w-5 h-5 text-yellow-500" />
                                Gerenciar Créditos
                            </h3>
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-400 mb-1">Saldo de Créditos</label>
                                    <input
                                        type="number"
                                        value={credits}
                                        onChange={(e) => setCredits(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-primary font-mono text-lg"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveCredits}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar
                                </button>
                            </div>
                        </section>


                    </div >
                )}

                {/* --- FINANCE TAB --- */}
                {
                    activeTab === 'finance' && (
                        <div className="max-w-2xl space-y-6">
                            <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                        Assinatura e Renovação
                                    </h3>
                                    <button
                                        onClick={handleSaveFinance}
                                        disabled={loading}
                                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        Salvar Dados
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Status da Assinatura</label>
                                        <select
                                            value={subStatus}
                                            onChange={(e) => setSubStatus(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-primary"
                                        >
                                            <option value="active">Ativa</option>
                                            <option value="inactive">Inativa</option>
                                            <option value="canceled">Cancelada</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Método de Pagamento</label>
                                        <input
                                            type="text"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Início da Assinatura</label>
                                        <input
                                            type="date"
                                            value={subStart}
                                            onChange={(e) => setSubStart(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Próxima Renovação (Ciclo)</label>
                                        <input
                                            type="date"
                                            value={periodEnd}
                                            onChange={(e) => setPeriodEnd(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <h4 className="text-white font-bold text-sm mb-2">Simular Renovação Mensal</h4>
                                    <p className="text-xs text-gray-400 mb-4">
                                        Esta ação irá resetar os créditos deste usuário para <strong>{PLAN_LIMITS[plan]}</strong> e avançar a data de "Próxima Renovação" em 1 mês.
                                        Os créditos atuais <strong>não</strong> serão acumulados.
                                    </p>
                                    <button
                                        onClick={handleManualRenewal}
                                        disabled={loading}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors"
                                    >
                                        Renovar Agora (Resetar Créditos)
                                    </button>
                                </div>
                            </section>

                            {/* History Grid */}
                            <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-yellow-500" />
                                    Histórico de Assinaturas
                                </h3>
                                <div className="overflow-x-auto rounded-lg border border-gray-700">
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-200 uppercase bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-3">Data Ação</th>
                                                <th className="px-4 py-3">Tipo</th>
                                                <th className="px-4 py-3">Plano</th>
                                                <th className="px-4 py-3">Créditos</th>
                                                <th className="px-4 py-3">Ciclo (Início - Fim)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subscriptionHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                        Nenhum histórico encontrado.
                                                    </td>
                                                </tr>
                                            ) : (
                                                subscriptionHistory.map((item) => (
                                                    <tr key={item.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
                                                        <td className="px-4 py-3">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {item.action_type === 'manual_renewal' ? 'Renovação Manual' : item.action_type}
                                                        </td>
                                                        <td className="px-4 py-3 capitalize">
                                                            {item.plan_snapshot}
                                                        </td>
                                                        <td className="px-4 py-3 text-green-400 font-bold">
                                                            +{item.credits_added}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs">
                                                            {item.period_start ? new Date(item.period_start).toLocaleDateString() : '-'}
                                                            {' até '}
                                                            {item.period_end ? new Date(item.period_end).toLocaleDateString() : '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )
                }

                {/* --- SECURITY TAB --- */}
                {
                    activeTab === 'security' && (
                        <div className="max-w-2xl space-y-6">
                            <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-red-500" />
                                    Alterar Senha do Usuário
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-400">
                                        Defina uma nova senha para o usuário. Essa ação é imediata e invalidará a sessão atual do usuário se ele estiver logado.
                                    </p>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const newPass = e.target.newPassword.value;
                                        if (!newPass || newPass.length < 6) {
                                            toast.error('A senha deve ter pelo menos 6 caracteres.');
                                            return;
                                        }

                                        openModal({
                                            title: 'Alterar Senha',
                                            message: 'Tem certeza que deseja alterar a senha deste usuário?',
                                            type: 'warning',
                                            onConfirm: async () => {
                                                setLoading(true);
                                                try {
                                                    const PROJECT_REF = 'qyruweidqlqniqdatnxx'; // Should ideally be in env but hardcoded in other places
                                                    const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/update-user`;
                                                    const { data: { session } } = await supabase.auth.getSession();

                                                    const response = await fetch(FUNCTION_URL, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${session.access_token}`
                                                        },
                                                        body: JSON.stringify({ user_id: user.id, password: newPass })
                                                    });

                                                    if (!response.ok) {
                                                        const errData = await response.json();
                                                        throw new Error(errData.error || "Falha ao atualizar senha");
                                                    }

                                                    toast.success("Senha alterada com sucesso!");
                                                    e.target.reset();
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error(`Erro: ${error.message}`);
                                                } finally {
                                                    if (isMounted.current) setLoading(false);
                                                }
                                            }
                                        });
                                    }}>
                                        <div className="flex gap-2">
                                            <input
                                                name="newPassword"
                                                type="text"
                                                placeholder="Nova senha (mín. 6 caracteres)"
                                                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-red-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Senha'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </div>
                    )
                }

                {/* --- STORE TAB --- */}
                {
                    activeTab === 'store' && (
                        <div className="max-w-4xl space-y-8">

                            {/* Registration Data Section */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        Dados Cadastrais
                                    </h3>
                                    <button
                                        onClick={handleSaveRegistration}
                                        disabled={loading}
                                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                    >
                                        Salvar
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">CPF / CNPJ</label>
                                        <input
                                            type="text"
                                            value={cpfCnpj}
                                            onChange={handleCpfCnpjChange}
                                            maxLength={18}
                                            placeholder="000.000.000-00"
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 font-mono"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs text-gray-400 mb-1">Email</label>
                                        <div className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Whatsapp Config Section */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0" /></svg>
                                        WhatsApp da Loja
                                    </h3>
                                    <button
                                        onClick={handleSaveWhatsapp}
                                        disabled={loading}
                                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                    >
                                        Salvar
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Número de Contato</label>
                                    <input
                                        type="text"
                                        value={whatsapp}
                                        onChange={handleWhatsappChange}
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Store className="w-5 h-5 text-primary" />
                                        Imagens da Loja
                                    </h3>
                                    <span className="text-xs text-gray-400">{storeImages.length}/4 imagens</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {storeImages.map((img) => (
                                        <div key={img.name} className="aspect-square rounded-xl relative group overflow-hidden border border-gray-700 bg-gray-800">
                                            <img src={img.url} alt="Loja" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => handleDeleteStoreImage(img.name)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {storeImages.length < 4 && (
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-700 hover:border-primary hover:bg-gray-800/50 transition-all flex flex-col items-center justify-center cursor-pointer gap-2 text-gray-500 hover:text-primary group">
                                            <input type="file" accept="image/*" onChange={handleStoreFileChange} className="hidden" />
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-medium">Adicionar</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- LOGO TAB --- */}
                {
                    activeTab === 'logo' && (
                        <div className="max-w-4xl flex flex-col items-center">
                            <div className="w-full flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                    Logotipo
                                </h3>
                            </div>

                            {/* If viewing existing logo (and not editing a new one) */}
                            {!logoImage && existingLogoUrl && (
                                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                                    <div className="w-full aspect-square bg-gray-800/50 rounded-2xl border border-gray-700 flex items-center justify-center p-8 relative overflow-hidden">
                                        {/* Checker pattern for transparency */}
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://img.freepik.com/free-vector/gray-white-checker-pattern-background-design_1017-38063.jpg?w=360)' }}></div>
                                        <img src={existingLogoUrl} alt="Logo Atual" className="max-w-full max-h-full object-contain relative z-10" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDeleteLogo}
                                            disabled={loading}
                                            className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors border border-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" /> Excluir Atual
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* If no logo or uploading new one */}
                            {!logoImage && !existingLogoUrl && (
                                <div className="w-full max-w-sm aspect-square border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary hover:bg-gray-800/50 transition-all relative">
                                    <input type="file" accept="image/*" onChange={handleLogoFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-primary">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-400 font-medium">Enviar Logo</p>
                                </div>
                            )}

                            {/* If uploading/editing new logo */}
                            {logoImage && (
                                <div className="flex flex-col items-center gap-6 w-full max-w-lg">
                                    {/* Format Tabs */}
                                    <div className="flex bg-gray-800 rounded-lg p-1 w-full max-w-sm">
                                        <button onClick={() => setLogoAspectRatio(1)} className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${logoAspectRatio === 1 ? 'bg-primary text-white' : 'text-gray-400'}`}>Quadrado</button>
                                        <button onClick={() => setLogoAspectRatio(1.5)} className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${logoAspectRatio === 1.5 ? 'bg-primary text-white' : 'text-gray-400'}`}>Retangular</button>
                                    </div>

                                    {/* Editor Canvas */}
                                    <div
                                        ref={logoContainerRef}
                                        className="relative shadow-2xl overflow-hidden border border-gray-700 rounded-lg touch-none bg-gray-900"
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        onPointerLeave={handlePointerUp}
                                    >
                                        <canvas ref={logoCanvasRef} className="max-w-full object-contain pointer-events-none" />
                                    </div>

                                    {/* Controls */}
                                    <div className="w-full bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <ZoomOut className="w-4 h-4 text-gray-400" />
                                            <input type="range" min="0.1" max="3" step="0.1" value={logoScale} onChange={(e) => setLogoScale(parseFloat(e.target.value))} className="flex-1 accent-primary h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                            <ZoomIn className="w-4 h-4 text-gray-400" />
                                        </div>

                                        {logoIsPng && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Fundo:</span>
                                                {['transparent', '#ffffff', '#000000'].map(bg => (
                                                    <button
                                                        key={bg}
                                                        onClick={() => setLogoBgColor(bg)}
                                                        className={`w-6 h-6 rounded border ${logoBgColor === bg ? 'border-primary ring-1 ring-primary' : 'border-gray-600'}`}
                                                        style={{ backgroundColor: bg === 'transparent' ? 'gray' : bg }} // 'gray' to rep transparent in UI
                                                        title={bg}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 w-full">
                                        <button onClick={() => setLogoImage(null)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors">Cancelar</button>
                                        <button onClick={handleSaveLogo} disabled={loading} className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar Logo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >

            {/* STORE CROPPER MODAL (Overlay) */}
            {
                storeImageSrc && (
                    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 z-10">
                            <button onClick={() => setStoreImageSrc(null)} className="p-2 text-white/70 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-white font-medium">Recortar Foto da Loja</h3>
                            <div className="w-10"></div>
                        </div>

                        <div className="relative flex-1 bg-black">
                            <Cropper
                                image={storeImageSrc}
                                crop={storeCrop}
                                zoom={storeZoom}
                                aspect={1}
                                onCropChange={setStoreCrop}
                                onCropComplete={(_, pixels) => setStoreCroppedAreaPixels(pixels)}
                                onZoomChange={setStoreZoom}
                            />
                        </div>

                        <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex gap-4 safe-area-bottom">
                            <input
                                type="range"
                                value={storeZoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setStoreZoom(e.target.value)}
                                className="flex-1 accent-primary h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <button
                                onClick={handleStoreUpload}
                                disabled={loading}
                                className="px-6 py-2 bg-primary text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-primary-hover"
                            >
                                {loading ? 'Salvando...' : 'Salvar'}
                                {!loading && <Check className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminUserDetail;
