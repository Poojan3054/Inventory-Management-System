import { useState } from "react";
import CategoryForm from "../components/categories/CategoryForm";
import CategoryList from "../components/categories/CategoryList";

export default function CategoriesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false); // Add Form visibility
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddForm(false); // after adding, close the modal
  };

  return (
    <div className="container mt-4">
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Category Management</h2>
        <button 
          className="btn btn-primary rounded-pill px-4 shadow-sm"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Category
        </button>
      </div>

      {/* List Part - Always visible in Table format */}
      <div className="card border-0 shadow-sm rounded-4 p-3">
        <CategoryList refreshKey={refreshKey} />
      </div>

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">Enter Category Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddForm(false)}></button>
              </div>
              <div className="modal-body p-0">
                {/* pass onSuccess handler */}
                <CategoryForm onSuccess={handleRefresh} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}