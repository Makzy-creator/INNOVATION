import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { WagmiConfig } from 'wagmi'
import { config } from './config/web3modal'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DonorProfile from './pages/DonorProfile'
import RecipientProfile from './pages/RecipientProfile'
import BloodRequests from './pages/BloodRequests'
import DonationHistory from './pages/DonationHistory'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import PremiumFeatures from './components/PremiumFeatures'
import VideoTutorials from './components/VideoTutorials'
import MatchingDashboard from './pages/MatchingDashboard'
import './index.css'

function App() {
  return (
    <WagmiConfig config={config}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/donor-profile" element={<DonorProfile />} />
                <Route path="/recipient-profile" element={<RecipientProfile />} />
                <Route path="/blood-requests" element={<BloodRequests />} />
                <Route path="/donation-history" element={<DonationHistory />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/premium" element={<PremiumFeatures />} />
                <Route path="/tutorials" element={<VideoTutorials />} />
                <Route path="/matching" element={<MatchingDashboard />} />
              </Routes>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </WagmiConfig>
  )
}

export default App