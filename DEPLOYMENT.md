# Guía de Despliegue

Esta guía te ayudará a desplegar el Sistema de Gestión de Citas en diferentes plataformas.

## Opciones de Despliegue

### 1. Vercel (Recomendado para proyectos pequeños a medianos)

1. **Preparar el proyecto**
```bash
npm run build
```

2. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

3. **Desplegar**
```bash
vercel
```

4. **Configurar variables de entorno en Vercel**
- Ve a tu dashboard de Vercel
- Selecciona tu proyecto
- Ve a Settings → Environment Variables
- Agrega las variables necesarias

### 2. Railway

1. **Conectar repositorio**
- Ve a [railway.app](https://railway.app)
- Conecta tu repositorio de GitHub

2. **Configurar build**
- Railway detectará automáticamente el proyecto Node.js
- Build Command: `npm run build`
- Start Command: `npm run start`

3. **Variables de entorno**
- Configura en el dashboard de Railway

### 3. Render

1. **Crear nuevo Web Service**
- Conecta tu repositorio de GitHub
- Build Command: `npm run build`
- Start Command: `npm run start`

2. **Configurar puerto**
- Render asigna automáticamente la variable PORT

### 4. Heroku

1. **Crear aplicación**
```bash
heroku create tu-app-name
```

2. **Configurar buildpack**
```bash
heroku buildpacks:set heroku/nodejs
```

3. **Desplegar**
```bash
git push heroku main
```

### 5. VPS/Servidor Propio

1. **Conectar al servidor**
```bash
ssh usuario@tu-servidor.com
```

2. **Clonar repositorio**
```bash
git clone tu-repositorio.git
cd sistema-gestion-citas
```

3. **Instalar dependencias**
```bash
npm install
```

4. **Construir aplicación**
```bash
npm run build
```

5. **Configurar PM2 (proceso en segundo plano)**
```bash
npm install -g pm2
pm2 start npm --name "gestion-citas" -- run start
pm2 startup
pm2 save
```

6. **Configurar Nginx (opcional)**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Variables de Entorno Requeridas

```bash
NODE_ENV=production
PORT=5000
# Agregar otras variables según necesidades
```

## Configuración de Base de Datos

### PostgreSQL (Para producción)

1. **Instalar dependencias**
```bash
npm install pg @types/pg
```

2. **Configurar variables de entorno**
```bash
DATABASE_URL=postgresql://usuario:password@host:puerto/database
```

3. **Ejecutar migraciones**
```bash
npm run db:push
```

## Consideraciones de Seguridad

1. **Variables de entorno**
   - Nunca commitear archivos .env
   - Usar secretos seguros en producción

2. **HTTPS**
   - Configurar certificados SSL
   - Usar servicios como Let's Encrypt

3. **Límites de velocidad**
   - Implementar rate limiting
   - Usar middleware como express-rate-limit

## Monitoreo y Logs

1. **Logs de aplicación**
```bash
pm2 logs gestion-citas
```

2. **Monitoreo de recursos**
```bash
pm2 monit
```

3. **Servicios externos**
   - Considerar usar servicios como LogRocket, Sentry
   - Configurar alertas de uptime

## Troubleshooting Común

### Error de Puerto
```bash
# Verificar que la aplicación use process.env.PORT
const port = process.env.PORT || 5000;
```

### Problemas de Build
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Errores de Memoria
```bash
# Aumentar límite de memoria para Node.js
NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

## Backup y Mantenimiento

1. **Backup de base de datos**
```bash
pg_dump database_name > backup.sql
```

2. **Actualizaciones**
```bash
git pull origin main
npm install
npm run build
pm2 restart gestion-citas
```

3. **Monitoreo de espacio en disco**
```bash
df -h
```

## Escalabilidad

Para aplicaciones con mayor tráfico, considera:

1. **Load Balancer**
2. **Múltiples instancias de la aplicación**
3. **CDN para archivos estáticos**
4. **Base de datos con replicas de lectura**
5. **Cache con Redis**