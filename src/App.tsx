import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioDetailPage from './pages/PortfolioDetailPage';
import AboutPage from './pages/AboutPage';
import BookingModal from './components/BookingModal';
import { AuthProvider } from './contexts/AuthContext';
import { PlansProvider } from './contexts/PlansContext';
import { LoginModal } from './components/LoginModal';
import DashboardPage from './pages/DashboardPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import CRMPage from './pages/admin/crm';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { FirestoreErrorProvider } from './contexts/FirestoreErrorContext';
import AdminAccessPage from './pages/AdminAccessPage';
import DirectAdminAccess from './pages/DirectAdminAccess';
import WhatsAppClone from './components/chat/WhatsAppClone';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const AppContent: React.FC = () => {
  const [isBookingModalOpen, setBookingModalOpen] = React.useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | undefined>(undefined);
  const [prefilledNotes, setPrefilledNotes] = React.useState<string | undefined>(undefined);

  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  // Keep language context synchronized with URL path prefixes
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/en' || path.startsWith('/en/')) {
      if (language !== 'en') {
        setLanguage('en');
      }
    } else {
      // Do not sync admin/CRM paths since they shouldn't trigger language toggle
      const isAdminPath = path.startsWith('/admin') || path === '/paneldecontrol' || path === '/micrm';
      if (!isAdminPath && language !== 'es') {
        setLanguage('es');
      }
    }
  }, [location.pathname, language, setLanguage]);

  // Debug: ver qué ruta está recibiendo React Router
  console.log('Current location:', location.pathname, location);

  const handleOpenBookingModal = (planId?: any, notes?: string) => {
    if (planId && typeof planId === 'string') {
      setSelectedPlanId(planId);
    } else {
      setSelectedPlanId(undefined);
    }
    
    if (notes && typeof notes === 'string') {
      setPrefilledNotes(notes);
    } else {
      setPrefilledNotes(undefined);
    }
    
    setBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setBookingModalOpen(false);
    setSelectedPlanId(undefined);
    setPrefilledNotes(undefined);
  };

  const handleOpenLoginModal = () => {
    navigate('/login');
  };
  const handleCloseLoginModal = () => setLoginModalOpen(false);

  React.useEffect(() => {
    if (location.hash === '#book') {
      handleOpenBookingModal();
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/paneldecontrol" element={<CRMPage />} />
        
        {/* Spanish Routes (Default) */}
        <Route path="/" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><HomePage onBookCallClick={handleOpenBookingModal} /></Layout>} />
        <Route path="/services" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><ServicesPage /></Layout>} />
        <Route path="/portfolio" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PortfolioPage /></Layout>} />
        <Route path="/portfolio/:id" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PortfolioDetailPage onBookCallClick={handleOpenBookingModal} /></Layout>} />
        <Route path="/about" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><AboutPage /></Layout>} />
        <Route path="/dashboard" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><ClientDashboardPage /></Layout>} />
        <Route path="/dashboard-legacy" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><DashboardPage /></Layout>} />
        <Route path="/login" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><LoginPage /></Layout>} />
        <Route path="/admin-access" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><AdminAccessPage /></Layout>} />
        <Route path="/micrm" element={<DirectAdminAccess />} />
        <Route path="/admin/crm" element={<CRMPage />} />
        <Route path="/blog" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><BlogPage /></Layout>} />
        <Route path="/blog/:slug" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><BlogPostPage /></Layout>} />
        <Route path="/terms-of-service" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><TermsOfServicePage /></Layout>} />
        <Route path="/privacy-policy" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PrivacyPolicyPage /></Layout>} />

        {/* English Routes */}
        <Route path="/en" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><HomePage onBookCallClick={handleOpenBookingModal} /></Layout>} />
        <Route path="/en/services" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><ServicesPage /></Layout>} />
        <Route path="/en/portfolio" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PortfolioPage /></Layout>} />
        <Route path="/en/portfolio/:id" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PortfolioDetailPage onBookCallClick={handleOpenBookingModal} /></Layout>} />
        <Route path="/en/about" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><AboutPage /></Layout>} />
        <Route path="/en/dashboard" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><ClientDashboardPage /></Layout>} />
        <Route path="/en/dashboard-legacy" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><DashboardPage /></Layout>} />
        <Route path="/en/login" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><LoginPage /></Layout>} />
        <Route path="/en/admin-access" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><AdminAccessPage /></Layout>} />
        <Route path="/en/blog" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><BlogPage /></Layout>} />
        <Route path="/en/blog/:slug" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><BlogPostPage /></Layout>} />
        <Route path="/en/terms-of-service" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><TermsOfServicePage /></Layout>} />
        <Route path="/en/privacy-policy" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PrivacyPolicyPage /></Layout>} />
      </Routes>
      <BookingModal isOpen={isBookingModalOpen} onClose={handleCloseBookingModal} preselectedPlanId={selectedPlanId} prefilledNotes={prefilledNotes} />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
      <WhatsAppClone onBookCall={handleOpenBookingModal} />
    </>
  );
};


const App: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <LanguageProvider>
        <AuthProvider>
          <PlansProvider>
            <FirestoreErrorProvider>
              <AppContent />
            </FirestoreErrorProvider>
          </PlansProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;