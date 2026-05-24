// Componente de detalle del cliente mejorado con historial completo
import React, { useState, useEffect } from 'react';
import type { Client, Consultation, Appointment, Payment, ClientHistory } from '../../../../types/crm';
import { useConsultations, useAppointments } from '../../../../hooks/useCRM';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, formatDateTime } from '../../../../utils/dateUtils';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ClientDetailProps {
  client: Client;
  onEdit: () => void;
  onClose: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client, onEdit, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'appointments' | 'payments' | 'history'>('overview');

  // Obtener datos relacionados del cliente
  const { consultations } = useConsultations({
    clientEmail: client.email
  });

  const { appointments } = useAppointments({
    initialFilters: { clientId: client.id }
  });

  // Simular pagos (en una implementación real vendrían de un hook)
  const payments: Payment[] = [];

  // Generar historial del cliente
  const clientHistory: ClientHistory[] = [
    ...consultations.map(c => ({
      id: c.id,
      clientId: client.id,
      type: 'consultation' as const,
      title: c.subject,
      description: c.message,
      date: c.createdAt,
      status: c.status
    })),
    ...appointments.map(a => ({
      id: a.id,
      clientId: client.id,
      type: 'appointment' as const,
      title: a.planType || 'Cita programada',
      description: `Cita ${a.planType} - ${a.duration}min`,
      date: a.date,
      status: a.status
    })),
    ...payments.map(p => ({
      id: p.id,
      clientId: client.id,
      type: 'payment' as const,
      title: p.description,
      description: `$${p.amount} ${p.currency}`,
      date: p.createdAt,
      status: p.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: UserIcon },
    { id: 'consultations', label: 'Consultas', icon: DocumentTextIcon },
    { id: 'appointments', label: 'Citas', icon: CalendarIcon },
    { id: 'payments', label: 'Pagos', icon: CreditCardIcon },
    { id: 'history', label: 'Historial', icon: ClockIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'consultation': return DocumentTextIcon;
      case 'appointment': return CalendarIcon;
      case 'payment': return CreditCardIcon;
      default: return ClockIcon;
    }
  };

  const getHistoryColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'text-blue-500';
      case 'appointment': return 'text-green-500';
      case 'payment': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del cliente */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
              <p className="text-gray-600">{client.email}</p>
              {client.company && (
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  {client.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={onEdit} variant="outline">
              Editar
            </Button>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">Nombre completo</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.email}</p>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                  {client.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.phone}</p>
                        <p className="text-sm text-gray-500">Teléfono</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estado</p>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status === 'active' ? 'Activo' :
                        client.status === 'inactive' ? 'Inactivo' : 'Prospecto'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fecha de registro</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(client.registrationDate)}
                    </p>
                  </div>
                  {client.lastContactDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Último contacto</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(client.lastContactDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{consultations.length}</div>
                <div className="text-sm text-gray-600">Total Consultas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{appointments.length}</div>
                <div className="text-sm text-gray-600">Total Citas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {consultations.filter(c => c.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Consultas Pendientes</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {payments.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Pagos Completados</div>
              </div>
            </div>

            {/* Etiquetas */}
            {client.tags && client.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, index) => (
                    <Badge key={index} className="bg-gray-100 text-gray-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            {client.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
                <p className="text-gray-700">{client.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Consultas del Cliente</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consulta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {consultation.subject}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {consultation.message}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-blue-100 text-blue-800">
                          {consultation.planType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(consultation.status)}>
                          {consultation.status === 'pending' ? 'Pendiente' :
                            consultation.status === 'contacted' ? 'Contactado' :
                              consultation.status === 'scheduled' ? 'Programada' :
                                consultation.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityColor(consultation.priority)}>
                          {consultation.priority === 'high' ? 'Alta' :
                            consultation.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(consultation.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {consultations.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay consultas registradas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Citas del Cliente</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-blue-100 text-blue-800">
                          {appointment.planType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status === 'scheduled' ? 'Programada' :
                            appointment.status === 'confirmed' ? 'Confirmada' :
                              appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay citas programadas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Historial de Pagos</h3>
            </div>
            <div className="p-6 text-center">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">El sistema de pagos estará disponible próximamente</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Historial Completo</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {clientHistory.map((item) => {
                const Icon = getHistoryIcon(item.type);
                return (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${getHistoryColor(item.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {item.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(item.date)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {item.description}
                        </p>
                        <div className="mt-2">
                          <Badge className="bg-gray-100 text-gray-800">
                            {item.type === 'consultation' ? 'Consulta' :
                              item.type === 'appointment' ? 'Cita' :
                                item.type === 'payment' ? 'Pago' : 'Nota'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {clientHistory.length === 0 && (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay historial disponible</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;