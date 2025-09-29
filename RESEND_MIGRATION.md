# Migración a Resend - Guía Técnica

## 🔄 **Cambios Realizados**

### **1. Dependencias Actualizadas**
```json
// functions/package.json - ANTES
"@sendgrid/mail": "^8.1.5"

// functions/package.json - DESPUÉS  
"resend": "^4.0.0"
```

### **2. Configuración de Secretos Firebase**
```bash
# ANTES
firebase functions:secrets:set SENDGRID_API_KEY

# DESPUÉS
firebase functions:secrets:set RESEND_API_KEY
```

### **3. Cambios en el Código**

#### **Import y Setup**
```javascript
// ANTES
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// DESPUÉS
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
```

#### **Formato de Email**
```javascript
// ANTES (SendGrid)
const msg = {
  to: "email@example.com",
  from: { name: "Diego", email: "hola@diegogalmarini.com" },
  subject: "Asunto",
  html: "Contenido"
};
await sgMail.send(msg);

// DESPUÉS (Resend)
const emailData = {
  from: { name: "Diego", email: "hola@diegogalmarini.com" },
  to: ["email@example.com"],  // Debe ser array
  subject: "Asunto", 
  html: "Contenido"
};
const result = await resend.emails.send(emailData);
```

## 🚀 **Pasos para Completar la Migración**

### **1. Configurar API Key de Resend en Firebase**
```bash
cd functions/
firebase functions:secrets:set RESEND_API_KEY
# Introduce tu API key de Resend cuando se solicite
```

### **2. Verificar Dominio en Resend**
- Ve a [resend.com/domains](https://resend.com/domains)
- Agrega `diegogalmarini.com`
- Configura los registros DNS necesarios

### **3. Instalar Nuevas Dependencias**
```bash
cd functions/
npm install resend@^4.0.0
npm uninstall @sendgrid/mail
```

### **4. Desplegar Functions Actualizadas**
```bash
firebase deploy --only functions
```

## ✅ **Verificación**

### **Funciones Actualizadas:**
- ✅ `onConsultationCreated` - Emails automáticos al crear consulta
- ✅ `sendConsultationResponse` - Respuestas a consultas  
- ✅ `sendAppointmentEmail` - Emails de citas

### **Cambios en Formato:**
- ✅ `to` field ahora es array: `["email@example.com"]`
- ✅ Respuesta incluye `result.data.id` para tracking
- ✅ Logging mejorado con IDs de email

## 🔧 **Testing**

### **Test Local (Emulador)**
```bash
cd functions/
firebase emulators:start --only functions
```

### **Test Producción**
1. Crear nueva consulta desde la web
2. Verificar logs en Firebase Console
3. Confirmar recepción de emails

## 📊 **Ventajas de Resend vs SendGrid**

| Característica | SendGrid | Resend |
|---|---|---|
| **Precio** | $19.95/mes | $20/mes |
| **API Simplicidad** | Compleja | Simple |
| **Deliverability** | Buena | Excelente |
| **Developer UX** | Regular | Excelente |
| **Logs & Analytics** | Básico | Detallado |

## 🎯 **Estado Actual**
- ✅ Código migrado completamente
- ⏳ Pendiente: Configurar RESEND_API_KEY en Firebase
- ⏳ Pendiente: Verificar dominio en Resend
- ⏳ Pendiente: Deploy de functions