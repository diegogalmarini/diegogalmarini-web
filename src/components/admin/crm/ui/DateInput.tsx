import React, { useState, useEffect, useRef } from 'react';

interface DateInputProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  min?: string;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

// Función para convertir DD/MM/AAAA a YYYY-MM-DD
const convertToISODate = (ddmmyyyy: string): string => {
  const numbers = ddmmyyyy.replace(/\D/g, '');
  if (numbers.length === 8) {
    const day = numbers.slice(0, 2);
    const month = numbers.slice(2, 4);
    const year = numbers.slice(4, 8);
    return `${year}-${month}-${day}`;
  }
  return '';
};

// Función para convertir YYYY-MM-DD a DD/MM/AAAA
const convertFromISODate = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  return '';
};

// Función para validar fecha
const isValidDate = (ddmmyyyy: string): boolean => {
  const numbers = ddmmyyyy.replace(/\D/g, '');
  if (numbers.length !== 8) return false;
  
  const day = parseInt(numbers.slice(0, 2), 10);
  const month = parseInt(numbers.slice(2, 4), 10);
  const year = parseInt(numbers.slice(4, 8), 10);
  
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
    return false;
  }
  
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value = '',
  onChange,
  error,
  required,
  min,
  placeholder = 'DD/MM/AAAA',
  helpText,
  className
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Convertir valor inicial de ISO a DD/MM/AAAA
  useEffect(() => {
    if (value) {
      setDisplayValue(convertFromISODate(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatInput = (inputValue: string): string => {
    // Remover todo excepto números
    const numbers = inputValue.replace(/\D/g, '');
    
    // Aplicar formato DD/MM/AAAA
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 2);
      if (numbers.length > 2) {
        formatted += '/' + numbers.slice(2, 4);
        if (numbers.length > 4) {
          formatted += '/' + numbers.slice(4, 8);
        }
      }
    }
    
    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatInput(inputValue);
    
    // Limitar a 10 caracteres (DD/MM/AAAA)
    if (formatted.length <= 10) {
      setDisplayValue(formatted);
      
      // Validar y convertir a ISO si está completa
      if (formatted.length === 10) {
        if (isValidDate(formatted)) {
          const isoDate = convertToISODate(formatted);
          
          // Validar fecha mínima si se especifica
          if (min) {
            const minDate = new Date(min);
            const inputDate = new Date(isoDate);
            if (inputDate < minDate) {
              setValidationError('La fecha no puede ser anterior a la fecha mínima permitida');
              return;
            }
          }
          
          setValidationError('');
          onChange?.(isoDate);
        } else {
          setValidationError('Fecha inválida');
        }
      } else {
        setValidationError('');
        onChange?.('');
      }
    }
  };

  const handleBlur = () => {
    if (displayValue && displayValue.length < 10) {
      setValidationError('Fecha incompleta');
    }
  };

  const finalError = validationError || error;
  const inputId = `date-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={10}
          className={`
            block w-full rounded-md border-2 shadow-sm transition-colors bg-white px-3 py-2
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm
            ${finalError ? 'border-red-400 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-400'}
          `}
          aria-invalid={!!finalError}
          aria-describedby={finalError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        />
        
        {finalError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {finalError && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {finalError}
        </p>
      )}
      
      {helpText && !finalError && (
        <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default DateInput;