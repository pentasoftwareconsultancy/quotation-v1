import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import HomePage from './pages/Homepage/herosec.jsx'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Fotter.jsx'
import ScrollToTop from './components/common/ScrollToTop'
import ContactUs from './components/Homepage/ContactUs'
import PrivacyPolicy from './components/Homepage/PrivacyPolicy'
import TermsOfService from './components/Homepage/TermsOfService'
import CookiePolicy from './components/Homepage/CookiePolicy'
import LoginModal from './components/login/LoginSelection'
import ForgotPassword from './components/login/ForgotPassword'
import ResetPassword from './components/login/ResetPassword'
import AdminPanel from './components/Admin/AdminPanel'
import EmployeePanel from './components/Employee/EmployeePanel'
import CreateQuotation from './components/Employee/CreateQuotation';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/employee/*" element={<EmployeePanel />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  )
}

function MainLayout() {
  return (
    <>
       <Navbar />
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/create-quotation/:id" element={<CreateQuotation />} />
      </Routes>
   
      
      <Footer />
    </>
  )
}

function LoginPage() {
  const navigate = useNavigate();
  return <LoginModal isOpen={true} onClose={() => navigate('/')} />;
}

export default App;