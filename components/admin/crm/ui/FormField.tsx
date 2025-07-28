// Componentes de formulario reutilizables
// Proporciona campos de entrada con validación y manejo de errores

import React, { forwardRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

// Interfaz base para props de campo
interface BaseFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
  labelClassName?: string;
}

// Props para Input
interface InputProps extends BaseFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Props para TextArea
interface TextAreaProps extends BaseFieldProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  rows?: number;
}

// Props para Select
interface SelectProps extends BaseFieldProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
}

// Componente Input
export const Input = forwardRef<HTMLInputElement, InputProps>((
  { 
    label, 
    error, 
    required, 
    helpText, 
    className = '', 
    labelClassName = '',
    leftIcon,
    rightIcon,
    ...props 
  }, 
  ref
) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  const inputClasses = `
    block w-full rounded-md border-2 border-gray-400 shadow-sm transition-colors bg-white px-3 py-2
    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm
    ${hasError ? 'border-red-400 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-200' : ''}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon || hasError ? 'pr-10' : ''}
    ${props.disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300' : ''}
  `;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
        
        {(rightIcon || hasError) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {hasError ? (
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            ) : (
              rightIcon && <div className="h-5 w-5 text-gray-400">{rightIcon}</div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Componente TextArea
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((
  { 
    label, 
    error, 
    required, 
    helpText, 
    className = '', 
    labelClassName = '',
    rows = 3,
    ...props 
  }, 
  ref
) => {
  const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  const textareaClasses = `
    block w-full rounded-md border-2 border-gray-400 shadow-sm transition-colors bg-white px-3 py-2
    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm
    ${hasError ? 'border-red-400 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-200' : ''}
    ${props.disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300' : ''}
  `;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={textareaClasses}
        aria-invalid={hasError}
        aria-describedby={error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined}
        {...props}
      />
      
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${textareaId}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

// Componente Select
export const Select = forwardRef<HTMLSelectElement, SelectProps>((
  { 
    label, 
    error, 
    required, 
    helpText, 
    className = '', 
    labelClassName = '',
    options,
    placeholder,
    ...props 
  }, 
  ref
) => {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  const selectClasses = `
    block w-full rounded-md border-2 border-gray-400 shadow-sm transition-colors bg-white px-3 py-2
    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm
    ${hasError ? 'border-red-400 text-red-900 focus:border-red-500 focus:ring-red-200' : ''}
    ${props.disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300' : ''}
  `;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        id={selectId}
        className={selectClasses}
        aria-invalid={hasError}
        aria-describedby={error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${selectId}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Componente Checkbox
interface CheckboxProps extends BaseFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((
  { 
    label, 
    error, 
    required, 
    helpText, 
    description,
    className = '', 
    labelClassName = '',
    ...props 
  }, 
  ref
) => {
  const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  return (
    <div className={className}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`
              h-4 w-4 text-blue-600 border-gray-300 rounded transition-colors
              focus:ring-blue-500 focus:ring-2 focus:ring-offset-2
              ${hasError ? 'border-red-300' : ''}
              ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            `}
            aria-invalid={hasError}
            aria-describedby={error ? `${checkboxId}-error` : helpText ? `${checkboxId}-help` : undefined}
            {...props}
          />
        </div>
        
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={checkboxId} className={`font-medium text-gray-700 ${labelClassName}`}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {description && (
              <p className="text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${checkboxId}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Componente Radio Group
interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps extends BaseFieldProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  error,
  required,
  helpText,
  className = '',
  labelClassName = '',
  name,
  options,
  value,
  onChange,
  orientation = 'vertical'
}) => {
  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className={className}>
      {label && (
        <legend className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}
      
      <div className={`space-${orientation === 'horizontal' ? 'x' : 'y'}-4 ${orientation === 'horizontal' ? 'flex' : ''}`}>
        {options.map((option) => {
          const radioId = `${groupId}-${option.value}`;
          
          return (
            <div key={option.value} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={radioId}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  disabled={option.disabled}
                  className={`
                    h-4 w-4 text-blue-600 border-gray-300 transition-colors
                    focus:ring-blue-500 focus:ring-2 focus:ring-offset-2
                    ${hasError ? 'border-red-300' : ''}
                    ${option.disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
                  `}
                  aria-invalid={hasError}
                />
              </div>
              
              <div className="ml-3 text-sm">
                <label htmlFor={radioId} className="font-medium text-gray-700">
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

// Componente FormGroup para agrupar campos
interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  title,
  description,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};