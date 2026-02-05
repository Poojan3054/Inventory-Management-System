import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";

export default function SupplierList({ refreshKey }: { refreshKey: number }) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [viewSupplier, setViewSupplier] = useState<any>(null); 
  const [editSupplier, setEditSupplier] = useState<any>(null); 
  const [updateReason, setUpdateReason] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0); 
  const recordsPerPage = 5; 

  // Load suppliers from backend
  const load = useCallback(() => {
    // Note: Ensure your backend only returns records where status = true
    api.get(`/suppliers/?page=${currentPage}&limit=${recordsPerPage}`)
      .then((res) => {
        setSuppliers(res.data.results || []);
        setTotalCount(res.data.total_count || 0);
      })
      .catch(err => console.error("Error loading suppliers:", err));
  }, [currentPage]);

  useEffect(() => { load(); }, [refreshKey, load]);

  // Client-side search filtering
  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.includes(searchTerm)
  );

  const totalPages = Math.ceil(totalCount / recordsPerPage);

  // Soft Delete Function: Triggers Postgres function sp_delete_delete_supplier
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this supplier?")) {
      // Calling delete triggers the status update in your Postgres function
      api.delete(`/suppliers/${id}/`) 
        .then(() => { 
          alert("Supplier deactivated successfully!"); 
          setViewSupplier(null); // Close the view modal card
          load(); // Refresh the list to reflect changes
        })
        .catch((err) => {
          console.error("Soft Delete Error:", err);
          // Show error if foreign key constraints fail or function is missing
          alert("Failed to deactivate supplier. Ensure the database function is correctly updated.");
        });
    }
  };

  // Update Function: Updates supplier details via PUT request
  const handleUpdate = () => {
    // Validation checks
    if (!updateReason) return alert("Please provide a reason for update.");
    if (editSupplier.contact.length !== 10) return alert("Mobile number must be 10 digits.");

    const updateData = {
      name: editSupplier.name,
      contact: editSupplier.contact,
      updated_by: "Admin",
      update_reason: updateReason
    };

    api.put(`/suppliers/${editSupplier.id}/`, updateData)
      .then(() => {
        alert("Supplier Updated Successfully!");
        setEditSupplier(null); // Close update modal
        setViewSupplier(null); // Close view card
        setUpdateReason(""); // Reset reason field
        load(); // Refresh list
      })
      .catch((err) => {
        console.error("Update Error:", err);
        alert("Update Failed! Please check your connection or data.");
      });
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: "450px" }}>
      {/* Search Header - Scannable design */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-muted m-0">🤝 Business Partners</h5>
        <div className="input-group w-50 shadow-sm border rounded overflow-hidden">
          <span className="input-group-text bg-white border-0">🔍</span>
          <input 
            type="text" 
            className="form-control border-0 shadow-none" 
            placeholder="Search name or contact..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Supplier Table */}
      <div className="table-responsive flex-grow-1">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light border-bottom">
            <tr>
              <th className="ps-4 py-3">No.</th>
              <th className="py-3">Supplier Name</th>
              <th className="py-3 text-center">Contact</th>
              <th className="py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s, index) => (
                <tr key={s.id}>
                  <td className="ps-4 text-muted fw-bold">{(currentPage - 1) * recordsPerPage + index + 1}</td>
                  <td className="fw-semibold text-dark">{s.name}</td>
                  <td className="text-center text-muted">📞 {s.contact}</td>
                  <td className="text-center">
                    <button 
                      className="btn btn-sm btn-outline-primary rounded-pill px-4 shadow-none" 
                      onClick={() => setViewSupplier(s)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="text-center py-4">No suppliers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalCount > recordsPerPage && (
        <div className="d-flex justify-content-center mt-4 pb-2">
          <nav>
            <ul className="pagination shadow-sm">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link shadow-none" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link shadow-none" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link shadow-none" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* View Details Card */}
      {viewSupplier && !editSupplier && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '380px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-body text-center p-4 pt-5">
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3 shadow-none" onClick={() => setViewSupplier(null)}></button>
                <h3 className="fw-bold text-dark mb-1">{viewSupplier.name}</h3>
                <p className="text-muted mb-4">📞 {viewSupplier.contact}</p>
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-warning px-3 fw-bold" onClick={() => setEditSupplier(viewSupplier)}>Update</button>
                  <button className="btn btn-danger px-3 fw-bold" onClick={() => handleDelete(viewSupplier.id)}>Delete</button>
                  <button className="btn btn-secondary px-3 fw-bold" onClick={() => setViewSupplier(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Form Modal */}
      {editSupplier && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-warning border-0 py-3">
                <h5 className="modal-title fw-bold text-dark">Modify Supplier</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => {setEditSupplier(null); setUpdateReason("");}}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="fw-bold small text-muted text-uppercase">Supplier Name</label>
                  <input className="form-control border-2 shadow-none" value={editSupplier.name} onChange={(e) => setEditSupplier({...editSupplier, name: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="fw-bold small text-muted text-uppercase">Contact (10 Digits)</label>
                  <input className="form-control border-2 shadow-none" maxLength={10} value={editSupplier.contact} 
                    onChange={(e) => { if (/^\d*$/.test(e.target.value)) setEditSupplier({...editSupplier, contact: e.target.value}) }} />
                </div>
                <div className="mb-2">
                  <label className="text-primary fw-bold small text-uppercase">Update Reason *</label>
                  <textarea className="form-control border-primary border-2 shadow-none" rows={3} value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} placeholder="Reason for change..." />
                </div>
              </div>
              <div className="modal-footer bg-light border-0 px-4">
                <button className="btn btn-secondary px-4 rounded-pill" onClick={() => {setEditSupplier(null); setUpdateReason("");}}>Cancel</button>
                <button className="btn btn-primary px-4 rounded-pill shadow" onClick={handleUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}