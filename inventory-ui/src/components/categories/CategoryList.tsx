import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";

export default function CategoryList({ refreshKey }: { refreshKey: number }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateReason, setUpdateReason] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const recordsPerPage = 5;

  // --- NEW STATES FOR CONNECTION FEATURE ---
  const [connections, setConnections] = useState<any[]>([]);
  const [showConnectionTable, setShowConnectionTable] = useState(false);

  const load = useCallback(() => {
    api.get(`/categories/?page=${currentPage}&limit=${recordsPerPage}`)
      .then((res) => {
        const fetchedData = res.data.results ? res.data.results : res.data;
        const count = res.data.total_count ? res.data.total_count : 0;
        setCategories(fetchedData);
        setTotalCount(count);
      })
      .catch(err => {
        console.error("Error loading categories:", err);
        setCategories([]);
      });
  }, [currentPage]);

  useEffect(() => {
    load();
  }, [refreshKey, load]);

  // --- FUNCTION TO FETCH CONNECTION DATA FROM NEW API ---
  const handleViewConnection = async () => {
    if (!showConnectionTable) {
      
      api.get('/category-connections/')
        .then(res => {
          setConnections(res.data.data);
        })
        .catch(err => {
          console.error("Error fetching connections:", err);
        });
    }
    // Toggle the visibility of the connection table below the list
    setShowConnectionTable(!showConnectionTable);
  };

  const filteredCategories = Array.isArray(categories) ? categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const totalPages = Math.ceil(totalCount / recordsPerPage);

  const openUpdateForm = () => {
    setEditCategoryName(selectedCategory.name);
    setUpdateReason("");
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!updateReason) return alert("Please provide an update reason.");
    api.put(`/categories/${selectedCategory.id}/`, {
      name: editCategoryName,
      updated_by: "Admin",
      update_reason: updateReason
    }).then(() => {
      alert("Updated Successfully!");
      setShowEditModal(false);
      setSelectedCategory(null);
      load();
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure? This will be a soft delete.")) {
      api.delete(`/categories/${id}/`).then(() => {
        alert("Deleted!");
        setSelectedCategory(null);
        load();
      });
    }
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: "450px" }}>
      
      {/* Search Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-muted m-0">📁 Category List</h5>
        <div className="input-group w-50 shadow-sm border rounded">
          <span className="input-group-text bg-white border-0">🔍</span>
          <input type="text" className="form-control border-0 shadow-none" placeholder="Search category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="table-responsive flex-grow-1">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light border-bottom">
            <tr>
              <th className="ps-4 py-3">ID</th>
              <th className="py-3">Category Name</th>
              <th className="py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((c: any, index: number) => (
              <tr key={c.id}>
                <td className="ps-4 text-muted fw-bold">
                  {(currentPage - 1) * recordsPerPage + index + 1}
                </td>
                <td className="fw-semibold text-dark">{c.name}</td>
                <td className="text-center">
                  <button 
                    className="btn btn-sm btn-outline-primary rounded-pill px-4" 
                    onClick={() => setSelectedCategory(c)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))
            ) : (
            <tr>
              <td colSpan={3} className="text-center py-5 text-muted">No categories found.</td>
            </tr>
          )}
        </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      {totalCount > recordsPerPage && (
        <nav className="mt-4 pb-2">
          <ul className="pagination justify-content-center shadow-sm">
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
      )}

      {/* --- ADDED: VIEW CONNECTION BUTTON (Right side as per Paint sketch) --- */}
      <div className="d-flex justify-content-end mt-3 px-2">
        <button 
          className="btn btn-dark shadow-sm px-4 rounded-pill fw-bold" 
          onClick={handleViewConnection}
        >
          {showConnectionTable ? "Hide Connections" : "View Connection"}
        </button>
      </div>

      {/* --- ADDED: CONNECTION MAPPING TABLE (Below Category List) --- */}
      {showConnectionTable && (
        <div className="mt-4 card border-0 shadow-sm p-4 mb-5 bg-light rounded-4">
          <h6 className="fw-bold mb-3 text-primary">🔗 Category - Product - Supplier Connections</h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered bg-white shadow-sm">
              <thead className="table-secondary text-uppercase small fw-bold">
                <tr>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {connections.length > 0 ? (
                  connections.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3">{item.c_name}</td>
                      <td className="px-3">{item.p_name}</td>
                      <td className="px-3">{item.s_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-3 text-muted">
                      No connections found (Ensure products have category and supplier assigned).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals for View/Update */}
      {selectedCategory && !showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0 pt-4">
                <button type="button" className="btn-close shadow-none" onClick={() => setSelectedCategory(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <h2 className="fw-bold mb-4">{selectedCategory.name}</h2>
              </div>
              <div className="modal-footer border-0 p-4 pt-0 d-flex justify-content-center gap-2">
                <button className="btn btn-warning rounded-pill px-4 shadow-sm" onClick={openUpdateForm}>Update</button>
                <button className="btn btn-danger rounded-pill px-4 shadow-sm" onClick={() => handleDelete(selectedCategory.id)}>Delete</button>
                <button className="btn btn-secondary rounded-pill px-4 shadow-none" onClick={() => setSelectedCategory(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning text-dark border-0">
                <h5 className="modal-title fw-bold">Update Category</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <label className="fw-bold mb-1 small text-uppercase">New Category Name</label>
                <input className="form-control mb-3 shadow-none border-2" value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} />
                <label className="text-primary fw-bold mb-1 small text-uppercase">Update Reason *</label>
                <textarea className="form-control border-primary border-2 shadow-none" rows={3} value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} placeholder="Explain why you are changing this..." />
              </div>
              <div className="modal-footer bg-light border-0">
                <button className="btn btn-secondary px-4 rounded-pill shadow-none" onClick={() => setShowEditModal(false)}>Back</button>
                <button className="btn btn-primary px-4 rounded-pill shadow" onClick={handleUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}