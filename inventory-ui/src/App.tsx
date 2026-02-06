import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";

function AppContent() {
  const isAuthenticated = !!localStorage.getItem("access_token");
  const location = useLocation();

  // ડેશબોર્ડ માટે નેવબાર છુપાવવા માટે
  const isDashboard = location.pathname === "/dashboard";
  const showNavbar = isAuthenticated && !isDashboard;

  return (
    <>
      {showNavbar && <Navbar />}      
      {/* જો ડેશબોર્ડ હોય તો container કાઢી નાખવું જેથી full width મળે */}
      <div className={showNavbar ? "container mt-3" : ""}>
        <AppRoutes />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;