# 🚀 Socio Tecnológico Estratégico - Diego Galmarini

## 📋 Descripción del Proyecto

Aplicación web completa para consultoría tecnológica estratégica que incluye un sitio corporativo profesional y un sistema CRM avanzado para gestión de clientes, citas y comunicaciones.

## ✨ Características Principales

### 🌐 Sitio Web Corporativo
- **Diseño Moderno**: Interfaz elegante con soporte para tema claro/oscuro
- **Responsive**: Optimizado para todos los dispositivos
- **Testimonios**: 30 testimonios reales con fotos
- **Logos de Clientes**: 30 logos de empresas en formato SVG
- **Portafolio**: Casos de éxito y proyectos destacados
- **Sistema de Reservas**: Modal integrado para agendar citas

### 🔐 Sistema de Autenticación
- **Firebase Auth**: Autenticación segura con email/password
- **Roles de Usuario**: Diferenciación entre admin y clientes
- **Recuperación de Contraseña**: Sistema completo de reset
- **Protección de Rutas**: Acceso controlado al dashboard

### 📊 Dashboard CRM Avanzado
- **Gestión de Citas**: Calendario interactivo con slots de 30 minutos
- **Base de Datos de Clientes**: Información completa y historial
- **Sistema de Plantillas**: Mensajes personalizables con variables dinámicas
- **Seguimientos**: Gestión de tareas con prioridades y tipos
- **Registro de Comunicaciones**: Historial completo de interacciones
- **Métricas en Tiempo Real**: Dashboard con estadísticas clave

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **React Router DOM** para navegación
- **React Icons** para iconografía

### Backend/Servicios
- **Firebase Authentication** para autenticación
- **Firebase Firestore** para base de datos
- **Firebase Hosting** para despliegue

### Herramientas de Desarrollo
- **TypeScript** para tipado estático
- **ESLint** para linting
- **PostCSS** y **Autoprefixer**

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- npm o yarn
- Cuenta de Firebase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone [url-del-repositorio]
cd diegogalmarini-web-style
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password)
   - Crear base de datos Firestore
   - Obtener configuración del proyecto

4. **Variables de entorno**
   Crear archivo `.env` en la raíz:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Build para producción**
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
proyecto/
├── components/           # Componentes reutilizables
│   ├── AuthModal.tsx
│   ├── BookingModal.tsx
│   ├── Layout.tsx
│   └── ...
├── contexts/            # Contextos de React
│   ├── AuthContext.tsx
│   └── PlansContext.tsx
├── pages/               # Páginas principales
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   └── ...
├── public/              # Archivos estáticos
│   ├── client-logos/    # 30 logos SVG
│   └── testimonials/    # Fotos de testimonios
├── functions/           # Firebase Functions
├── App.tsx              # Componente raíz
├── firebaseConfig.ts    # Configuración Firebase
└── index.css           # Estilos globales
```

## 🎯 Funcionalidades del CRM

### 📅 Gestión de Citas
- **Calendario Visual**: Vista mensual con navegación
- **Slots de Tiempo**: Intervalos de 30 minutos (10:00-18:00)
- **Estados de Citas**: Programada, Completada, Cancelada
- **Tipos de Sesión**: Gratis (30min), Estratégica (30min), Completa (60min)
- **Bloqueo de Horarios**: Gestión de disponibilidad

### 📧 Sistema de Plantillas
- **Variables Dinámicas**: `{clientName}`, `{date}`, `{time}`, `{duration}`, `{planType}`
- **Tipos de Plantilla**: Confirmación, Recordatorio, Cambio, Cancelación, Seguimiento
- **Preview en Tiempo Real**: Vista previa con datos reales

### 📋 Seguimientos
- **Tipos**: Llamada, Email, Reunión, Tarea
- **Prioridades**: Baja, Media, Alta
- **Estados**: Pendiente, Completado, Cancelado
- **Fechas de Vencimiento**: Control de deadlines

### 💬 Registro de Comunicaciones
- **Tipos**: Email, Llamada, Reunión, Nota
- **Estados**: Enviado, Recibido, Pendiente, Completado
- **Historial Completo**: Trazabilidad total

## 🎨 Personalización

### Temas
Soporte completo para tema claro/oscuro con variables CSS:
```css
:root {
  --primary-color: #3b82f6;
  --text-color: #1f2937;
  --bg-color: #ffffff;
  /* ... más variables */
}
```

### Componentes
- **Modular**: Componentes reutilizables
- **Tipado**: TypeScript en todos los componentes
- **Responsive**: Diseño adaptativo

## 📊 Métricas del Dashboard

- **Total de Consultas**: Contador general
- **Consultas Pendientes**: Requieren respuesta
- **Citas Programadas**: Próximas citas
- **Clientes Registrados**: Base de usuarios
- **Tasa de Respuesta**: Eficiencia de respuestas

## 🔒 Seguridad

- **Autenticación Firebase**: Seguridad empresarial
- **Protección de Rutas**: Acceso controlado
- **Validación de Datos**: Sanitización de inputs
- **Roles y Permisos**: Control de acceso granular

## 🚀 Despliegue

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
npm run build
# Conectar repositorio en Vercel Dashboard
```

## 📚 Documentación Adicional

- **[Documentación Completa](./DOCUMENTACION_PROYECTO_COMPLETO.md)**: Guía detallada del proyecto
- **[Código Fuente Principal](./CODIGO_FUENTE_PRINCIPAL.md)**: Componentes principales

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Diego Galmarini.

## 📞 Contacto

- **Email**: diego@diegogalmarini.com
- **LinkedIn**: [Diego Galmarini](https://linkedin.com/in/diegogalmarini)
- **Web**: [diegogalmarini.com](https://diegogalmarini.com)

---

**Desarrollado con ❤️ por Diego Galmarini**  
*Socio Tecnológico Estratégico*

## 🎯 Próximas Mejoras

- [ ] Integración con servicios de email (SendGrid/Mailgun)
- [ ] Notificaciones push en tiempo real
- [ ] Generación de reportes PDF
- [ ] API REST completa
- [ ] Aplicación móvil
- [ ] Integración con Google Calendar
- [ ] Sistema de pagos (Stripe/PayPal)
- [ ] Chat en tiempo real
- [ ] Analytics avanzados
- [ ] Backup automático de datos

## 📈 Estadísticas del Proyecto

- **Líneas de Código**: ~3,000+
- **Componentes**: 15+
- **Páginas**: 8
- **Funcionalidades CRM**: 20+
- **Plantillas de Mensaje**: 5
- **Testimonios**: 30
- **Logos de Clientes**: 30
