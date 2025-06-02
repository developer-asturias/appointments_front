# Sistema de Gestión de Citas

Sistema de gestión de citas diseñado para facilitar la programación y administración de reuniones entre estudiantes y mentores. La aplicación ofrece interfaces diferenciadas para múltiples roles, con funcionalidades de búsqueda, edición y cancelación de citas.

## Características Principales

- 🔐 Autenticación de usuarios con roles (estudiante, mentor, admin)
- 📅 Calendarios interactivos para visualización de citas
- 🔍 Búsqueda de citas por email y documento
- ✏️ Gestión completa de citas (crear, editar, cancelar)
- 📊 Dashboard de reportes y estadísticas
- ⏰ Gestión de horarios y disponibilidad de mentores

## Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes de interfaz
- **React Hook Form** con validación Zod
- **TanStack Query** para manejo de estado del servidor
- **Wouter** para enrutamiento
- **Lucide React** para iconos

### Backend
- **Express.js** con TypeScript
- **Drizzle ORM** para manejo de base de datos
- **Zod** para validación de datos
- **Express Session** para autenticación

## Estructura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilidades y configuración
│   │   └── App.tsx         # Componente principal
├── server/                 # Backend Express
│   ├── index.ts            # Servidor principal
│   ├── routes.ts           # Rutas de la API
│   └── storage.ts          # Capa de almacenamiento
├── shared/                 # Código compartido
│   └── schema.ts           # Esquemas de base de datos
└── public/                 # Archivos estáticos
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd sistema-gestion-citas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno** (opcional)
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`

## Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run check` - Verifica tipos de TypeScript

## Roles de Usuario

### Estudiante
- Agendar nuevas citas
- Ver sus citas programadas
- Editar citas pendientes
- Cancelar citas

### Mentor
- Ver citas asignadas
- Gestionar horarios de disponibilidad
- Actualizar estado de citas

### Administrador
- Gestión completa de citas
- Asignar mentores a citas
- Ver reportes y estadísticas
- Gestionar usuarios y configuraciones

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Eliminar cita
- `POST /api/appointments/search` - Buscar citas

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/mentors` - Listar mentores

### Configuración
- `GET /api/programs` - Listar programas
- `GET /api/appointment-types` - Listar tipos de cita
- `GET /api/schedules` - Listar horarios

## Despliegue

### Construcción para Producción
```bash
npm run build
```

### Variables de Entorno de Producción
```bash
NODE_ENV=production
PORT=5000
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Si tienes preguntas o necesitas ayuda, puedes:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo

---

Desarrollado con ❤️ para mejorar la gestión de citas académicas.