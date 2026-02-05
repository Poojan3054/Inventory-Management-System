import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";

function AppContent() {
  // Check authentication status from LocalStorage
  const isAuthenticated = !!localStorage.getItem("access_token");

  return (
    <>
      {/* Show Navbar only if the user is logged in */}
      {isAuthenticated && <Navbar />}       
      {/* Apply Bootstrap container margin only for authenticated pages */}
      <div className={isAuthenticated ? "container mt-3" : ""}>
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