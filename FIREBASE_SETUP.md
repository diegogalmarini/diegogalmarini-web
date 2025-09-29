# Configuración de Firebase para Cloud Functions

## Estado Actual
✅ Código de Cloud Functions implementado  
✅ Variables de entorno configuradas (.env)  
✅ Dependencias instaladas (SendGrid, dotenv)  
❌ Plan Blaze requerido para despliegue  

## Pasos para Completar la Configuración

### 1. Actualizar Plan a Blaze
1. Visita: https://console.cloud.google.com/billing/linkedaccount?project=diego-galmarini-oficial-web
2. Agrega una cuenta de facturación
3. Actualiza el proyecto al plan Blaze

### 2. Configurar API Key de SendGrid
1. Edita el archivo `functions/.env`
2. Reemplaza `your_sendgrid_api_key_here` con tu API key real de SendGrid
3. Asegúrate de que la API key comience con "SG."

### 3. Desplegar Cloud Functions
Una vez completados los pasos anteriores:
```bash
cd functions
firebase deploy --only functions
```

## Funciones Implementadas

### `onConsultationCreated`
- Se ejecuta automáticamente cuando se crea una nueva consulta
- Envía email de confirmación al cliente
- Envía notificación a Diego

### `sendConsultationResponse`
- Función callable para enviar respuestas a consultas
- Actualiza el estado de la consulta en Firestore
- Envía email con la respuesta al cliente

## Verificación Post-Despliegue
1. Crear una consulta de prueba desde la web
2. Verificar que lleguen los emails
3. Responder desde el dashboard de administración
4. Confirmar que el cliente reciba la respuesta

## Troubleshooting
- Si los emails no llegan, verificar la configuración de SendGrid
- Si las funciones fallan, revisar los logs en Firebase Console
- Asegurar que todas las APIs estén habilitadas en Google Cloud Console