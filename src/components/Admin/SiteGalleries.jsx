import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Save, Plus, X, Loader2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';

const PAGES = [
    { id: 'getmidia-produto', label: 'GetMídia - Produto' },
    { id: 'getmidia-moda', label: 'GetMídia - Moda' },
    { id: 'getmidia-food', label: 'GetMídia - Food' },
    { id: 'getmidia-auto', label: 'GetMídia - Auto' },
    { id: 'getmidia-otica', label: 'GetMídia - Ótica' },
    { id: 'getmidia-pet', label: 'GetMídia - Pet' },
];

const SiteGalleries = ({ selectedPage = 'getmidia-produto', onPageSelect }) => {
    // ... (state remains same)
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newItem, setNewItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);
    const fileInputRef = useRef(null);
    const [page, setPage] = useState(selectedPage);

    // ... (useEffects remain same)
    useEffect(() => {
        if (onPageSelect) {
            setPage(selectedPage);
        }
    }, [selectedPage]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        if (onPageSelect) onPageSelect(newPage);
    }

    useEffect(() => {
        if (page) {
            fetchImages();
        }
    }, [page]);

    // ... (fetchImages remains same)
    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_gallery_images')
                .select('*')
                .eq('page_slug', page)
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setImages(data || []);
            setHasOrderChanged(false);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(images);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setImages(items);
        setHasOrderChanged(true);
    };

    const saveOrder = async () => {
        setUploading(true);
        try {
            const updates = images.map((img, index) => ({
                id: img.id,
                display_order: index
            }));

            const promises = updates.map(u =>
                supabase.from('site_gallery_images').update({ display_order: u.display_order }).eq('id', u.id)
            );

            await Promise.all(promises);

            setHasOrderChanged(false);
            toast.success('Ordem salva com sucesso!');
        } catch (error) {
            console.error("Error saving order:", error);
            toast.error("Erro ao salvar ordem.");
        } finally {
            setUploading(false);
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        setNewItem({
            file,
            preview,
            title: '',
            description: ''
        });
    };

    const handleUpload = async () => {
        if (!newItem) return;
        setUploading(true);

        try {
            // 1. Upload Image to Storage
            const fileExt = newItem.file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `site-gallery/${page}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery-images')
                .upload(filePath, newItem.file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('gallery-images')
                .getPublicUrl(filePath);

            // 2. Save Metadata to DB
            const { error: dbError } = await supabase
                .from('site_gallery_images')
                .insert({
                    page_slug: page,
                    image_url: publicUrl,
                    title: newItem.title,
                    description: newItem.description
                });

            if (dbError) throw dbError;

            // 3. Reset and Refresh
            setNewItem(null);
            fetchImages();
            toast.success('Imagem enviada com sucesso!');

        } catch (error) {
            console.error('Error uploading:', error);
            toast.error('Erro ao fazer upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        setUploading(true);

        try {
            const { error } = await supabase
                .from('site_gallery_images')
                .update({
                    title: editingItem.title,
                    description: editingItem.description
                })
                .eq('id', editingItem.id);

            if (error) throw error;

            setEditingItem(null);
            fetchImages();
            toast.success('Imagem atualizada com sucesso!');
        } catch (error) {
            console.error('Error updating:', error);
            toast.error('Erro ao atualizar imagem.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, imageUrl) => {
        if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

        try {
            const { error } = await supabase
                .from('site_gallery_images')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchImages();
            toast.success('Imagem excluída com sucesso!');
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Erro ao excluir.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Gerenciar Galerias</h2>
                {hasOrderChanged && (
                    <button
                        onClick={saveOrder}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 animate-in fade-in slide-in-from-right-4 transition-all"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Nova Ordem
                    </button>
                )}
            </div>

            {/* Page Selector */}
            <div className="flex gap-4 mb-8">
                {PAGES.map(p => (
                    <button
                        key={p.id}
                        onClick={() => handlePageChange(p.id)}
                        className={`px-4 py-2 rounded-lg transition-colors border ${page === p.id
                            ? 'bg-yellow-500 text-black border-yellow-500 font-bold'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Upload Area */}
            <div className={`bg-gray-800 rounded-2xl border-2 border-dashed ${newItem ? 'border-yellow-500/50' : 'border-gray-700'} p-6 transition-all`}>
                {!newItem ? (
                    <div
                        className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-700/50 rounded-xl transition-colors"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300">Adicionar Nova Imagem</h3>
                        <p className="text-sm text-gray-500 mt-1">Clique para selecionar</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 aspect-video bg-black rounded-lg overflow-hidden relative group">
                            <img src={newItem.preview} alt="Preview" className="w-full h-full object-contain" />
                            <button
                                onClick={() => setNewItem(null)}
                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                    placeholder="Ex: Produto fundo Páscoa"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 h-24 resize-none"
                                    placeholder="Ex: Tema: Páscoa Cena: ..."
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                    {uploading ? 'Enviando...' : 'Salvar na Galeria'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gallery List */}
            {isLoading ? (
                <p className="text-gray-500 col-span-full text-center py-8">Carregando galeria...</p>
            ) : images.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">Nenhuma imagem cadastrada para esta página.</p>
            ) : (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="gallery" direction="horizontal">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                            >
                                {images.map((img, index) => (
                                    <Draggable key={img.id} draggableId={String(img.id)} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    opacity: snapshot.isDragging ? 0.8 : 1
                                                }}
                                                className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden group relative ${snapshot.isDragging ? 'ring-2 ring-yellow-500 z-50' : ''}`}
                                            >
                                                <div className="aspect-video bg-black relative">
                                                    <img src={img.image_url} alt={img.title} className="w-full h-full object-cover pointer-events-none" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                // Prevent drag when clicking buttons (handled by dnd usually, but good to be safe)
                                                                if (!snapshot.isDragging) setEditingItem({ ...img });
                                                            }}
                                                            className="p-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-colors pointer-events-auto"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (!snapshot.isDragging) handleDelete(img.id, img.image_url);
                                                            }}
                                                            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors pointer-events-auto"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-[10px] text-gray-400 font-mono pointer-events-none">
                                                        Segure para mover
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-white truncate">{img.title || 'Sem título'}</h4>
                                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{img.description || 'Sem descrição'}</p>
                                                    <div className="mt-4 text-xs text-gray-500">
                                                        {new Date(img.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                            <h3 className="text-lg font-bold text-white">Editar Imagem</h3>
                            <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-gray-800">
                                <img src={editingItem.image_url} alt="Preview" className="max-w-full max-h-full object-contain" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={editingItem.title || ''}
                                    onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                                <textarea
                                    value={editingItem.description || ''}
                                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-800/30 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={uploading}
                                className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {uploading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SiteGalleries;
