
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import AboutPage from './pages/AboutPage';
import BookingModal from './components/BookingModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const AppContent: React.FC = () => {
  const [isBookingModalOpen, setBookingModalOpen] = React.useState(false);
  const { user } = useAuth(); // Obtenemos el usuario aquí

  const handleOpenModal = () => setBookingModalOpen(true);
  const handleCloseModal = () => setBookingModalOpen(false);

  return (
    <>
      <ScrollToTop />
      <Layout onBookCallClick={handleOpenModal}>
        <Routes>
          <Route path="/" element={<HomePage onBookCallClick={handleOpenModal}/>} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage onBookCallClick={handleOpenModal} />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        </Routes>
      </Layout>
      {/* Pasamos el usuario al modal para que sepa si empezar en registro o en servicios */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={handleCloseModal}
        user={user}
      />
    </>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
