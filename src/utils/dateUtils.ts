// Utilidades para manejo de fechas en el CRM
// Funciones para formateo, comparación y manipulación de fechas

/**
 * Formatea una fecha en formato legible
 * @param date - Fecha a formatear
 * @param options - Opciones de formateo
 * @returns Fecha formateada
 */
export const formatDate = (
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string => {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  return dateObj.toLocaleDateString('es-ES', options);
};

/**
 * Formatea una fecha y hora en formato legible
 * @param date - Fecha a formatear
 * @param options - Opciones de formateo
 * @returns Fecha y hora formateada
 */
export const formatDateTime = (
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  return dateObj.toLocaleDateString('es-ES', options);
};

/**
 * Formatea solo la hora
 * @param date - Fecha de la cual extraer la hora
 * @param options - Opciones de formateo
 * @returns Hora formateada
 */
export const formatTime = (
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  if (!date) return 'Hora no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return 'Hora inválida';
  }
  
  return dateObj.toLocaleTimeString('es-ES', options);
};

/**
 * Verifica si una fecha es hoy
 * @param date - Fecha a verificar
 * @returns true si es hoy
 */
export const isToday = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Verifica si una fecha es mañana
 * @param date - Fecha a verificar
 * @returns true si es mañana
 */
export const isTomorrow = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Verifica si una fecha es ayer
 * @param date - Fecha a verificar
 * @returns true si es ayer
 */
export const isYesterday = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Verifica si una fecha está en esta semana
 * @param date - Fecha a verificar
 * @returns true si está en esta semana
 */
export const isThisWeek = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  const today = new Date();
  
  // Obtener el inicio de la semana (lunes)
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Obtener el final de la semana (domingo)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return dateObj >= startOfWeek && dateObj <= endOfWeek;
};

/**
 * Verifica si una fecha está en este mes
 * @param date - Fecha a verificar
 * @returns true si está en este mes
 */
export const isThisMonth = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  const today = new Date();
  
  return (
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Obtiene el inicio del día
 * @param date - Fecha base
 * @returns Fecha al inicio del día (00:00:00)
 */
export const startOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Obtiene el final del día
 * @param date - Fecha base
 * @returns Fecha al final del día (23:59:59)
 */
export const endOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Obtiene el inicio de la semana (lunes)
 * @param date - Fecha base
 * @returns Fecha del inicio de la semana
 */
export const startOfWeek = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = dateObj.getDay();
  const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
  const startDate = new Date(dateObj);
  startDate.setDate(diff);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

/**
 * Obtiene el final de la semana (domingo)
 * @param date - Fecha base
 * @returns Fecha del final de la semana
 */
export const endOfWeek = (date: Date | string): Date => {
  const startDate = startOfWeek(date);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};

/**
 * Obtiene el inicio del mes
 * @param date - Fecha base
 * @returns Fecha del inicio del mes
 */
export const startOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
};

/**
 * Obtiene el final del mes
 * @param date - Fecha base
 * @returns Fecha del final del mes
 */
export const endOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Añade días a una fecha
 * @param date - Fecha base
 * @param days - Número de días a añadir
 * @returns Nueva fecha
 */
export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Añade semanas a una fecha
 * @param date - Fecha base
 * @param weeks - Número de semanas a añadir
 * @returns Nueva fecha
 */
export const addWeeks = (date: Date | string, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

/**
 * Añade meses a una fecha
 * @param date - Fecha base
 * @param months - Número de meses a añadir
 * @returns Nueva fecha
 */
export const addMonths = (date: Date | string, months: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setMonth(dateObj.getMonth() + months);
  return dateObj;
};

/**
 * Añade minutos a una fecha
 * @param date - Fecha base
 * @param minutes - Número de minutos a añadir
 * @returns Nueva fecha
 */
export const addMinutes = (date: Date | string, minutes: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setMinutes(dateObj.getMinutes() + minutes);
  return dateObj;
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns Diferencia en días
 */
export const diffInDays = (date1: Date | string, date2: Date | string): number => {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = Math.abs(dateObj2.getTime() - dateObj1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calcula la diferencia en horas entre dos fechas
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns Diferencia en horas
 */
export const diffInHours = (date1: Date | string, date2: Date | string): number => {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = Math.abs(dateObj2.getTime() - dateObj1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

/**
 * Calcula la diferencia en minutos entre dos fechas
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns Diferencia en minutos
 */
export const diffInMinutes = (date1: Date | string, date2: Date | string): number => {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = Math.abs(dateObj2.getTime() - dateObj1.getTime());
  return Math.ceil(diffTime / (1000 * 60));
};

/**
 * Formatea una fecha para input de tipo date
 * @param date - Fecha a formatear
 * @returns Fecha en formato YYYY-MM-DD
 */
export const formatForInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

/**
 * Formatea una fecha para input de tipo datetime-local
 * @param date - Fecha a formatear
 * @returns Fecha en formato YYYY-MM-DDTHH:mm
 */
export const formatForDateTimeInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formatea una fecha para input de tipo time
 * @param date - Fecha a formatear
 * @returns Hora en formato HH:mm
 */
export const formatForTimeInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Obtiene el nombre del día de la semana
 * @param date - Fecha
 * @param format - Formato (long, short, narrow)
 * @returns Nombre del día
 */
export const getDayName = (
  date: Date | string,
  format: 'long' | 'short' | 'narrow' = 'long'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', { weekday: format });
};

/**
 * Obtiene el nombre del mes
 * @param date - Fecha
 * @param format - Formato (long, short, narrow)
 * @returns Nombre del mes
 */
export const getMonthName = (
  date: Date | string,
  format: 'long' | 'short' | 'narrow' = 'long'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', { month: format });
};

/**
 * Verifica si una fecha es válida
 * @param date - Fecha a verificar
 * @returns true si es válida
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Convierte una cadena a fecha de manera segura
 * @param dateString - Cadena de fecha
 * @returns Fecha o null si no es válida
 */
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
};

/**
 * Obtiene la fecha actual sin tiempo
 * @returns Fecha actual al inicio del día
 */
export const getToday = (): Date => {
  return startOfDay(new Date());
};

/**
 * Obtiene la fecha de mañana sin tiempo
 * @returns Fecha de mañana al inicio del día
 */
export const getTomorrow = (): Date => {
  return startOfDay(addDays(new Date(), 1));
};

/**
 * Obtiene la fecha de ayer sin tiempo
 * @returns Fecha de ayer al inicio del día
 */
export const getYesterday = (): Date => {
  return startOfDay(addDays(new Date(), -1));
};

/**
 * Formatea una duración en minutos a texto legible
 * @param minutes - Duración en minutos
 * @returns Duración formateada
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Obtiene un rango de fechas relativo
 * @param period - Período (today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth)
 * @returns Objeto con fechas de inicio y fin
 */
export const getDateRange = (period: string): { start: Date; end: Date } => {
  const today = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: startOfDay(today),
        end: endOfDay(today)
      };
      
    case 'yesterday':
      const yesterday = addDays(today, -1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday)
      };
      
    case 'thisWeek':
      return {
        start: startOfWeek(today),
        end: endOfWeek(today)
      };
      
    case 'lastWeek':
      const lastWeekStart = addDays(startOfWeek(today), -7);
      return {
        start: lastWeekStart,
        end: addDays(lastWeekStart, 6)
      };
      
    case 'thisMonth':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today)
      };
      
    case 'lastMonth':
      const lastMonth = addMonths(today, -1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth)
      };
      
    default:
      return {
        start: startOfDay(today),
        end: endOfDay(today)
      };
  }
};