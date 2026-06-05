import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Plan } from '../types/crm';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

const db = getFirestore(app);
const PLANS_COLLECTION = 'plans';

interface PlanContextType {
  plans: (Plan & { order: number })[];
  loading: boolean;
  updatePlan: (id: string, updatedPlan: Partial<Plan>) => Promise<void>;
  getPlanById: (id: string) => (Plan & { order: number }) | undefined;
  addPlan: (plan: Omit<Plan, 'id' | 'order'>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  togglePlanStatus: (id: string) => Promise<void>;
  reorderPlans: (fromIndex: number, toIndex: number) => void;
}

const defaultPlans: (Plan & { order: number })[] = [
  {
    id: 'free',
    name: 'Consulta Inicial Gratuita',
    nameEn: 'Free Initial Consultation',
    price: 0,
    duration: 0,
    features: ['Comunicación por email', 'Respuesta en 24h'],
    featuresEn: ['Email communication', 'Response within 24h'],
    description: 'Evaluación inicial de tu proyecto con recomendaciones básicas. Ideal para obtener una primera orientación sobre tu situación actual.',
    descriptionEn: 'Initial evaluation of your project with basic recommendations. Ideal to get an initial guidance on your current status.',
    isActive: true,
    order: 0,
    paymentLink: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'express',
    name: 'Sesión Estratégica',
    nameEn: 'Strategy Session',
    price: 150,
    duration: 30,
    features: ['Videollamada 30 min', 'Grabación de la sesión', 'Plan de acción'],
    featuresEn: ['30-min video call', 'Session recording', 'Action plan'],
    description: 'Análisis detallado de un problema específico con plan de acción concreto. Incluye seguimiento por email para resolver dudas posteriores.',
    descriptionEn: 'Detailed analysis of a specific problem with a concrete action plan. Includes follow-up by email to resolve subsequent questions.',
    isActive: true,
    order: 1,
    paymentLink: 'https://buy.stripe.com/dRm5kx9VHcwQ5VTf3G1oI00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'complete',
    name: 'Consultoría Completa',
    nameEn: 'Full Strategic Consultation',
    price: 250,
    duration: 60,
    features: ['Videollamada 60 min', 'Auditoría completa', 'Documentación PDF', 'Soporte 1 semana'],
    featuresEn: ['60-min video call', 'Full audit', 'PDF documentation', '1-week support'],
    description: 'Para retos complejos, arquitectura o roadmaps estratégicos. Incluye análisis profundo, estrategia personalizada, documentación detallada y seguimiento por una semana.',
    descriptionEn: 'For complex challenges, architecture, or strategic roadmaps. Includes in-depth analysis, custom strategy, detailed documentation, and one-week support.',
    isActive: true,
    order: 2,
    paymentLink: 'https://buy.stripe.com/7sY9AN6Jv9kEesp5t61oI01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const PlansContext = createContext<PlanContextType | undefined>(undefined);

export const PlansProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<(Plan & { order: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar planes desde Firestore al montar
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, PLANS_COLLECTION));
        if (querySnapshot.empty) {
          // Si está vacío, sembrar los planes iniciales
          const seededPlans = [...defaultPlans];
          for (const plan of seededPlans) {
            await setDoc(doc(db, PLANS_COLLECTION, plan.id), plan);
          }
          setPlans(seededPlans);
        } else {
          const loadedPlans: (Plan & { order: number })[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loadedPlans.push({
              ...data,
              id: docSnap.id
            } as Plan & { order: number });
          });
          setPlans(loadedPlans.sort((a, b) => a.order - b.order));
        }
      } catch (err) {
        console.error('Error loading plans from Firestore:', err);
        // Fallback a planes por defecto
        setPlans(defaultPlans);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const updatePlan = async (id: string, updatedPlan: Partial<Plan>) => {
    try {
      const docRef = doc(db, PLANS_COLLECTION, id);
      const updateData = {
        ...updatedPlan,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, updateData);
      
      setPlans(currentPlans =>
        currentPlans.map(plan =>
          plan.id === id ? { ...plan, ...updateData } : plan
        )
      );
    } catch (err) {
      console.error('Error updating plan in Firestore:', err);
      throw err;
    }
  };

  const getPlanById = (id: string) => {
    return plans.find(plan => plan.id === id);
  };

  const addPlan = async (newPlan: Omit<Plan, 'id' | 'order'>) => {
    try {
      const newId = Date.now().toString();
      const newOrder = Math.max(...plans.map(p => p.order), -1) + 1;
      const planData = {
        ...newPlan,
        id: newId,
        order: newOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, PLANS_COLLECTION, newId), planData);
      
      setPlans(currentPlans => [
        ...currentPlans,
        planData
      ]);
    } catch (err) {
      console.error('Error adding plan in Firestore:', err);
      throw err;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, PLANS_COLLECTION, id));
      setPlans(currentPlans => currentPlans.filter(plan => plan.id !== id));
    } catch (err) {
      console.error('Error deleting plan from Firestore:', err);
      throw err;
    }
  };

  const togglePlanStatus = async (id: string) => {
    try {
      const plan = plans.find(p => p.id === id);
      if (plan) {
        const docRef = doc(db, PLANS_COLLECTION, id);
        const newStatus = !plan.isActive;
        await updateDoc(docRef, {
          isActive: newStatus,
          updatedAt: new Date().toISOString()
        });
        
        setPlans(currentPlans =>
          currentPlans.map(p =>
            p.id === id ? { ...p, isActive: newStatus, updatedAt: new Date().toISOString() } : p
          )
        );
      }
    } catch (err) {
      console.error('Error toggling plan status in Firestore:', err);
      throw err;
    }
  };

  const reorderPlans = (fromIndex: number, toIndex: number) => {
    setPlans(currentPlans => {
      const sortedPlans = [...currentPlans].sort((a, b) => a.order - b.order);
      const [movedPlan] = sortedPlans.splice(fromIndex, 1);
      sortedPlans.splice(toIndex, 0, movedPlan);

      const updated = sortedPlans.map((plan, index) => ({
        ...plan,
        order: index
      }));

      // Guardar orden en segundo plano
      updated.forEach(async (plan) => {
        try {
          await updateDoc(doc(db, PLANS_COLLECTION, plan.id), {
            order: plan.order,
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          console.error('Error updating order in Firestore for plan:', plan.id, err);
        }
      });

      return updated;
    });
  };

  return (
    <PlansContext.Provider value={{
      plans: plans.sort((a, b) => a.order - b.order),
      loading,
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