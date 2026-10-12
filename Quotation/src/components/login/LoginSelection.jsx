import React, { useState, useEffect } from 'react';

const LoginModal = ({ isOpen, onClose }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ username: '', employeeId: '', password: '' });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsAdmin(false);
      setFormData({ username: '', employeeId: '', password: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isAdmin ? "auth/login" : "employee/auth/login";
    const payload = isAdmin 
      ? { username: formData.username, password: formData.password }
      : { employeeId: formData.employeeId, password: formData.password };

    try {
      const res = await fetch(`http://localhost:8080/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (!isAdmin) localStorage.setItem("empId", formData.employeeId);
        window.location.href = isAdmin ? "/admin" : "/employee";
      } else {
        setError("Invalid username or password");
      }
    } catch (err) { setError("Something went wrong. Please try again."); }
  };

  const handleForgotPassword = () => {
    onClose();
    window.location.href = '/forgot-password';
  };

  const SocialIcons = () => (
    <div className="flex justify-center gap-4 mb-6 mt-2">
      {[
        { name: 'Google', color: '#EA4335', path: "M12.48 10.92v3.28h7.84c-.24 1.84-1.92 5.36-7.84 5.36-5.12 0-9.28-4.24-9.28-9.52s4.16-9.52 9.28-9.52c2.92 0 4.88 1.24 6 2.32l2.6-2.52C19.24 1.4 16.12 0 12.48 0 5.58 0 0 5.58 0 12.48s5.58 12.48 12.48 12.48c7.2 0 12-5.08 12-12.2 0-.84-.08-1.48-.24-2.16h-11.76z" },
        { name: 'Facebook', color: '#1877F2', path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
        { name: 'GitHub', color: '#333', path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
        { name: 'LinkedIn', color: '#0077B5', path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" }
      ].map((social) => (
        <div 
          key={social.name} 
          className="w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-sm hover:shadow-md bg-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" style={{ fill: social.color }}>
            <path d={social.path} />
          </svg>
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[999] p-4 font-sans">
      <div className="relative bg-white w-full max-w-[850px] h-[550px] rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden flex">
        
        <button onClick={onClose} className="absolute top-6 right-8 text-gray-400 hover:text-gray-800 z-[110] text-2xl font-bold transition-transform hover:scale-110">✕</button>

        <div className="relative w-full h-full flex">
          
          {/* LEFT SIDE: ADMIN FORM */}
          <div className={`w-1/2 h-full flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isAdmin ? 'translate-x-0 opacity-100' : 'translate-x-[20%] opacity-0 pointer-events-none'}`}>
  
            <form onSubmit={handleSubmit} className="w-full max-w-[340px] flex flex-col items-center">

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                Admin Login
              </h2>

              {/* Subtitle */}
              <p className="text-gray-500 text-sm mb-6">
                Sign in to manage your dashboard
              </p>

              {/* Divider */}
              <div className="flex items-center w-full mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="px-3 text-xs text-gray-400 uppercase tracking-wider">
                  Secure Access
                </span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {error && (
                <div className="w-full mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                  ⚠️ {error}
                </div>
              )}
              
              <input type="text" placeholder="Username" className="w-full bg-gray-50 border border-gray-100 px-5 py-3.5 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-[#c33764]/30 transition-all text-sm" 
                value={formData.username} onChange={(e) => {setFormData({...formData, username: e.target.value}); setError("");}} />
              
              <input type="password" placeholder="Password" className="w-full bg-gray-50 border border-gray-100 px-5 py-3.5 rounded-xl mb-6 outline-none focus:ring-2 focus:ring-[#c33764]/30 transition-all text-sm" 
                value={formData.password} onChange={(e) => {setFormData({...formData, password: e.target.value}); setError("");}} />
              
              {/* CROSS COLORED: Admin uses Blue theme */}
              <button type="submit" className="w-full bg-gradient-to-r from-[#4e54c8] to-[#c326c8] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:opacity-90 active:scale-95 transition-all text-base">
                Sign In
              </button>
            </form>
          </div>

          {/* RIGHT SIDE: EMPLOYEE FORM */}
          <div className={`w-1/2 h-full flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${!isAdmin ? 'translate-x-0 opacity-100' : 'translate-x-[-20%] opacity-0 pointer-events-none'}`}>
  
            <form onSubmit={handleSubmit} className="w-full max-w-[340px] flex flex-col items-center">

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                Employee Login
              </h2>

              {/* Subtitle */}
              <p className="text-gray-500 text-sm mb-6 text-center">
                Sign in using your employee credentials
              </p>

              {/* Divider */}
              <div className="flex items-center w-full mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="px-3 text-xs text-gray-400 uppercase tracking-wider">
                  Employee Access
                </span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {error && (
                <div className="w-full mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                  ⚠️ {error}
                </div>
              )}
              
              <input type="text" placeholder="Employee ID" className="w-full bg-gray-50 border border-gray-100 px-5 py-3.5 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-[#4e54c8]/30 transition-all text-sm" 
                value={formData.employeeId} onChange={(e) => {setFormData({...formData, employeeId: e.target.value}); setError("");}} />
              
              <input type="password" placeholder="Password" className="w-full bg-gray-50 border border-gray-100 px-5 py-3.5 rounded-xl mb-6 outline-none focus:ring-2 focus:ring-[#4e54c8]/30 transition-all text-sm" 
                value={formData.password} onChange={(e) => {setFormData({...formData, password: e.target.value}); setError("");}} />
              <button type="button" onClick={handleForgotPassword} className="text-xs text-[#4e54c8] hover:text-[#c326c8] mb-4 font-semibold transition-colors">
                Forgot Password?
              </button>
              
              {/* CROSS COLORED: Employee uses Pink/Red theme */}
              <button type="submit" className="w-full bg-gradient-to-r from-[#c33764] to-[#1d2671] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-pink-100 hover:opacity-90 active:scale-95 transition-all text-base">
                Sign In
              </button>
            </form>
          </div>
        </div>

        {/* --- DYNAMIC SLIDING OVERLAY --- */}
        <div className={`absolute top-0 left-0 w-1/2 h-full z-[100] transition-transform duration-700 ease-in-out overflow-hidden ${isAdmin ? 'translate-x-full rounded-l-[100px]' : 'translate-x-0 rounded-r-[100px]'}`}>
          <div className={`relative h-full w-[200%] transition-transform duration-700 ease-in-out ${isAdmin ? '-translate-x-1/2 bg-gradient-to-br from-[#c33764] to-[#1d2671]' : 'translate-x-0 bg-gradient-to-br from-[#4e54c8] to-[#c326c8]'}`}>
            <div className="flex h-full text-white">
              <div className="w-1/2 flex flex-col items-center justify-center p-12 text-center">
                <h2 className="text-4xl font-bold mb-4">Hello, Admin!</h2>
                <p className="mb-10 text-sm opacity-90 leading-relaxed">Switch to the administrative portal to manage your system and employees.</p>
                <button onClick={() => setIsAdmin(true)} className="border-[3px] border-white px-12 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-[#4e54c8] transition-all">Admin Login</button>
              </div>
              <div className="w-1/2 flex flex-col items-center justify-center p-12 text-center">
                <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
                <p className="mb-10 text-sm opacity-90 leading-relaxed">Enter your personal details to access your employee dashboard.</p>
                <button onClick={() => setIsAdmin(false)} className="border-[3px] border-white px-12 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-[#c33764] transition-all">Employee Login</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;