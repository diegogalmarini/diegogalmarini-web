import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Plan } from '../types/crm';

interface PlanContextType {
  plans: (Plan & { order: number })[];
  updatePlan: (id: string, updatedPlan: Partial<Plan>) => void;
  getPlanById: (id: string) => (Plan & { order: number }) | undefined;
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  deletePlan: (id: string) => void;
  togglePlanStatus: (id: string) => void;
  reorderPlans: (fromIndex: number, toIndex: number) => void;
}

const defaultPlans: (Plan & { order: number })[] = [
  {
    id: 'free',
    name: 'Consulta Inicial Gratuita',
    price: 0,
    duration: 0,
    features: ['Comunicación por email', 'Respuesta en 24h'],
    description: 'Evaluación inicial de tu proyecto con recomendaciones básicas. Ideal para obtener una primera orientación sobre tu situación actual.',
    isActive: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'express',
    name: 'Sesión Estratégica',
    price: 150,
    duration: 30,
    features: ['Videollamada 30 min', 'Grabación de la sesión', 'Plan de acción'],
    description: 'Análisis detallado de un problema específico con plan de acción concreto. Incluye seguimiento por email para resolver dudas posteriores.',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'complete',
    name: 'Consultoría Completa',
    price: 250,
    duration: 60,
    features: ['Videollamada 60 min', 'Auditoría completa', 'Documentación PDF', 'Soporte 1 semana'],
    description: 'Para retos complejos, arquitectura o roadmaps estratégicos. Incluye análisis profundo, estrategia personalizada, documentación detallada y seguimiento por una semana.',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const PlansContext = createContext<PlanContextType | undefined>(undefined);

export const PlansProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<(Plan & { order: number })[]>(defaultPlans);

  const updatePlan = (id: string, updatedPlan: Partial<Plan>) => {
    setPlans(currentPlans =>
      currentPlans.map(plan =>
        plan.id === id ? { ...plan, ...updatedPlan } : plan
      )
    );
  };

  const getPlanById = (id: string) => {
    return plans.find(plan => plan.id === id);
  };

  const addPlan = (newPlan: Omit<Plan, 'id' | 'order'>) => {
    const newId = Date.now().toString();
    const newOrder = Math.max(...plans.map(p => p.order), -1) + 1;
    setPlans(currentPlans => [
      ...currentPlans,
      { ...newPlan, id: newId, order: newOrder }
    ]);
  };

  const deletePlan = (id: string) => {
    setPlans(currentPlans => currentPlans.filter(plan => plan.id !== id));
  };

  const togglePlanStatus = (id: string) => {
    setPlans(currentPlans =>
      currentPlans.map(plan =>
        plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
      )
    );
  };

  const reorderPlans = (fromIndex: number, toIndex: number) => {
    setPlans(currentPlans => {
      const sortedPlans = [...currentPlans].sort((a, b) => a.order - b.order);
      const [movedPlan] = sortedPlans.splice(fromIndex, 1);
      sortedPlans.splice(toIndex, 0, movedPlan);

      return sortedPlans.map((plan, index) => ({
        ...plan,
        order: index
      }));
    });
  };

  return (
    <PlansContext.Provider value={{
      plans: plans.sort((a, b) => a.order - b.order),
      updatePlan,
      getPlanById,
      addPlan,
      deletePlan,
      togglePlanStatus,
      reorderPlans
    }}>
      {children}
    </PlansContext.Provider>
  );
};

export const usePlans = (): PlanContextType => {
  const context = useContext(PlansContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
};