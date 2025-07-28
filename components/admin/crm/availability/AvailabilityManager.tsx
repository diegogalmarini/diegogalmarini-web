// Componente de gestión de disponibilidad
// Permite configurar horarios disponibles y bloquear períodos específicos

import React, { useState, useCallback, useMemo } from 'react';
import type { AvailabilitySlot, BlockedPeriod, DayOfWeek } from '../../../../types/crm';
import { useAvailability } from '../../../../hooks/useCRM';
import Button from '../ui/Button';
import { Input, Select, Checkbox } from '../ui/FormField';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';
import { Calendar } from '../ui/Calendar';
import { formatDate, formatTime } from '../../../../utils/dateUtils';
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
    onAddSlot(newSlot);
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
                <Badge variant="gray">Sin horarios</Badge>
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
                        <Badge variant="blue" size="sm">Recurrente</Badge>
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
    title: '',
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
      title: newPeriod.title,
      startDate,
      endDate,
      reason: newPeriod.reason || undefined,
      isAllDay: newPeriod.isAllDay
    });
    
    setShowAddForm(false);
    setNewPeriod({
      title: '',
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
              label="Título"
              value={newPeriod.title}
              onChange={(e) => setNewPeriod(prev => ({ ...prev, title: e.target.value }))}
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
            
            <Input
              label="Motivo (opcional)"
              value={newPeriod.reason}
              onChange={(e) => setNewPeriod(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Describe el motivo del bloqueo"
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
                disabled={!newPeriod.title || !newPeriod.startDate || !newPeriod.endDate}
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
                    <div className="font-medium text-red-900">{period.title}</div>
                    <div className="text-sm text-red-700">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </div>
                    {period.reason && (
                      <div className="text-sm text-red-600 mt-1">{period.reason}</div>
                    )}
                  </div>
                  <Badge variant="red">Activo</Badge>
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
                    <div className="font-medium text-yellow-900">{period.title}</div>
                    <div className="text-sm text-yellow-700">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </div>
                    {period.reason && (
                      <div className="text-sm text-yellow-600 mt-1">{period.reason}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="yellow">Programado</Badge>
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
                    <div className="font-medium text-gray-700">{period.title}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </div>
                  </div>
                  <Badge variant="gray">Finalizado</Badge>
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
  const [activeTab, setActiveTab] = useState<'schedule' | 'blocked'>('schedule');
  const [showPresets, setShowPresets] = useState(false);

  // Hooks
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

  // Aplicar horario predefinido
  const applyPresetSchedule = useCallback(async (preset: typeof PRESET_SCHEDULES[0]) => {
    try {
      // Eliminar slots existentes (opcional, se podría preguntar al usuario)
      // for (const slot of availabilitySlots) {
      //   await deleteAvailabilitySlot(slot.id);
      // }
      
      // Crear nuevos slots
      for (const slot of preset.slots) {
        await createAvailabilitySlot(slot);
      }
      
      setShowPresets(false);
    } catch (error) {
      console.error('Error aplicando horario predefinido:', error);
    }
  }, [createAvailabilitySlot]);

  const tabs = [
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
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
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
      </div>

      {/* Modal de horarios predefinidos */}
      <Modal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        title="Horarios predefinidos"
        size="lg"
      >
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
                        <Badge key={slotIndex} variant="blue" size="sm">
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
    </div>
  );
};

export default AvailabilityManager;