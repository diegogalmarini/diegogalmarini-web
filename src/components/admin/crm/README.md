# Módulo CRM - Sistema de Gestión de Relaciones con Clientes

Este módulo proporciona un sistema completo de CRM (Customer Relationship Management) para gestionar consultas, clientes, citas y disponibilidad.

## 🏗️ Arquitectura

### Estructura de Carpetas

```
crm/
├── CRMDashboard.tsx          # Componente principal del dashboard
├── index.ts                   # Exportaciones principales
├── README.md                  # Documentación
├── consultations/             # Módulo de consultas
│   ├── ConsultationList.tsx
│   ├── ConsultationForm.tsx
│   └── ConsultationDetail.tsx
├── clients/                   # Módulo de clientes
│   ├── ClientList.tsx
│   ├── ClientForm.tsx
│   └── ClientDetail.tsx
├── appointments/              # Módulo de citas
│   ├── AppointmentList.tsx
│   └── AppointmentForm.tsx
├── availability/              # Módulo de disponibilidad
│   └── AvailabilityManager.tsx
└── ui/                        # Componentes UI reutilizables
    ├── LoadingSpinner.tsx
    ├── Alert.tsx
    ├── Modal.tsx
    ├── Badge.tsx
    ├── Button.tsx
    ├── Table.tsx
    ├── FormField.tsx
    └── Calendar.tsx
```

### Dependencias Externas

- **Firebase/Firestore**: Base de datos en tiempo real
- **React Hook Form**: Gestión de formularios
- **Yup**: Validación de esquemas
- **Headless UI**: Componentes accesibles
- **Heroicons**: Iconografía
- **Tailwind CSS**: Estilos

## 🚀 Características Principales

### 1. Dashboard Principal
- **Métricas en tiempo real**: Consultas pendientes, citas del día, clientes activos
- **Actividad reciente**: Últimas consultas, citas y clientes registrados
- **Acciones rápidas**: Crear consultas, clientes y citas
- **Navegación por pestañas**: Acceso rápido a todos los módulos

### 2. Gestión de Consultas
- **Lista con filtros avanzados**: Por estado, prioridad, tipo de plan, fechas
- **Formulario completo**: Información del cliente, preferencias, notas internas
- **Vista detallada**: Historial de comunicaciones y seguimientos
- **Estados**: Pendiente, En progreso, Completada, Cancelada
- **Prioridades**: Baja, Media, Alta, Urgente

### 3. Gestión de Clientes
- **Base de datos completa**: Información personal, profesional y preferencias
- **Sistema de etiquetas**: Categorización personalizable
- **Historial de interacciones**: Consultas y comunicaciones
- **Validación de email único**: Previene duplicados
- **Estados**: Activo, Inactivo, Prospecto

### 4. Gestión de Citas
- **Calendario integrado**: Visualización mensual y diaria
- **Programación inteligente**: Verificación de disponibilidad
- **Tipos de cita**: Consulta inicial, Seguimiento, Reunión, Llamada
- **Recordatorios**: Sistema de notificaciones
- **Integración con clientes**: Selección y búsqueda de clientes

### 5. Gestión de Disponibilidad
- **Horarios semanales**: Configuración por día de la semana
- **Períodos bloqueados**: Vacaciones, días festivos, compromisos
- **Slots de tiempo**: Duración personalizable
- **Horarios predefinidos**: Plantillas comunes (9-17, 10-18, etc.)

## 🛠️ Uso del Módulo

### Importación Básica

```typescript
import { CRMDashboard } from '@/components/admin/crm';

// En tu componente
function AdminPanel() {
  return (
    <div>
      <CRMDashboard />
    </div>
  );
}
```

### Uso de Componentes Individuales

```typescript
import {
  ConsultationList,
  ClientForm,
  AppointmentList,
  useConsultations,
  useClients
} from '@/components/admin/crm';

function CustomCRMView() {
  const { consultations, loading } = useConsultations();
  const { createClient } = useClients();

  return (
    <div>
      <ConsultationList />
      <ClientForm onSubmit={createClient} />
      <AppointmentList />
    </div>
  );
}
```

### Hooks Disponibles

```typescript
// Hook para consultas
const {
  consultations,
  loading,
  error,
  createConsultation,
  updateConsultation,
  deleteConsultation
} = useConsultations({
  filters: { status: 'pending' },
  pagination: { page: 1, limit: 10 },
  sort: { field: 'createdAt', direction: 'desc' }
});

// Hook para clientes
const {
  clients,
  loading,
  error,
  createClient,
  updateClient,
  deleteClient
} = useClients();

// Hook para métricas del dashboard
const { metrics, loading, error } = useDashboardMetrics();
```

## 🎨 Componentes UI Reutilizables

### Botones
```typescript
import { Button, PrimaryButton, DangerButton } from '@/components/admin/crm';

<Button variant="outline" size="sm">Cancelar</Button>
<PrimaryButton loading={isSubmitting}>Guardar</PrimaryButton>
<DangerButton onClick={handleDelete}>Eliminar</DangerButton>
```

### Formularios
```typescript
import { Input, Select, TextArea } from '@/components/admin/crm';

<Input
  label="Nombre"
  placeholder="Ingresa el nombre"
  error={errors.name?.message}
  {...register('name')}
/>

<Select
  label="Estado"
  options={statusOptions}
  {...register('status')}
/>

<TextArea
  label="Descripción"
  rows={4}
  {...register('description')}
/>
```

### Tablas
```typescript
import { Table } from '@/components/admin/crm';

<Table
  columns={columns}
  data={data}
  loading={loading}
  pagination={{
    currentPage: 1,
    totalPages: 10,
    onPageChange: handlePageChange
  }}
  sortable
  onSort={handleSort}
/>
```

### Modales
```typescript
import { Modal } from '@/components/admin/crm';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Crear Cliente"
  size="lg"
>
  <ClientForm onSubmit={handleSubmit} />
</Modal>
```

## 📊 Tipos de Datos

### Consulta
```typescript
interface Consultation {
  id: string;
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  planType: 'basic' | 'standard' | 'premium' | 'enterprise';
  clientEmail: string;
  clientName: string;
  clientPhone?: string;
  preferredDate?: Date;
  preferredTime?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Cliente
```typescript
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'prospect';
  address?: string;
  company?: string;
  position?: string;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';
  language: string;
  timezone: string;
  tags: string[];
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Cita
```typescript
interface Appointment {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  clientName: string;
  type: 'consultation' | 'follow_up' | 'meeting' | 'call';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  startTime: Date;
  endTime: Date;
  duration: number;
  location?: string;
  meetingUrl?: string;
  internalNotes?: string;
  reminders: Date[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Configuración

### Variables de Entorno
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Consultas
    match /consultations/{consultationId} {
      allow read, write: if request.auth != null;
    }
    
    // Clientes
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    
    // Citas
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    
    // Disponibilidad
    match /availability/{availabilityId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Rendimiento

### Optimizaciones Implementadas

1. **React.memo**: Componentes memorizados para evitar re-renderizados innecesarios
2. **useCallback**: Funciones memorizadas en hooks y componentes
3. **useMemo**: Cálculos costosos memorizados
4. **Paginación**: Carga de datos por páginas para mejorar rendimiento
5. **Lazy Loading**: Carga diferida de componentes pesados
6. **Debouncing**: En búsquedas y filtros para reducir llamadas a la API

### Mejores Prácticas

1. **Componentización**: Componentes pequeños y reutilizables (<300 líneas)
2. **Tipado fuerte**: TypeScript en todo el código
3. **Gestión de errores**: Manejo adecuado de estados de error y carga
4. **Accesibilidad**: Componentes accesibles con Headless UI
5. **Responsive**: Diseño adaptable a diferentes dispositivos

## 🧪 Testing

### Estructura de Tests
```
__tests__/
├── components/
│   ├── CRMDashboard.test.tsx
│   ├── ConsultationList.test.tsx
│   └── ClientForm.test.tsx
├── hooks/
│   └── useCRM.test.ts
└── utils/
    └── dateUtils.test.ts
```

### Ejemplo de Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsultationForm } from '@/components/admin/crm';

describe('ConsultationForm', () => {
  it('should render form fields correctly', () => {
    render(<ConsultationForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText('Asunto')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de plan')).toBeInTheDocument();
  });
  
  it('should validate required fields', async () => {
    const onSubmit = jest.fn();
    render(<ConsultationForm onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByText('Guardar'));
    
    expect(await screen.findByText('El asunto es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

## 📈 Métricas y Analytics

El módulo incluye un sistema de métricas que proporciona:

- **Consultas**: Pendientes, en progreso, completadas, total
- **Citas**: Hoy, próximas, completadas, total
- **Clientes**: Activos, con teléfono, con consultas, total
- **Conversión**: Tasa de conversión de consultas a clientes
- **Tendencias**: Evolución temporal de las métricas

## 🔮 Roadmap

### Próximas Características

1. **Integración con Email**: Envío automático de confirmaciones y recordatorios
2. **Notificaciones Push**: Alertas en tiempo real
3. **Reportes Avanzados**: Gráficos y análisis detallados
4. **Integración con Calendar**: Sincronización con Google Calendar
5. **Chat en Vivo**: Comunicación directa con clientes
6. **API REST**: Endpoints para integraciones externas
7. **Móvil**: Aplicación móvil nativa
8. **IA**: Sugerencias automáticas y análisis predictivo

## 🤝 Contribución

Para contribuir al módulo CRM:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

### Estándares de Código

- **TypeScript**: Tipado fuerte obligatorio
- **ESLint**: Configuración estricta
- **Prettier**: Formateo automático
- **Conventional Commits**: Mensajes de commit estandarizados
- **Tests**: Cobertura mínima del 80%

## 📄 Licencia

Este módulo está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:

- **Email**: soporte@diegogalmarini.com
- **Issues**: GitHub Issues
- **Documentación**: Wiki del proyecto
- **Discord**: Canal #crm-support

---

**Desarrollado con ❤️ por el equipo de Diego Galmarini**