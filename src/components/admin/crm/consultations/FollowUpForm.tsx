import React, { useState } from 'react';
import { Input, Select, TextArea } from '../ui/FormField';
import Button, { PrimaryButton } from '../ui/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { googleCalendarService } from '../../../../services/googleCalendar';
import Alert from '../ui/Alert';

export interface FollowUpFormData {
    title: string;
    description: string;
    dueDate: string;
    type: 'call' | 'email' | 'meeting' | 'task';
    priority: 'low' | 'medium' | 'high';
}

interface FollowUpFormProps {
    consultationId: string;
    onSave: (data: FollowUpFormData) => void;
    onCancel: () => void;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({
    consultationId,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '',
        type: 'email',
        priority: 'medium'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [conflict, setConflict] = useState<string | null>(null);
    const { googleAccessToken } = useAuth();

    // Verificar conflictos con Google Calendar
    const checkGoogleCalendarConflict = async (date: string, time: string) => {
        if (!googleAccessToken || !date || !time) return;

        try {
            // Definir rango de tiempo para el evento (asumiendo 1 hora de duración por defecto)
            const startDateTime = new Date(`${date}T${time}`);
            const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hora

            // Buscar eventos en ese día
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const events = await googleCalendarService.listEvents(
                googleAccessToken,
                dayStart.toISOString(),
                dayEnd.toISOString()
            );

            // Verificar superposición
            const hasConflict = events.some(event => {
                const eventStart = new Date(`${event.startDate}T${event.startTime || '00:00'}`);
                const eventEnd = new Date(`${event.endDate}T${event.endTime || '23:59'}`);

                return (
                    (startDateTime >= eventStart && startDateTime < eventEnd) ||
                    (endDateTime > eventStart && endDateTime <= eventEnd) ||
                    (startDateTime <= eventStart && endDateTime >= eventEnd)
                );
            });

            if (hasConflict) {
                setConflict('Tienes un evento en Google Calendar a esta hora.');
            } else {
                setConflict(null);
            }
        } catch (error) {
            console.error('Error checking calendar conflict:', error);
        }
    };

    // Efecto para verificar conflictos cuando cambia fecha u hora
    React.useEffect(() => {
        if (formData.dueDate && formData.dueTime) {
            checkGoogleCalendarConflict(formData.dueDate, formData.dueTime);
        } else {
            setConflict(null);
        }
    }, [formData.dueDate, formData.dueTime]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        }

        if (!formData.dueDate) {
            newErrors.dueDate = 'La fecha de vencimiento es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        // Combinar fecha y hora
        let finalDate = formData.dueDate;
        if (formData.dueTime) {
            finalDate = `${formData.dueDate}T${formData.dueTime}:00`;
        } else {
            // Si no hay hora, usar final del día o una hora por defecto
            finalDate = `${formData.dueDate}T09:00:00`;
        }

        onSave({
            title: formData.title,
            description: formData.description,
            dueDate: finalDate,
            type: formData.type as 'call' | 'email' | 'meeting' | 'task',
            priority: formData.priority as 'low' | 'medium' | 'high'
        });
    };

    return (
        <div className="space-y-4">
            {conflict && (
                <Alert
                    type="warning"
                    title="Conflicto de agenda"
                    message={conflict}
                />
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                </label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Llamar al cliente"
                    error={errors.title}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                    </label>
                    <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        options={[
                            { value: 'email', label: 'Email' },
                            { value: 'call', label: 'Llamada' },
                            { value: 'meeting', label: 'Reunión' },
                            { value: 'task', label: 'Tarea' }
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad
                    </label>
                    <Select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        options={[
                            { value: 'low', label: 'Baja' },
                            { value: 'medium', label: 'Media' },
                            { value: 'high', label: 'Alta' }
                        ]}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha *
                    </label>
                    <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        error={errors.dueDate}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora
                    </label>
                    <Input
                        type="time"
                        value={formData.dueTime}
                        onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                </label>
                <TextArea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalles adicionales..."
                    rows={3}
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <Button onClick={onCancel} variant="outline">
                    Cancelar
                </Button>
                <PrimaryButton onClick={handleSubmit}>
                    Guardar Seguimiento
                </PrimaryButton>
            </div>
        </div>
    );
};

export default FollowUpForm;
