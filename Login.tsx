
import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

interface LoginProps {
  onLogin: (user: { email: string; name: string }) => void;
}

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // ==========================================================
  // CONFIGURACIÓN DE EMAILJS
  // ==========================================================
  const SERVICE_ID = 'service_n4gj4yo';
  const TEMPLATE_ID = 'template_51eoele';
  const PUBLIC_KEY = 'K-gv5LKf12Y7eb4RN';
  // ==========================================================

  const [activeTab, setActiveTab] = useState<AuthView>('login');
  const [isSending, setIsSending] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Limpiar errores al cambiar de pestaña
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  const sendRecoveryEmail = async (email: string, code: string) => {
    const templateParams = {
      user_email: email,
      verification_code: code,
      user_name: email.split('@')[0],
      reply_to: 'soporte@monotributopro.com'
    };
    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
  };

  const sendWelcomeEmail = async (name: string, email: string) => {
    const templateParams = {
      user_email: email,
      user_name: name,
      verification_code: '¡Bienvenido!',
    };
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    } catch (e) {
      console.error("Error enviando bienvenida:", e);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const users = JSON.parse(localStorage.getItem('monotributo_registered_users') || '[]');
    const user = users.find((u: any) => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (!user) {
      setError("No existe una cuenta registrada con este correo.");
      return;
    }

    if (user.password !== loginPassword) {
      setError("La contraseña ingresada es incorrecta. Inténtalo de nuevo.");
      return;
    }

    onLogin({ email: user.email, name: user.name });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== regConfirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    const users = JSON.parse(localStorage.getItem('monotributo_registered_users') || '[]');
    if (users.find((u: any) => u.email.toLowerCase() === regEmail.toLowerCase())) {
      setError("Este correo ya está registrado.");
      return;
    }

    const newUser = { name: regName, email: regEmail, password: regPassword };
    users.push(newUser);
    localStorage.setItem('monotributo_registered_users', JSON.stringify(users));
    
    await sendWelcomeEmail(regName, regEmail);
    alert(`✅ Registro exitoso. Se envió un correo a ${regEmail}`);
    setActiveTab('login');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const users = JSON.parse(localStorage.getItem('monotributo_registered_users') || '[]');
    const user = users.find((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase());

    if (!user) {
      setError("No encontramos ningún usuario con ese correo.");
      return;
    }

    setIsSending(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      const response = await sendRecoveryEmail(forgotEmail, code);
      if (response.status === 200) {
        setActiveTab('reset-password');
      }
    } catch (error: any) {
      setError("Error al enviar el correo. Revisa tu conexión.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verificationCode !== generatedCode) {
      setError("El código de seguridad es incorrecto.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }
    const users = JSON.parse(localStorage.getItem('monotributo_registered_users') || '[]');
    const userIdx = users.findIndex((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase());
    
    if (userIdx > -1) {
      users[userIdx].password = newPassword;
      localStorage.setItem('monotributo_registered_users', JSON.stringify(users));
      alert("🎉 Contraseña actualizada con éxito.");
      setActiveTab('login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">MONOTRIBUTO<span className="text-indigo-600">PRO</span></h1>
        <p className="text-slate-500 font-medium">Panel Administrativo para Contadores</p>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-2xl shadow-indigo-100 border border-slate-100 p-10 transition-all duration-300">
        {(activeTab === 'login' || activeTab === 'register') && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button onClick={() => setActiveTab('login')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'login' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500'}`}>Ingresar</button>
            <button onClick={() => setActiveTab('register')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'register' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500'}`}>Registrar</button>
          </div>
        )}

        {/* MENSAJE DE ERROR GLOBAL */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in zoom-in duration-300">
            <i className="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
            <p className="text-xs font-bold text-red-700 leading-tight">{error}</p>
          </div>
        )}

        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Correo Electrónico</label>
              <input type="email" placeholder="ejemplo@correo.com" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" value={loginEmail} onChange={(e) => {setLoginEmail(e.target.value); setError(null);}} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Contraseña</label>
              <input type="password" placeholder="••••••••" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" value={loginPassword} onChange={(e) => {setLoginPassword(e.target.value); setError(null);}} />
            </div>
            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">Iniciar Sesión</button>
            <button type="button" onClick={() => setActiveTab('forgot-password')} className="w-full text-center text-xs text-indigo-600 font-bold hover:underline py-2">¿Olvidaste tu contraseña?</button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <input type="text" placeholder="Tu nombre y apellido" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={regName} onChange={(e) => {setRegName(e.target.value); setError(null);}} />
            <input type="email" placeholder="Tu correo electrónico" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={regEmail} onChange={(e) => {setRegEmail(e.target.value); setError(null);}} />
            <input type="password" placeholder="Crear contraseña" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={regPassword} onChange={(e) => {setRegPassword(e.target.value); setError(null);}} />
            <input type="password" placeholder="Confirmar contraseña" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={regConfirmPassword} onChange={(e) => {setRegConfirmPassword(e.target.value); setError(null);}} />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all">Crear mi cuenta</button>
          </form>
        )}

        {activeTab === 'forgot-password' && (
          <form onSubmit={handleForgotSubmit} className="space-y-6">
            <div>
              <button type="button" onClick={() => setActiveTab('login')} className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-xs font-bold uppercase mb-4 transition-colors">← Volver</button>
              <h2 className="text-2xl font-black text-slate-900">Recuperación</h2>
              <p className="text-sm text-slate-500 mt-2">Enviaremos un código al correo del usuario.</p>
            </div>
            <input type="email" placeholder="correo-del-usuario@gmail.com" required className="w-full px-5 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl outline-none" value={forgotEmail} onChange={(e) => {setForgotEmail(e.target.value); setError(null);}} />
            <button type="submit" disabled={isSending} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
              {isSending ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Enviar código'}
            </button>
          </form>
        )}

        {activeTab === 'reset-password' && (
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <h2 className="text-2xl font-black text-slate-900 text-center">Código enviado</h2>
            <input type="text" placeholder="000000" required maxLength={6} className="w-full p-5 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-center text-3xl font-mono font-bold text-indigo-700 outline-none" value={verificationCode} onChange={(e) => {setVerificationCode(e.target.value.replace(/\D/g, '')); setError(null);}} />
            <div className="space-y-3">
              <input type="password" placeholder="Nueva contraseña" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl" value={newPassword} onChange={(e) => {setNewPassword(e.target.value); setError(null);}} />
              <input type="password" placeholder="Confirmar contraseña" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl" value={confirmNewPassword} onChange={(e) => {setConfirmNewPassword(e.target.value); setError(null);}} />
            </div>
            <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition-all">Guardar cambios</button>
          </form>
        )}
      </div>
      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Monotributo Pro © 2024</p>
    </div>
  );
};

export default Login;
