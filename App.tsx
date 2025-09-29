import React from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import ServicesPage from './pages/ServicesPage.tsx';
import PortfolioPage from './pages/PortfolioPage.tsx';
import PortfolioDetailPage from './pages/PortfolioDetailPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import BookingModal from './components/BookingModal.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { PlansProvider } from './contexts/PlansContext.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import TermsOfServicePage from './pages/TermsOfServicePage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';

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

  const handleOpenBookingModal = () => setBookingModalOpen(true);
  const handleCloseBookingModal = () => setBookingModalOpen(false);

  const handleOpenLoginModal = () => setLoginModalOpen(true);
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
      <Layout onBookCallClick={handleOpenBookingModal} onLoginClick={handleOpenLoginModal}>
        <Routes>
          <Route path="/" element={<HomePage onBookCallClick={handleOpenBookingModal}/>} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<DashboardPage onBookCallClick={handleOpenBookingModal} />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        </Routes>
      </Layout>
      <BookingModal isOpen={isBookingModalOpen} onClose={handleCloseBookingModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter future={{ v7_relativeSplatPath: true }}>
      <AuthProvider>
        <PlansProvider>
          <AppContent />
        </PlansProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;