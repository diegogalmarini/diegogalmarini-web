
// Componente de gestión de disponibilidad
// Permite configurar horarios disponibles y bloquear períodos específicos

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { AvailabilitySlot, BlockedPeriod, DayOfWeek, Appointment, Consultation } from '../../../../types/crm';
import { useAvailability, useAppointments, useConsultations } from '../../../../hooks/useCRM';
import Button from '../ui/Button';
import { Input, Select, Checkbox } from '../ui/FormField';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';
import { Calendar } from '../ui/Calendar';
import { formatDate, formatTime } from '../../../../utils/dateUtils';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, parseISO, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../../contexts/AuthContext';
import { googleCalendarService } from '../../../../services/googleCalendar';
import {
  ClockIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Props del componente
interface AvailabilityManagerProps {
  className?: string;
  onViewConsultation?: (consultation: Consultation) => void;
  onViewAppointment?: (appointment: Appointment) => void;
  onCreateConsultation?: (initialDate?: Date) => void;
  onCreateAppointment?: (initialDate?: Date) => void;
  onNavigate?: (tab: string) => void;
}

// Días de la semana
const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

// Opciones de horarios en intervalos de 30 minutos
const TIME_OPTIONS = Array.from({ length: 24 * 2 }).map((_, i) => {
  const hour = Math.floor(i / 2);
  const min = i % 2 === 0 ? '00' : '30';
  const timeVal = `${hour.toString().padStart(2, '0')}:${min}`;
  return { value: timeVal, label: timeVal };
});

// Horarios predefinidos
const PRESET_SCHEDULES = [
  {
    name: 'Horario de oficina estándar',
    description: 'Lunes a viernes, 9:00 - 17:00',
    slots: [
      { dayOfWeek: 'monday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'tuesday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'wednesday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'thursday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'friday' as DayOfWeek, startTime: '09:00', endTime: '17:00' }
    ]
  },
  {
    name: 'Horario extendido',
    description: 'Lunes a viernes, 8:00 - 18:00',
    slots: [
      { dayOfWeek: 'monday' as DayOfWeek, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 'tuesday' as DayOfWeek, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 'wednesday' as DayOfWeek, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 'thursday' as DayOfWeek, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 'friday' as DayOfWeek, startTime: '08:00', endTime: '18:00' }
    ]
  },
  {
    name: 'Incluye sábados',
    description: 'Lunes a sábado, 9:00 - 17:00',
    slots: [
      { dayOfWeek: 'monday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'tuesday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'wednesday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'thursday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'friday' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'saturday' as DayOfWeek, startTime: '09:00', endTime: '17:00' }
    ]
  }
];

// Todos los slots de 30 minutos de 00:30 a 23:00 - 46 slots
const ALL_SLOTS = [
  '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
];

// Componente auxiliar para el formulario de bloqueo
const BlockPeriodForm: React.FC<{
  initialDate: Date;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ initialDate, onSubmit, onCancel }) => {
  const [reason, setReason] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleSubmit = () => {
    const startDate = new Date(initialDate);
    const endDate = new Date(initialDate);

    if (!isAllDay) {
      // Ajustar horas si no es todo el día
      // Nota: La implementación actual de BlockedPeriod en backend/types puede variar,
      // pero aquí asumimos que enviamos fechas completas o strings.
      // El hook useAvailability espera strings YYYY-MM-DD para startDate/endDate
      // Si queremos soportar horas específicas, necesitaríamos ajustar el tipo BlockedPeriod
      // o usar un campo adicional. Por ahora, mantenemos la lógica de BlockedPeriods existente.
    }

    onSubmit({
      startDate: initialDate.toISOString().split('T')[0],
      endDate: initialDate.toISOString().split('T')[0],
      reason,
      type: isAllDay ? 'full_day' : 'time_range',
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      createdBy: 'current-user'
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Motivo"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Ej: Cita personal, Vacaciones"
        autoFocus
      />

      <Checkbox
        label="Todo el día"
        checked={isAllDay}
        onChange={(e) => setIsAllDay(e.target.checked)}
      />

      {!isAllDay && (
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Hora inicio"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            options={TIME_OPTIONS}
          />
          <Select
            label="Hora fin"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            options={TIME_OPTIONS}
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!reason}>
          Bloquear
        </Button>
      </div>
    </div>
  );
};

// Componente de horario semanal estilo Calendly simplificado con slots de 30 minutos
const WeeklySchedule: React.FC<{
  availabilitySlots: AvailabilitySlot[];
  onAddSlot: (slot: Omit<AvailabilitySlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSlot: (id: string, slot: Partial<AvailabilitySlot>) => void;
  onDeleteSlot: (id: string) => void;
}> = ({ availabilitySlots, onAddSlot, onUpdateSlot, onDeleteSlot }) => {
  const [togglingDay, setTogglingDay] = useState<DayOfWeek | null>(null);

  // Agrupar slots por día de la semana
  const slotsByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, AvailabilitySlot[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    availabilitySlots.forEach(slot => {
      if (slot.dayOfWeek) {
        grouped[slot.dayOfWeek].push(slot);
      }
    });

    // Ordenar los slots de cada día cronológicamente por hora de inicio
    Object.keys(grouped).forEach(key => {
      grouped[key as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [availabilitySlots]);

  // Helper para convertir HH:MM a minutos desde la medianoche
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper para sumar 30 minutos a un string de hora
  const add30Minutes = (timeStr: string): string => {
    const [h, m] = timeStr.split(':').map(Number);
    const total = h * 60 + m + 30;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  };

  // Verificar si un slot de 30 minutos está activo en un día específico
  const isSlotActive = useCallback((day: DayOfWeek, timeStr: string): boolean => {
    const startMin = timeToMinutes(timeStr);
    const daySlots = slotsByDay[day] || [];
    return daySlots.some(slot => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);
      return startMin >= slotStart && startMin < slotEnd;
    });
  }, [slotsByDay]);

  // Activar/desactivar un slot de 30 minutos y fusionar intervalos consecutivos
  const handleToggleSlot = useCallback(async (day: DayOfWeek, timeStr: string) => {
    setTogglingDay(day);
    try {
      const daySlots = slotsByDay[day] || [];

      // 1. Obtener lista de todos los slots de 30 minutos actualmente activos
      const currentActive = ALL_SLOTS.filter(t => isSlotActive(day, t));

      // 2. Alternar (toggle) el slot cliqueado
      let newActive: string[];
      if (currentActive.includes(timeStr)) {
        newActive = currentActive.filter(t => t !== timeStr);
      } else {
        newActive = [...currentActive, timeStr];
      }

      // 3. Ordenar cronológicamente
      newActive.sort();

      // 4. Fusionar slots de 30 minutos consecutivos en bloques continuos
      const mergedBlocks: { startTime: string; endTime: string }[] = [];
      if (newActive.length > 0) {
        let blockStart = newActive[0];
        let blockEnd = add30Minutes(blockStart);

        for (let i = 1; i < newActive.length; i++) {
          const currentTime = newActive[i];
          const expectedNext = blockEnd;

          if (currentTime === expectedNext) {
            // Consecutivo: expandimos el final del bloque
            blockEnd = add30Minutes(currentTime);
          } else {
            // Brecha encontrada: guardamos el bloque anterior y empezamos uno nuevo
            mergedBlocks.push({ startTime: blockStart, endTime: blockEnd });
            blockStart = currentTime;
            blockEnd = add30Minutes(currentTime);
          }
        }
        mergedBlocks.push({ startTime: blockStart, endTime: blockEnd });
      }

      // 5. Eliminar todos los bloques viejos del día en Firestore
      for (const slot of daySlots) {
        await onDeleteSlot(slot.id);
      }

      // 6. Escribir los nuevos bloques fusionados en Firestore
      for (const block of mergedBlocks) {
        await onAddSlot({
          dayOfWeek: day,
          startTime: block.startTime,
          endTime: block.endTime,
          isRecurring: true,
          date: new Date().toISOString().split('T')[0],
          type: 'available',
          isAvailable: true
        });
      }
    } catch (err) {
      console.error('Error toggling availability slot:', err);
    } finally {
      setTogglingDay(null);
    }
  }, [slotsByDay, isSlotActive, onDeleteSlot, onAddSlot]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Horario semanal</h3>
          <p className="text-xs text-gray-500 mt-1">
            Haz clic en los intervalos de 30 minutos para activar (azul) o desactivar (gris) tu disponibilidad.
          </p>
        </div>
      </div>

      {/* Rejilla de Horarios Semanales Estilo Calendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map(day => {
          const daySlots = slotsByDay[day.value];
          const isDayToggling = togglingDay === day.value;

          return (
            <div 
              key={day.value} 
              className={`flex flex-col border rounded-2xl p-4 transition-all duration-200 shadow-sm h-[480px] relative ${
                isDayToggling ? 'opacity-50 pointer-events-none' : ''
              } ${
                daySlots.length > 0 
                  ? 'border-blue-100 bg-blue-50/5 hover:bg-blue-50/10 hover:shadow-md' 
                  : 'border-gray-200 bg-gray-50/30 hover:bg-gray-50/50'
              }`}
            >
              {/* Encabezado del Día */}
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-2 mb-3">
                <span className="font-bold text-gray-800 text-sm tracking-tight">{day.label}</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                  {daySlots.length > 0 ? `${daySlots.length} tramos` : 'Cerrado'}
                </span>
              </div>

              {/* Grid de 30 minutos scrollable */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 custom-scrollbar">
                {ALL_SLOTS.map(timeStr => {
                  const active = isSlotActive(day.value, timeStr);
                  return (
                    <button
                      key={timeStr}
                      onClick={() => handleToggleSlot(day.value, timeStr)}
                      className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all duration-150 border text-center cursor-pointer select-none focus:outline-none ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm hover:bg-blue-700 hover:scale-[1.03]'
                          : 'bg-gray-50 border-gray-150 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                      title={active ? `Disponible de ${timeStr} a ${add30Minutes(timeStr)}` : `No disponible de ${timeStr} a ${add30Minutes(timeStr)}`}
                    >
                      {timeStr}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente de períodos bloqueados
const BlockedPeriods: React.FC<{
  blockedPeriods: BlockedPeriod[];
  onAddPeriod: (period: Omit<BlockedPeriod, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeletePeriod: (id: string) => void;
}> = ({ blockedPeriods, onAddPeriod, onDeletePeriod }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    isAllDay: true
  });

  const handleAddPeriod = useCallback(() => {
    const startDate = new Date(newPeriod.startDate);
    const endDate = new Date(newPeriod.endDate);

    if (newPeriod.isAllDay) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    onAddPeriod({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reason: newPeriod.reason,
      type: newPeriod.isAllDay ? 'full_day' : 'time_range',
      createdBy: 'current-user' // Placeholder
    });

    setShowAddForm(false);
    setNewPeriod({
      startDate: '',
      endDate: '',
      reason: '',
      isAllDay: true
    });
  }, [newPeriod, onAddPeriod]);

  // Separar períodos por estado (pasados, actuales, futuros)
  const categorizedPeriods = useMemo(() => {
    const now = new Date();
    const past: BlockedPeriod[] = [];
    const current: BlockedPeriod[] = [];
    const future: BlockedPeriod[] = [];

    blockedPeriods.forEach(period => {
      const endDate = new Date(period.endDate);
      const startDate = new Date(period.startDate);

      if (endDate < now) {
        past.push(period);
      } else if (startDate <= now && endDate >= now) {
        current.push(period);
      } else {
        future.push(period);
      }
    });

    return { past, current, future };
  }, [blockedPeriods]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Períodos bloqueados</h3>
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Bloquear período
        </Button>
      </div>

      {/* Formulario para añadir nuevo período bloqueado */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Nuevo período bloqueado</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="Motivo"
              value={newPeriod.reason}
              onChange={(e) => setNewPeriod(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Vacaciones, reunión, etc."
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Fecha inicio"
                type="date"
                value={newPeriod.startDate}
                onChange={(e) => setNewPeriod(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />

              <Input
                label="Fecha fin"
                type="date"
                value={newPeriod.endDate}
                onChange={(e) => setNewPeriod(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>

            <Checkbox
              label="Todo el día"
              checked={newPeriod.isAllDay}
              onChange={(e) => setNewPeriod(prev => ({ ...prev, isAllDay: e.target.checked }))}
              helpText="Si no está marcado, podrás especificar horas exactas"
            />



            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddPeriod}
                disabled={!newPeriod.reason || !newPeriod.startDate || !newPeriod.endDate}
              >
                Bloquear período
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Períodos actuales */}
      {categorizedPeriods.current.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Bloqueados actualmente</h4>
          <div className="space-y-2">
            {categorizedPeriods.current.map(period => (
              <div key={period.id} className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-900">{period.reason}</div>
                    <div className="text-sm text-red-700">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </div>

                  </div>
                  <Badge variant="error">Activo</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Períodos futuros */}
      {categorizedPeriods.future.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Próximos bloqueos</h4>
          <div className="space-y-2">
            {categorizedPeriods.future.map(period => (
              <div key={period.id} className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-yellow-900">{period.reason}</div>
                    <div className="text-sm text-yellow-700">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </div>

                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="warning">Programado</Badge>
                    <button
                      onClick={() => onDeletePeriod(period.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Períodos pasados (últimos 5) */}
      {categorizedPeriods.past.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Bloqueos recientes</h4>
          <div className="space-y-2">
            {categorizedPeriods.past.slice(-5).map(period => (
              <div key={period.id} className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-700">{period.reason}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </div>
                  </div>
                  <Badge variant="secondary">Finalizado</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {blockedPeriods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No hay períodos bloqueados</p>
        </div>
      )}
    </div>
  );
};

// Componente principal
export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  className = '',
  onViewConsultation,
  onViewAppointment,
  onCreateConsultation,
  onCreateAppointment,
  onNavigate
}) => {
  // Hooks
  const { user, signInWithGoogle, googleAccessToken } = useAuth();
  const {
    availabilitySlots,
    blockedPeriods,
    loading,
    error,
    createAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    createBlockedPeriod,
    deleteBlockedPeriod
  } = useAvailability();

  const { appointments } = useAppointments();
  const { consultations } = useConsultations();

  // Estados locales
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'blocked'>('calendar');
  const [showPresets, setShowPresets] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Nuevos estados para modal de actividades del día
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [isAddingBlockOnDay, setIsAddingBlockOnDay] = useState(false);

  // Estado para la configuración en lote de la plantilla semanal
  const [bulkDays, setBulkDays] = useState<Record<DayOfWeek, { checked: boolean; startTime: string; endTime: string }>>({
    monday: { checked: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { checked: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { checked: true, startTime: '09:00', endTime: '17:00' },
    thursday: { checked: true, startTime: '09:00', endTime: '17:00' },
    friday: { checked: true, startTime: '09:00', endTime: '17:00' },
    saturday: { checked: false, startTime: '09:00', endTime: '17:00' },
    sunday: { checked: false, startTime: '09:00', endTime: '17:00' }
  });

  // Helper robusto para parsear fechas de Firestore y strings ISO
  const safeParseDate = (dateVal: any): Date => {
    if (!dateVal) return new Date();
    
    let result: Date | null = null;
    
    if (dateVal instanceof Date) {
      result = dateVal;
    } else if (typeof dateVal === 'object') {
      if (typeof dateVal.toDate === 'function') {
        try {
          result = dateVal.toDate();
        } catch (e) {}
      } else if (dateVal.seconds !== undefined) {
        result = new Date(dateVal.seconds * 1000);
      } else if (dateVal._seconds !== undefined) {
        result = new Date(dateVal._seconds * 1000);
      }
    } else if (typeof dateVal === 'string') {
      if (!dateVal.trim()) return new Date();
      try {
        const parsed = parseISO(dateVal);
        if (!isNaN(parsed.getTime())) result = parsed;
      } catch (e) {}
      
      if (!result) {
        const nativeParsed = new Date(dateVal);
        if (!isNaN(nativeParsed.getTime())) result = nativeParsed;
      }
    }
    
    if (!result) {
      result = new Date(dateVal);
    }
    
    if (!result || isNaN(result.getTime())) {
      return new Date(); // Safe fallback
    }
    
    return result;
  };

  // Obtener eventos para una fecha específica
  const getEventsForDate = useCallback((date: Date) => {
    const list: any[] = [];
    
    // Citas
    if (appointments) {
      appointments.forEach(apt => {
        if (apt.date && isSameDay(safeParseDate(apt.date), date)) {
          list.push({
            id: apt.id,
            type: 'appointment',
            title: apt.title || 'Cita programada',
            time: `${apt.startTime} - ${apt.endTime}`,
            status: apt.status,
            data: apt
          });
        }
      });
    }

    // Consultas
    if (consultations) {
      consultations.forEach(cons => {
        if (cons.createdAt && isSameDay(safeParseDate(cons.createdAt), date)) {
          list.push({
            id: cons.id,
            type: 'consultation',
            title: cons.subject || 'Consulta por mail',
            time: 'Consulta recibida',
            status: cons.status,
            priority: cons.priority,
            data: cons
          });
        }
      });
    }

    // Bloqueos
    if (blockedPeriods) {
      blockedPeriods.forEach(period => {
        if (period.startDate && period.endDate) {
          const startDate = startOfDay(safeParseDate(period.startDate));
          const endDate = startOfDay(safeParseDate(period.endDate));
          const checkDate = startOfDay(date);
          if (checkDate >= startDate && checkDate <= endDate) {
            list.push({
              id: period.id,
              type: 'blocked',
              title: period.reason || 'Bloqueado',
              time: period.type === 'time_range' ? `${period.startTime || ''} - ${period.endTime || ''}` : 'Todo el día',
              status: 'blocked',
              data: period
            });
          }
        }
      });
    }

    // Ordenar cronológicamente por hora si es posible
    return list.sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });
  }, [appointments, consultations, blockedPeriods]);

  // Google Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  // Fetch Google Calendar Events
  useEffect(() => {
    const fetchGoogleEvents = async () => {
      if (!googleAccessToken) {
        console.log('❌ No Google Access Token available');
        return;
      }

      setIsSyncingGoogle(true);
      try {
        // Fetch events for current month +/- 1 month to ensure smooth navigation
        const start = startOfMonth(subMonths(currentCalendarDate, 1)).toISOString();
        const end = endOfMonth(addMonths(currentCalendarDate, 1)).toISOString();

        console.log('🔄 Fetching Google Events:', {
          start,
          end,
          tokenLength: googleAccessToken.length
        });

        const events = await googleCalendarService.listEvents(googleAccessToken, start, end);
        console.log('✅ Google Events Fetched:', events.length);
        setGoogleEvents(events);
      } catch (error) {
        console.error('❌ Error fetching Google Calendar events:', error);
      } finally {
        setIsSyncingGoogle(false);
      }
    };

    if (activeTab === 'calendar') {
      fetchGoogleEvents();
    }
  }, [googleAccessToken, currentCalendarDate, activeTab]);

  const handleGoogleSync = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // Here you might want to set a local error state to show to the user
    }
  };

  // Aplicar horario predefinido
  const applyPresetSchedule = useCallback(async (preset: typeof PRESET_SCHEDULES[0]) => {
    try {
      // Eliminar todos los slots existentes primero para evitar solapamientos y duplicados
      for (const slot of availabilitySlots) {
        await deleteAvailabilitySlot(slot.id);
      }

      // Crear nuevos slots del preset
      for (const slot of preset.slots) {
        await createAvailabilitySlot({
          ...slot,
          date: new Date().toISOString().split('T')[0],
          type: 'available',
          isAvailable: true
        });
      }

      setShowPresets(false);
    } catch (error) {
      console.error('Error aplicando horario predefinido:', error);
    }
  }, [availabilitySlots, deleteAvailabilitySlot, createAvailabilitySlot]);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const getEventDetails = () => {
    if (!selectedEvent) return null;

    const { type, data, title, time, status } = selectedEvent;

    if (type === 'blocked') {
      const period = data as BlockedPeriod;
      return (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-red-100 p-2 rounded-full">
                <CalendarIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-red-900">{title}</h4>
                <p className="text-sm text-red-700">
                  {period.type === 'full_day' ? 'Todo el día' : `${period.startTime || '09:00'} - ${period.endTime || '17:00'}`}
                </p>
              </div>
            </div>
            {period.createdBy === 'google-calendar' && (
              <Badge variant="info" size="sm" className="mt-2">
                Evento de Google Calendar
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500">Inicio</span>
              <span className="font-medium">{format(parseISO(period.startDate), 'dd MMM yyyy', { locale: es })}</span>
            </div>
            <div>
              <span className="block text-gray-500">Fin</span>
              <span className="font-medium">{format(parseISO(period.endDate), 'dd MMM yyyy', { locale: es })}</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'appointment') {
      const apt = data as Appointment;
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">{title}</h4>
                <p className="text-sm text-blue-700">
                  {apt.startTime} - {apt.endTime} ({apt.duration} min)
                </p>
              </div>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {apt.status === 'scheduled' ? 'Programada' : apt.status === 'confirmed' ? 'Confirmada' : apt.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-gray-500 font-semibold">Cliente</span>
              <span className="font-medium text-gray-900">{apt.clientName || 'Sin asignar'}</span>
            </div>
            <div>
              <span className="block text-gray-500 font-semibold">Fecha</span>
              <span className="font-medium text-gray-900">{format(parseISO(apt.date), 'dd MMMM yyyy', { locale: es })}</span>
            </div>
            {apt.meetingLink && (
              <div>
                <span className="block text-gray-500 font-semibold">Enlace de videollamada</span>
                <a href={apt.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium inline-block mt-1">
                  🎥 Unirse a Google Meet
                </a>
              </div>
            )}
            {apt.notes && (
              <div>
                <span className="block text-gray-500 font-semibold">Notas</span>
                <p className="bg-gray-50 p-2 rounded text-gray-700 mt-1 whitespace-pre-wrap">{apt.notes}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (type === 'consultation') {
      const cons = data as Consultation;
      return (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-yellow-100 p-2 rounded-full">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-900">{title}</h4>
                <p className="text-sm text-yellow-700">
                  Plan: {cons.planType || 'General'}
                </p>
              </div>
            </div>
            <div className="mt-2 flex space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Prioridad: {cons.priority}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Estado: {cons.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-gray-500 font-semibold">Cliente</span>
              <span className="font-medium text-gray-900">{cons.clientName || 'Prospecto'}</span>
            </div>
            {cons.clientEmail && (
              <div>
                <span className="block text-gray-500 font-semibold">Email</span>
                <a href={`mailto:${cons.clientEmail}`} className="text-blue-600 hover:underline">{cons.clientEmail}</a>
              </div>
            )}
            {cons.message && (
              <div>
                <span className="block text-gray-500 font-semibold">Mensaje de consulta</span>
                <p className="bg-gray-50 p-2 rounded text-gray-700 mt-1 whitespace-pre-wrap">{cons.message}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p>Detalles del evento no disponibles.</p>
      </div>
    );
  };

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    setSelectedDayEvents(dayEvents);
    setIsAddingBlockOnDay(false);
    setShowDayDetailModal(true);
  }, [getEventsForDate]);

  const handleBlockPeriod = useCallback(async (periodData: any) => {
    await createBlockedPeriod(periodData);
    setShowBlockModal(false);
    setIsAddingBlockOnDay(false);
    setSelectedDate(null);
  }, [createBlockedPeriod]);

  // Aplicar plantilla semanal en lote
  const handleApplyBulkSchedule = useCallback(async () => {
    try {
      setIsSyncingGoogle(true);
      for (const dayKey of Object.keys(bulkDays) as DayOfWeek[]) {
        const dayConfig = bulkDays[dayKey];
        
        // 1. Obtener slots actuales de este día
        const daySlots = availabilitySlots.filter(s => s.dayOfWeek === dayKey);
        
        // 2. Eliminar de Firestore
        for (const slot of daySlots) {
          await deleteAvailabilitySlot(slot.id);
        }
        
        // 3. Crear bloque si está seleccionado
        if (dayConfig.checked) {
          await createAvailabilitySlot({
            dayOfWeek: dayKey,
            startTime: dayConfig.startTime,
            endTime: dayConfig.endTime,
            isRecurring: true,
            date: new Date().toISOString().split('T')[0],
            type: 'available',
            isAvailable: true
          });
        }
      }
      setShowPresets(false);
    } catch (error) {
      console.error('Error aplicando plantilla semanal:', error);
    } finally {
      setIsSyncingGoogle(false);
    }
  }, [bulkDays, availabilitySlots, deleteAvailabilitySlot, createAvailabilitySlot]);

  const tabs = [
    { id: 'calendar', label: 'Calendario', count: 0 },
    { id: 'schedule', label: 'Horario semanal', count: availabilitySlots.length },
    { id: 'blocked', label: 'Períodos bloqueados', count: blockedPeriods.length }
  ] as const;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de disponibilidad</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configura tus horarios disponibles y bloquea períodos específicos
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Switch de Google Calendar */}
            <div className="flex items-center space-x-2.5 bg-gray-50 border border-gray-200/85 rounded-xl px-3 py-1.5 text-xs transition-all duration-150 hover:bg-gray-100/50 shadow-sm mr-1">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-3.5 h-3.5" alt="Google" />
              <span className="font-semibold text-gray-700">Google Calendar</span>
              <button
                onClick={googleAccessToken ? () => {
                  if (confirm('¿Estás seguro de que deseas desconectar Google Calendar?')) {
                    localStorage.removeItem('google_access_token');
                    window.location.reload();
                  }
                } : handleGoogleSync}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  googleAccessToken ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={!!googleAccessToken}
                title={googleAccessToken ? 'Conectado - Haz clic para desconectar' : 'Desconectado - Haz clic para conectar'}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    googleAccessToken ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowPresets(true)}
              className="flex items-center"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Horarios predefinidos
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 border-b border-gray-200">
          <Alert type="error" title="Error" message={error} />
        </div>
      )}

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } `}
            >
              {tab.label}
              {tab.id !== 'calendar' && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {activeTab === 'schedule' && (
          <WeeklySchedule
            availabilitySlots={availabilitySlots}
            onAddSlot={createAvailabilitySlot}
            onUpdateSlot={updateAvailabilitySlot}
            onDeleteSlot={deleteAvailabilitySlot}
          />
        )}

        {activeTab === 'blocked' && (
          <BlockedPeriods
            blockedPeriods={blockedPeriods}
            onAddPeriod={createBlockedPeriod}
            onDeletePeriod={deleteBlockedPeriod}
          />
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4 animate-fadeIn">
            <Calendar
              appointments={appointments}
              consultations={consultations}
              blockedPeriods={[...blockedPeriods, ...googleEvents]}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
              currentDate={currentCalendarDate}
              onMonthChange={setCurrentCalendarDate}
              className="border border-gray-200 rounded-lg shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Modal de modelador de plantilla semanal en lote */}
      <Modal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        title="Configurar plantilla semanal"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Define tu horario semanal recurrente. Selecciona los días que estarás disponible y su rango de horas.
          </p>

          <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
            {DAYS_OF_WEEK.map((day) => {
              const config = bulkDays[day.value];
              return (
                <div key={day.value} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white border border-gray-200/80 rounded-xl gap-3 transition-colors hover:border-gray-300">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`bulk-${day.value}`}
                      checked={config.checked}
                      onChange={(e) => setBulkDays(prev => ({
                        ...prev,
                        [day.value]: { ...prev[day.value], checked: e.target.checked }
                      }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor={`bulk-${day.value}`} className="font-bold text-gray-800 text-sm cursor-pointer select-none">
                      {day.label}
                    </label>
                  </div>

                  {config.checked ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-medium">De</span>
                      <select
                        value={config.startTime}
                        onChange={(e) => setBulkDays(prev => ({
                          ...prev,
                          [day.value]: { ...prev[day.value], startTime: e.target.value }
                        }))}
                        className="py-1 px-2 border border-gray-300 rounded-lg text-xs font-bold bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {TIME_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-500 font-medium">a</span>
                      <select
                        value={config.endTime}
                        onChange={(e) => setBulkDays(prev => ({
                          ...prev,
                          [day.value]: { ...prev[day.value], endTime: e.target.value }
                        }))}
                        className="py-1 px-2 border border-gray-300 rounded-lg text-xs font-bold bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {TIME_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded-lg">Cerrado</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setShowPresets(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApplyBulkSchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Aplicar a disponibilidad
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de detalles del evento */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Detalles del evento"
        size="sm"
      >
        {getEventDetails()}
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setShowEventModal(false)}>
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* Modal de detalles de actividad del día */}
      {showDayDetailModal && selectedDate && (
        <Modal
          isOpen={showDayDetailModal}
          onClose={() => {
            setShowDayDetailModal(false);
            setSelectedDate(null);
            setIsAddingBlockOnDay(false);
          }}
          title={`Actividad del día: ${format(selectedDate, "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}`}
          size="md"
        >
          <div className="space-y-6">
            {!isAddingBlockOnDay ? (
              <>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
                      <CalendarIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-bold text-gray-700">Sin actividades para este día</p>
                      <p className="text-xs text-gray-505 mt-1 mb-4">No tienes citas, consultas ni bloqueos programados.</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {onCreateAppointment && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setShowDayDetailModal(false);
                              onCreateAppointment(selectedDate);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5"
                          >
                            + Agendar Cita
                          </Button>
                        )}
                        {onCreateConsultation && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowDayDetailModal(false);
                              onCreateConsultation(selectedDate);
                            }}
                            className="text-xs font-bold border-gray-300 hover:border-gray-400 px-3 py-1.5"
                          >
                            + Crear Consulta
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    selectedDayEvents.map((event) => {
                      const isApt = event.type === 'appointment';
                      const isCons = event.type === 'consultation';
                      const isBlock = event.type === 'blocked';

                      return (
                        <div
                          key={event.id}
                          className="py-1.5 px-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between transition-all duration-200 hover:border-gray-350 hover:shadow-sm"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-800 truncate leading-snug">
                                {event.title}
                              </h4>
                              
                              {event.status && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  event.status === 'pending' ? 'bg-gray-100 text-gray-750 border border-gray-200' :
                                  event.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                                  event.status === 'confirmed' || event.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                                  'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  {event.status === 'scheduled' ? 'Programada' :
                                   event.status === 'pending' ? 'Pendiente' :
                                   event.status === 'confirmed' ? 'Confirmada' :
                                   event.status === 'completed' ? 'Completada' :
                                   event.status}
                                </span>
                              )}
                            </div>
                            
                            {/* Subtexto simple: solo mostrar horario si es cita o bloqueo parcial */}
                            {!isCons && event.time && (
                              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                                {event.time}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {isApt && onViewAppointment && (
                              <button
                                onClick={() => {
                                  setShowDayDetailModal(false);
                                  onViewAppointment(event.data);
                                }}
                                className="text-xs font-bold text-blue-650 hover:text-blue-700 hover:underline bg-transparent border-0 cursor-pointer py-1"
                              >
                                Ver Cita →
                              </button>
                            )}
                            {isCons && onViewConsultation && (
                              <button
                                onClick={() => {
                                  setShowDayDetailModal(false);
                                  onViewConsultation(event.data);
                                }}
                                className="text-xs font-bold text-blue-650 hover:text-blue-700 hover:underline bg-transparent border-0 cursor-pointer py-1"
                              >
                                Ver Consulta →
                              </button>
                            )}
                            {isBlock && (
                              <button
                                onClick={async () => {
                                  if (confirm('¿Estás seguro de que deseas eliminar este bloqueo?')) {
                                    await deleteBlockedPeriod(event.id);
                                    setSelectedDayEvents(prev => prev.filter(e => e.id !== event.id));
                                  }
                                }}
                                className="p-1 text-red-550 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                                title="Eliminar bloqueo"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-100 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingBlockOnDay(true)}
                      className="flex items-center text-xs font-semibold border-gray-300 hover:border-gray-400 py-1.5 px-3"
                    >
                      <PlusIcon className="h-3.5 w-3.5 mr-1" />
                      Bloquear horas
                    </Button>
                    {onCreateAppointment && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowDayDetailModal(false);
                          onCreateAppointment(selectedDate);
                        }}
                        className="flex items-center text-xs font-semibold border-gray-300 hover:border-gray-400 py-1.5 px-3"
                      >
                        + Agendar Cita
                      </Button>
                    )}
                    {onCreateConsultation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowDayDetailModal(false);
                          onCreateConsultation(selectedDate);
                        }}
                        className="flex items-center text-xs font-semibold border-gray-300 hover:border-gray-400 py-1.5 px-3"
                      >
                        + Crear Consulta
                      </Button>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowDayDetailModal(false);
                      setSelectedDate(null);
                    }}
                    className="text-xs font-bold py-1.5 px-3"
                  >
                    Cerrar
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm">Bloquear horas en este día</h4>
                  <button
                    onClick={() => setIsAddingBlockOnDay(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Volver a la lista
                  </button>
                </div>
                <BlockPeriodForm
                  initialDate={selectedDate}
                  onSubmit={async (data) => {
                    await handleBlockPeriod(data);
                    setTimeout(() => {
                      setSelectedDayEvents(getEventsForDate(selectedDate));
                    }, 400);
                  }}
                  onCancel={() => setIsAddingBlockOnDay(false)}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AvailabilityManager;