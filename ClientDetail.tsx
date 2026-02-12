import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { TabType, Client, Invoice, Note } from '../types';
import { ARCA_CATEGORIES_2026, CREDIT_NOTE_CODES, INVOICE_TYPES } from '../constants';

interface ClientDetailProps {
  userEmail: string;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ userEmail }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>(TabType.SALES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState<TabType | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'txt' | 'xlsx'>('csv');
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const CLIENTS_KEY = `monotributo_clients_${userEmail}`;
  const INVOICES_KEY = `monotributo_invoices_${userEmail}_${id}`;
  const NOTES_KEY = `monotributo_notes_${userEmail}_${id}`;

  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const startOfYearMonth = `${new Date().getFullYear()}-01`;
  const [salesFilter, setSalesFilter] = useState({ start: startOfYearMonth, end: currentYearMonth });
  const [purchasesFilter, setPurchasesFilter] = useState({ start: startOfYearMonth, end: currentYearMonth });

  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [invoiceForm, setInvoiceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '011', pos: '0001', number: '', amount: '', description: ''
  });

  useEffect(() => {
    const savedClients = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
    const currentClient = savedClients.find((c: Client) => c.id === id);
    setClient(currentClient || null);

    setInvoices(JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]'));
    setNotes(JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'));
  }, [id, userEmail, CLIENTS_KEY, INVOICES_KEY, NOTES_KEY]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  }, [invoices, notes, id, INVOICES_KEY, NOTES_KEY]);

  const displayInvoices = useMemo(() => {
    const isTargetingSales = activeTab === TabType.SALES;
    const filter = isTargetingSales ? salesFilter : purchasesFilter;

    return invoices.filter(inv => {
      const invPeriod = inv.date.substring(0, 7);
      const matchesTab = inv.isSale === isTargetingSales;
      const matchesRange = invPeriod >= filter.start && invPeriod <= filter.end;
      return matchesTab && matchesRange;
    });
  }, [invoices, activeTab, salesFilter, purchasesFilter]);

  const { salesTotal, positiveSales, ncSales, purchasesTotal } = useMemo(() => {
    let pos = 0, neg = 0, purch = 0;
    invoices.forEach(inv => {
      if (inv.isSale) {
        if (CREDIT_NOTE_CODES.includes(inv.invoiceType)) neg += inv.totalAmount;
        else pos += inv.totalAmount;
      } else {
        purch += inv.totalAmount;
      }
    });
    return { salesTotal: pos - neg, positiveSales: pos, ncSales: neg, purchasesTotal: purch };
  }, [invoices]);

  const clientCategory = ARCA_CATEGORIES_2026.find(c => c.category === client?.category) || ARCA_CATEGORIES_2026[0];
  const usedPercentage = (salesTotal / clientCategory.maxBilling) * 100;

  const handleShareLink = () => {
    const baseUrl = window.location.href.split('#')[0];
    const publicUrl = `${baseUrl}#/reporte/${id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Reporte - ${client?.name}`,
        text: `Consultá el estado de tu monotributo aquí:`,
        url: publicUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(publicUrl).then(() => {
        toast('🚀 Link de reporte copiado con éxito');
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let imported: Invoice[] = [];
    const isImportingSales = activeTab === TabType.SALES;

    if (selectedFormat === 'csv') {
      const text = await file.text();
      imported = processCsv(text);
    } else if (selectedFormat === 'txt') {
      const text = await file.text();
      imported = processTxtFile(text);
    } else if (selectedFormat === 'xlsx') {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const json: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      imported = json.map(row => {
        const type = String(row['Tipo'] || row['Tipo de Comprobante'] || '011').split('-')[0].trim().padStart(3, '0');
        const amount = parseFloat(String(row['Importe'] || row['Imp. Total'] || row['Total'] || '0').replace(',', '.'));
        const dateRaw = row['Fecha'] || row['Fecha de Emisión'] || '';
        let date = dateRaw;
        if (typeof dateRaw === 'string' && dateRaw.includes('/')) {
            const [d, m, y] = dateRaw.split('/');
            date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return {
          id: Math.random().toString(36).substr(2, 9), clientId: id!,
          date: date || new Date().toISOString().split('T')[0],
          invoiceType: type, invoiceTypeName: INVOICE_TYPES[type] || 'Comprobante',
          pointOfSale: String(row['Punto de Venta'] || '1').padStart(4, '0'),
          number: String(row['Número'] || row['Número Desde'] || '0').padStart(8, '0'),
          description: row['Denominación'] || row['Denominación Emisor'] || row['Denominación Receptor'] || (isImportingSales ? 'Venta' : 'Compra'),
          netAmount: amount, taxAmount: 0, totalAmount: amount, month: 1, year: 2025, isSale: isImportingSales
        };
      });
    }

    if (imported.length > 0) {
      setInvoices(prev => {
        const keys = new Set(prev.map(i => `${i.pointOfSale}-${i.number}-${i.invoiceType}-${i.isSale}`));
        return [...imported.filter(i => !keys.has(`${i.pointOfSale}-${i.number}-${i.invoiceType}-${i.isSale}`)), ...prev];
      });
      toast(`${imported.length} registros procesados`);
    }
    setShowImportModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processCsv = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];
    const isImportingSales = activeTab === TabType.SALES;
    const sep = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      if (!line.trim()) return null;
      const values = line.split(sep).map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((h, i) => row[h] = values[i]);
      const dateRaw = row['Fecha de Emisión'] || row['Fecha'] || '';
      let date = dateRaw;
      if (dateRaw.includes('/')) {
        const [d, m, y] = dateRaw.split('/');
        date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      const total = parseFloat((row['Imp. Total'] || '0').replace(',', '.'));
      const type = (row['Tipo de Comprobante'] || row['Tipo'] || '').split('-')[0].trim().padStart(3, '0');
      let desc = isImportingSales ? (row['Denominación Receptor'] || 'Sin nombre') : (row['Denominación Emisor'] || 'Sin nombre');
      return { id: Math.random().toString(36).substr(2, 9), clientId: id!, date, invoiceType: type, invoiceTypeName: INVOICE_TYPES[type] || `Tipo ${type}`, pointOfSale: (row['Punto de Venta'] || '1').padStart(4, '0'), number: (row['Número Desde'] || '0').padStart(8, '0'), description: desc, netAmount: total, taxAmount: 0, totalAmount: total, month: 1, year: 2025, isSale: isImportingSales };
    }).filter(x => x !== null) as Invoice[];
  };

  const processTxtFile = (text: string) => {
    const lines = text.split(/\r?\n/);
    const importedInvoices: Invoice[] = [];
    const isImportingSales = activeTab === TabType.SALES;

    lines.forEach(line => {
      if (line.trim().length < 20) return;
      let date = '', type = '', pos = '', num = '', total = 0;

      if (line.length > 100) {
        const y = line.substring(0, 4);
        const m = line.substring(4, 6);
        const d = line.substring(6, 8);
        date = `${y}-${m}-${d}`;
        type = line.substring(8, 11);
        pos = line.substring(11, 16);
        num = line.substring(16, 36).replace(/^0+/, '');
        total = parseFloat(line.substring(100, 112).trim()) / 100 || 0;
      } else {
        type = line.substring(0, 3);
        pos = line.substring(3, 8);
        num = line.substring(8, 28).replace(/^0+/, '');
        total = parseFloat(line.substring(38, 50).trim()) / 100 || 0;
        date = new Date().toISOString().split('T')[0];
      }

      importedInvoices.push({
        id: Math.random().toString(36).substr(2, 9),
        clientId: id!,
        date,
        invoiceType: type.padStart(3, '0'),
        invoiceTypeName: INVOICE_TYPES[type.padStart(3, '0')] || `Tipo ${type}`,
        pointOfSale: pos.padStart(4, '0'),
        number: num.padStart(8, '0'),
        description: isImportingSales ? 'Cliente TXT' : 'Proveedor TXT',
        netAmount: total, taxAmount: 0, totalAmount: total,
        month: parseInt(date.split('-')[1] || '1'),
        year: parseInt(date.split('-')[0] || '2025'),
        isSale: isImportingSales
      });
    });
    return importedInvoices;
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const isImportingSales = activeTab === TabType.SALES;
    const newInv: Invoice = {
      id: Math.random().toString(36).substr(2, 9), clientId: id!, date: invoiceForm.date, invoiceType: invoiceForm.type, invoiceTypeName: INVOICE_TYPES[invoiceForm.type] || 'Factura', pointOfSale: invoiceForm.pos, number: invoiceForm.number.padStart(8, '0'), description: invoiceForm.description || (isImportingSales ? 'Venta Manual' : 'Compra Manual'), netAmount: parseFloat(invoiceForm.amount), taxAmount: 0, totalAmount: parseFloat(invoiceForm.amount), month: new Date(invoiceForm.date).getMonth() + 1, year: new Date(invoiceForm.date).getFullYear(), isSale: isImportingSales
    };
    setInvoices([newInv, ...invoices]);
    setShowAddInvoice(null);
    setInvoiceForm({ ...invoiceForm, description: '', number: '', amount: '' });
    toast('Comprobante registrado');
  };

  const clearTabRecords = () => {
    const isTargetingSales = activeTab === TabType.SALES;
    if (window.confirm(`¿Seguro que desea eliminar TODOS los registros de ${isTargetingSales ? 'VENTAS' : 'COMPRAS'}?`)) {
      setInvoices(invoices.filter(inv => inv.isSale !== isTargetingSales));
      toast('Registros eliminados');
    }
  };

  if (!client) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Cargando cliente...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-4">
          <Link to="/dashboard" className="text-slate-400 text-xs font-bold flex items-center gap-2 hover:text-indigo-600 uppercase tracking-widest">
            <i className="fa-solid fa-arrow-left"></i> Volver al Panel
          </Link>
          <h1 className="text-[42px] font-black text-slate-900 tracking-tight leading-none">{client.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-bold text-sm tracking-widest uppercase font-mono">CUIT: {client.cuit}</span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100 uppercase">Cat. {client.category}</span>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleShareLink} className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
            <i className="fa-solid fa-share-nodes"></i> Compartir Dirección Web
          </button>
          <button onClick={() => {setIsSyncing(true); setTimeout(() => setIsSyncing(false), 1500)}} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-black active:scale-95 transition-all">
            <i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'animate-spin' : ''}`}></i> Sincronizar ARCA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <i className="fa-solid fa-arrow-trend-up text-5xl text-emerald-500"></i>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Ventas Netas Anuales</p>
          <p className="text-3xl font-black text-slate-900">$ {salesTotal.toLocaleString('es-AR')}</p>
          <div className="mt-4 space-y-1 text-[10px] font-bold">
             <div className="flex justify-between text-emerald-600"><span>FACTURACIÓN</span><span>+ $ {positiveSales.toLocaleString()}</span></div>
             <div className="flex justify-between text-rose-500"><span>NOTAS CRÉDITO</span><span>- $ {ncSales.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm group">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Egresos Registrados</p>
          <p className="text-3xl font-black text-slate-900">$ {purchasesTotal.toLocaleString('es-AR')}</p>
          <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-slate-300 h-full w-[35%]"></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Límite Categoría</p>
            <p className={`text-3xl font-black mt-1 ${usedPercentage > 90 ? 'text-rose-600' : 'text-indigo-600'}`}>{usedPercentage.toFixed(1)}%</p>
          </div>
          <div className="relative w-16 h-16">
             <svg className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="176" strokeDashoffset={176 * (1 - Math.min(usedPercentage, 100) / 100)} className={usedPercentage > 90 ? 'text-rose-500' : 'text-indigo-600'} strokeLinecap="round" />
             </svg>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-10">
        {[ { id: TabType.SALES, label: 'Ventas' }, { id: TabType.PURCHASES, label: 'Compras' }, { id: TabType.REPORTS, label: 'Informes' }, { id: TabType.NOTES, label: 'Notas' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-5 px-1 text-sm font-black transition-all relative ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
            {tab.label} {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-in slide-in-from-left-1 duration-300"></div>}
          </button>
        ))}
      </div>

      <div className="pt-4 min-h-[400px]">
        {activeTab === TabType.SALES || activeTab === TabType.PURCHASES ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{activeTab === TabType.SALES ? 'Registro de Ventas' : 'Registro de Compras'}</h4>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-3">Desde</span>
                    <input type="month" value={activeTab === TabType.SALES ? salesFilter.start : purchasesFilter.start} onChange={(e) => activeTab === TabType.SALES ? setSalesFilter(p => ({...p, start: e.target.value})) : setPurchasesFilter(p => ({...p, start: e.target.value}))} className="border-none text-xs font-black focus:ring-0 cursor-pointer" />
                  </div>
                  <div className="h-4 w-px bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Hasta</span>
                    <input type="month" value={activeTab === TabType.SALES ? salesFilter.end : purchasesFilter.end} onChange={(e) => activeTab === TabType.SALES ? setSalesFilter(p => ({...p, end: e.target.value})) : setPurchasesFilter(p => ({...p, end: e.target.value}))} className="border-none text-xs font-black focus:ring-0 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={clearTabRecords} className="flex-1 md:flex-none px-5 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Limpiar</button>
                <button onClick={() => setShowImportModal(true)} className="flex-1 md:flex-none px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"><i className="fa-solid fa-file-import"></i> Importar</button>
                <button onClick={() => setShowAddInvoice(activeTab)} className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-black transition-all"><i className="fa-solid fa-plus"></i> Manual</button>
              </div>
            </div>
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr><th className="px-8 py-5">Fecha</th><th className="px-8 py-5">Tipo</th><th className="px-8 py-5">Comprobante</th><th className="px-8 py-5">{activeTab === TabType.SALES ? 'Receptor' : 'Emisor'}</th><th className="px-8 py-5">Total</th><th className="px-8 py-5"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-slate-600">{inv.date}</td>
                        <td className="px-8 py-5">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${CREDIT_NOTE_CODES.includes(inv.invoiceType) ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>{inv.invoiceTypeName}</span>
                        </td>
                        <td className="px-8 py-5 text-sm font-mono text-slate-400">{inv.pointOfSale}-{inv.number}</td>
                        <td className="px-8 py-5 text-sm font-bold text-slate-700 truncate max-w-[200px]">{inv.description}</td>
                        <td className={`px-8 py-5 text-sm font-black ${CREDIT_NOTE_CODES.includes(inv.invoiceType) ? 'text-rose-500' : 'text-slate-900'}`}>{CREDIT_NOTE_CODES.includes(inv.invoiceType) ? '-' : ''} $ {inv.totalAmount.toLocaleString('es-AR')}</td>
                        <td className="px-8 py-5">
                          <button onClick={() => setInvoices(invoices.filter(i => i.id !== inv.id))} className="text-slate-200 hover:text-rose-500 transition-all active:scale-90"><i className="fa-solid fa-trash-can"></i></button>
                        </td>
                      </tr>
                    ))}
                    {displayInvoices.length === 0 && (
                      <tr><td colSpan={6} className="p-32 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <i className="fa-solid fa-file-invoice text-5xl"></i>
                          <p className="font-black text-sm uppercase tracking-widest">Sin comprobantes para este periodo</p>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === TabType.NOTES ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <button onClick={() => setShowAddNote(true)} className="border-4 border-dashed border-slate-100 rounded-[32px] p-10 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-all gap-4 group">
              <i className="fa-solid fa-plus-circle text-4xl group-hover:scale-110 transition-transform"></i>
              <span className="font-black text-xs uppercase tracking-widest">Nueva Nota Técnica</span>
            </button>
            {notes.map(note => (
              <div key={note.id} className="bg-[#fffbeb] p-8 rounded-[32px] border border-[#fef3c7] shadow-sm relative group animate-in zoom-in duration-300">
                <p className="text-[10px] font-black text-[#b45309] mb-4 uppercase tracking-widest">{note.date}</p>
                <h5 className="font-black text-slate-900 text-lg mb-3 tracking-tight">{note.title}</h5>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{note.content}</p>
                <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="absolute top-6 right-6 text-[#b45309] opacity-0 group-hover:opacity-100 transition-all hover:scale-125"><i className="fa-solid fa-trash"></i></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[40px] border border-slate-100 text-center space-y-6 shadow-sm">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <i className="fa-solid fa-rocket text-4xl"></i>
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reportes Avanzados</h3>
               <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">Estamos terminando el generador automático de PDFs para bancos y recategorizaciones.</p>
             </div>
             <div className="pt-4">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Próxima semana</span>
             </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-300 border border-slate-100">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Importar Lote</h3>
                <button onClick={() => setShowImportModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
             </div>
             <div className="space-y-3 mb-10">
                {[ { id: 'csv', label: 'CSV (Comprobantes Recibidos/Emitidos)', icon: 'fa-solid fa-file-csv' }, { id: 'xlsx', label: 'Excel (Planillas Propias)', icon: 'fa-solid fa-file-excel' }, { id: 'txt', label: 'TXT (Sistemas Legacy)', icon: 'fa-solid fa-file-lines' }].map(format => (
                  <button key={format.id} onClick={() => setSelectedFormat(format.id as any)} className={`w-full flex items-center gap-4 p-5 rounded-3xl border-2 transition-all font-bold text-sm ${selectedFormat === format.id ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}>
                    <i className={`${format.icon} text-xl`}></i> {format.label}
                    {selectedFormat === format.id && <i className="fa-solid fa-circle-check ml-auto text-indigo-600"></i>}
                  </button>
                ))}
             </div>
             <button onClick={() => fileInputRef.current?.click()} className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">Seleccionar Archivo</button>
          </div>
        </div>
      )}

      {showAddInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-300 border border-slate-100">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Carga Manual</h3>
                <button onClick={() => setShowAddInvoice(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><i className="fa-solid fa-xmark"></i></button>
             </div>
             <form onSubmit={handleAddInvoice} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fecha Emisión</label>
                  <input type="date" value={invoiceForm.date} onChange={e => setInvoiceForm({...invoiceForm, date: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Descripción de Operación</label>
                  <input placeholder="Ej: Servicios Profesionales" value={invoiceForm.description} onChange={e => setInvoiceForm({...invoiceForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Monto Final ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={invoiceForm.amount} onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})} className="w-full bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 text-4xl font-black text-indigo-700 outline-none placeholder:text-indigo-200" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95">Guardar en Registro</button>
             </form>
          </div>
        </div>
      )}

      {showAddNote && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-300">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10">Crear Nota Técnica</h3>
             <form onSubmit={(e) => {
               e.preventDefault();
               const newNote: Note = { id: Math.random().toString(36).substr(2, 9), clientId: id!, title: noteForm.title, content: noteForm.content, date: new Date().toLocaleDateString('es-AR') };
               setNotes([newNote, ...notes]);
               setShowAddNote(false);
               setNoteForm({ title: '', content: '' });
               toast('Nota archivada correctamente');
             }} className="space-y-6">
                <input placeholder="Asunto de la nota..." required value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} className="w-full border-b-2 border-slate-100 p-3 text-xl font-black text-slate-900 outline-none focus:border-indigo-600 transition-all" />
                <textarea placeholder="Detalles y observaciones..." required value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[32px] p-6 min-h-[180px] resize-none outline-none font-medium text-slate-600 focus:border-indigo-500"></textarea>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowAddNote(false)} className="flex-1 py-5 font-bold text-slate-400 uppercase text-xs tracking-widest">Descartar</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Guardar Nota</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const toast = (msg: string) => {
  const t = document.createElement('div');
  t.className = "fixed bottom-10 right-10 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl animate-in slide-in-from-bottom-5 duration-300 z-[300] border border-slate-700";
  t.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 mr-3"></i> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.classList.add('animate-out', 'fade-out', 'slide-out-to-right-10');
    setTimeout(() => t.remove(), 500);
  }, 3000);
}

export default ClientDetail;