'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ModalType = 'login' | 'booking' | null;

interface ModalContextType {
  activeModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  isModalOpen: (type: ModalType) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    // Prevent background scrolling when modal is open
    if (type) {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    // Restore background scrolling
    document.body.style.overflow = 'unset';
  };

  const isModalOpen = (type: ModalType) => {
    return activeModal === type;
  };

  return (
    <ModalContext.Provider value={{
      activeModal,
      openModal,
      closeModal,
      isModalOpen
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};