import React from 'react'
import HeroSection from '../../components/Homepage/Herosection.jsx'
import About from '../../components/Homepage/About.jsx'
import { useNavigate } from 'react-router-dom'

const herosec = () => {
  const navigate = useNavigate();

  return (
    <div>
      <HeroSection onGetStarted={() => navigate('/login')} />
      <section id="about">
        <About/>
      </section>
    </div>
  )
}

export default herosec;
