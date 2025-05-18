import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const SystemMonitor = () => {
  const [monitorData, setMonitorData] = useState({
    uptime: '',
    totalUsers: 0,
    recentLogins: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonitorData = async () => {
      try {
        console.log('Fetching system monitor data...');
        const token = localStorage.getItem('token');
        console.log('Auth token present:', !!token);
        
        const response = await axios.get('/api/admin/system-monitor', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('System monitor response:', response.data);
        setMonitorData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching system monitor data:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.response?.data?.error || 'Failed to fetch system monitoring data');
        setLoading(false);
      }
    };

    fetchMonitorData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Server Status</h2>
          <p className="text-gray-600">Uptime: {monitorData.uptime}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User Statistics</h2>
          <p className="text-gray-600">Total Users: {monitorData.totalUsers}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Login Activity</h2>
        {monitorData.recentLogins.length === 0 ? (
          <p className="text-gray-500">No new notification found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">User ID</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">IP Address</th>
                  <th className="px-4 py-2 text-left">Login Time</th>
                </tr>
              </thead>
              <tbody>
                {monitorData.recentLogins.map((login, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{login.user_id}</td>
                    <td className="px-4 py-2">{login.username || 'Unknown'}</td>
                    <td className="px-4 py-2">{login.ip}</td>
                    <td className="px-4 py-2">
                      {format(new Date(login.login_time), 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitor; 