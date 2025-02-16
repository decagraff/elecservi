# Proyecto Elecservi

Este es el repositorio para el proyecto **Elecservi**, una aplicación web que utiliza Node.js, EJS, MySQL y CSS. A continuación se describen los pasos necesarios para clonar y ejecutar el proyecto en tu entorno local.

## Requisitos
- **Node.js** (se recomienda la última versión LTS)
- **MySQL** (con el puerto predeterminado o el puerto que elijas)
- **Editor de código** (se recomienda [VSCode](https://code.visualstudio.com/))

## Pasos para ejecutar el proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/decagraff/elecservi.git
```

Esto descargará el proyecto en tu máquina local.

### 2. Abrir el proyecto en VSCode
Navega a la carpeta del proyecto en la terminal:
```bash
cd elecservi
code .
```

### 3. Instalar las dependencias
Una vez que tengas el proyecto abierto en VSCode, instala las dependencias:
```bash
npm install
```

### 4. Crear un archivo .env
Crea un archivo .env en la raíz del proyecto:
```env
PORT=3010                # Puerto para el servidor Node.js
DB_HOST=localhost        # Dirección de la base de datos MySQL
DB_PORT=3310            # Puerto de MySQL
DB_USER=root            # Usuario de la base de datos
DB_PASSWORD=            # Contraseña de la base de datos
DB_NAME=electroservicios_db  # Nombre de la base de datos
SESSION_SECRET=your_secret_key  # Clave secreta para las sesiones
```

### 5. Configurar la base de datos MySQL
Instala MySQL si aún no lo tienes y crea la base de datos con los datos de DB.text:
```sql
CREATE DATABASE electroservicios_db;
```

### 6. Ejecutar el proyecto
Inicia el servidor:
```bash
npm run deca
```

### 7. Acceso a la aplicación
Abre tu navegador y navega a `http://localhost:3010` para ver el proyecto en acción.

## Notas adicionales
- Si tienes problemas con la configuración de MySQL o la conexión de la base de datos, asegúrate de que el servidor MySQL esté en ejecución y que los valores en el archivo .env estén correctos.
- Si deseas cambiar el puerto del servidor o de la base de datos, solo necesitas editar el archivo .env y reiniciar el servidor.

