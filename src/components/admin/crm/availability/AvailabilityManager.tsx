
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
import { format, startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from 'date-fns';
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

// Componente de horario semanal
const WeeklySchedule: React.FC<{
  availabilitySlots: AvailabilitySlot[];
  onAddSlot: (slot: Omit<AvailabilitySlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSlot: (id: string, slot: Partial<AvailabilitySlot>) => void;
  onDeleteSlot: (id: string) => void;
}> = ({ availabilitySlots, onAddSlot, onUpdateSlot, onDeleteSlot }) => {
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 'monday' as DayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true
  });

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

    return grouped;
  }, [availabilitySlots]);

  const handleAddSlot = useCallback(() => {
    onAddSlot({
      ...newSlot,
      date: new Date().toISOString().split('T')[0], // Fecha dummy para slots recurrentes
      type: 'available',
      isAvailable: true
    });
    setShowAddForm(false);
    setNewSlot({
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true
    });
  }, [newSlot, onAddSlot]);

  const handleUpdateSlot = useCallback((slot: AvailabilitySlot, field: string, value: any) => {
    onUpdateSlot(slot.id, { [field]: value });
  }, [onUpdateSlot]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Horario semanal</h3>
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Añadir horario
        </Button>
      </div>

      {/* Formulario para añadir nuevo slot */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Nuevo horario</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Día"
              value={newSlot.dayOfWeek}
              onChange={(e) => setNewSlot(prev => ({ ...prev, dayOfWeek: e.target.value as DayOfWeek }))}
              options={DAYS_OF_WEEK}
            />

            <Input
              label="Hora inicio"
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
            />

            <Input
              label="Hora fin"
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
            />

            <div className="flex items-end">
              <Button
                onClick={handleAddSlot}
                disabled={!newSlot.startTime || !newSlot.endTime}
                className="w-full"
              >
                Añadir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de horarios por día */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => (
          <div key={day.value} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{day.label}</h4>
              {slotsByDay[day.value].length === 0 && (
                <Badge variant="secondary">Sin horarios</Badge>
              )}
            </div>

            {slotsByDay[day.value].length > 0 ? (
              <div className="space-y-2">
                {slotsByDay[day.value].map(slot => (
                  <div key={slot.id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-center space-x-4">
                      <ClockIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      {slot.isRecurring && (
                        <Badge variant="info" size="sm">Recurrente</Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingSlot(slot)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSlot(slot.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay horarios configurados para este día</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {editingSlot && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSlot(null)}
          title="Editar horario"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hora inicio"
                type="time"
                value={editingSlot.startTime}
                onChange={(e) => handleUpdateSlot(editingSlot, 'startTime', e.target.value)}
              />

              <Input
                label="Hora fin"
                type="time"
                value={editingSlot.endTime}
                onChange={(e) => handleUpdateSlot(editingSlot, 'endTime', e.target.value)}
              />
            </div>

            <Checkbox
              label="Horario recurrente"
              checked={editingSlot.isRecurring}
              onChange={(e) => handleUpdateSlot(editingSlot, 'isRecurring', e.target.checked)}
              helpText="Se aplicará automáticamente cada semana"
            />

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setEditingSlot(null)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setEditingSlot(null)}
              >
                Guardar
              </Button>
            </div>
          </div>
        </Modal>
      )}
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
  className = ''
}) => {
  // Estados locales
  const [activeTab, setActiveTab] = useState<'schedule' | 'blocked' | 'calendar'>('schedule');
  const [showPresets, setShowPresets] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Google Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

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
      // Crear nuevos slots
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
  }, [createAvailabilitySlot]);

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
    setShowBlockModal(true);
  }, []);

  const handleBlockPeriod = useCallback(async (periodData: any) => {
    await createBlockedPeriod(periodData);
    setShowBlockModal(false);
    setSelectedDate(null);
  }, [createBlockedPeriod]);

  const tabs = [
    { id: 'schedule', label: 'Horario semanal', count: availabilitySlots.length },
    { id: 'blocked', label: 'Períodos bloqueados', count: blockedPeriods.length },
    { id: 'calendar', label: 'Calendario', count: 0 }
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
          <div className="space-y-4">
            {!googleAccessToken ? (
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Sincronizar con Google Calendar</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Conecta tu cuenta para ver tus eventos personales y evitar conflictos.
                  </p>
                </div>
                <Button onClick={handleGoogleSync} variant="outline" className="bg-white">
                  <span className="flex items-center">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 mr-2" alt="Google" />
                    Conectar
                  </span>
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-green-900">Conectado con Google Calendar</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Tus eventos se están sincronizando correctamente.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="success">Sincronizado</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('google_access_token');
                      window.location.reload(); // Force reload to clear context state
                    }}
                    className="ml-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Desconectar
                  </Button>
                </div>
              </div>
            )}

            <Calendar
              appointments={appointments}
              consultations={consultations}
              blockedPeriods={[...blockedPeriods, ...googleEvents]}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
              currentDate={currentCalendarDate}
              onMonthChange={setCurrentCalendarDate}
              className="border border-gray-200 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Modal de horarios predefinidos */}
      <Modal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        title="Horarios predefinidos"
        size="lg"
      >
        {/* ... existing preset modal content ... */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecciona un horario predefinido para aplicar rápidamente a tu disponibilidad.
          </p>

          <div className="space-y-3">
            {PRESET_SCHEDULES.map((preset, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{preset.name}</h4>
                    <p className="text-sm text-gray-600">{preset.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {preset.slots.map((slot, slotIndex) => (
                        <Badge key={slotIndex} variant="info" size="sm">
                          {DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label}: {slot.startTime}-{slot.endTime}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => applyPresetSchedule(preset)}
                    className="ml-4"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPresets(false)}
            >
              Cerrar
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

      {/* Modal para bloquear fecha desde calendario */}
      {showBlockModal && selectedDate && (
        <Modal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          title={`Bloquear ${formatDate(selectedDate.toISOString())} `}
          size="md"
        >
          <BlockPeriodForm
            initialDate={selectedDate}
            onSubmit={handleBlockPeriod}
            onCancel={() => setShowBlockModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

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
          <Input
            label="Hora inicio"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Hora fin"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
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

export default AvailabilityManager;