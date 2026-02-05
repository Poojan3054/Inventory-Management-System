import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import FileUpload from "./FileUpload";
const BASE_URL = "http://127.0.0.1:8000"; 

export default function ProductList({ refreshKey }: { refreshKey: number }) {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [selectedProduct, setSelectedProduct] = useState<any>(null); 
  const [showEditModal, setShowEditModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get current user role and username for RBAC
  const role = localStorage.getItem("role");
  const currentUsername = localStorage.getItem("username") || "Admin";

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    quantity: 0,
    update_reason: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const load = useCallback(() => {
    api.get(`/products/?page=${currentPage}&limit=${recordsPerPage}`)
      .then(res => {
        setProducts(res.data.results || []);
        setTotalCount(res.data.total_count || 0);
      })
      .catch(err => console.error("Error loading products:", err));
  }, [currentPage]); 

  useEffect(() => { 
    load(); 
  }, [refreshKey, load, currentPage]); 

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(totalCount / recordsPerPage);
  
  const openEditForm = () => {
    setFormData({
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: selectedProduct.quantity || 0,
      update_reason: ""
    });
    setSelectedFile(null);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!formData.update_reason) return alert("Please provide an update reason");
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price.toString());
    data.append("quantity", formData.quantity.toString());
    data.append("update_reason", formData.update_reason);
    data.append("updated_by", currentUsername); // Using dynamic username

    if (selectedFile) {
      data.append("product_image", selectedFile);
    }
    try {
      await api.put(`/products/${selectedProduct.id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Product updated successfully!");
      setShowEditModal(false);
      setSelectedProduct(null); 
      setSelectedFile(null);
      load();
    } catch (err) { 
      console.error(err);
      alert("Update failed!"); 
    }
  };

  const remove = (id: number) => {
    if (window.confirm("Are you sure?")) {
      api.delete(`/products/${id}/`).then(() => { 
        alert("Deleted!"); 
        setSelectedProduct(null);
        load(); 
      });
    }
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: "500px" }}>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-muted m-0">📦 Inventory Status</h5>
        <div className="input-group w-50 shadow-sm border rounded overflow-hidden">
          <span className="input-group-text bg-white border-0">🔍</span>
          <input 
            type="text" 
            className="form-control border-0 shadow-none" 
            placeholder="Search product name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive flex-grow-1">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light border-bottom">
            <tr>
              <th className="ps-4 py-3">ID</th>
              <th className="py-3">Image</th>
              <th className="py-3">Product Name</th>
              <th className="py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p: any, index: number) => (
                <tr key={p.id}>
                  <td className="ps-4 text-muted fw-bold">
                    {(currentPage - 1) * recordsPerPage + index + 1}
                  </td>
                  <td>
                    <div style={{ width: '40px', height: '40px' }}>
                      {p.product_image ? (
                        <a 
                          href={`${BASE_URL}/media/${p.product_image}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="Click to view full file"
                        >
                          {p.product_image.toLowerCase().endsWith('.pdf') ? (
                            <div className="bg-light rounded text-center shadow-sm border" style={{ lineHeight: '40px', fontSize: '20px' }}>
                              📄
                            </div>
                          ) : (
                            <img
                              src={`${BASE_URL}/media/${p.product_image}`}
                              alt="product"
                              style={{ width: '40px', height: '40px', objectFit: 'cover', cursor: 'pointer' }}
                              className="rounded shadow-sm border"
                            />
                          )}
                        </a>
                      ) : (
                        <div className="bg-light rounded text-center text-muted" style={{ lineHeight: '40px', fontSize: '10px' }}>
                          No Img
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="fw-semibold text-dark">{p.name}</td>
                  <td className="text-center">
                    <button 
                      className="btn btn-sm btn-outline-primary rounded-pill px-4" 
                      onClick={() => setSelectedProduct(p)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-5 text-muted">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 mb-2">
          <nav>
            <ul className="pagination pagination-sm shadow-sm">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* View Detail Modal - ROLE BASED ACTIONS ADDED */}
      {selectedProduct && !showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 pt-4">
                <button type="button" className="btn-close shadow-none" onClick={() => setSelectedProduct(null)}></button>
              </div>
              <div className="modal-body p-4 pt-0 text-center">
                {selectedProduct.product_image ? (
                    selectedProduct.product_image.toLowerCase().endsWith('.pdf') ? (
                      <div className="bg-light rounded-4 mb-3 shadow-sm d-flex align-items-center justify-content-center mx-auto" style={{ width: '150px', height: '150px', fontSize: '60px' }}>
                        📄
                      </div>
                    ) : (
                      <img 
                        src={`${BASE_URL}/media/${selectedProduct.product_image}`} 
                        className="rounded-4 mb-3 shadow-sm" 
                        style={{width: '150px', height: '150px', objectFit: 'cover'}} 
                        alt="Product" 
                      />
                    )
                ) : (
                  <div className="bg-light rounded-4 mb-3 shadow-sm d-flex align-items-center justify-content-center mx-auto text-muted" style={{ width: '150px', height: '150px' }}>
                    No Image
                  </div>
                )}
                <h2 className="fw-bold mb-4">{selectedProduct.name}</h2>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-4">
                      <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '10px' }}>Price</small>
                      <span className="h4 m-0 fw-bold text-success">₹{selectedProduct.price}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-4">
                      <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{ fontSize: '10px' }}>Quantity</small>
                      <span className="h4 m-0 fw-bold">{selectedProduct.quantity || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0 d-flex justify-content-center gap-2">
                {/* ROLE CHECK: Only Admin can Update or Delete */}
                {role === "admin" && (
                  <>
                    <button className="btn btn-warning rounded-pill px-4 shadow-sm fw-bold" onClick={openEditForm}>Update</button>
                    <button className="btn btn-danger rounded-pill px-4 shadow-sm fw-bold" onClick={() => remove(selectedProduct.id)}>Delete</button>
                  </>
                )}
                <button className="btn btn-secondary rounded-pill px-4 shadow-none" onClick={() => setSelectedProduct(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Form Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-warning text-dark border-0">
                <h5 className="modal-title fw-bold">Update: {selectedProduct.name}</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="fw-bold small text-uppercase text-muted">Product Name</label>
                  <input className="form-control shadow-none border-2" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <FileUpload label="Change Product Image" onFileSelect={(file) => setSelectedFile(file)} />

                <div className="row mb-3">
                  <div className="col-6">
                    <label className="fw-bold small text-uppercase text-muted">Price</label>
                    <input type="number" className="form-control shadow-none border-2" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div className="col-6">
                    <label className="fw-bold small text-uppercase text-muted">Quantity</label>
                    <input type="number" className="form-control shadow-none border-2" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="text-primary fw-bold small text-uppercase">Update Reason *</label>
                  <textarea className="form-control border-primary border-2 shadow-none" rows={3} value={formData.update_reason} onChange={(e) => setFormData({...formData, update_reason: e.target.value})} placeholder="Why are you changing this?" />
                </div>
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