# Sistema de Respuesta a Consultas

## Descripción

Este módulo implementa un sistema completo de respuesta a consultas para el CRM, permitiendo a los usuarios responder directamente a las consultas de los clientes mediante diferentes canales de comunicación.

## Componentes Implementados

### ResponseForm.tsx

Componente principal para responder a consultas que incluye:

- **Formulario de respuesta** con validación usando `react-hook-form` y `yup`
- **Tipos de comunicación** soportados: Email, Llamada telefónica, Nota interna
- **Sistema de plantillas** predefinidas para respuestas comunes
- **Reemplazo de variables** dinámicas en las plantillas
- **Integración** con el sistema de logs de comunicación
- **Simulación de envío** de emails (preparado para integración real)

#### Características principales:

1. **Validación de formulario**:
   - Tipo de comunicación requerido
   - Asunto requerido (mínimo 3 caracteres)
   - Contenido requerido (mínimo 10 caracteres)

2. **Plantillas predefinidas**:
   - Confirmación de recepción
   - Solicitud de información adicional
   - Propuesta de reunión
   - Respuesta de seguimiento

3. **Variables dinámicas**:
   - `{clientName}`: Nombre del cliente
   - `{subject}`: Asunto de la consulta original
   - `{originalMessage}`: Mensaje original de la consulta

4. **Registro automático**:
   - Crea un log de comunicación automáticamente
   - Marca la dirección como 'outbound'
   - Registra el estado como 'sent'

## Integración con ConsultationDetail

El componente `ResponseForm` se integra con `ConsultationDetail` mediante:

- **Modal de respuesta** que se abre al hacer clic en "Responder"
- **Botón condicional** que solo aparece para consultas con estado 'pending'
- **Actualización automática** del historial de comunicaciones
- **Manejo de estados** del modal (abrir/cerrar)

## Tipos de Datos

Se han agregado nuevos tipos en `types/crm.ts`:

```typescript
export interface ConsultationFormData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  description: string;
  planType: string;
  priority: Consultation['priority'];
  status: Consultation['status'];
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}

export interface CommunicationFormData {
  clientId: string;
  consultationId?: string;
  appointmentId?: string;
  type: CommunicationLog['type'];
  direction: CommunicationLog['direction'];
  subject: string;
  content: string;
  status: CommunicationLog['status'];
  templateId?: string;
  attachments?: string[];
  createdBy: string;
}
```

## Hooks Utilizados

- `useCommunicationLogs()`: Para crear y gestionar logs de comunicación
- `useForm()`: Para manejo del formulario con validación
- `useState()`: Para gestión de estado local del componente

## Servicios Backend

Utiliza el `communicationLogService` de `services/firestore.ts` que proporciona:

- `create()`: Crear nuevos logs de comunicación
- `getByClient()`: Obtener logs por cliente

## Próximas Mejoras

1. **Integración real de email**: Conectar con servicios como SendGrid, Mailgun, etc.
2. **Adjuntos**: Permitir adjuntar archivos a las respuestas
3. **Plantillas personalizables**: Sistema de gestión de plantillas por usuario
4. **Notificaciones**: Alertas cuando se envían respuestas
5. **Historial de borradores**: Guardar borradores de respuestas
6. **Respuestas automáticas**: Sistema de auto-respuesta basado en reglas
7. **Integración con calendario**: Proponer citas directamente desde la respuesta
8. **Métricas de respuesta**: Tiempo de respuesta, tasa de conversión, etc.

## Uso

1. Navegar a una consulta en estado 'pending'
2. Hacer clic en el botón "Responder"
3. Seleccionar el tipo de comunicación
4. Opcionalmente, aplicar una plantilla predefinida
5. Completar el asunto y contenido
6. Enviar la respuesta

La respuesta se registrará automáticamente en el historial de comunicaciones de la consulta.