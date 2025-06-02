# Guía de Configuración Paso a Paso

Esta guía te ayudará a configurar el proyecto desde cero en tu máquina local.

## Paso 1: Preparar el Entorno

### Verificar Node.js
```bash
node --version
# Debe ser v18 o superior
npm --version
```

Si no tienes Node.js instalado:
- Descarga desde [nodejs.org](https://nodejs.org/)
- O usa un manejador de versiones como nvm

## Paso 2: Clonar y Configurar

### Descargar el proyecto
```bash
# Si descargaste como ZIP, extrae y navega al directorio
cd sistema-gestion-citas

# O si clonaste desde GitHub
git clone <tu-repositorio-url>
cd sistema-gestion-citas
```

### Instalar dependencias
```bash
npm install
```

## Paso 3: Verificar la Instalación

### Ejecutar en modo desarrollo
```bash
npm run dev
```

Deberías ver:
```
[express] serving on port 5000
```

### Abrir en el navegador
Visita `http://localhost:5000`

## Paso 4: Usuarios de Prueba

El sistema incluye usuarios predeterminados:

### Administrador
- **Email**: admin@example.com
- **Contraseña**: admin123
- **Acceso**: Panel completo de administración

### Mentor
- **Email**: mentor@example.com
- **Contraseña**: mentor123
- **Acceso**: Gestión de citas asignadas

### Estudiante
- **Email**: student@example.com
- **Contraseña**: student123
- **Acceso**: Crear y gestionar sus citas

## Paso 5: Funcionalidades Disponibles

### Como Estudiante:
1. Ir a la página principal
2. Llenar el formulario de cita
3. Buscar citas existentes con email y documento

### Como Administrador:
1. Hacer login con credenciales de admin
2. Ver todas las citas en el dashboard
3. Asignar mentores a las citas
4. Ver reportes y estadísticas

### Como Mentor:
1. Hacer login con credenciales de mentor
2. Ver citas asignadas
3. Gestionar horarios de disponibilidad

## Paso 6: Estructura de Datos

### Programas Disponibles:
- Desarrollo Web Full Stack
- Ciencia de Datos
- Diseño UX/UI
- Marketing Digital

### Tipos de Cita:
- Consulta Inicial (30 min)
- Sesión de Mentoría (60 min)
- Revisión de Proyecto (45 min)
- Consulta Técnica (30 min)

## Troubleshooting

### Error de Puerto Ocupado
```bash
# Cambiar puerto en package.json o matar proceso
lsof -ti:5000 | xargs kill -9
```

### Problemas de Dependencias
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
```

### Error de TypeScript
```bash
# Verificar tipos
npm run check
```

## Desarrollo

### Agregar Nuevos Componentes
Los componentes de UI están en `client/src/components/`

### Modificar API
Las rutas están en `server/routes.ts`

### Cambiar Estilos
Usa clases de Tailwind CSS o modifica `client/src/index.css`

### Base de Datos
Actualmente usa almacenamiento en memoria. Para persistencia:
1. Configurar PostgreSQL
2. Actualizar las variables de entorno
3. Ejecutar migraciones

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Verificar tipos
npm run check

# Construir para producción
npm run build

# Ejecutar en producción
npm run start

# Migraciones de DB (si usas base de datos)
npm run db:push
```

## Próximos Pasos

1. Personalizar la interfaz según tus necesidades
2. Configurar base de datos para persistencia
3. Agregar funcionalidades específicas
4. Preparar para despliegue (ver DEPLOYMENT.md)

## Soporte

Si encuentras problemas:
1. Verifica que todas las dependencias estén instaladas
2. Revisa los logs en la consola
3. Consulta la documentación de las tecnologías usadas