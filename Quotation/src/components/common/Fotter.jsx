import React from 'react';
import { Link } from 'react-router-dom';
import mainlogo from '../../assets/mainlogo.webp';
import { FaTwitter, FaLinkedinIn, FaFacebookF, FaInstagram } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="bg-white p-3 rounded-lg w-fit mx-auto sm:mx-0">
              <img src={mainlogo} alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
            <p className="text-sm">Transforming Ideas into intelligent solutions.</p>
            <p className="text-sm">Building tomorrow's technology, today.</p>

<div className="flex space-x-4 justify-center sm:justify-start">

  {/* LinkedIn */}
  <div className="group relative">
    <a href="#" className="icon-btn bg-blue-700 hover:bg-blue-800">
      <FaLinkedinIn />
    </a>
    <span className="tooltip bg-blue-700">LinkedIn</span>
  </div>

  {/* Facebook (NEW) */}
  <div className="group relative">
    <a href="#" className="icon-btn bg-blue-600 hover:bg-blue-700">
      <FaFacebookF />
    </a>
    <span className="tooltip bg-blue-600">Facebook</span>
  </div>

  {/* Instagram */}
  <div className="group relative">
    <a href="#" className="icon-btn bg-gradient-to-r from-pink-500 to-yellow-500 hover:opacity-90">
      <FaInstagram />
    </a>
    <span className="tooltip bg-pink-500">Instagram</span>
  </div>

</div>

<style>{`
  .icon-btn {
    padding: 10px;
    border-radius: 9999px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 14px;
  }

  .icon-btn:hover {
    transform: translateY(-3px) scale(1.1);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }

  /* Tooltip */
  .tooltip {
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    color: white;
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    transition: all 0.25s ease;
  }

  .group:hover .tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`}</style>

          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-cyan-400 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-cyan-400">Home</Link></li>
              <li><a href="#" className="hover:text-cyan-400">About</a></li>
              <li><a href="#" className="hover:text-cyan-400">Features</a></li>
              <li><Link to="/contact" className="hover:text-cyan-400">Contact Us</Link></li>
              {/* <li><a href="#" className="hover:text-cyan-400">Career</a></li>
              <li><a href="#" className="hover:text-cyan-400">Contact</a></li> */}
            </ul>
          </div>

          {/* Our Services */}
          <div className="text-center sm:text-left">
            <h3 className="text-cyan-400 font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Web Development</li>
              <li>App Development</li>
              <li>Cloud Computing</li>
              <li>Digital Marketing</li>
              <li>UI/UX Design</li>
              <li>IT Consulting</li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="text-center sm:text-left">
            <h3 className="text-cyan-400 font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3 justify-center sm:justify-start">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-left">Office No. 102-B, First Floor, Ganesham Commercial -A, Survey No. 21/18-21/24, BRTS Road, Pimple Saudagar, Pune- 411027</p>
              </div>
              <div className="flex items-center space-x-3 justify-center sm:justify-start">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <p>+91 9112108484</p>
              </div>
              <div className="flex items-center space-x-3 justify-center sm:justify-start">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <p>hr@smartmatrixds.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© 2024 QuotationSoftware Digital Services Pvt. Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-cyan-400">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-cyan-400">Terms of Service</Link>
            <Link to="/cookie-policy" className="hover:text-cyan-400">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;