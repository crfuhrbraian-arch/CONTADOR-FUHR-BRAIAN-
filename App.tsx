import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import ClientDetail from './ClientDetail';
import Login from './Login';
import Landing from './Landing';
import PublicReport from './PublicReport';

interface UserSession {
  email: string;
  name: string;
}

const Sidebar: React.FC<{ user: UserSession; onLogout: () => void }> = ({ user, onLogout }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', label: 'Panel', icon: 'fa-solid fa-border-all' },
    { path: '/clientes', label: 'Clientes', icon: 'fa-solid fa-users' },
  ];

  return (
    <div className="w-64 bg-[#0f172a] text-white flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold">Monotributo Pro</h1>
        <p className="text-slate-400 text-xs mt-1">Gestión Fiscal</p>
      </div>

      <nav className="flex-1 mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-4 transition-colors ${
                isActive 
                  ? 'bg-slate-800 border-r-4 border-indigo-500 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <i className={`${item.icon} w-5 text-center`}></i>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6 overflow-hidden">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-[#1e293b] border border-slate-700 flex items-center justify-center text-indigo-400 font-bold uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium w-full"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('monotributo_session');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('monotributo_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('monotributo_session');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8fafc] flex">
        {currentUser && <Sidebar user={currentUser} onLogout={handleLogout} />}
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/reporte/:id" element={<PublicReport />} />
            <Route path="/login" element={!currentUser ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />} />

            {currentUser ? (
              <>
                <Route path="/dashboard" element={<Dashboard userEmail={currentUser.email} />} />
                <Route path="/client/:id" element={<ClientDetail userEmail={currentUser.email} />} />
                <Route path="/clientes" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;