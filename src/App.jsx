
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminPanel from './pages/AdminPanel'
import LandingPage from './pages/LandingPage'
import GetmidiaProduct from './pages/GetmidiaProduct'
import GetmidiaModa from './pages/GetmidiaModa'
import GetmidiaFood from './pages/GetmidiaFood'
import GetmidiaAuto from './pages/GetmidiaAuto'
import GetmidiaOtica from './pages/GetmidiaOtica'
import GetmidiaPet from './pages/GetmidiaPet'
import GetmidiaFarma from './pages/GetmidiaFarma'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import CookiePolicy from './pages/CookiePolicy'
import { PaymentSuccess, PaymentFailure, PaymentPending } from './pages/PaymentReturn'
import UserDashboard from './pages/UserDashboard'
import ScrollToTop from './components/ScrollToTop'
import WhatsappButton from './components/WhatsappButton' // Add this import
import CookieBanner from './components/CookieBanner'

import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
      }} />
      <ScrollToTop />
      <WhatsappButton /> {/* Add the button here */}
      <CookieBanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/produto" element={<GetmidiaProduct />} />
        <Route path="/moda" element={<GetmidiaModa />} />
        <Route path="/food" element={<GetmidiaFood />} />
        <Route path="/auto" element={<GetmidiaAuto />} />
        <Route path="/otica" element={<GetmidiaOtica />} />
        <Route path="/pet" element={<GetmidiaPet />} />
        <Route path="/farma" element={<GetmidiaFarma />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos-de-uso" element={<TermsOfUse />} />
        <Route path="/politica-de-cookies" element={<CookiePolicy />} />

        {/* Payment Return Routes */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/payment-pending" element={<PaymentPending />} />
        <Route path="/minha-conta" element={<UserDashboard />} />
      </Routes>
    </div>
  )
}

export default App
