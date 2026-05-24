// Componente de calendario mejorado para mostrar consultas y citas
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Appointment, Consultation, BlockedPeriod } from '../../../../types/crm';

interface CalendarEvent {
  id: string;
  type: 'appointment' | 'consultation' | 'blocked';
  title: string;
  time?: string;
  status: string;
  priority?: string;
  data: Appointment | Consultation | BlockedPeriod;
}

interface CalendarProps {
  appointments?: Appointment[];
  consultations?: Consultation[];
  blockedPeriods?: BlockedPeriod[];
  onEventClick?: (event: CalendarEvent, date: Date) => void;
  onDateSelect?: (date: Date) => void;
  currentDate?: Date;
  onMonthChange?: (date: Date) => void;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  appointments,
  consultations = [],
  blockedPeriods = [],
  onEventClick,
  onDateSelect,
  currentDate: externalDate,
  onMonthChange,
  className = ''
}) => {
  const [internalDate, setInternalDate] = useState(new Date());
  const currentDate = externalDate || internalDate;

  const handleMonthChange = (newDate: Date) => {
    if (onMonthChange) {
      onMonthChange(newDate);
    } else {
      setInternalDate(newDate);
    }
  };

  // Calcular fechas del mes actual
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Navegación del calendario
  const goToPreviousMonth = () => handleMonthChange(subMonths(currentDate, 1));
  const goToNextMonth = () => handleMonthChange(addMonths(currentDate, 1));
  const goToToday = () => handleMonthChange(new Date());

  // Crear eventos del calendario
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Agregar citas
    if (appointments) {
      appointments.forEach(appointment => {
        events.push({
          id: appointment.id,
          type: 'appointment',
          title: appointment.title || 'Cita programada',
          time: appointment.startTime,
          status: appointment.status,
          data: appointment
        });
      });
    }

    // Agregar consultas
    if (consultations) {
      consultations.forEach(consultation => {
        events.push({
          id: consultation.id,
          type: 'consultation',
          title: consultation.subject,
          status: consultation.status,
          priority: consultation.priority,
          data: consultation
        });
      });
    }

    // Agregar períodos bloqueados
    if (blockedPeriods) {
      blockedPeriods.forEach(period => {
        // Para períodos que abarcan varios días, deberíamos generar un evento por día
        // Por simplicidad, mostramos el inicio
        events.push({
          id: period.id,
          type: 'blocked',
          title: period.reason || 'No disponible',
          status: 'blocked',
          time: period.type === 'time_range' ? 'Parcial' : 'Todo el día',
          data: period
        });
      });
    }

    return events;
  }, [appointments, consultations, blockedPeriods]);

  // Obtener eventos para una fecha específica
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      if (event.type === 'appointment') {
        const appointment = event.data as Appointment;
        return isSameDay(parseISO(appointment.date), date);
      } else if (event.type === 'consultation') {
        const consultation = event.data as Consultation;
        return isSameDay(parseISO(consultation.createdAt), date);
      } else if (event.type === 'blocked') {
        const period = event.data as BlockedPeriod;
        if (!period.startDate || !period.endDate) return false;

        const startDate = startOfDay(parseISO(period.startDate));
        const endDate = startOfDay(parseISO(period.endDate));
        const checkDate = startOfDay(date);

        return checkDate >= startDate && checkDate <= endDate;
      }
      return false;
    });
  };

  // Obtener color del estado
  const getStatusColor = (status: string, type: string) => {
    if (type === 'blocked') {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
    if (type === 'appointment') {
      switch (status) {
        case 'scheduled': return 'bg-blue-500 text-white';
        case 'confirmed': return 'bg-green-500 text-white';
        case 'completed': return 'bg-gray-500 text-white';
        case 'cancelled': return 'bg-red-500 text-white';
        default: return 'bg-gray-500 text-white';
      }
    } else {
      switch (status) {
        case 'pending': return 'bg-yellow-500 text-white';
        case 'in_progress': return 'bg-blue-500 text-white';
        case 'completed': return 'bg-green-500 text-white';
        case 'cancelled': return 'bg-red-500 text-white';
        default: return 'bg-gray-500 text-white';
      }
    }
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header del calendario */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>

            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-50 px-3 py-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {monthDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              onClick={() => onDateSelect?.(day)}
              className={`min-h-[120px] bg-white p-2 ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
                } ${isCurrentDay ? 'bg-blue-50' : ''} ${onDateSelect ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                }`}
            >
              {/* Número del día */}
              <div className={`text-sm font-medium mb-2 ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                }`}>
                {format(day, 'd')}
              </div>

              {/* Eventos del día */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event, day);
                    }}
                    className={`text-xs p-1 rounded cursor-pointer transition-colors hover:opacity-80 ${getStatusColor(event.status, event.type)
                      } mb-1`}
                    title={`${event.title} - ${event.status}`}
                  >
                    <div className="truncate font-medium flex items-center">
                      <span className="mr-1">
                        {event.type === 'appointment' ? '📅' : event.type === 'consultation' ? '📝' : '🚫'}
                      </span>
                      {event.title}
                    </div>
                    {event.time && (
                      <div className="text-xs opacity-90">{event.time}</div>
                    )}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>Bloqueado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Citas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Consultas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completadas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Canceladas</span>
          </div>
        </div>
      </div>
    </div>
  );
};