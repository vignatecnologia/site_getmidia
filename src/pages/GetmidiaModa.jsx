import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'
import { Shirt, CheckCircle, Zap, ArrowRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import heroDemoImage from '../assets/hero_moda_demo.png'

const features = [
    {
        title: "Modelos Reais",
        description: "Escolha modelos de diversas etnias, idades e estilos que combinam perfeitamente com sua marca."
    },
    {
        title: "Cenários de Moda",
        description: "Transporte suas roupas para passarelas, ruas icônicas, estúdios profissionais ou paisagens naturais."
    },
    {
        title: "Preservação da Peça",
        description: "Nossa tecnologia avançada mantém o caimento, a textura e cada detalhe da sua roupa original."
    },
    {
        title: "Pronto para Vender",
        description: "Gere imagens otimizadas para catálogos, Instagram, TikTok e lojas virtuais em segundos."
    }
]

const galleryItems = []

const GetmidiaModa = () => {
    const [selectedImage, setSelectedImage] = React.useState(null)
    const [dynamicItems, setDynamicItems] = React.useState([])

    React.useEffect(() => {
        const fetchImages = async () => {
            const { data } = await supabase
                .from('site_gallery_images')
                .select('*')
                .eq('page_slug', 'getmidia-moda')
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false })

            if (data) {
                setDynamicItems(data.map(item => ({
                    id: `dyn-${item.id}`,
                    image: item.image_url,
                    title: item.title,
                    description: item.description
                })))
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
                <div className="absolute top-0 right-0 w-[50%] h-full bg-purple-500/5 blur-3xl rounded-l-full" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 font-medium mb-6">
                                <Shirt className="w-4 h-4" />
                                <span>GetMídia Moda</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Valorize sua coleção com <span className="text-purple-500">modelos reais</span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Transforme fotos de roupas em cabides ou manequins em produções de moda profissionais. Ideal para lookbooks, e-commerce e redes sociais.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/register"
                                    className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-purple-500 text-white rounded-xl font-bold text-lg hover:bg-purple-600 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                                >
                                    Assinar Agora <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a
                                    href="#demo"
                                    className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-700 transition-all border border-gray-700 hover:border-purple-500/30"
                                >
                                    Ver Exemplos
                                </a>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Modelos diversos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Troca de pose simples</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Alta resolução</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Preserva o produto</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Product Demo Image */}
                            <div className="aspect-square relative flex items-center justify-center">
                                <img src={heroDemoImage} alt="Demonstração de Moda" className="w-full h-full object-contain" />
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
                            <div key={index} className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-colors">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 text-purple-500">
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
                        <h2 className="text-3xl font-bold text-white mb-4">Galeria de Looks</h2>
                        <p className="text-gray-400">Veja o que você pode criar com o GetMídia Moda</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {allGalleryItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item)}
                                className="aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-colors group relative cursor-pointer"
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
                        {allGalleryItems.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-800/50 rounded-2xl border border-gray-700 border-dashed">
                                <p>Nenhum exemplo na galeria ainda.</p>
                            </div>
                        )}
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
                        className="absolute top-4 right-4 text-white hover:text-purple-500 transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div
                        className="max-w-4xl w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative h-[80vh] bg-black flex items-center justify-center">
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

export default GetmidiaModa
