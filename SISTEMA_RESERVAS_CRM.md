# Sistema de Reservas y CRM - Diego Galmarini

## 📋 Resumen del Sistema

### Flujo Cliente (Público)

1. **Solicitud de Consulta**
   - El cliente accede desde "Agendar Llamada" en el sitio web
   - **NO requiere registro ni login**
   - Selecciona fecha y hora disponible
   - Elige duración: Actualmente 30 minutos (se puede configurar para ofrecer 15, 20 o 30 min)
   - Completa formulario:
     - Nombre
     - Email  
     - Descripción del proyecto/problema (mínimo 200 caracteres)

2. **Confirmación Automática**
   - El sistema guarda la solicitud en Firestore
   - **Resend envía emails automáticamente**:
     - ✅ Email al cliente con confirmación
     - ✅ Email a Diego con los datos de la consulta
   - Cliente recibe enlaces para agregar al calendario (Google Calendar, .ics)

### Flujo Administrador (Privado)

1. **Acceso al CRM**
   - URL oculta: `diegogalmarini.com/#/micrm`
   - **NO aparece en la navegación pública**
   - Solo accesible conociendo la URL directa

2. **Gestión de Consultas**
   - Diego revisa las solicitudes recibidas
   - Puede ver todos los detalles:
     - Información del cliente
     - Fecha/hora solicitada
     - Descripción del proyecto
   - **Aprueba o rechaza** según le interese el caso
   - Realiza seguimiento de clientes

## 🎯 Configuración Actual

### Tipos de Consulta
- **Sesión Estratégica de Innovación**: 30 minutos
- Formato: Virtual (Google Meet/Zoom)
- **Gratuita** (por ahora)

### Futuro: Sistema de Pagos
- Consultas de 30 minutos podrían ser de pago
- Diferenciación entre:
  - **Consultas/Asesorías**: Auditorías, análisis (ejemplo: auditar campaña Google)
  - **Servicios**: Implementación específica (ejemplo: configurar campaña Google)

## 🔐 Rutas de Acceso

### Públicas
- `/` - Home
- `/services` - Servicios
- `/portfolio` - Casos de Estudio
- `/about` - Sobre Mí
- `/terms-of-service` - Términos
- `/privacy-policy` - Privacidad

### Privadas (No visibles en navegación)
- `/micrm` - Panel CRM principal ⭐ **NUEVA RUTA**
- `/paneldecontrol` - Panel de administración alternativo
- `/admin/crm` - Vista CRM detallada
- `/dashboard` - Panel cliente (si se usa autenticación)

## 🚀 Próximos Pasos Sugeridos

1. **Configurar Duraciones Múltiples**
   - Modificar BookingModal para ofrecer 15, 20, 30 min
   - Ajustar precios futuros según duración

2. **Sistema de Aprobación**
   - Mejorar interfaz de aprobación/rechazo en el CRM
   - Enviar email de confirmación tras aprobación manual

3. **Integración de Pagos (Futuro)**
   - Stripe para consultas premium
   - Diferenciación consulta gratis vs. pagada

4. **Optimizaciones**
   - Sincronización con Google Calendar (automática)
   - Recordatorios automáticos 24h antes
   - Sistema de notas internas para cada cliente

## 📧 Configuración Resend

Actualmente funcionando:
- ✅ Email confirmación al cliente
- ✅ Email notificación a admin (diegogalmarini@gmail.com)
- ✅ Adjunto .ics para calendario
- ✅ Enlaces para Google Calendar

## 🔧 Archivos Clave

- `/src/components/BookingModal.tsx` - Formulario de reserva
- `/src/components/Layout.tsx` - Navegación (limpia, sin links CRM)
- `/src/App.tsx` - Rutas (CRM en /micrm)
- `/functions/index.js` - Cloud Function para Resend
- `/src/pages/DirectAdminAccess.tsx` - Panel CRM principal

---

**Autor**: Diego Galmarini  
**Última actualización**: 20 Nov 2025  
**Tecnologías**: React + TypeScript + Firebase + Resend
