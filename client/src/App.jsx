import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import MemoryBank from './pages/MemoryBank';
import RecallGame from './pages/RecallGame';
import CapsuleViewer from './pages/CapsuleViewer';
import MedicalDashboard from './pages/MedicalDashboard';
import { motion, AnimatePresence } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/patient-dashboard/:id" element={<PageWrapper><PatientDashboard /></PageWrapper>} />
        <Route path="/memory-bank/:id" element={<PageWrapper><MemoryBank /></PageWrapper>} />
        <Route path="/capsule/:id" element={<PageWrapper><CapsuleViewer /></PageWrapper>} />
        <Route path="/recall-game" element={<PageWrapper><RecallGame /></PageWrapper>} />
        <Route path="/recall_game" element={<PageWrapper><RecallGame /></PageWrapper>} />
        <Route path="/medical" element={<PageWrapper><MedicalDashboard /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <AnimatedRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
