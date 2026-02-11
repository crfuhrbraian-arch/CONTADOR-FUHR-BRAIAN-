# 1. Inicializar el repositorio local
git init

# 2. Agregar todos los archivos al "paquete" para subir
git add .

# 3. Ponerle un nombre a esta versión (Primer guardado)
git commit -m "Versión inicial de Monotributo Pro"

# 4. Crear la rama principal
git branch -M main

# 5. Conectar tu PC con el link de GitHub (Copia el link de TU repo de GitHub)
git remote add origin https://github.com/TU_USUARIO/monotributo-pro.git

# 6. Subir los archivos finalmente
git push -u origin main