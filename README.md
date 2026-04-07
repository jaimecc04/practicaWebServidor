# Practica Web Servidor

API REST desarrollada con Node.js + Express + MongoDB que implementa autenticación con JWT, gestión de usuarios y compañías, control de roles y subida de archivos.


# Tecnologías utilizadas
Node.js (>= 20)
Express 5
MongoDB + Mongoose
JWT (jsonwebtoken)
bcryptjs
Zod (validación)
Multer (subida de archivos)
Helmet + Rate Limit + CORS



# Estructura del proyecto
src/
├── app.js
├── index.js
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── validators/
└── uploads/



# Instalación
1. Clonar el repositorio:

git clone <url-del-repo>
cd practicaWebServidor


2. Instalar dependencias:

npm install


3. Crear archivo .env a partir de .env.example:

cp .env.example .env


4. Configurar variables de entorno:

PORT=3000
MONGO_URI=mongodb://localhost:27017/practica
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=2h



# Ejecución

1. Desarrollo
npm run dev

2. Producción
npm start

Servidor disponible en:

http://localhost:3000



# Autenticación

La API usa JWT.

1. Registro
POST /api/auth/register
2. Login
POST /api/auth/login

Respuesta:

{
  "token": "JWT_TOKEN",
  "user": { ... }
}

# Uso del token

Añadir en headers:

Authorization: Bearer <token>



# Endpoints principales

1. Usuario
GET /api/user/me → Obtener perfil
PATCH /api/user → Actualizar usuario
DELETE /api/user → Eliminar usuario (soft/hard)
PATCH /api/user/password → Cambiar contraseña

2. Compañía
PATCH /api/user/onboarding → Crear / unir a compañía
POST /api/user/invite → Invitar usuario
PATCH /api/user/logo → Subir logo



# Roles

- admin: control total de la compañía
- guest: usuario invitado


# Borrado de usuario

- Soft delete: marca el usuario como eliminado
- Hard delete: elimina definitivamente

Ejemplo:

DELETE /api/user?soft=true



# Subida de archivos
- Endpoint: PATCH /api/user/logo
- Tipo: multipart/form-data
- Campo: logo

Los archivos se guardan en:

/uploads



# Testing

Se incluye archivo:

index.http

Compatible con:

REST Client (VSCode)
Thunder Client
Postman


# Seguridad

Hash de contraseñas con bcrypt
JWT con expiración
Rate limiting
Sanitización de inputs
Helmet
CORS configurado


# Notas
Se requiere MongoDB en ejecución
Node.js 20+
Variables de entorno obligatorias
