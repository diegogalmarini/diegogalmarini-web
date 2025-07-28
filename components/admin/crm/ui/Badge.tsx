// Componente de badge reutilizable
// Muestra estados, etiquetas y categorías con diferentes colores

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Componentes específicos para estados comunes
export const StatusBadge: React.FC<{ status?: string; className?: string }> = ({ status, className }) => {
  const getVariant = (status?: string) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pendiente':
        return 'warning';
      case 'in_progress':
      case 'en_progreso':
        return 'info';
      case 'completed':
      case 'completado':
        return 'success';
      case 'cancelled':
      case 'cancelado':
        return 'error';
      case 'scheduled':
      case 'programado':
        return 'info';
      case 'confirmed':
      case 'confirmado':
        return 'success';
      case 'active':
      case 'activo':
        return 'success';
      case 'inactive':
      case 'inactivo':
        return 'secondary';
      case 'prospect':
      case 'prospecto':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDisplayText = (status?: string) => {
    if (!status) return 'Sin estado';
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En Progreso',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'scheduled': 'Programado',
      'confirmed': 'Confirmado',
      'active': 'Activo',
      'inactive': 'Inactivo',
      'prospect': 'Prospecto'
    };

    return statusMap[status.toLowerCase()] || status;
  };

  return (
    <Badge variant={getVariant(status)} className={className}>
      {getDisplayText(status)}
    </Badge>
  );
};

export const PriorityBadge: React.FC<{ priority?: string; className?: string }> = ({ priority, className }) => {
  const getVariant = (priority?: string) => {
    if (!priority) return 'default';
    switch (priority.toLowerCase()) {
      case 'high':
      case 'alta':
        return 'error';
      case 'medium':
      case 'media':
        return 'warning';
      case 'low':
      case 'baja':
        return 'success';
      default:
        return 'default';
    }
  };

  const getDisplayText = (priority?: string) => {
    if (!priority) return 'Sin prioridad';
    const priorityMap: { [key: string]: string } = {
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };

    return priorityMap[priority.toLowerCase()] || priority;
  };

  return (
    <Badge variant={getVariant(priority)} className={className}>
      {getDisplayText(priority)}
    </Badge>
  );
};

export const PlanTypeBadge: React.FC<{ planType?: string; className?: string }> = ({ planType, className }) => {
  const getVariant = (planType?: string) => {
    if (!planType) return 'default';
    switch (planType.toLowerCase()) {
      case 'consultation_30':
        return 'info';
      case 'consultation_60':
        return 'secondary';
      case 'follow_up':
        return 'warning';
      case 'strategy_session':
        return 'success';
      default:
        return 'default';
    }
  };

  const getDisplayText = (planType?: string) => {
    if (!planType) return 'Sin tipo';
    const planMap: { [key: string]: string } = {
      'consultation_30': 'Consulta 30min',
      'consultation_60': 'Consulta 60min',
      'follow_up': 'Seguimiento',
      'strategy_session': 'Sesión Estratégica'
    };

    return planMap[planType.toLowerCase()] || planType;
  };

  return (
    <Badge variant={getVariant(planType)} className={className}>
      {getDisplayText(planType)}
    </Badge>
  );
};

export default Badge;