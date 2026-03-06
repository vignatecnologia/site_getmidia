import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Comparison from '../components/Comparison'
import Solutions from '../components/Solutions'
import Testimonials from '../components/Testimonials'
import Pricing from '../components/Pricing'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <Hero />
            <Features />
            <Comparison />
            <Solutions />
            <Testimonials />
            <Pricing />
            <FAQ />
            <Contact />
            <Footer />
        </div>
    )
}

export default LandingPage
