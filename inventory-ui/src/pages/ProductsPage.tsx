import { useState } from "react";
import ProductForm from "../components/products/ProductForm";
import ProductList from "../components/products/ProductList";

export default function ProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Get user role
  const role = localStorage.getItem("role");

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark m-0">Product Management</h2>
        
        {/* Only Admin can see the Add button */}
        {role === "admin" && (
          <button 
            className="btn btn-primary btn-lg shadow-sm rounded-pill px-4"
            onClick={() => setShowAddForm(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>Add New Product
          </button>
        )}
      </div>

      {/* Product List wrapped in a Card */}
      <div className="card border-0 shadow-sm rounded-4 p-3 card-table">
        <ProductList refreshKey={refreshKey} />
      </div>

      {/* Add Product Form Modal */}
      {showAddForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold">Enter Product Details</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowAddForm(false)}></button>
              </div>
              <div className="modal-body p-0">
                <ProductForm 
                  onSuccess={() => {
                    setShowAddForm(false);
                    handleRefresh();
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}