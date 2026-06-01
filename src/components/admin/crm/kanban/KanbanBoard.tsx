// Componente de Tablero Kanban para gestión de Leads (Consultas) y Tareas (Seguimientos)
// Soporta cambio dinámico de estado con Firestore y diseño responsivo premium

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Consultation, FollowUp, ConsultationStatus, FollowUpStatus } from '../../../../types/crm';
import { useConsultations, useFollowUps, useClients } from '../../../../hooks/useCRM';
import Badge, { StatusBadge, PriorityBadge, PlanTypeBadge } from '../ui/Badge';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import { formatDate } from '../../../../utils/dateUtils';
import {
  ViewColumnsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface KanbanBoardProps {
  onConsultationSelect?: (consultation: Consultation) => void;
  onConsultationEdit?: (consultation: Consultation) => void;
  onFollowUpEdit?: (followUp: FollowUp) => void;
  className?: string;
}

type BoardMode = 'leads' | 'tasks';

// Definición de columnas para Leads (Consultas)
const LEAD_COLUMNS = [
  { id: 'pending' as ConsultationStatus, name: 'Pendientes', color: 'border-t-gray-300 bg-gray-50/40' },
  { id: 'contacted' as ConsultationStatus, name: 'Contactados', color: 'border-t-gray-300 bg-gray-50/40' },
  { id: 'scheduled' as ConsultationStatus, name: 'Programados', color: 'border-t-gray-300 bg-gray-50/40' },
  { id: 'completed' as ConsultationStatus, name: 'Completados', color: 'border-t-gray-300 bg-gray-50/40' },
  { id: 'cancelled' as ConsultationStatus, name: 'Cancelados', color: 'border-t-gray-300 bg-gray-50/40' }
];

// Definición de columnas para Tareas de Seguimiento
const TASK_COLUMNS = [
  { id: 'pending' as FollowUpStatus, name: 'Por hacer', color: 'border-t-gray-300 bg-gray-50/40' },
  { id: 'in_progress' as FollowUpStatus, name: 'En proceso', color: 'border-t-gray-300 bg-gray-50/40' },
  { id: 'completed' as FollowUpStatus, name: 'Completadas', color: 'border-t-gray-300 bg-gray-50/40' },
  { id: 'cancelled' as FollowUpStatus, name: 'Canceladas', color: 'border-t-gray-300 bg-gray-50/40' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onConsultationSelect,
  onConsultationEdit,
  onFollowUpEdit,
  className = ''
}) => {
  const [boardMode, setBoardMode] = useState<BoardMode>('leads');

  // Drag and Drop active states
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<BoardMode | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Hooks de datos
  const {
    consultations,
    loading: loadingLeads,
    error: errorLeads,
    updateConsultation,
    loadConsultations
  } = useConsultations();

  const {
    followUps,
    loading: loadingTasks,
    error: errorTasks,
    updateFollowUp,
    completeFollowUp,
    loadFollowUps
  } = useFollowUps();

  const { clients } = useClients();

  // Diccionario de búsqueda de nombres de clientes
  const clientNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (clients && Array.isArray(clients)) {
      clients.forEach(client => {
        if (client.id && client.name) {
          map[client.id] = client.name;
        }
      });
    }
    return map;
  }, [clients]);

  // Manejadores de Drag and Drop
  const handleDragStart = useCallback((e: React.DragEvent, id: string, type: BoardMode) => {
    setDraggedItemId(id);
    setDraggedItemType(type);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItemId(null);
    setDraggedItemType(null);
    setDragOverColumnId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumnId(columnId);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const id = draggedItemId || e.dataTransfer.getData('text/plain');
    const type = draggedItemType;

    setDragOverColumnId(null);
    setDraggedItemId(null);
    setDraggedItemType(null);

    if (!id || !type) return;

    if (type === 'leads') {
      const lead = consultations.find(c => c.id === id);
      if (lead && lead.status !== columnId) {
        console.log(`🚀 Kanban DND: Moviendo consulta ${id} de ${lead.status} a ${columnId}`);
        await updateConsultation(id, { status: columnId as ConsultationStatus });
        await loadConsultations();
      }
    } else if (type === 'tasks') {
      const task = followUps.find(f => f.id === id);
      const currentStatus = task?.status === 'overdue' ? 'pending' : task?.status;
      if (task && currentStatus !== columnId) {
        console.log(`🚀 Kanban DND: Moviendo tarea ${id} de ${currentStatus} a ${columnId}`);
        if (columnId === 'completed') {
          await completeFollowUp(id, 'Completada desde el Tablero Kanban (Drag & Drop)');
        } else {
          await updateFollowUp(id, { status: columnId as FollowUpStatus });
        }
        await loadFollowUps();
      }
    }
  }, [draggedItemId, draggedItemType, consultations, followUps, updateConsultation, loadConsultations, updateFollowUp, completeFollowUp, loadFollowUps]);

  const isLoading = loadingLeads || loadingTasks;
  const isError = errorLeads || errorTasks;

  // Agrupar consultas por estado
  const groupedLeads = useMemo(() => {
    const groups: Record<ConsultationStatus, Consultation[]> = {
      pending: [],
      contacted: [],
      scheduled: [],
      completed: [],
      cancelled: []
    };
    consultations.forEach(lead => {
      if (groups[lead.status]) {
        groups[lead.status].push(lead);
      }
    });
    return groups;
  }, [consultations]);

  // Agrupar tareas por estado
  const groupedTasks = useMemo(() => {
    const groups: Record<FollowUpStatus, FollowUp[]> = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
      overdue: [] // Se mapean juntas a pending
    };
    followUps.forEach(task => {
      const status = task.status === 'overdue' ? 'pending' : task.status;
      if (groups[status]) {
        groups[status].push(task);
      }
    });
    return groups;
  }, [followUps]);

  // Mover consulta (Lead) de estado
  const handleMoveLead = useCallback(async (lead: Consultation, direction: 'left' | 'right') => {
    const statuses: ConsultationStatus[] = ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'];
    const currentIndex = statuses.indexOf(lead.status);
    let nextIndex = currentIndex + (direction === 'right' ? 1 : -1);

    if (nextIndex >= 0 && nextIndex < statuses.length) {
      const newStatus = statuses[nextIndex];
      console.log(`🚀 Kanban: Moviendo consulta ${lead.id} de ${lead.status} a ${newStatus}`);
      await updateConsultation(lead.id, { status: newStatus });
      await loadConsultations();
    }
  }, [updateConsultation, loadConsultations]);

  // Mover tarea (FollowUp) de estado
  const handleMoveTask = useCallback(async (task: FollowUp, direction: 'left' | 'right') => {
    const statuses: FollowUpStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
    const currentStatus = task.status === 'overdue' ? 'pending' : task.status;
    const currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = currentIndex + (direction === 'right' ? 1 : -1);

    if (nextIndex >= 0 && nextIndex < statuses.length) {
      const newStatus = statuses[nextIndex];
      console.log(`🚀 Kanban: Moviendo tarea ${task.id} de ${currentStatus} a ${newStatus}`);
      
      if (newStatus === 'completed') {
        await completeFollowUp(task.id, 'Completada desde el Tablero Kanban');
      } else {
        await updateFollowUp(task.id, { status: newStatus });
      }
      await loadFollowUps();
    }
  }, [updateFollowUp, completeFollowUp, loadFollowUps]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header del Tablero */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ViewColumnsIcon className="h-7 w-7 mr-2 text-blue-600" />
            Tablero Pipeline
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Visualiza y gestiona el flujo de trabajo de asesorías estratégicas en tiempo real
          </p>
        </div>

        {/* Alternar modos */}
        <div className="bg-gray-100 p-1 rounded-xl flex self-start sm:self-auto border border-gray-200">
          <button
            onClick={() => setBoardMode('leads')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              boardMode === 'leads'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Leads / Consultas
          </button>
          <button
            onClick={() => setBoardMode('tasks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              boardMode === 'tasks'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tareas / Seguimientos
          </button>
        </div>
      </div>

      {isError && (
        <Alert
          type="error"
          title="Error en la carga"
          message={errorLeads || errorTasks || 'Ha ocurrido un error al conectar con Firestore'}
        />
      )}

      {/* Grid del Tablero */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 font-medium">Sincronizando tablero con la nube...</span>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {boardMode === 'leads'
            ? LEAD_COLUMNS.map(column => {
                const leads = groupedLeads[column.id] || [];
                const isDragOver = dragOverColumnId === column.id;
                return (
                  <div
                    key={column.id}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={() => setDragOverColumnId(prev => prev === column.id ? null : prev)}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className={`rounded-2xl border p-4 min-h-[500px] flex flex-col space-y-4 shadow-sm border-t-4 transition-all duration-200 ${
                      isDragOver
                        ? 'border-dashed border-blue-400 bg-blue-50/10 scale-[1.01] ring-2 ring-blue-100/50'
                        : 'border-gray-200/60'
                    } ${column.color}`}
                  >
                    {/* Header de columna */}
                    <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                      <span className="font-semibold text-gray-800 text-sm">{column.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-500 shadow-sm">
                        {leads.length}
                      </span>
                    </div>

                    {/* Contenido / Tarjetas */}
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                      {leads.length > 0 ? (
                        leads.map(lead => {
                          const isCurrentlyDragged = draggedItemId === lead.id;
                          return (
                            <div
                              key={lead.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, lead.id, 'leads')}
                              onDragEnd={handleDragEnd}
                              className={`bg-white/80 border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between space-y-3 relative overflow-hidden cursor-grab active:cursor-grabbing ${
                                isCurrentlyDragged ? 'opacity-40 border-dashed border-blue-300' : 'border-gray-200/60'
                              }`}
                            >
                              {/* Prioridad de borde sutil */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                lead.priority === 'high' ? 'bg-red-500' :
                                lead.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />

                              <div className="space-y-1.5 pl-1.5">
                                <div className="flex items-center justify-between">
                                  <PlanTypeBadge planType={lead.planType} />
                                  <PriorityBadge priority={lead.priority} />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm leading-snug truncate group-hover:text-blue-600" title={lead.subject}>
                                  {lead.subject || 'Sin asunto'}
                                </h4>
                                <p className="text-xs font-medium text-gray-700 truncate">
                                  {lead.clientName}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">
                                  {lead.clientEmail}
                                </p>
                                <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-1">
                                  <ClockIcon className="h-3 w-3" />
                                  <span>{formatDate(lead.createdAt)}</span>
                                </div>
                              </div>

                              {/* Controles CRUD */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100 pl-1.5">
                                <div className="flex space-x-1.5">
                                  {onConsultationSelect && (
                                    <button
                                      onClick={() => onConsultationSelect(lead)}
                                      className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                      title="Ver detalle"
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                  {onConsultationEdit && (
                                    <button
                                      onClick={() => onConsultationEdit(lead)}
                                      className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                                      title="Editar"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200/50 rounded-xl">
                          <FolderOpenIcon className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400">Sin consultas</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            : TASK_COLUMNS.map(column => {
                const tasks = groupedTasks[column.id] || [];
                const isDragOver = dragOverColumnId === column.id;
                return (
                  <div
                    key={column.id}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={() => setDragOverColumnId(prev => prev === column.id ? null : prev)}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className={`rounded-2xl border p-4 min-h-[500px] flex flex-col space-y-4 shadow-sm border-t-4 transition-all duration-200 ${
                      isDragOver
                        ? 'border-dashed border-blue-400 bg-blue-50/10 scale-[1.01] ring-2 ring-blue-100/50'
                        : 'border-gray-200/60'
                    } ${column.color}`}
                  >
                    {/* Header de columna */}
                    <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                      <span className="font-semibold text-gray-800 text-sm">{column.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-500 shadow-sm">
                        {tasks.length}
                      </span>
                    </div>

                    {/* Contenido / Tarjetas */}
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                      {tasks.length > 0 ? (
                        tasks.map(task => {
                          const isOverdue = new Date(task.dueDate) < new Date() && task.status === 'pending';
                          const isCurrentlyDragged = draggedItemId === task.id;
                          const clientName = clientNameMap[task.clientId];
                          return (
                            <div
                              key={task.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, task.id, 'tasks')}
                              onDragEnd={handleDragEnd}
                              className={`bg-white/80 border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between space-y-3 relative overflow-hidden cursor-grab active:cursor-grabbing ${
                                isCurrentlyDragged ? 'opacity-40 border-dashed border-blue-300' : 'border-gray-200/60'
                              }`}
                            >
                              {/* Prioridad de borde sutil */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-500' :
                                task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />

                              <div className="space-y-1.5 pl-1.5">
                                <div className="flex items-center justify-between">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 border text-gray-600`}>
                                    {task.type.toUpperCase()}
                                  </span>
                                  <PriorityBadge priority={task.priority === 'urgent' ? 'high' : task.priority} />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm leading-snug truncate" title={task.title}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2" title={task.description}>
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-1.5 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-150 p-1.5 rounded-lg mt-2">
                                  <UserIcon className="h-3 w-3 text-gray-400" />
                                  <span className="truncate" title={clientName || `ID: ${task.clientId}`}>
                                    Cliente: {clientName || `ID: ${task.clientId.substring(0, 8)}...`}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-[10px] mt-1">
                                  <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                                  <span className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                    Vence: {formatDate(task.dueDate)} {isOverdue && '⚠️ Vencida'}
                                  </span>
                                </div>
                              </div>

                              {/* Controles CRUD */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100 pl-1.5">
                                <div className="flex space-x-1.5">
                                  {onFollowUpEdit && (
                                    <button
                                      onClick={() => onFollowUpEdit(task)}
                                      className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                                      title="Editar"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                  {task.status !== 'completed' && (
                                    <button
                                      onClick={async () => {
                                        await completeFollowUp(task.id, 'Completada desde el Tablero Kanban');
                                        await loadFollowUps();
                                      }}
                                      className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-green-600 transition-colors"
                                      title="Marcar como Completada"
                                    >
                                      <CheckCircleIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200/50 rounded-xl">
                          <FolderOpenIcon className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400">Sin tareas</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
