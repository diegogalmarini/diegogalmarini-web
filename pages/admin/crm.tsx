// Página de administración del CRM
// Ejemplo de integración del módulo CRM en Next.js

import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { CRMDashboard } from '../../components/admin/crm';

// Componente de layout para páginas de administración
interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = 'CRM Dashboard' 
}) => {
  return (
    <>
      <Head>
        <title>{title} | Diego Galmarini - Admin</title>
        <meta name="description" content="Sistema de gestión CRM para Diego Galmarini" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header de administración */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Diego Galmarini - Admin
                </h1>
                <nav className="ml-8">
                  <div className="flex space-x-4">
                    <a
                      href="/admin"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/admin/crm"
                      className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      CRM
                    </a>
                    <a
                      href="/admin/content"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Contenido
                    </a>
                    <a
                      href="/admin/analytics"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Analytics
                    </a>
                  </div>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700">
                  <span className="sr-only">Notificaciones</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <div className="flex items-center space-x-2">
                  <img
                    className="h-8 w-8 rounded-full"
                    src="/images/profile-placeholder.jpg"
                    alt="Perfil"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Diego Galmarini
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Contenido principal */}
        <main>
          {children}
        </main>
      </div>
    </>
  );
};

// Página principal del CRM
const CRMPage: NextPage = () => {
  return (
    <AdminLayout title="CRM Dashboard">
      <CRMDashboard className="max-w-7xl mx-auto" />
    </AdminLayout>
  );
};

// Configuración de autenticación (ejemplo)
CRMPage.getInitialProps = async (ctx) => {
  // Aquí puedes añadir lógica de autenticación
  // Por ejemplo, verificar si el usuario está autenticado
  // y tiene permisos de administrador
  
  return {};
};

export default CRMPage;