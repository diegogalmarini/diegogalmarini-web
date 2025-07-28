// Componente de calendario interactivo para gestión de citas y disponibilidad
// Proporciona navegación mensual, visualización de eventos y gestión de slots de tiempo

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment, AvailabilitySlot, BlockedPeriod } from '../../../../types/crm';
import Badge from './Badge';
import Button from './Button';

// Interfaz para eventos del calendario
interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'appointment' | 'blocked' | 'available';
  status?: string;
  clientName?: string;
}

// Props del componente Calendar
interface CalendarProps {
  appointments?: Appointment[];
  availabilitySlots?: AvailabilitySlot[];
  blockedPeriods?: BlockedPeriod[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent, date: Date) => void;
  className?: string;
}

// Props del componente DaySchedule
interface DayScheduleProps {
  date: Date;
  appointments?: Appointment[];
  availabilitySlots?: AvailabilitySlot[];
  blockedPeriods?: BlockedPeriod[];
  onSlotClick?: (slot: { time: string; type: 'available' | 'blocked' | 'appointment'; data?: any }) => void;
  className?: string;
}

// Utilidad para generar slots de tiempo
const generateTimeSlots = (startHour: number = 9, endHour: number = 18, intervalMinutes: number = 30): string[] => {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
};

// Componente principal Calendar
export const Calendar: React.FC<CalendarProps> = ({
  appointments = [],
  availabilitySlots = [],
  blockedPeriods = [],
  selectedDate,
  onDateSelect,
  onEventClick,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // Navegación del calendario
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    if (onDateSelect) {
      onDateSelect(today);
    }
  }, [onDateSelect]);

  // Generar días del mes
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener eventos para una fecha específica
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const dateString = format(date, 'yyyy-MM-dd');

    // Agregar citas
    appointments
      .filter(apt => apt.date === dateString)
      .forEach(apt => {
        events.push({
          id: apt.id,
          title: `Cita - ${apt.clientName}`,
          time: apt.time,
          type: 'appointment',
          status: apt.status,
          clientName: apt.clientName
        });
      });

    // Agregar períodos bloqueados
    blockedPeriods
      .filter(period => {
        const periodStart = parseISO(period.startDate);
        const periodEnd = parseISO(period.endDate);
        return date >= periodStart && date <= periodEnd;
      })
      .forEach(period => {
        events.push({
          id: period.id,
          title: period.reason || 'Bloqueado',
          time: 'Todo el día',
          type: 'blocked'
        });
      });

    // Agregar slots de disponibilidad
    availabilitySlots
      .filter(slot => slot.date === dateString && slot.isAvailable)
      .forEach(slot => {
        events.push({
          id: slot.id,
          title: 'Disponible',
          time: `${slot.startTime} - ${slot.endTime}`,
          type: 'available'
        });
      });

    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, availabilitySlots, blockedPeriods]);

  // Determinar el estado de un día
  const getDayStatus = useCallback((date: Date) => {
    const events = getEventsForDate(date);
    const hasAppointments = events.some(e => e.type === 'appointment');
    const hasBlocked = events.some(e => e.type === 'blocked');
    const hasAvailable = events.some(e => e.type === 'available');

    if (hasBlocked) return 'blocked';
    if (hasAppointments) return 'busy';
    if (hasAvailable) return 'available';
    return 'none';
  }, [getEventsForDate]);

  // Manejar clic en día
  const handleDayClick = useCallback((date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  }, [onDateSelect]);

  // Manejar clic en evento
  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    if (onEventClick) {
      onEventClick(event, date);
    }
  }, [onEventClick]);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header del calendario */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
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
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="p-2"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="p-2"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7">
        {daysInMonth.map((date) => {
          const events = getEventsForDate(date);
          const dayStatus = getDayStatus(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isTodayDate = isToday(date);

          return (
            <div
              key={date.toISOString()}
              className={`
                min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer transition-colors
                hover:bg-gray-50
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
              `}
              onClick={() => handleDayClick(date)}
            >
              {/* Número del día */}
              <div className="flex items-center justify-between mb-1">
                <span className={`
                  text-sm font-medium
                  ${isTodayDate ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                  ${isSelected && !isTodayDate ? 'text-blue-600' : ''}
                `}>
                  {format(date, 'd')}
                </span>
                
                {/* Indicador de estado */}
                {dayStatus !== 'none' && (
                  <div className={`
                    w-2 h-2 rounded-full
                    ${dayStatus === 'blocked' ? 'bg-red-500' : ''}
                    ${dayStatus === 'busy' ? 'bg-yellow-500' : ''}
                    ${dayStatus === 'available' ? 'bg-green-500' : ''}
                  `} />
                )}
              </div>

              {/* Eventos del día */}
              <div className="space-y-1">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded truncate cursor-pointer transition-colors
                      ${event.type === 'appointment' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                      ${event.type === 'blocked' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                      ${event.type === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event, date);
                    }}
                    title={`${event.title} - ${event.time}`}
                  >
                    {event.title}
                  </div>
                ))}
                
                {events.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{events.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente DaySchedule para vista detallada del día
export const DaySchedule: React.FC<DayScheduleProps> = ({
  date,
  appointments = [],
  availabilitySlots = [],
  blockedPeriods = [],
  onSlotClick,
  className = ''
}) => {
  const timeSlots = useMemo(() => generateTimeSlots(9, 18, 30), []);
  const dateString = format(date, 'yyyy-MM-dd');

  // Obtener el estado de un slot de tiempo
  const getSlotStatus = useCallback((time: string) => {
    // Verificar si hay una cita en este horario
    const appointment = appointments.find(apt => 
      apt.date === dateString && apt.time === time
    );
    if (appointment) {
      return { type: 'appointment' as const, data: appointment };
    }

    // Verificar si está bloqueado
    const isBlocked = blockedPeriods.some(period => {
      const periodStart = parseISO(period.startDate);
      const periodEnd = parseISO(period.endDate);
      return date >= periodStart && date <= periodEnd;
    });
    if (isBlocked) {
      return { type: 'blocked' as const, data: null };
    }

    // Verificar si está disponible
    const availableSlot = availabilitySlots.find(slot => 
      slot.date === dateString && 
      slot.isAvailable && 
      time >= slot.startTime && 
      time < slot.endTime
    );
    if (availableSlot) {
      return { type: 'available' as const, data: availableSlot };
    }

    return { type: 'none' as const, data: null };
  }, [appointments, availabilitySlots, blockedPeriods, date, dateString]);

  // Manejar clic en slot
  const handleSlotClick = useCallback((time: string) => {
    if (onSlotClick) {
      const status = getSlotStatus(time);
      onSlotClick({ time, type: status.type, data: status.data });
    }
  }, [onSlotClick, getSlotStatus]);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(date, 'EEEE, d MMMM yyyy', { locale: es })}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Horarios disponibles y ocupados
        </p>
      </div>

      {/* Slots de tiempo */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {timeSlots.map((time) => {
          const status = getSlotStatus(time);
          
          return (
            <div
              key={time}
              className={`
                flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                hover:shadow-sm
                ${status.type === 'appointment' ? 'bg-blue-50 border-blue-200' : ''}
                ${status.type === 'blocked' ? 'bg-red-50 border-red-200' : ''}
                ${status.type === 'available' ? 'bg-green-50 border-green-200' : ''}
                ${status.type === 'none' ? 'bg-gray-50 border-gray-200' : ''}
              `}
              onClick={() => handleSlotClick(time)}
            >
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{time}</span>
              </div>

              <div className="flex items-center space-x-2">
                {status.type === 'appointment' && status.data && (
                  <>
                    <UserIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-700">
                      {status.data.clientName}
                    </span>
                    <Badge variant="primary" size="sm">
                      {status.data.status}
                    </Badge>
                  </>
                )}
                
                {status.type === 'blocked' && (
                  <>
                    <XMarkIcon className="h-4 w-4 text-red-500" />
                    <Badge variant="danger" size="sm">
                      Bloqueado
                    </Badge>
                  </>
                )}
                
                {status.type === 'available' && (
                  <Badge variant="success" size="sm">
                    Disponible
                  </Badge>
                )}
                
                {status.type === 'none' && (
                  <Badge variant="secondary" size="sm">
                    No configurado
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente CalendarLegend para mostrar la leyenda
interface CalendarLegendProps {
  className?: string;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Leyenda</h4>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm text-gray-600">Citas programadas</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-600">Horarios disponibles</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-sm text-gray-600">Períodos bloqueados</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-sm text-gray-600">Días ocupados</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;