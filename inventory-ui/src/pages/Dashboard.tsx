import React, { useEffect, useState } from 'react';
import api from '../api/axios'; 
import ProductForm from "../components/products/ProductForm"; 
import CategoryForm from "../components/categories/CategoryForm";
import SupplierForm from "../components/suppliers/SupplierForm"; // Import added
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface Product {
  id: number;
  name: string; 
  price: string;
  category_id?: number; // DB column name for check
  supplier_id?: number; // DB column name for check
  category?: any; 
  product_image: string | null; 
}

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalUsers: number; 
}

interface UserData {
  id: number;
  username: string;
  email: string;
}

interface GeneralItem {
  id: number;
  name: string;
  details?: string;
  contact?: string; // Added for suppliers
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ 
    totalProducts: 0, totalCategories: 0, totalSuppliers: 0, totalUsers: 0 
  });
  const [myProducts, setMyProducts] = useState<Product[]>([]); 
  const [categories, setCategories] = useState<GeneralItem[]>([]);
  const [suppliers, setSuppliers] = useState<GeneralItem[]>([]);
  const [users, setUsers] = useState<UserData[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Modal states for Suppliers
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "https://ui-avatars.com/api/?name=No+Image";
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://127.0.0.1:8000${cleanPath.includes('/media/') ? '' : '/media'}${cleanPath}`;
  };

  const fetchData = async () => {
    try {
      const [statsRes, prodRes, userRes, catRes, supRes] = await Promise.allSettled([
        api.get('/dashboard-stats/'),
        api.get('/products/?limit=100'),
        api.get('/users/'),
        api.get('/categories/'),
        api.get('/suppliers/')
      ]);

      if (statsRes.status === 'fulfilled') {
        const sData = statsRes.value.data.data || statsRes.value.data;
        setStats(prev => ({
          ...prev,
          totalProducts: sData.totalProducts || 0,
          totalCategories: sData.totalCategories || 0,
          totalSuppliers: sData.totalSuppliers || 0
        }));
      }

      if (prodRes.status === 'fulfilled') {
        const pData = prodRes.value.data.results || prodRes.value.data;
        setMyProducts(Array.isArray(pData) ? pData : []);
      }
      
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data.results || catRes.value.data || []);
      if (supRes.status === 'fulfilled') setSuppliers(supRes.value.data.results || supRes.value.data || []);
      if (userRes.status === 'fulfilled') {
        const uData = userRes.value.data.results || userRes.value.data.data || userRes.value.data || [];
        setUsers(uData);
        setStats(prev => ({ ...prev, totalUsers: uData.length }));
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}/`);
        setMyProducts(myProducts.filter(p => p.id !== id));
        setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
      } catch (error) {
        alert("Error deleting product");
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const catToDelete = categories.find(c => c.id === id);
      const categoryName = catToDelete ? catToDelete.name : "this category";
      const connectedProducts = myProducts.filter((p: any) => Number(p.category_id) === Number(id));

      if (connectedProducts.length > 0) {
        const productNames = connectedProducts.map(p => p.name).join(", ");
        alert(`Action Denied: "${categoryName}" is connected with: 👉 ${productNames}`);
        return;
      }

      if (window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
        await api.delete(`/categories/${id}/`);
        setCategories(categories.filter(cat => cat.id !== id));
        setStats(prev => ({ ...prev, totalCategories: prev.totalCategories - 1 }));
      }
    } catch (error) {
      alert("Error deleting category");
    }
  };

  // --- NEW: SUPPLIER DELETE LOGIC WITH DB CHECK ---
  const handleDeleteSupplier = async (id: number) => {
    try {
      const supToDelete = suppliers.find(s => s.id === id);
      const supplierName = supToDelete ? supToDelete.name : "this supplier";

      // Check connections using supplier_id
      const connectedProducts = myProducts.filter((p: any) => Number(p.supplier_id) === Number(id));

      if (connectedProducts.length > 0) {
        const productNames = connectedProducts.map(p => p.name).join(", ");
        alert(`Action Denied: "${supplierName}" is connected with these products: 👉 ${productNames}`);
        return;
      }

      if (window.confirm(`Are you sure you want to delete supplier "${supplierName}"?`)) {
        await api.delete(`/suppliers/${id}/`);
        setSuppliers(suppliers.filter(sup => sup.id !== id));
        setStats(prev => ({ ...prev, totalSuppliers: prev.totalSuppliers - 1 }));
      }
    } catch (error) {
      alert("Error deleting supplier");
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditForm(true);
  };

  const handleEditCategory = (cat: GeneralItem) => {
    setSelectedCategory(cat);
    setShowCategoryModal(true);
  };

  // --- NEW: SUPPLIER EDIT HANDLER ---
  const handleEditSupplier = (sup: GeneralItem) => {
    setSelectedSupplier(sup);
    setShowSupplierModal(true);
  };

  const filteredProducts = myProducts.filter(p => 
    (p.name ? String(p.name).toLowerCase() : '').includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear(); 
      window.location.href = '/login';
    }
  };

  if (loading) return <div className="p-5 text-center">Loading Inventory...</div>;

  return (
    <div className="d-flex" style={{ backgroundColor: '#f4f7fe', minHeight: '100vh', width: '100%', position: 'absolute', left: 0, top: 0, fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Sidebar Navigation */}
      <div className="bg-dark text-white p-4 d-flex flex-column shadow" style={{ width: '280px', minHeight: '100vh', backgroundColor: '#1a1c1e', position: 'sticky', top: 0 }}>
         <div className="d-flex align-items-center gap-3 mb-4 mt-2 px-2">
           <img src="/IMG_20250601_122206.jpg" className="rounded-circle border border-2 border-light" alt="Admin" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
           <div><h6 className="mb-0 fw-bold small">Poojan Raval</h6><p className="mb-0 text-muted" style={{ fontSize: '11px' }}>Admin Panel</p></div>
         </div>
         <nav className="nav flex-column gap-2 flex-grow-1 overflow-auto">
            {['home', 'top-selling', 'products', 'categories', 'suppliers', 'stats', 'users'].map(id => (
               <button key={id} onClick={() => setActiveTab(id)} className="nav-link text-white p-3 border-0 text-start d-flex align-items-center gap-3" style={{ backgroundColor: activeTab === id ? '#bc57ff' : 'transparent', borderRadius: '15px', opacity: activeTab === id ? 1 : 0.7 }}>
                 {id === 'home' && '🏠'} {id === 'products' && '📦'} {id === 'categories' && '📂'} {id === 'suppliers' && '🤝'} {id === 'stats' && '📈'} {id === 'users' && '👥'} {id === 'top-selling' && '🔥'}
                 <span className="text-capitalize">{id.replace('-', ' ')}</span>
               </button>
            ))}
         </nav>
         <button onClick={handleLogout} className="btn text-danger mt-auto p-2 fw-bold border-0 bg-transparent text-start d-flex align-items-center gap-3 w-100"><span>🚪</span> Log Out</button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 p-4 px-md-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div><h2 className="fw-bold mb-0 text-capitalize">{activeTab.replace('-', ' ')}</h2><small className="text-muted">Inventory Management System</small></div>
          <div className="position-relative w-25">
            <input type="text" className="form-control rounded-pill px-4 border-0 shadow-sm" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Products Management Tab */}
        {activeTab === 'products' && (
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex justify-content-between mb-4">
              <h5 className="fw-bold">Manage Products</h5>
              <button className="btn btn-primary rounded-pill px-4" onClick={() => { setSelectedProduct(null); setShowEditForm(true); }}>+ Add Product</button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr><th>ID</th><th>Image</th><th>Name</th><th>Price</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td><img src={getImageUrl(p.product_image)} width="40" height="40" className="rounded" alt="" /></td>
                      <td className="fw-bold">{p.name}</td>
                      <td>₹{p.price}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Management Tab */}
        {activeTab === 'categories' && (
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex justify-content-between mb-4">
              <h5 className="fw-bold">Manage Categories</h5>
              <button className="btn btn-success rounded-pill px-4" onClick={() => { setSelectedCategory(null); setShowCategoryModal(true); }}>+ Add Category</button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr><th>ID</th><th>Category Name</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td>
                      <td className="fw-bold">{cat.name}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEditCategory(cat)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- NEW: Suppliers Management Tab --- */}
        {activeTab === 'suppliers' && (
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex justify-content-between mb-4">
              <h5 className="fw-bold">Manage Suppliers</h5>
              <button className="btn btn-warning rounded-pill px-4 text-dark fw-bold" onClick={() => { setSelectedSupplier(null); setShowSupplierModal(true); }}>+ Add Supplier</button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr><th>ID</th><th>Supplier Name</th><th>Contact</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {suppliers.map(sup => (
                    <tr key={sup.id}>
                      <td>{sup.id}</td>
                      <td className="fw-bold">{sup.name}</td>
                      <td>{sup.contact || 'N/A'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEditSupplier(sup)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteSupplier(sup.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Product Add/Edit */}
        {showEditForm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-primary text-white border-0 py-3">
                  <h5 className="modal-title fw-bold">{selectedProduct ? 'Edit Product' : 'Add New Product'}</h5>
                  <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowEditForm(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <ProductForm product={selectedProduct} onSuccess={() => { setShowEditForm(false); fetchData(); }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Category Add/Edit */}
        {showCategoryModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-success text-white border-0 py-3">
                  <h5 className="modal-title fw-bold">{selectedCategory ? 'Edit Category' : 'Add New Category'}</h5>
                  <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowCategoryModal(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <CategoryForm category={selectedCategory} onSuccess={() => { setShowCategoryModal(false); fetchData(); }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- NEW: Modal for Supplier Add/Edit --- */}
        {showSupplierModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-warning text-dark border-0 py-3">
                  <h5 className="modal-title fw-bold">{selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowSupplierModal(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <SupplierForm supplier={selectedSupplier} onSuccess={() => { setShowSupplierModal(false); fetchData(); }} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;