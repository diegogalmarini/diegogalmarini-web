# 🧪 Guía de Entorno de Pruebas - Sistema CRM Diego Galmarini

## 🚀 Servidor de Desarrollo

### Iniciar el Servidor
```bash
npm run dev
```
**URL**: http://localhost:5173/

## 👤 Credenciales de Prueba

### Usuario de Prueba Principal
- **Email**: `test@diegogalmarini.com`
- **Contraseña**: `TestPassword123!`
- **Tipo**: Cliente regular
- **Datos**: Incluye consultas y citas de prueba

### Usuario Administrador
- **Email**: `diegogalmarini@gmail.com`
- **Contraseña**: [Usar contraseña real del administrador]
- **Tipo**: Administrador (acceso completo)

## 🔧 Scripts de Prueba Disponibles

### 1. Prueba Integral Simplificada ⭐ **RECOMENDADO**
```bash
node simple-system-test.cjs
```
**Propósito**: Prueba integral simplificada del sistema completo. Verifica autenticación, Firestore y servidor web. No requiere índices complejos, prueba rápida y confiable.

### 2. Verificación de Autenticación
```bash
node test-auth-integration.js
```
**Propósito**: Verifica que la autenticación y acceso a Firestore funcionen correctamente.

### 3. Creación de Usuarios de Prueba
```bash
node create-test-user.js
```
**Propósito**: Crea nuevos usuarios de prueba con datos de ejemplo.

### 4. Verificación de Estado de Autenticación
```bash
node test-auth-status.js
```
**Propósito**: Diagnóstica problemas de autenticación básicos.

## 🌐 Rutas de Prueba en la Aplicación Web

### Páginas Principales
- **Inicio**: http://localhost:5173/
- **Servicios**: http://localhost:5173/services
- **Portafolio**: http://localhost:5173/portfolio
- **Acerca de**: http://localhost:5173/about
- **Login**: http://localhost:5173/login

### Dashboard (Requiere Autenticación)
- **Dashboard Principal**: http://localhost:5173/dashboard
- **Consultas**: http://localhost:5173/dashboard?tab=consultations
- **Citas**: http://localhost:5173/dashboard?tab=appointments
- **Calendario**: http://localhost:5173/dashboard?tab=calendar

## 📋 Casos de Prueba Recomendados

### 1. Autenticación
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas
- [ ] Registro de nuevo usuario
- [ ] Logout
- [ ] Persistencia de sesión

### 2. Dashboard de Cliente
- [ ] Visualización de consultas pendientes
- [ ] Visualización de citas programadas
- [ ] Calendario con eventos
- [ ] Estados de consultas (pendiente/respondida)
- [ ] Estados de citas (pendiente de pago/pagada y programada)

### 3. Dashboard de Administrador
- [ ] Vista de todas las consultas
- [ ] Respuesta a consultas
- [ ] Gestión de citas
- [ ] Cambio manual de estados de pago
- [ ] Calendario administrativo

### 4. Booking System
- [ ] Reserva de consulta gratuita
- [ ] Reserva de sesión de 30 minutos
- [ ] Reserva de sesión de 60 minutos
- [ ] Validación de formularios
- [ ] Confirmación por email

## 🐛 Diagnóstico de Problemas

### Error "Service is unavailable"
1. Verificar que el servidor esté ejecutándose: `npm run dev`
2. Comprobar la URL: http://localhost:5173/
3. Revisar la consola del navegador para errores
4. Verificar la configuración de Firebase

### Errores de Permisos de Firestore
1. Ejecutar: `node test-auth-integration.js`
2. Verificar que el usuario esté autenticado
3. Revisar las reglas de Firestore
4. Comprobar la configuración de Firebase

### Problemas de Autenticación
1. Ejecutar: `node test-auth-status.js`
2. Verificar credenciales
3. Crear nuevo usuario de prueba si es necesario
4. Revisar la configuración de Firebase Auth

## 📊 Datos de Prueba

El usuario de prueba incluye:
- **3 Consultas**: Con diferentes estados (pendiente/respondida)
- **3 Citas**: Con diferentes tipos (30/60 min) y estados
- **Fechas variadas**: Para probar el calendario
- **Datos realistas**: Nombres, emails, descripciones

## 🔄 Regenerar Datos de Prueba

Si necesitas datos frescos:
```bash
node create-test-user.js
```

Esto creará nuevos datos de prueba manteniendo el usuario existente.

## 📝 Notas Importantes

- **Firestore**: Configurado con reglas de seguridad que requieren autenticación
- **Firebase Auth**: Configurado para email/password y Google Sign-In
- **Estados**: Sistema diferenciado entre consultas (gratuitas) y citas (de pago)
- **Roles**: Diferenciación automática entre cliente y administrador
- **Responsive**: Diseño adaptable a móviles y desktop

## 🆘 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador
2. Ejecuta los scripts de diagnóstico
3. Verifica que Firebase esté configurado correctamente
4. Asegúrate de que el servidor de desarrollo esté ejecutándose