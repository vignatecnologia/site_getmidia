
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
import HowItWorks from './pages/HowItWorks'
import { PaymentSuccess, PaymentFailure, PaymentPending } from './pages/PaymentReturn'
import UserDashboard from './pages/UserDashboard'
import ScrollToTop from './components/ScrollToTop'

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<LandingPage />} />
        <Route path="/produto" element={<GetmidiaProduct />} />
        <Route path="/moda" element={<GetmidiaModa />} />
        <Route path="/food" element={<GetmidiaFood />} />
        <Route path="/auto" element={<GetmidiaAuto />} />
        <Route path="/otica" element={<GetmidiaOtica />} />
        <Route path="/pet" element={<GetmidiaPet />} />
        <Route path="/farma" element={<GetmidiaFarma />} />
        <Route path="/como-funciona" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />

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
