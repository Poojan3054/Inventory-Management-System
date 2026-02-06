// import { Link } from "react-router-dom";

// export default function Navbar() {
//   // Get the username and role from localStorage
//   const username = localStorage.getItem("username");
//   const rawRole = localStorage.getItem("role"); // Added role check
//   const role = rawRole ? rawRole.toLowerCase() : null;

//   const handleLogout = () => {
//     // Clear all auth data from storage
//     localStorage.clear(); 
//     // Redirect to login page and force a refresh to update App.tsx state
//     window.location.href = "/login"; 
//   };

//   return (
//     <nav className="navbar navbar-dark bg-dark px-3 shadow-sm py-3">
//       <div className="container-fluid d-flex align-items-center">                
//         <div className="d-flex align-items-center" style={{ flex: 1 }}>
//           <Link to="/products">
//             <img src="/download.jpg" alt="Logo" width="45" height="45" style={{ borderRadius: "50%", objectFit: "cover" }} />
//           </Link>
//           {username && (
//             <span className="text-info ms-3 d-none d-md-inline big fw-bold">
//               👤 {username} 
//             </span>
//           )}
//         </div>

//         {/* 2. Center: Title */}
//         <div className="text-center" style={{ flex: 2 }}>
//           <Link 
//             className="navbar-brand fw-bold text-uppercase m-0" 
//             to="/products"
//             style={{ letterSpacing: "2px", fontSize: "1.8rem" }}
//           >
//             Inventory Management System
//           </Link>
//         </div>

//         {/* 3. Right Side: Navigation & Logout */}
//         <div className="d-flex justify-content-end align-items-center" style={{ flex: 1 }}>
          
//           {/* Dashboard Link: Only visible to Admin */}
//           {role === "admin" && (
//             <Link className="btn btn-primary btn-sm me-2 px-3 py-2 fw-semibold shadow-sm" to="/dashboard">
//               📊 Dashboard
//             </Link>
//           )}

//           <Link className="btn btn-outline-light btn-sm me-2 px-3 py-2 fw-semibold shadow-sm" to="/products">
//             Products
//           </Link>

//           {/* Role-Based Links: Only visible to Admin */}
//           {role === "admin" && (
//             <>
//               <Link className="btn btn-outline-light btn-sm me-2 px-3 py-2 fw-semibold shadow-sm" to="/categories">
//                 Categories
//               </Link>
//               <Link className="btn btn-outline-light btn-sm me-3 px-3 py-2 fw-semibold shadow-sm" to="/suppliers">
//                 Suppliers
//               </Link>
//             </>
//           )}

//           {/* Logout Button */}
//           <button className="btn btn-danger btn-sm px-3 py-2 fw-bold shadow-sm" onClick={handleLogout}>Logout</button>
//         </div>
//       </div>
//     </nav>
//   );
// }
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation(); // વર્તમાન પાથ જાણવા માટે
  
  // જો પાથ '/dashboard' હોય તો Navbar ને રેન્ડર ન કરો
  if (location.pathname === "/dashboard") {
    return null;
  }

  // Get the username and role from localStorage
  const username = localStorage.getItem("username");
  const rawRole = localStorage.getItem("role");
  const role = rawRole ? rawRole.toLowerCase() : null;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear(); 
      window.location.href = "/login"; 
    }
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3 shadow-sm py-3">
      <div className="container-fluid d-flex align-items-center">                
        <div className="d-flex align-items-center" style={{ flex: 1 }}>
          <Link to="/">
            <img src="/download.jpg" alt="Logo" width="45" height="45" style={{ borderRadius: "50%", objectFit: "cover" }} />
          </Link>
          {username && (
            <span className="text-info ms-3 d-none d-md-inline fw-bold">
              👤 {username} 
            </span>
          )}
        </div>

        {/* Center: Title */}
        <div className="text-center" style={{ flex: 2 }}>
          <Link 
            className="navbar-brand fw-bold text-uppercase m-0" 
            to="/"
            style={{ letterSpacing: "2px", fontSize: "1.5rem" }}
          >
            Inventory System
          </Link>
        </div>

        {/* Right Side: Navigation & Logout */}
        <div className="d-flex justify-content-end align-items-center" style={{ flex: 1 }}>
          
          {/* Dashboard Link: Only visible to Admin */}
          {role === "admin" && (
            <Link className="btn btn-primary btn-sm me-2 px-3 py-2 fw-semibold shadow-sm" to="/dashboard">
              📊 Dashboard
            </Link>
          )}

          <Link className="btn btn-outline-light btn-sm me-2 px-3 py-2 fw-semibold shadow-sm" to="/products">
            Products
          </Link>

          {/* Role-Based Links: Only visible to Admin */}
          {role === "admin" && (
            <>
              <Link className="btn btn-outline-light btn-sm me-2 px-3 py-2 fw-semibold shadow-sm" to="/categories">
                Categories
              </Link>
              <Link className="btn btn-outline-light btn-sm me-3 px-3 py-2 fw-semibold shadow-sm" to="/suppliers">
                Suppliers
              </Link>
            </>
          )}

          {/* Logout Button */}
          <button className="btn btn-danger btn-sm px-3 py-2 fw-bold shadow-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}