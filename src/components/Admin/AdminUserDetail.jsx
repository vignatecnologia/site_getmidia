import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Coins, Save, Check, X, Image as ImageIcon, Store, Trash2, Plus, Upload, ZoomIn, ZoomOut, Loader2, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../lib/cropUtils';
import toast from 'react-hot-toast';
import ConfirmationModal from '../ConfirmationModal';

const AdminUserDetail = ({ user, onBack }) => {
    if (!user) return null;

    const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'store', 'logo', 'security'
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState(user.credits || 0);
    const [plan, setPlan] = useState((user.plan || 'essencial').toLowerCase());
    const [allowedFeatures, setAllowedFeatures] = useState(user.allowed_features || []);
    
    const [subStatus, setSubStatus] = useState(user.subscription_status || 'inactive');
    const [subStart, setSubStart] = useState(user.subscription_start ? new Date(user.subscription_start).toISOString().split('T')[0] : '');
    const [periodEnd, setPeriodEnd] = useState(user.current_period_end ? new Date(user.current_period_end).toISOString().split('T')[0] : '');
    const [stripeCustomerId, setStripeCustomerId] = useState(user.stripe_customer_id || '');
    
    const [fullName, setFullName] = useState(user.full_name || '');
    const [cpfCnpj, setCpfCnpj] = useState(user.cpf_cnpj || '');
    const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');

    const [invoices, setInvoices] = useState([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // --- State Sync with User Prop ---
    useEffect(() => {
        const fetchFreshData = async () => {
            if (!user?.id) return;
            
            try {
                // Fetch directly from the source of truth (the same table the user dashboard uses)
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (error) throw error;

                if (profile) {
                    setCredits(profile.credits || 0);
                    
                    // Normalize plan using both plan and plan_id (following UserDashboard logic)
                    const rawPlanId = (profile.plan_id || '').toLowerCase();
                    const rawPlanName = (profile.plan || '').toLowerCase();
                    const fullPlanStr = `${rawPlanId} ${rawPlanName}`;
                    
                    let normalizedPlan = 'essencial';
                    if (fullPlanStr.includes('prof')) normalizedPlan = 'profissional';
                    else if (fullPlanStr.includes('avan') || fullPlanStr.includes('advan')) normalizedPlan = 'avancado';
                    else if (fullPlanStr.includes('essen')) normalizedPlan = 'essencial';
                    setPlan(normalizedPlan);

                    // Admin Control: Only show what is strictly in allowed_features.
                    // If empty, fallback to the user's selected module choice instead of hardcoded 'product'
                    let features = [...(profile.allowed_features || [])];
                    if (features.length === 0 && profile.selected_module) {
                        features = [profile.selected_module];
                    } else if (features.length === 0) {
                        features = ['product']; // Absolute last resort
                    }
                    setAllowedFeatures(features);

                    setFullName(profile.full_name || '');
                    setCpfCnpj(formatCpfCnpj(profile.cpf_cnpj || ''));
                    setWhatsapp(formatPhone(profile.whatsapp || ''));
                    
                    // Handle subscription status normalization (active, active, Ativo)
                    const rawStatus = (profile.subscription_status || '').toLowerCase();
                    setSubStatus(rawStatus === 'active' || rawStatus === 'ativo' ? 'active' : 'inactive');
                    
                    // RESTORE MISSING FIELDS
                    setSubStart(profile.subscription_start ? new Date(profile.subscription_start).toISOString().split('T')[0] : '');
                    setPeriodEnd(profile.current_period_end ? new Date(profile.current_period_end).toISOString().split('T')[0] : '');
                    setStripeCustomerId(profile.stripe_customer_id || '');
                    
                    // Trigger invoice fetch (uses fresh ID)
                    fetchInvoices(profile.stripe_customer_id);
                }
            } catch (err) {
                console.error("Error fetching fresh user data:", err);
            }
        };

        fetchFreshData();
    }, [user.id]);

    // --- Load Data on Mount ---
    useEffect(() => {
        if (user?.id) {
            fetchWhatsapp();
            fetchLogo();
            fetchStoreImages();
            // fetchSubscriptionHistory removed
        }
    }, [user?.id]);

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
            onConfirm: async () => {
                await onConfirm();
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


    // --- Plan Constants ---
    const PLAN_LIMITS = {
        'essencial': 80,
        'avancado': 120,
        'profissional': 200
    };

    // --- Features Constants ---
    const ALL_FEATURES = ['product', 'food', 'fashion', 'optical', 'pet', 'auto', 'farma', 'credito'];
    const FEATURE_LABELS = {
        'product': 'Produto',
        'food': 'Food',
        'fashion': 'Moda',
        'optical': 'Ótica',
        'pet': 'PET',
        'auto': 'Auto',
        'farma': 'Farma',
        'credito': 'Crédito',
    };

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
            setLoading(false);
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
                            try {
                                const { data: { session } } = await supabase.auth.getSession();
                                const { error: funcError } = await supabase.functions.invoke('update-user-credits', {
                                    body: {
                                        userId: user.id,
                                        credits: PLAN_LIMITS[newPlan]
                                    },
                                    headers: {
                                        'x-supabase-auth': session?.access_token
                                    }
                                });
                                if (funcError) throw funcError;

                                setCredits(PLAN_LIMITS[newPlan]);
                                toast.success('Plano e créditos atualizados!');
                            } catch (err) {
                                console.error('Error updating plan credits:', err);
                                toast.error('Erro ao atualizar créditos');
                            }
                        }
                    });

                    toast.success('Plano atualizado!');

                } catch (error) {
                    console.error(error);
                    toast.error('Erro ao atualizar plano');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // --- Logo Editor State ---
    const [existingLogoUrl, setExistingLogoUrl] = useState(null);
    const [logoImage, setLogoImage] = useState(null);
    const [logoScale, setLogoScale] = useState(1);
    const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });
    const [logoIsPng, setLogoIsPng] = useState(false);
    const [logoBgColor, setLogoBgColor] = useState('transparent');
    const [logoAspectRatio, setLogoAspectRatio] = useState(1); // 1 for square, 1.5 for rectangle
    const [isDragging, setIsDragging] = useState(false);
    const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });

    const logoCanvasRef = useRef(null);
    const logoContainerRef = useRef(null);

    // --- Pointer Events for Logo Editor ---
    const handlePointerDown = (e) => {
        setIsDragging(true);
        setLastPointerPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const dx = (e.clientX - lastPointerPos.x) / logoScale;
        const dy = (e.clientY - lastPointerPos.y) / logoScale;
        setLogoPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPointerPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    // =================================================================================
    // GENERAL TAB LOGIC
    // =================================================================================
    const handleSaveCredits = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { error: funcError } = await supabase.functions.invoke('update-user-credits', {
                body: {
                    userId: user.id,
                    credits: parseInt(credits)
                },
                headers: {
                    'x-supabase-auth': session?.access_token
                }
            });
            if (funcError) throw funcError;
            toast.success('Créditos atualizados com sucesso!');
        } catch (error) {
            console.error('Error updating credits:', error);
            toast.error('Erro ao atualizar créditos');
        } finally {
            setLoading(false);
        }
    };

    const fetchWhatsapp = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('whatsapp')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setWhatsapp(formatPhone(data.whatsapp));
            }
        } catch (error) {
            console.error(error);
        }
    }

    const formatPhone = (value) => {
        if (!value) return '';
        const v = value.replace(/\D/g, '');
        if (v.length > 11) return value.slice(0, 11);
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
            setLoading(false);
        }
    };

    // =================================================================================
    // STORE IMAGES TAB LOGIC
    // =================================================================================
    const fetchStoreImages = async () => {
        setIsLoadingImages(true);
        try {
            const { data, error } = await supabase.storage
                .from('store-images')
                .list(user.id);

            if (error) throw error;

            const images = (data || []).map(file => {
                const { data: { publicUrl } } = supabase.storage
                    .from('store-images')
                    .getPublicUrl(`${user.id}/${file.name}`);
                return {
                    name: file.name,
                    url: publicUrl
                };
            });
            setStoreImages(images);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
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

            const fileName = `store_${Date.now()}.jpg`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('store-images')
                .upload(filePath, croppedBlob);

            if (uploadError) throw uploadError;

            if (isMounted.current) setStoreImageSrc(null);
            fetchStoreImages();
            toast.success('Imagem da loja salva!');

        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Erro ao enviar imagem.');
        } finally {
            setLoading(false);
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

    // states moved to top

    // states moved to top

    useEffect(() => {
        if (activeTab === 'finance') {
            fetchInvoices();
        }
    }, [activeTab]);

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

    const handleCpfCnpjChange = (e) => {
        setCpfCnpj(formatCpfCnpj(e.target.value));
    };

    // states moved to top

    const fetchInvoices = async (manualId) => {
        const targetCid = manualId || stripeCustomerId || user.stripe_customer_id;
        if (!targetCid) return;
        
        setIsLoadingInvoices(true);
        try {
            const { data, error } = await supabase.functions.invoke('get-invoices', {
                body: { 
                    userId: user.id,
                    stripeCustomerId: targetCid
                }
            });

            if (error) throw error;
            if (data?.invoices) {
                setInvoices(data.invoices);
                
                // If the function found a customer ID but we didn't have it, update local state
                if (data.invoices.length > 0 && !stripeCustomerId) {
                    // Try to extract customer ID from first invoice if possible or just rely on next reload
                }
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const handleSaveRegistration = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    cpf_cnpj: cpfCnpj
                })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Dados cadastrais atualizados!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar dados cadastrais');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFinance = async () => {
        setLoading(true);
        try {
            const updates = {
                subscription_status: subStatus,
                subscription_start: subStart || null,
                current_period_end: periodEnd || null,
                stripe_customer_id: stripeCustomerId
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Dados financeiros atualizados!');
            fetchInvoices();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar financeiro');
        } finally {
            setLoading(false);
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
                    const { data: { session } } = await supabase.auth.getSession();
                    const { data, error } = await supabase.functions.invoke('manual-renewal', {
                        body: { userId: user.id },
                        headers: {
                            'x-supabase-auth': session?.access_token
                        }
                    });

                    if (error) throw error;

                    if (data) {
                        setCredits(data.new_credits);
                        setPeriodEnd(new Date(data.new_period_end).toISOString().split('T')[0]);
                        setSubStatus('active');
                        fetchSubscriptionHistory();
                        toast.success(`Renovado! Créditos: ${data.new_credits}, Próx: ${new Date(data.new_period_end).toLocaleDateString()}`);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Erro na renovação manual');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // =================================================================================
    // LOGO TAB LOGIC
    // =================================================================================
    const fetchLogo = async () => {
        setExistingLogoUrl(null);

        try {
            const { data, error } = await supabase.storage
                .from('logos')
                .list(user.id);

            if (error) throw error;

            if (data && data.length > 0) {
                const { data: { publicUrl } } = supabase.storage
                    .from('logos')
                    .getPublicUrl(`${user.id}/logo.png`);
                setExistingLogoUrl(`${publicUrl}?t=${Date.now()}`);
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
        if (logoImage && logoCanvasRef.current) {
            const canvas = logoCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const width = 800;
            const height = width / logoAspectRatio;

            canvas.width = width;
            canvas.height = height;

            // Clear and Background
            ctx.clearRect(0, 0, width, height);
            if (logoBgColor !== 'transparent') {
                ctx.fillStyle = logoBgColor;
                ctx.fillRect(0, 0, width, height);
            }

            // Draw Image
            const drawWidth = logoImage.width * logoScale;
            const drawHeight = logoImage.height * logoScale;
            const x = (width - drawWidth) / 2 + (logoPosition.x * logoScale);
            const y = (height - drawHeight) / 2 + (logoPosition.y * logoScale);

            ctx.drawImage(logoImage, x, y, drawWidth, drawHeight);
        }
    }, [logoImage, logoScale, logoPosition, logoBgColor, logoAspectRatio]);

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

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(`${user.id}/logo.png`, blob, {
                    upsert: true
                });

            if (uploadError) throw uploadError;

            fetchLogo();
            if (isMounted.current) setLogoImage(null);
            toast.success('Logotipo salvo com sucesso!');

        } catch (error) {
            console.error('Error saving logo:', error);
            toast.error('Erro ao salvar logotipo');
        } finally {
            setLoading(false);
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
                        .from('logos')
                        .remove([`${user.id}/logo.png`]);

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
                    setLoading(false);
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
                                        <div className="font-bold capitalize">{key === 'avancado' ? 'Avançado' : key}</div>
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
                                    Acessos Liberados (Módulos)
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
                                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-black rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
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
                                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-black rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
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
                                        <label className="block text-xs text-gray-400 mb-1">Stripe Customer ID</label>
                                        <input
                                            type="text"
                                            value={stripeCustomerId}
                                            onChange={(e) => setStripeCustomerId(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-primary font-mono text-xs"
                                            placeholder="cus_..."
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

                                {/* Manual renewal removed per request */}
                            </section>

                            {/* Invoices Grid */}
                            <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
                                    Histórico de Faturas (Stripe)
                                </h3>
                                
                                {isLoadingInvoices ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-gray-700">
                                        <table className="w-full text-sm text-left text-gray-400">
                                            <thead className="text-xs text-gray-200 uppercase bg-gray-700/50">
                                                <tr>
                                                    <th className="px-4 py-3">Data</th>
                                                    <th className="px-4 py-3">Plano</th>
                                                    <th className="px-4 py-3 text-right">Valor</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                    <th className="px-4 py-3 text-right">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700/50">
                                                {invoices.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500 italic">
                                                            Nenhuma fatura encontrada no Stripe para este usuário.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    invoices.map((inv) => (
                                                        <tr key={inv.id} className="hover:bg-gray-700/30 transition-colors">
                                                            <td className="px-4 py-3 font-medium">
                                                                {new Date(inv.date).toLocaleDateString('pt-BR')}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-white font-bold">{inv.plan_name}</div>
                                                                <div className="text-[10px] text-gray-500 uppercase">{inv.number}</div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-white">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: inv.currency.toUpperCase() }).format(inv.amount)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                    inv.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                                                }`}>
                                                                    {inv.status === 'paid' ? 'Paga' : inv.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                {inv.pdf && (
                                                                    <a href={inv.pdf} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-xs">
                                                                        Ver PDF
                                                                    </a>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
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
                                                    const { data, error } = await supabase.functions.invoke('update-user', {
                                                        body: {
                                                            user_id: user.id,
                                                            password: newPass
                                                        }
                                                    });

                                                    if (error) {
                                                        console.error("Update password function error details:", error);
                                                        throw error;
                                                    }

                                                    if (error) throw error;

                                                    toast.success("Senha alterada com sucesso!");
                                                    e.target.reset();
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error(`Erro ao atualizar senha`);
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
                                                    const { data, error } = await supabase.functions.invoke('delete-user', {
                                                        body: { user_id: user.id }
                                                    });

                                                    if (error) {
                                                        console.error("Delete user function error:", error);
                                                        // Extract the actual response body
                                                        if (error.context) {
                                                            try {
                                                                const errorBody = await error.context.json();
                                                                console.error("=== SERVER RESPONSE BODY ===", errorBody);
                                                                toast.error(`Erro: ${errorBody?.error || errorBody?.message || 'Erro desconhecido'}`);
                                                            } catch (e) {
                                                                const errorText = await error.context.text();
                                                                console.error("=== SERVER RESPONSE TEXT ===", errorText);
                                                            }
                                                        }
                                                        throw error;
                                                    }

                                                    toast.success("Usuário excluído com sucesso.");
                                                    onBack();
                                                } catch (error) {
                                                    console.error("Delete user error:", error);
                                                    if (!error.context) toast.error(`Falha ao excluir usuário`);
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
                                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-black rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
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
                                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-black rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
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
                                        <button onClick={handleSaveLogo} disabled={loading} className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-black rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
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
                                className="px-6 py-2 bg-primary text-black font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-primary-hover"
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
