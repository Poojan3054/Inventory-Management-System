import React from "react";

export default function AccessDenied() {
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div 
        className="card shadow-lg p-5 text-center" 
        style={{ 
          maxWidth: "500px", 
          borderRadius: "20px",
          borderTop: "5px solid #dc3545" // Red accent line
        }}
      >
        <div className="mb-4">
          {/* એક મોટું Warning Icon */}
          <span style={{ fontSize: "5rem" }}>🚫</span>
        </div>
        
        <h1 className="display-5 fw-bold text-danger mb-3">Access Denied</h1>
        
        <div className="p-3 bg-light rounded-3 mb-4">
          <p className="lead mb-0 text-muted">
            You can only view **Products**. 
            No other administrative changes can be performed by your account.
          </p>
        </div>

        <button 
          className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" 
          style={{ borderRadius: "10px" }}
          onClick={() => window.location.href = "/"}
        >
          🏠 Go back to Home
        </button>
        
        <p className="mt-4 small text-muted">
          Contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}