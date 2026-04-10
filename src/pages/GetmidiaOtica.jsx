import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'
import { Box, CheckCircle, Zap, Image as ImageIcon, ArrowRight, X, Glasses } from 'lucide-react'
import { supabase } from '../lib/supabase'
import antesDepoisOtica from '../assets/antes_depois_otica.png'

const features = [
    {
        title: "Destaque nas Armações",
        description: "Realce texturizações, metais e o brilho das lentes com iluminação realista que valoriza o design de cada óculos."
    },
    {
        title: "Provador Virtual na Foto",
        description: "Nossa IA aplica os óculos no rosto de modelos com perfeição, respeitando a perspectiva e a profundidade."
    },
    {
        title: "Cenários de Lifestyle",
        description: "Coloque suas peças em ambientes sofisticados, praias ensolaradas ou editoriais de moda urbana em segundos."
    },
    {
        title: "Alta Fidelidade Visual",
        description: "Preservação absoluta das cores originais e dos detalhes da marca em cada armação gerada."
    }
]

const galleryItems = []

const GetmidiaOtica = () => {
    const [selectedImage, setSelectedImage] = React.useState(null)
    const [dynamicItems, setDynamicItems] = React.useState([])

    React.useEffect(() => {
        const fetchImages = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_gallery_images')
                    .select('*')
                    .eq('page_slug', 'getmidia-otica')
                    .order('display_order');

                if (error) throw error;

                if (data) {
                    setDynamicItems(data.map(item => ({
                        id: `dyn-${item.id}`,
                        image: item.image_url,
                        title: item.title,
                        description: item.description
                    })))
                }
            } catch (error) {
                console.error("Error fetching gallery images:", error);
            }
        }
        fetchImages()
    }, [])

    const allGalleryItems = [...dynamicItems, ...galleryItems]

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[50%] h-full bg-cyan-500/5 blur-3xl rounded-l-full" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium mb-6">
                                <Glasses className="w-4 h-4" />
                                <span>GetMídia Ótica</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Seus óculos em <span className="text-cyan-400">foco total</span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Crie fotos publicitárias profissionais para óculos de sol e de grau. Perfeito para vitrines digitais, anúncios e redes sociais com um toque de luxo.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="#demo"
                                    className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-700 transition-all border border-gray-700 hover:border-cyan-500/30"
                                >
                                    Ver Exemplos
                                </a>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Modelos IA Realistas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Reflexos controlados</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Alta Resolução 4K</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Cenários de Luxo</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="aspect-square relative flex items-center justify-center">
                                <img src={antesDepoisOtica} alt="Antes e Depois Ótica" className="w-full h-full object-contain" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-cyan-500/30 transition-colors">
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="demo" className="py-20 bg-gray-900 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Galeria de Exemplos</h2>
                        <p className="text-gray-400">Excelência visual com o GetMídia Ótica</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {allGalleryItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item)}
                                className="aspect-square bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-colors group relative cursor-pointer"
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <span className="text-white font-medium text-sm mb-1">{item.title}</span>
                                    <p className="text-gray-300 text-xs line-clamp-2">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-cyan-400 transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div
                        className="max-w-4xl w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative aspect-video bg-black flex items-center justify-center">
                            <img
                                src={selectedImage.image}
                                alt={selectedImage.title}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{selectedImage.title}</h3>
                            <p className="text-gray-400">{selectedImage.description}</p>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default GetmidiaOtica
