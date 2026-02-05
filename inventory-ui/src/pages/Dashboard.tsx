import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ટાઇપ ડેફિનેશન
interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  lowStockItems: number;
}

const COLORS = ['#28a745', '#007bff', '#dc3545', '#ffc107'];

const Dashboard: React.FC = () => {
  // આ ડેટા અત્યારે સ્ટેટિક છે, પછી આપણે API થી કનેક્ટ કરીશું
  const stats: DashboardStats = {
    totalProducts: 1250,
    totalCategories: 15,
    totalSuppliers: 8,
    lowStockItems: 32
  };

  const chartData = [
    { name: 'Products', count: stats.totalProducts },
    { name: 'Categories', count: stats.totalCategories },
    { name: 'Suppliers', count: stats.totalSuppliers },
  ];

  const pieData = [
    { name: 'Available Stock', value: 80 },
    { name: 'Low Stock', value: 20 },
  ];

  return (
    <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: '#343a40', color: 'white' }}>
      <h1 className="fw-bold mb-5 mt-2">Inventory Overview</h1>

      {/* 1. Top Row: Stats Cards (તમારી ઈમેજ જેવી ડિઝાઇન) */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4" style={{ backgroundColor: '#28a745', color: 'white' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold">Total Products</h5>
                <h2 className="display-6 fw-bold">#{stats.totalProducts}</h2>
              </div>
              <span style={{ fontSize: '2rem' }}>📦</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4" style={{ backgroundColor: '#007bff', color: 'white' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold">Total Categories</h5>
                <h2 className="display-6 fw-bold">#{stats.totalCategories}</h2>
              </div>
              <span style={{ fontSize: '2rem' }}>📋</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4" style={{ backgroundColor: '#dc3545', color: 'white' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold">Low Stock Items</h5>
                <h2 className="display-6 fw-bold">#{stats.lowStockItems}</h2>
              </div>
              <span style={{ fontSize: '2rem' }}>⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Small Stats Card for Suppliers */}
      <div className="row mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-dark">
            <div className="d-flex align-items-center">
                <span className="me-3" style={{ fontSize: '1.5rem' }}>🤝</span>
                <div>
                    <h6 className="mb-0 text-muted">Total Suppliers</h6>
                    <h4 className="fw-bold mb-0">{stats.totalSuppliers}</h4>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Charts */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white text-dark">
            <h5 className="fw-bold mb-4">Inventory Distribution</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#007bff" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white text-dark">
            <h5 className="fw-bold mb-4">Stock Status Summary</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;