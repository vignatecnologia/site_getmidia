import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import Comparison from '../components/Comparison'
import Solutions from '../components/Solutions'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <Hero />
            <HowItWorks />
            <Features />
            <Comparison />
            <Solutions />
            <Testimonials />
            <FAQ />
            <Footer />
        </div>
    )
}

export default LandingPage
