import { useState } from "react";
import SupplierForm from "../components/suppliers/SupplierForm";
import SupplierList from "../components/suppliers/SupplierList";

export default function SuppliersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddForm(false);
  };

  return (
    <div className="container mt-4">
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark m-0">Supplier Management</h2>
        <button 
          className="btn btn-primary btn-lg shadow-sm rounded-pill px-4"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Supplier
        </button>
      </div>

      {/* Supplier List in a consistent Card Container */}
      <div className="card border-0 shadow-sm rounded-4 p-3 card-table">
        <SupplierList refreshKey={refreshKey} />
      </div>

      {/* Add Supplier Modal */}
      {showAddForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold">Enter Supplier Details</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowAddForm(false)}></button>
              </div>
              <div className="modal-body p-0">
                <SupplierForm onSuccess={handleRefresh} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}