import './App.css';

import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AdminNew from './pages/AdminNew';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Manager from './pages/Manager';
import ManagerRoute from './components/ManagerRoute';
import PrivateRoute from './components/PrivateRoute';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                {/* <Admin /> */}
                <AdminNew />
              </AdminRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ManagerRoute>
                <Manager />
              </ManagerRoute>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
