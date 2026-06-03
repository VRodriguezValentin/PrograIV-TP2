# Red Social - TP #2

## Descripción

Red Social es una aplicación web desarrollada como trabajo práctico utilizando Angular para el frontend, NestJS para el backend y MongoDB como base de datos.

La plataforma permite a los usuarios registrarse, iniciar sesión, crear publicaciones, reaccionar con "Me gusta", comentar publicaciones y administrar su perfil personal.

El sistema implementa autenticación mediante JWT, control de roles (usuario y administrador), paginación, carga de imágenes y estadísticas administrativas.

---

## Tecnologías utilizadas

### Frontend

* Angular
* TypeScript
* HTML5
* CSS3 / SCSS

### Backend

* NestJS
* TypeScript
* JWT Authentication
* bcrypt
* Multer + Cloudinary

### Base de datos

* MongoDB
* Mongoose

---

## Funcionalidades principales

### Autenticación

* Registro de usuarios.
* Inicio de sesión.
* Contraseñas encriptadas.
* Autenticación mediante JWT.
* Validación y renovación de token.
* Control de acceso mediante Guards.

### Gestión de usuarios

* Visualización de perfil.
* Edición de perfil.
* Imagen de perfil.
* Roles:

  * Usuario
  * Administrador
* Alta y baja lógica de usuarios.

### Publicaciones

* Crear publicaciones.
* Listar publicaciones.
* Eliminar publicaciones propias.
* Baja lógica de publicaciones.
* Imagen opcional por publicación.
* Ordenamiento por:

  * Fecha
  * Cantidad de Me Gusta
* Paginación de resultados.

### Reacciones

* Dar Me Gusta.
* Quitar Me Gusta.
* Un único Me Gusta por usuario y publicación.

### Comentarios

* Crear comentarios.
* Editar comentarios propios.
* Identificación de comentarios editados.
* Paginación de comentarios.
* Ordenamiento por fecha.

### Administración

* Dashboard de usuarios.
* Dashboard de estadísticas.
* Gestión de usuarios.
* Gestión de publicaciones.
* Acceso restringido para administradores.

### Estadísticas

* Publicaciones realizadas por usuario.
* Comentarios realizados en un período.
* Comentarios por publicación.
* Visualización mediante gráficos.

---

## Instalación

### Clonar repositorio

```bash
git clone <url-del-repositorio>
```

### Backend

```bash
cd nest-app
npm install
cp .env.example .env
npm run start:dev
```

### Frontend

```bash
cd angular-app
npm install
ng serve
```

---

## Seguridad

* Contraseñas almacenadas utilizando bcrypt.
* Tokens JWT con expiración de 15 minutos.
* Validación de roles.
* Protección de rutas privadas.
* Validación de datos mediante DTOs.

---

## Estado del proyecto

Proyecto desarrollado siguiendo metodología incremental mediante sprints:

* Sprint 1: Autenticación y usuarios.
* Sprint 2: Publicaciones y Me Gusta.
* Sprint 3: Comentarios y manejo de sesión.
* Sprint 4: Administración y estadísticas.
