# NEXO — Red Social

> Una red social para la comunidad gamer que permite compartir publicaciones, interactuar mediante reacciones y comentarios, y conectar con otros jugadores en una plataforma moderna y segura.

---

## ✨ Descripción del proyecto

NEXO es una aplicación web desarrollada como trabajo práctico integrador de Programación IV. El objetivo del proyecto fue diseñar e implementar una red social completa aplicando una arquitectura cliente-servidor, autenticación de usuarios, persistencia de datos y buenas prácticas de desarrollo.

El proyecto combina un frontend moderno con Angular, un backend robusto con NestJS y una base de datos NoSQL en MongoDB, logrando una solución escalable y organizada para aplicaciones sociales.

[📥 Descargar PDF](https://raw.githubusercontent.com/VRodriguezValentin/PrograIV-TP2_Red-Social/main/docs/PROGRAMACION%20IV%20-%20TP%20%232%20-%20Completo%20-%202026.pdf)

---

## 🌟 Características principales

### Autenticación y seguridad

- Registro e inicio de sesión de usuarios.
- Contraseñas protegidas mediante hashing con bcrypt.
- Autenticación basada en JWT.
- Control de acceso mediante guards y roles.
- Validación de datos con DTOs.

### Gestión de usuarios

- Creación y gestión de perfiles.
- Edición de información personal.
- Carga de imagen de perfil.
- Roles de usuario y administrador.
- Baja lógica de usuarios.

### Publicaciones

- Creación de publicaciones con texto e imagen opcional.
- Visualización de contenido en listado dinámico.
- Eliminación de publicaciones propias.
- Ordenamiento por fecha y cantidad de reacciones.
- Paginación de resultados.

### Reacciones y comentarios

- Dar y quitar me gustas.
- Un único me gusta por usuario y publicación.
- Comentarios en publicaciones.
- Edición de comentarios propios.
- Identificación visual de comentarios modificados.
- Paginación y orden por fecha.

### Administración

- Panel de administración para usuarios.
- Dashboard con estadísticas generales.
- Gestión de publicaciones y usuarios.
- Acceso restringido exclusivamente para administradores.

---

## �🛠️ Tecnologías utilizadas

### Frontend

- Angular
- TypeScript
- HTML5
- CSS3 / SCSS

### Backend

- NestJS
- TypeScript
- JWT Authentication
- bcrypt
- Multer + Cloudinary

### Base de datos

- MongoDB
- Mongoose

---

## 🧩 Arquitectura del sistema

La aplicación sigue una arquitectura modular y separada por responsabilidades:

- Frontend: interfaz de usuario interactiva y responsiva.
- Backend: lógica de negocio, autenticación, validaciones y control de acceso.
- Base de datos: almacenamiento de usuarios, publicaciones, comentarios y reacciones.

Esta estructura facilita el mantenimiento, la escalabilidad y la futura incorporación de nuevas funcionalidades.

---

## ▶️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
```

### 2. Backend

```bash
cd nest-app
npm install
cp .env.example .env
npm run start:dev
```

### 3. Frontend

```bash
cd angular-app
npm install
ng serve
```

---

## 📊 Estado del proyecto

El proyecto fue desarrollado mediante una metodología incremental por sprints:

- Sprint 1: Autenticación y gestión de usuarios.
- Sprint 2: Publicaciones y sistema de me gustas.
- Sprint 3: Comentarios y manejo de sesión.
- Sprint 4: Administración y estadísticas.
