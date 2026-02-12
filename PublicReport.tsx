import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Client, Invoice } from '../types';
import { ARCA_CATEGORIES_2026, CREDIT_NOTE_CODES } from '../constants';

const PublicReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allStorageKeys = Object.keys(localStorage);
    const clientKey = allStorageKeys.find(k => k.startsWith('monotributo_clients_'));
    
    if (clientKey) {
      const clients = JSON.parse(localStorage.getItem(clientKey) || '[]');
      const found = clients.find((c: Client) => c.id === id);
      if (found) {
        setClient(found);
        const userEmail = clientKey.replace('monotributo_clients_', '');
        const invKey = `monotributo_invoices_${userEmail}_${id}`;
        setInvoices(JSON.parse(localStorage.getItem(invKey) || '[]'));
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando reporte...</div>;
  if (!client) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 text-center p-8">Este link ya no es válido o el reporte ha sido removido.</div>;

  const salesTotal = invoices.reduce((acc, inv) => {
    if (!inv.isSale) return acc;
    return CREDIT_NOTE_CODES.includes(inv.invoiceType) ? acc - inv.totalAmount : acc + inv.totalAmount;
  }, 0);

  const cat = ARCA_CATEGORIES_2026.find(c => c.category === client.category) || ARCA_CATEGORIES_2026[0];
  const percentage = (salesTotal / cat.maxBilling) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-10 text-white text-center">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Estado de Monotributo</p>
          <h1 className="text-3xl font-black tracking-tight">{client.name}</h1>
          <div className="mt-4 inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-bold">
            Categoría {client.category}
          </div>
        </div>
        
        <div className="p-10 space-y-10">
          <div className="text-center">
            <p className="text-slate-400 text-xs font-bold uppercase mb-4">Facturación Anual Acumulada</p>
            <p className="text-5xl font-black text-slate-900">$ {salesTotal.toLocaleString('es-AR')}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-500 tracking-tight">Límite Categoría {client.category}</span>
              <span className="text-slate-900">$ {cat.maxBilling.toLocaleString()}</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${percentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {percentage.toFixed(1)}% del límite utilizado
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Próxima Cuota</p>
              <p className="text-xl font-bold text-slate-900">$ {cat.monthlyQuota.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Recategorización</p>
              <p className="text-xl font-bold text-slate-900">Julio 2024</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 mb-6 italic">Reporte generado por Monotributo Pro para uso informativo.</p>
            <button onClick={() => window.print()} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 mx-auto active:scale-95 transition-all">
              <i className="fa-solid fa-file-pdf"></i> Descargar Reporte
            </button>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">Consultas: Contacte a su contador de confianza</p>
    </div>
  );
};

export default PublicReport;