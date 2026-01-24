
import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Solutions from '../components/Solutions'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Hero />
                <Features />
                <Solutions />
                <Pricing />
            </main>
            <Footer />
        </div>
    )
}

export default Home
