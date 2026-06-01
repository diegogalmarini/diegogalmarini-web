// Componente unificado de consultas con calendario
// Incluye vista de calendario mensual con indicadores de estado y lista de consultas por día

import React, { useState, useMemo, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useConsultations } from '../../../../hooks/useCRM';
import { StatusBadge, PriorityBadge, PlanTypeBadge } from '../ui/Badge';
import Button, { PrimaryButton } from '../ui/Button';
import { Input, Select } from '../ui/FormField';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';

// Tipos de filtros
const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const PLAN_TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'free', label: 'Consulta gratuita' },
  { value: '30min', label: 'Consulta 30 minutos' },
  { value: '60min', label: 'Consulta 60 minutos' },
  { value: 'custom', label: 'Consulta personalizada' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Todos los pagos' },
  { value: 'pending', label: 'Pendiente de pago' },
  { value: 'paid', label: 'Pagado' },
  { value: 'free', label: 'Gratuito' }
];

interface ConsultationCalendarViewProps {
  onConsultationSelect?: (consultation: any) => void;
  onConsultationEdit?: (consultation: any) => void;
  onConsultationDelete?: (consultationId: string) => void;
  onConsultationRespond?: (consultation: any) => void;
  onCreateConsultation?: () => void;
}

const ConsultationCalendarView: React.FC<ConsultationCalendarViewProps> = ({
  onConsultationSelect,
  onConsultationEdit,
  onConsultationDelete,
  onConsultationRespond,
  onCreateConsultation
}) => {
  // Estados locales
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    planType: '',
    paymentStatus: '',
    hasScheduledDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Hook de consultas
  const {
    consultations,
    loading,
    error,
    loadConsultations
  } = useConsultations();

  // Calcular días del mes actual incluyendo relleno de días de la semana
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo es 0
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Agrupar consultas por fecha
  const consultationsByDate = useMemo(() => {
    if (!consultations) return {};

    const grouped: { [key: string]: any[] } = {};

    consultations.forEach(consultation => {
      // Usar startTime si existe (para citas programadas) o createdAt
      const dateField = consultation.startTime || consultation.createdAt;
      const dateKey = format(parseISO(dateField), 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(consultation);
    });

    return grouped;
  }, [consultations]);

  // Obtener estado del día para mostrar indicadores
  const getDayStatus = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayConsultations = consultationsByDate[dateKey] || [];

    if (dayConsultations.length === 0) return null;

    const hasCompleted = dayConsultations.some(c => c.status === 'completed');
    const hasPending = dayConsultations.some(c => c.status === 'pending' || c.status === 'in_progress');
    const hasCancelled = dayConsultations.some(c => c.status === 'cancelled');

    // Prioridad: rojo (canceladas) > amarillo (pendientes) > verde (completadas)
    if (hasCancelled) return 'cancelled';
    if (hasPending) return 'pending';
    if (hasCompleted) return 'completed';

    return null;
  }, [consultationsByDate]);

  // Filtrar consultas del día seleccionado
  const selectedDayConsultations = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    let dayConsultations = consultationsByDate[dateKey] || [];

    // Aplicar filtros
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      dayConsultations = dayConsultations.filter(consultation =>
        consultation.subject?.toLowerCase().includes(searchLower) ||
        consultation.description?.toLowerCase().includes(searchLower) ||
        consultation.clientName?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      dayConsultations = dayConsultations.filter(consultation =>
        consultation.status === filters.status
      );
    }

    if (filters.planType) {
      dayConsultations = dayConsultations.filter(consultation =>
        consultation.planType === filters.planType
      );
    }

    if (filters.paymentStatus) {
      dayConsultations = dayConsultations.filter(consultation =>
        consultation.paymentStatus === filters.paymentStatus
      );
    }

    if (filters.hasScheduledDate) {
      dayConsultations = dayConsultations.filter(consultation =>
        filters.hasScheduledDate === 'yes' ? consultation.scheduledDate : !consultation.scheduledDate
      );
    }

    return dayConsultations;
  }, [consultationsByDate, selectedDate, filters]);

  // Navegación del calendario
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Manejadores de filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      planType: '',
      paymentStatus: '',
      hasScheduledDate: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error"
        message={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultas y Calendario</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona todas las consultas desde una vista unificada
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <Input
                placeholder="Buscar consultas..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>
            <div>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={STATUS_OPTIONS}
              />
            </div>
            <div>
              <Select
                value={filters.planType}
                onChange={(e) => handleFilterChange('planType', e.target.value)}
                options={PLAN_TYPE_OPTIONS}
              />
            </div>
            <div>
              <Select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                options={PAYMENT_STATUS_OPTIONS}
              />
            </div>
            <div>
              <Select
                value={filters.hasScheduledDate}
                onChange={(e) => handleFilterChange('hasScheduledDate', e.target.value)}
                options={[
                  { value: '', label: 'Todas las fechas' },
                  { value: 'yes', label: 'Con fecha programada' },
                  { value: 'no', label: 'Sin fecha programada' }
                ]}
              />
            </div>
            <div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Header del calendario */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Hoy
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMonth}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7">
              {monthDays.map(day => {
                const dayStatus = getDayStatus(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                const dayConsultations = consultationsByDate[format(day, 'yyyy-MM-dd')] || [];

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-3 text-sm border-r border-b border-gray-100 hover:bg-gray-50 transition-colors
                      ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
                      ${isCurrentDay ? 'font-bold text-blue-600' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span>{format(day, 'd')}</span>

                      {/* Indicadores de estado */}
                      {dayStatus && (
                        <div className={`
                          w-2 h-2 rounded-full
                          ${dayStatus === 'completed' ? 'bg-green-500' : ''}
                          ${dayStatus === 'pending' ? 'bg-yellow-500' : ''}
                          ${dayStatus === 'cancelled' ? 'bg-red-500' : ''}
                        `} />
                      )}

                      {/* Contador de consultas */}
                      {dayConsultations.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {dayConsultations.length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista de consultas del día */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isToday(selectedDate) ? 'Hoy' : format(selectedDate, 'dd MMMM yyyy', { locale: es })}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedDayConsultations.length} consulta{selectedDayConsultations.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {selectedDayConsultations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay consultas para este día</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {selectedDayConsultations.map(consultation => (
                    <div key={consultation.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {consultation.subject || 'Sin asunto'}
                            </h4>
                            <StatusBadge status={consultation.status} />
                          </div>

                          {consultation.clientName && (
                            <p className="text-sm text-gray-600 mb-1">
                              Cliente: {consultation.clientName}
                            </p>
                          )}

                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <PlanTypeBadge planType={consultation.planType} />
                            {consultation.paymentStatus && (
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-medium
                                ${consultation.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : ''}
                                ${consultation.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${consultation.paymentStatus === 'free' ? 'bg-gray-100 text-gray-800' : ''}
                              `}>
                                {consultation.paymentStatus === 'paid' ? 'Pagado' :
                                  consultation.paymentStatus === 'pending' ? 'Pendiente' : 'Gratuito'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onConsultationSelect?.(consultation)}
                            title="Ver consulta"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onConsultationEdit?.(consultation)}
                            title="Editar consulta"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationCalendarView;