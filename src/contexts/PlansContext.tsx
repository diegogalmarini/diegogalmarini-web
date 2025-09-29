'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Plan {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  isActive: boolean;
  order: number;
}

interface PlanContextType {
  plans: Plan[];
  updatePlan: (id: string, updatedPlan: Partial<Plan>) => void;
  getPlanById: (id: string) => Plan | undefined;
  addPlan: (plan: Omit<Plan, 'id' | 'order'>) => void;
  deletePlan: (id: string) => void;
  togglePlanStatus: (id: string) => void;
  reorderPlans: (fromIndex: number, toIndex: number) => void;
}

const defaultPlans: Plan[] = [
  {
    id: 'free',
    name: 'Consulta Inicial Gratuita',
    price: 'Gratis',
    duration: 'Comunicación y respuesta por email',
    description: 'Evaluación inicial de tu proyecto con recomendaciones básicas. Ideal para obtener una primera orientación sobre tu situación actual.',
    isActive: true,
    order: 0
  },
  {
    id: '30min',
    name: 'Sesión Estratégica',
    price: '€150',
    duration: '30 minutos',
    description: 'Análisis detallado de un problema específico con plan de acción concreto. Incluye seguimiento por email para resolver dudas posteriores.',
    isActive: true,
    order: 1
  },
  {
    id: '60min',
    name: 'Consultoría Completa',
    price: '€250',
    duration: '60 minutos',
    description: 'Para retos complejos, arquitectura o roadmaps estratégicos. Incluye análisis profundo, estrategia personalizada, documentación detallada y seguimiento por una semana.',
    isActive: true,
    order: 2
  }
];

const PlansContext = createContext<PlanContextType | undefined>(undefined);

export const PlansProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);

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