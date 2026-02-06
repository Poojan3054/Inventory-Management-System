// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "../pages/ProductsPage";
import CategoriesPage from "../pages/CategoriesPage";
import SuppliersPage from "../pages/SuppliersPage";
import LoginPage from "../pages/LoginPage"; 
import RegisterPage from "../pages/RegisterPage";
import ForgotPassword from "../pages/ForgotPassword";
import AccessDenied from "../pages/AccessDenied";
import Dashboard from "../pages/Dashboard";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem("access_token");
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const role = localStorage.getItem("role")?.toLowerCase();
  // જો રોલ એડમિન ન હોય તો એક્સેસ ડીનાઈડ બતાવો
  if (role !== "admin") {
    return <AccessDenied />;
  }
  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* જ્યારે યુઝર લૉગિન થાય ત્યારે સીધો '/' પર આવે, 
          તો તેને ProductsPage ને બદલે સીધો Dashboard પર મોકલીશું.
      */}
      <Route path="/" element={
        <PrivateRoute>
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        </PrivateRoute>
      } />

      {/* Admin Dashboard - Main Full Screen View */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        </PrivateRoute>
      } />

      {/* આ રૂટ્સ હજી પણ રહેશે જો તમારે ડાયરેક્ટ એક્સેસ કરવા હોય તો */}
      <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
      
      <Route path="/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
      <Route path="/suppliers" element={<AdminRoute><SuppliersPage /></AdminRoute>} />
      
      {/* Default Catch-all */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}