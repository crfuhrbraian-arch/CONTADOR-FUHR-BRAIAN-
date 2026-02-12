
import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navegación */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <i className="fa-solid fa-chart-pie text-white"></i>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">MONOTRIBUTO<span className="text-indigo-600">PRO</span></span>
          </div>
          <div className="hidden lg:flex gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Funciones</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">Preguntas</a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">Contacto</a>
          </div>
          <Link to="/login" className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
            Acceso Contador
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-24 pb-32 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
          🚀 El Futuro de la Contabilidad
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
          Menos trámites, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-400">más rentabilidad.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Transforma tu estudio contable con la plataforma que automatiza el seguimiento de categorías y la relación con tus clientes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95">
            Probar Gratis
          </Link>
          <a href="#features" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-600 text-lg font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
            Ver funciones
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-4xl font-black text-slate-900">500+</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Estudios</p>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">12k+</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monotributistas</p>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">100%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Nube</p>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">ARCA</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Integración</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Preguntas Frecuentes</h2>
          <p className="text-slate-500 mt-2">Todo lo que necesitas saber antes de empezar.</p>
        </div>
        <div className="space-y-6">
          {[
            { q: "¿Es seguro el manejo de datos?", a: "Absolutamente. Utilizamos encriptación de grado bancario y tus datos se guardan de forma segura y privada." },
            { q: "¿Cómo se importan las facturas?", a: "Puedes subir los archivos CSV o TXT que descargas directamente desde la web de ARCA (ex-AFIP)." },
            { q: "¿Tengo que pagar por cada cliente?", a: "No, nuestros planes están diseñados para estudios contables de todos los tamaños con clientes ilimitados." }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">{item.q}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-chart-pie text-white text-sm"></i>
              </div>
              <span className="text-xl font-black tracking-tighter">MONOTRIBUTO<span className="text-indigo-400">PRO</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              La plataforma líder para la gestión de monotributo en Argentina. Desarrollada por contadores para contadores.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold uppercase text-[10px] tracking-widest text-indigo-400">Legal</h5>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="hover:text-white cursor-pointer transition-colors">Términos y Condiciones</li>
              <li className="hover:text-white cursor-pointer transition-colors">Privacidad de Datos</li>
              <li className="hover:text-white cursor-pointer transition-colors">Seguridad</li>
            </ul>
          </div>
          <div id="contact" className="space-y-4">
            <h5 className="font-bold uppercase text-[10px] tracking-widest text-indigo-400">Contacto</h5>
            <p className="text-sm text-slate-400">soporte@monotributopro.com</p>
            <div className="flex gap-4 pt-2">
              <i className="fa-brands fa-linkedin text-xl text-slate-500 hover:text-white cursor-pointer"></i>
              <i className="fa-brands fa-instagram text-xl text-slate-500 hover:text-white cursor-pointer"></i>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 border-t border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            © 2024 Monotributo Pro • Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
