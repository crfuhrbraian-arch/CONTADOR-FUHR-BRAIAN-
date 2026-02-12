import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Client } from '../types';

interface DashboardProps {
  userEmail: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userEmail }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const STORAGE_KEY = `monotributo_clients_${userEmail}`;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setClients(JSON.parse(saved));
    } else {
      setClients([]); 
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients, STORAGE_KEY]);

  const [formData, setFormData] = useState({
    name: '', cuit: '', category: 'A', phone: '', email: '', address: ''
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cuit.includes(searchTerm)
  );

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', cuit: '', category: 'A', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name, cuit: client.cuit, category: client.category,
      phone: client.phone || '', email: client.email || '', address: client.address || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este cliente? Se borrarán todos sus registros.')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
    } else {
      const newClient: Client = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        nextRenewal: '20-07-2024'
      };
      setClients([...clients, newClient]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[32px] font-bold text-[#0f172a]">Panel General</h1>
          <p className="text-slate-500 text-base">Gestión administrativa de clientes</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#1a365d] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#122645] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Agregar cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Clientes Activos</p>
            <p className="text-[38px] font-bold text-[#0f172a] leading-none mt-2">{clients.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <i className="fa-solid fa-users text-xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Recategorizaciones</p>
            <p className="text-[38px] font-bold text-[#0f172a] leading-none mt-2">Próx. Julio</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
            <i className="fa-solid fa-calendar-check text-xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Alertas</p>
            <p className="text-[38px] font-bold text-[#0f172a] leading-none mt-2">0</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
            <i className="fa-solid fa-bell text-xl"></i>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0f172a]">Listado de Clientes</h2>
          <div className="relative w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text" 
              placeholder="Buscar por nombre o CUIT..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuit</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-700">{client.name}</td>
                    <td className="px-6 py-5 text-slate-500 font-mono text-sm">{client.cuit}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-[#ecfdf5] text-[#10b981] rounded-full text-xs font-bold border border-[#d1fae5]">
                        Cat. {client.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-400">{client.phone}</td>
                    <td className="px-6 py-5 text-slate-500 text-sm">{client.email}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/client/${client.id}`}
                          className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-[#1a365d] hover:text-white transition-all"
                        >
                          Gestionar
                        </Link>
                        <button 
                          onClick={() => openEditModal(client)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-pencil text-sm"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[600px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-[24px] font-bold text-[#0f172a]">
                  {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] mb-2">Nombre Completo *</label>
                  <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a365d]/10 focus:border-[#1a365d] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] mb-2">CUIT *</label>
                  <input required placeholder="20-XXXXXXXX-X" value={formData.cuit} onChange={(e) => setFormData({...formData, cuit: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#1a365d]/10 focus:border-[#1a365d] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] mb-2">Categoría Actual *</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a365d]/10 focus:border-[#1a365d] outline-none transition-all">
                    {['A','B','C','D','E','F','G','H','I','J','K'].map(cat => <option key={cat} value={cat}>Categoría {cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] mb-2">Teléfono</label>
                  <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0f172a] mb-2">Correo Electrónico</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all" />
              </div>
              <button type="submit" className="w-full py-4 bg-[#1a365d] text-white font-bold rounded-2xl hover:bg-[#122645] transition-all shadow-lg active:scale-95">
                {editingClient ? 'Actualizar Datos' : 'Registrar Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;