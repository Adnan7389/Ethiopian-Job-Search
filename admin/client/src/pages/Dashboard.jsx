import { useState, useEffect } from 'react';
import { getDashboardAnalytics } from '../services/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getDashboardAnalytics();
        setAnalytics(res.data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);
  
  if (loading) return <div className="text-center py-10">Loading analytics...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!analytics) return null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Active Users</h2>
          <p className="text-3xl font-bold">{analytics.activeUsers}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Total Jobs</h2>
          <p className="text-3xl font-bold">
            {analytics.jobsByStatus.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Total Applications</h2>
          <p className="text-3xl font-bold">
            {analytics.applicationsByStatus.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Jobs by Status</h2>
          <ul className="space-y-2">
            {analytics.jobsByStatus.map(item => (
              <li key={item.status} className="flex justify-between">
                <span className="capitalize">{item.status}</span>
                <span className="font-medium">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Applications by Status</h2>
          <ul className="space-y-2">
            {analytics.applicationsByStatus.map(item => (
              <li key={item.status} className="flex justify-between">
                <span className="capitalize">{item.status}</span>
                <span className="font-medium">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Jobs by Industry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.jobsByIndustry.map(item => (
            <div key={item.industry} className="border rounded p-3">
              <span className="block font-medium">{item.industry}</span>
              <span>{item.count} jobs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;