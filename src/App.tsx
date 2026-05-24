import React from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { FirestoreErrorProvider } from './contexts/FirestoreErrorContext';
import AuthDebugInfo from './components/AuthDebugInfo';
import AdminAccessPage from './pages/AdminAccessPage';
import DirectAdminAccess from './pages/DirectAdminAccess';

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

  const location = useLocation();
  const navigate = useNavigate();

  // Debug: ver qué ruta está recibiendo React Router
  console.log('Current location:', location.pathname, location);

  const handleOpenBookingModal = () => setBookingModalOpen(true);
  const handleCloseBookingModal = () => setBookingModalOpen(false);

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
        <Route path="/paneldecontrol" element={
          <div style={{ padding: '40px', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>Panel de Control Admin</h1>
            <p>Esta es una prueba para verificar que la ruta funciona correctamente.</p>
            <AdminDashboardPage />
          </div>
        } />
        <Route path="/" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><HomePage onBookCallClick={handleOpenBookingModal} /></Layout>} />
        <Route path="/services" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><ServicesPage /></Layout>} />
        <Route path="/portfolio" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PortfolioPage /></Layout>} />
        <Route path="/portfolio/:id" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PortfolioDetailPage /></Layout>} />
        <Route path="/about" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><AboutPage /></Layout>} />
        <Route path="/dashboard" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><ClientDashboardPage /></Layout>} />
        <Route path="/dashboard-legacy" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><DashboardPage /></Layout>} />
        <Route path="/login" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><LoginPage /></Layout>} />
        <Route path="/admin-access" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><AdminAccessPage /></Layout>} />
        <Route path="/micrm" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><DirectAdminAccess /></Layout>} />
        <Route path="/admin/crm" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><CRMPage /></Layout>} />
        <Route path="/terms-of-service" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><TermsOfServicePage /></Layout>} />
        <Route path="/privacy-policy" element={<Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}><PrivacyPolicyPage /></Layout>} />
      </Routes>
      <AuthDebugInfo />
      <BookingModal isOpen={isBookingModalOpen} onClose={handleCloseBookingModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <PlansProvider>
          <FirestoreErrorProvider>
            <AppContent />
          </FirestoreErrorProvider>
        </PlansProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;