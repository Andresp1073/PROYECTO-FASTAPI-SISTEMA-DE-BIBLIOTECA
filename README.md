# Sistema de Biblioteca Web

Una aplicación web completa para gestión de bibliotecas con frontend en React y backend en FastAPI.

##  Tecnologías Utilizadas

### Backend
- **FastAPI** 0.135.1 - Framework web asíncrono
- **SQLAlchemy** 2.0.48 - ORM para base de datos
- **PyMySQL** 1.1.2 - Driver para MySQL
- **Alembic** 1.18.4 - Migraciones de base de datos
- **python-jose** 3.5.0 - Manejo de tokens JWT
- **passlib** + **bcrypt** - Hashing de contraseñas
- **fastapi-mail** 1.6.2 - Envío de correos
- **pydantic-settings** 2.13.1 - Gestión de configuración

### Frontend
- **React** 18 - Biblioteca de UI
- **Vite** - Build tool y servidor de desarrollo
- **React Router** - Enrutamiento del SPA
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Iconos
- **axios** - Cliente HTTP

### Base de Datos
- **MySQL** - Sistema de base de datos relacional

## Estructura del Proyecto

```
PROYECTO-FASTAPI-SISTEMA-DE-BIBLIOTECA/
├── frontend/
│   └── biblioteca_frontend/
│       ├── public/
│       ├── src/
│       │   ├── admin/              # Panel de administración
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AdminCategorias.jsx
│       │   │   ├── AdminLibros.jsx
│       │   │   ├── AdminUsuarios.jsx
│       │   │   ├── AdminPrestamos.jsx
│       │   │   └── AdminCargaMasiva.jsx
│       │   ├── api/                # Cliente HTTP y módulos de API
│       │   │   ├── http.js
│       │   │   ├── auth.js
│       │   │   ├── libros.js
│       │   │   ├── categorias.js
│       │   │   ├── prestamos.js
│       │   │   ├── users.js
│       │   │   ├── uploads.js
│       │   │   └── bulk.js
│       │   ├── auth/               # Autenticación
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   ├── VerifyEmail.jsx
│       │   │   ├── ForgotPassword.jsx
│       │   │   └── ResetPassword.jsx
│       │   ├── catalogo/           # Catálogo público
│       │   │   ├── Home.jsx
│       │   │   ├── Categorias.jsx
│       │   │   ├── ListadoLibros.jsx
│       │   │   └── DetalleLibro.jsx
│       │   ├── context/            # Contextos de React
│       │   │   └── AuthContext.jsx
│       │   ├── layout/             # Componentes de layout
│       │   │   ├── Navegacion.jsx
│       │   │   ├── AuthBridge.jsx
│       │   │   └── RutaProtegida.jsx
│       │   ├── prestamos/          # Préstamos de usuarios
│       │   │   └── MisPrestamos.jsx
│       │   ├── components/         # Componentes reutilizables
│       │   │   ├── Spinner.jsx
│       │   │   └── Alerta.jsx
│       │   ├── App.jsx             # Router principal
│       │   └── main.jsx            # Punto de entrada
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
└── backend/
    ├── core/
    │   └── settings.py            # Configuración con Pydantic
    ├── models/                    # Modelos de base de datos
    ├── routers/                   # Rutas de la API
    ├── main.py                    # Aplicación FastAPI
    ├── requirements.txt           # Dependencias Python
    └── .env                       # Variables de entorno
``` 

## Configuración Local

### Prerrequisitos
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### Backend

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd PROYECTO-FASTAPI-SISTEMA-DE-BIBLIOTECA/backend
   ```

2. **Crear entorno virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**
   Crear archivo `.env` basado en la configuración:
   ```env
   # Base de datos
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=biblioteca_book

   # JWT
   JWT_SECRET_KEY=tu_secreto_super_seguro

   # SMTP (opcional, para verificación de email)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_email@gmail.com
   SMTP_PASSWORD=tu_app_password
   EMAIL_FROM=tu_email@gmail.com
   EMAIL_FROM_NAME="Biblioteca"

   # Frontend
   FRONTEND_URL=http://localhost:5173
   CORS_ORIGINS=http://localhost:5173

   # Admin
   ADMIN_EMAIL=admin@biblioteca.com
   ADMIN_PASSWORD=Admin123*
   ```

5. **Ejecutar migraciones de la base de datos**
   ```bash
   alembic upgrade head
   ```

6. **Iniciar el servidor**
   ```bash
   uvicorn main:app --reload
   ```

   El backend estará disponible en `http://127.0.0.1:8000`

### Frontend

1. **Navegar al directorio del frontend**
   ```bash
   cd ../frontend/biblioteca_frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   El frontend estará disponible en `http://localhost:5173`

## Características Principales

### Autenticación
- Registro de usuarios con verificación por email
- Login con tokens JWT (access + refresh)
- Recuperación de contraseña
- Roles de usuario (USER/ADMIN)

### Gestión de Catálogo
- CRUD de libros
- Gestión de categorías
- Upload de imágenes de portada
- Importación masiva desde CSV

### Préstamos
- Sistema de préstamos para usuarios
- Panel de administración de préstamos
- Control de devoluciones

### Panel de Administración
- Dashboard principal
- Gestión de usuarios
- Reportes y estadísticas
- Carga masiva de datos

## Modelo de Autenticación

El sistema utiliza un esquema de doble token:

- **Access Token**: JWT de corta duración (15 minutos) almacenado en memoria
- **Refresh Token**: Cookie HttpOnly de larga duración (7 días)

El frontend incluye interceptores automáticos para refrescar el token cuando expira.

## API Endpoints

La API expone los siguientes grupos de endpoints:

- `/auth/*` - Autenticación y gestión de usuarios
- `/libros/*` - Gestión del catálogo de libros
- `/categorias/*` - Gestión de categorías
- `/prestamos/*` - Sistema de préstamos
- `/users/*` - Administración de usuarios
- `/uploads/covers` - Upload de imágenes
- `/bulk/libros` - Importación masiva

## UI/UX

- Interfaz responsive con Bootstrap 5
- Modo oscuro por defecto
- Navegación intuitiva
- Componentes reutilizables (Alerta, Spinner)
- Protección de rutas por rol

## Contribución

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit de cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Contacto

- Autor: Andrés Mauricio Peña
- Email: andresmauriciope1073@gmail.com


