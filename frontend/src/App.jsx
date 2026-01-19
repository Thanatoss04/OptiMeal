import { OrderProvider } from './context/OrderContext';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import WaiterPage from './pages/WaiterPage';
import KitchenPage from './pages/KitchenPage';
import ManagerPage from './pages/ManagerPage';
import LoginPage from './pages/LoginPage';
import './App.css';

function AppContent() {
  const { isAuthenticated, isLoading, currentRole } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Render page based on role
  switch (currentRole) {
    case ROLES.WAITER:
      return <WaiterPage />;
    case ROLES.KITCHEN:
      return <KitchenPage />;
    case ROLES.MANAGER:
      return <ManagerPage />;
    default:
      return <LoginPage />;
  }
}

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppContent />
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
