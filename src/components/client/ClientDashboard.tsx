// Dashboard específico para clientes (no administradores)
// Muestra solo las consultas y datos relevantes del cliente autenticado

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConsultations, useClients, useCommunicationLogs, useAppointments } from '../../hooks/useCRM';
import type { Client, Consultation, CommunicationLog, Appointment, Payment } from '../../types/crm';
import LoadingSpinner from '../admin/crm/ui/LoadingSpinner';
import Alert from '../admin/crm/ui/Alert';
import Badge, { StatusBadge } from '../admin/crm/ui/Badge';
import Button from '../admin/crm/ui/Button';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import AuthDebugInfo from '../AuthDebugInfo';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface ClientDashboardProps {
  className?: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'appointments' | 'payments' | 'communications'>('overview');

  // Hooks para obtener datos del cliente
  const { clients, loading: clientsLoading } = useClients();
  const { consultations, loading: consultationsLoading } = useConsultations(
    currentClient ? { clientId: currentClient.id } : undefined
  );
  const { appointments, loading: appointmentsLoading } = useAppointments({
    initialFilters: currentClient ? { clientId: currentClient.id } : undefined,
    sort: { field: 'startTime', direction: 'asc' }
  });
  const { logs: communicationLogs, loading: communicationsLoading } = useCommunicationLogs(
    currentClient?.id
  );

  // Buscar el cliente actual basado en el email del usuario autenticado
  useEffect(() => {
    if (user?.email && clients.length > 0) {
      const client = clients.find(c => c.email === user.email);
      setCurrentClient(client || null);
    }
  }, [user?.email, clients]);

  // Estados de carga
  const isLoading = clientsLoading || consultationsLoading || appointmentsLoading || communicationsLoading;

  // Función para agregar cita al calendario móvil
  const addToMobileCalendar = (appointment: Appointment) => {
    const startDate = new Date(appointment.date + 'T' + appointment.startTime);
    const endDate = new Date(appointment.date + 'T' + appointment.endTime);

    // Formato para Google Calendar
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appointment.title || 'Consulta con Diego Galmarini')}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(appointment.notes || 'Consulta programada')}`;

    // Formato para Apple Calendar
    const appleUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}%0ADTEND:${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}%0ASUMMARY:${encodeURIComponent(appointment.title || 'Consulta con Diego Galmarini')}%0ADESCRIPTION:${encodeURIComponent(appointment.notes || 'Consulta programada')}%0AEND:VEVENT%0AEND:VCALENDAR`;

    // Abrir en nueva ventana
    window.open(googleUrl, '_blank');
  };

  // Función para procesar pago
  const handlePayment = (payment: Payment) => {
    // Aquí se integraría con Stripe o PayPal
    console.log('Procesando pago:', payment);
    // Por ahora simulamos el proceso
    alert('Redirigiendo al sistema de pagos...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bienvenido al Portal del Cliente
          </h1>
          <p className="text-gray-600 mb-6">
            Hola {user?.email}, aún no tienes consultas registradas.
            ¡Agenda tu primera consulta para comenzar!
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Haz clic en "Agendar Llamada" en el menú principal para programar tu primera consulta.
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Ir al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: UserIcon },
    { id: 'consultations', label: 'Mis Consultas', icon: DocumentTextIcon },
    { id: 'appointments', label: 'Mis Citas', icon: CalendarIcon },
    { id: 'payments', label: 'Pagos', icon: CreditCardIcon },
    { id: 'communications', label: 'Comunicaciones', icon: ChatBubbleLeftRightIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
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

  // Filtrar citas próximas (próximos 7 días)
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return aptDate >= today && aptDate <= nextWeek && apt.status !== 'cancelled';
  });

  // Filtrar pagos pendientes
  const pendingPayments = []; // Aquí se cargarían los pagos reales

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <AuthDebugInfo />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Diego Galmarini - Portal del Cliente
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {currentClient.name}
              </span>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentClient.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Información del Cliente */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Mi Información</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currentClient.name}</p>
                      <p className="text-sm text-gray-500">Nombre completo</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currentClient.email}</p>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                  {currentClient.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{currentClient.phone}</p>
                        <p className="text-sm text-gray-500">Teléfono</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estado</p>
                    <Badge className={getStatusColor(currentClient.status)}>
                      {currentClient.status === 'active' ? 'Activo' :
                        currentClient.status === 'inactive' ? 'Inactivo' : 'Prospecto'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fecha de registro</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(currentClient.registrationDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de Consultas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen de Consultas</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{consultations.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {consultations.filter(c => c.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {consultations.filter(c => c.status === 'contacted').length}
                  </p>
                  <p className="text-sm text-gray-600">Contactados</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {consultations.filter(c => c.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completadas</p>
                </div>
              </div>
            </div>

            {/* Próximas Citas */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Próximas Citas</h2>
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.title || 'Consulta programada'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(appointment.date)} a las {appointment.startTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getAppointmentStatusColor(appointment.status)}>
                          {appointment.status === 'scheduled' ? 'Programada' :
                            appointment.status === 'confirmed' ? 'Confirmada' :
                              appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </Badge>
                        <Button
                          onClick={() => addToMobileCalendar(appointment)}
                          className="text-xs px-2 py-1"
                        >
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {upcomingAppointments.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => setActiveTab('appointments')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Ver todas las citas ({upcomingAppointments.length})
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Pagos Pendientes */}
            {pendingPayments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Pagos Pendientes</h2>
                <div className="space-y-3">
                  {pendingPayments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCardIcon className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            Vence: {formatDate(payment.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${payment.amount} {payment.currency}
                        </span>
                        <Button
                          onClick={() => handlePayment(payment)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                        >
                          Pagar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Mis Consultas</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Respuesta
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {consultation.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Respondida
                          </Badge>
                        ) : consultation.status === 'pending' ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Esperando
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            En proceso
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {consultations.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes consultas registradas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Mis Citas</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
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
                        <Badge className={getAppointmentStatusColor(appointment.status)}>
                          {appointment.status === 'scheduled' ? 'Programada' :
                            appointment.status === 'confirmed' ? 'Confirmada' :
                              appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => addToMobileCalendar(appointment)}
                            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Calendario
                          </Button>
                          {appointment.meetingLink && (
                            <Button
                              onClick={() => window.open(appointment.meetingLink, '_blank')}
                              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              Unirse
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes citas programadas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Historial de Pagos</h2>
            </div>
            <div className="p-6 text-center">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">El sistema de pagos estará disponible próximamente</p>
              <p className="text-sm text-gray-400 mt-2">
                Por favor, contacta a Diego Galmarini para realizar pagos
              </p>
            </div>
          </div>
        )}

        {activeTab === 'communications' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Historial de Comunicaciones</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {communicationLogs.map((log) => (
                <div key={log.id} className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {log.type === 'email' ? (
                        <EnvelopeIcon className="h-6 w-6 text-blue-500" />
                      ) : log.type === 'call' ? (
                        <PhoneIcon className="h-6 w-6 text-green-500" />
                      ) : (
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {log.subject}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${log.direction === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {log.direction === 'inbound' ? 'Recibido' : 'Enviado'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(log.date)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {log.content}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <Badge className={`${log.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          log.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            log.status === 'read' ? 'bg-purple-100 text-purple-800' :
                              log.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                          }`}>
                          {log.status === 'sent' ? 'Enviado' :
                            log.status === 'delivered' ? 'Entregado' :
                              log.status === 'read' ? 'Leído' :
                                log.status === 'failed' ? 'Fallido' : 'Pendiente'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {log.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {communicationLogs.length === 0 && (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay comunicaciones registradas</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;