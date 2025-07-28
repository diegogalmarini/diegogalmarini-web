// Componente de detalle de cita
// Muestra información completa de una cita específica

import React from 'react';
import type { Appointment } from '../../../../types/crm';
import Badge, { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, formatTime } from '../../../../utils/dateUtils';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  BellIcon,
  CurrencyEuroIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// Props del componente
interface AppointmentDetailProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onClose?: () => void;
  className?: string;
}

// Componente principal
export const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  appointment,
  onEdit,
  onClose,
  className = ''
}) => {
  // Opciones para mostrar etiquetas legibles
  const planTypeLabels = {
    'mail': 'Comunicación por mail',
    '30min': 'Consulta 30 minutos',
    '60min': 'Consulta 60 minutos',
    'custom': 'Consulta personalizada'
  };

  const paymentStatusLabels = {
    'free': 'Gratis',
    'pending': 'Pendiente de pago',
    'paid': 'Pagado'
  };

  const appointmentTypeLabels = {
    'consultation': 'Consulta inicial',
    'follow-up': 'Seguimiento',
    'planning': 'Planificación',
    'review': 'Revisión'
  };

  const reminderLabels = {
    15: '15 minutos antes',
    30: '30 minutos antes',
    60: '1 hora antes',
    120: '2 horas antes',
    1440: '1 día antes',
    2880: '2 días antes'
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{appointment.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {appointmentTypeLabels[appointment.type as keyof typeof appointmentTypeLabels] || appointment.type}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <StatusBadge status={appointment.status} />
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(appointment)}
              className="flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cliente */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <UserIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-900">Cliente</h4>
          </div>
          <div>
            <p className="font-medium text-gray-900">{appointment.clientName}</p>
            <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CalendarIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-900">Fecha y hora</h4>
          </div>
          <div>
            <p className="font-medium text-gray-900">{formatDate(appointment.startTime)}</p>
            <p className="text-sm text-gray-600">
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </p>
            <div className="flex items-center mt-2">
              <ClockIcon className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">{appointment.duration} minutos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan y pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de plan */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CurrencyEuroIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">Tipo de plan</h4>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {planTypeLabels[appointment.planType as keyof typeof planTypeLabels] || appointment.planType}
            </p>
            {appointment.planType === 'custom' && appointment.customPrice && (
              <p className="text-sm text-blue-600 mt-1">
                Precio personalizado: €{appointment.customPrice}
              </p>
            )}
          </div>
        </div>

        {/* Estado de pago */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CurrencyEuroIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-900">Estado de pago</h4>
          </div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getPaymentStatusColor(appointment.paymentStatus)
            }`}>
              {paymentStatusLabels[appointment.paymentStatus as keyof typeof paymentStatusLabels] || appointment.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Ubicación y reunión virtual */}
      {(appointment.location || appointment.meetingUrl) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ubicación */}
          {appointment.location && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <MapPinIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">Ubicación</h4>
              </div>
              <p className="text-gray-900">{appointment.location}</p>
            </div>
          )}

          {/* URL de reunión */}
          {appointment.meetingUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <VideoCameraIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">Reunión virtual</h4>
              </div>
              <a
                href={appointment.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {appointment.meetingUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Descripción */}
      {appointment.description && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-900">Descripción</h4>
          </div>
          <p className="text-gray-900 whitespace-pre-wrap">{appointment.description}</p>
        </div>
      )}

      {/* Configuración adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recordatorio */}
        {appointment.reminderMinutes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <BellIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="font-medium text-gray-900">Recordatorio</h4>
            </div>
            <p className="text-gray-900">
              {reminderLabels[appointment.reminderMinutes as keyof typeof reminderLabels] || 
               `${appointment.reminderMinutes} minutos antes`}
            </p>
          </div>
        )}

        {/* Notas */}
        {appointment.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="font-medium text-gray-900">Notas internas</h4>
            </div>
            <p className="text-gray-900 whitespace-pre-wrap">{appointment.notes}</p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        )}
        
        {onEdit && (
          <Button
            onClick={() => onEdit(appointment)}
            className="flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Editar cita
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;