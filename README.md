
# Monotributo Pro 🚀

Sistema de gestión contable diseñado para contadores independientes. Permite el seguimiento de facturación, límites de categorías y exportación de reportes para clientes.

## 🛠️ Estructura del Proyecto

- `index.html`: Punto de entrada con Tailwind CSS y React via ESM.
- `App.tsx`: Enrutamiento y lógica principal de la sesión.
- `/pages`: Vistas de Dashboard, Login, Clientes y Reporte Público.
- `constants.tsx`: Valores actualizados de escalas ARCA 2026.

## 🚀 Despliegue Genérico (Vercel, GitHub Pages, Hostinger)

Este proyecto es una **Single Page Application (SPA)** de "Cero Compilación". 
1. Sube todos los archivos a tu servidor.
2. Asegúrate de que el servidor sirva `index.html` para todas las peticiones (ya manejado por `HashRouter`).
3. No requiere `npm install` ni `npm build` en el servidor, ya que usa `esm.sh` y Babel Standalone.

## 📄 Licencia
Privado - Uso Profesional.
