import React, { useEffect, useState } from 'react';
import api from '../api/axios'; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#0d6efd', '#198754', '#ffc107'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0, totalSuppliers: 0 });
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard-stats/');
        // બેકએન્ડ ડેટા સ્ટ્રક્ચર ચેક કરીને સેટ કરો
        const data = response.data.data ? response.data.data : response.data;
        setStats(data);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Products', value: stats.totalProducts },
    { name: 'Categories', value: stats.totalCategories },
    { name: 'Suppliers', value: stats.totalSuppliers },
  ];

  if (loading) return <div className="text-white p-5 text-center">Loading Dashboard Data...</div>;

  return (
    <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: '#1a1d20', color: 'white' }}>
      <h2 className="fw-bold mb-5">📊 INVENTORY ANALYTICS</h2>

      {/* --- આ સેક્શન આંકડા બતાવશે (કાર્ડ્સ) --- */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-lg p-4 bg-white text-dark rounded-4">
            <h6 className="text-muted text-uppercase fw-bold">Total Products</h6>
            <h1 className="display-5 fw-bold text-success">{stats.totalProducts}</h1>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-lg p-4 bg-white text-dark rounded-4">
            <h6 className="text-muted text-uppercase fw-bold">Total Categories</h6>
            <h1 className="display-5 fw-bold text-primary">{stats.totalCategories}</h1>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-lg p-4 bg-white text-dark rounded-4">
            <h6 className="text-muted text-uppercase fw-bold">Total Suppliers</h6>
            <h1 className="display-5 fw-bold text-warning">{stats.totalSuppliers}</h1>
          </div>
        </div>
      </div>

      {/* --- ચાર્ટ અને બટન્સનું સેક્શન --- */}
      <div className="card border-0 shadow-lg p-4 bg-white text-dark rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold m-0">Stock Distribution Overview</h5>
          
          <div className="btn-group shadow-sm">
            <button 
              className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setChartType('bar')}
            >
              📊 Bar Chart
            </button>
            <button 
              className={`btn ${chartType === 'pie' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setChartType('pie')}
            >
              ⭕ Pie Chart
            </button>
          </div>
        </div>

        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0d6efd" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  dataKey="value"
                  // TypeScript એરર ફિક્સ: 'percent' ચેક
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;