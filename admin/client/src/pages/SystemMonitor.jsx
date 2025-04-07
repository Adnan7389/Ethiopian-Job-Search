import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const MetricCard = ({ title, value, icon, subtext }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
      </div>
      {icon && <div className="text-gray-400">{icon}</div>}
    </div>
  </div>
);

const StatsCard = ({ title, stats }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  </div>
);

const LogTable = ({ title, logs, columns }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {logs.length === 0 ? (
      <p className="text-gray-500">No logs found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-2 text-left">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="border-t">
                {columns.map((col, index) => (
                  <td key={index} className="px-4 py-2">
                    {col.render ? col.render(log[col.key]) : log[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const SystemMonitor = () => {
  const [monitorData, setMonitorData] = useState({
    uptime: '',
    totalUsers: 0,
    recentLogins: [],
    errorLogs: [],
    auditLogs: [],
    errorStats: [],
    systemMetrics: {},
    applicationMetrics: {},
    userDistribution: []
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
    const interval = setInterval(fetchMonitorData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const errorLogColumns = [
    { key: 'error_type', label: 'Type' },
    { key: 'message', label: 'Message' },
    { key: 'endpoint', label: 'Endpoint' },
    { key: 'username', label: 'User' },
    { key: 'ip_address', label: 'IP Address' },
    { 
      key: 'created_at', 
      label: 'Time',
      render: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm:ss')
    }
  ];

  const auditLogColumns = [
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Entity' },
    { key: 'entity_id', label: 'ID' },
    { key: 'username', label: 'User' },
    { key: 'ip_address', label: 'IP Address' },
    { 
      key: 'created_at', 
      label: 'Time',
      render: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm:ss')
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>
      
      {/* System Performance Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">System Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="CPU Usage" 
            value={monitorData.systemMetrics.cpuUsage}
            icon="💻"
            subtext={`Node.js ${monitorData.systemMetrics.nodeVersion}`}
          />
          <MetricCard 
            title="Memory Usage" 
            value={monitorData.systemMetrics.memoryUsage}
            icon="🧠"
            subtext={`Free: ${monitorData.systemMetrics.freeMemory}`}
          />
          <MetricCard 
            title="Total Memory" 
            value={monitorData.systemMetrics.totalMemory}
            icon="💾"
          />
          <MetricCard 
            title="Server Time" 
            value={format(new Date(monitorData.systemMetrics.serverTime), 'HH:mm:ss')}
            icon="🕒"
            subtext={format(new Date(monitorData.systemMetrics.serverTime), 'MMM dd, yyyy')}
          />
        </div>
      </div>

      {/* Application Metrics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Application Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard 
            title="Employer Statistics" 
            stats={monitorData.applicationMetrics.employerStats}
          />
          <StatsCard 
            title="Job Statistics" 
            stats={monitorData.applicationMetrics.jobStats}
          />
        </div>
      </div>

      {/* Error Statistics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Error Statistics (Last 24 Hours)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitorData.errorStats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-700">{stat.error_type}</h3>
              <p className="text-2xl font-semibold text-gray-900">{stat.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Distribution Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitorData.userDistribution.map((type, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-700 capitalize">{type.user_type}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold">{type.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified</span>
                  <span className="font-semibold">{type.verified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Suspended</span>
                  <span className="font-semibold">{type.suspended}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Logs Section */}
      <div className="mb-8">
        <LogTable 
          title="Recent Error Logs" 
          logs={monitorData.errorLogs}
          columns={errorLogColumns}
        />
      </div>

      {/* Audit Logs Section */}
      <div className="mb-8">
        <LogTable 
          title="Recent Audit Logs" 
          logs={monitorData.auditLogs}
          columns={auditLogColumns}
        />
      </div>

      {/* Recent Login Activity Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Login Activity</h2>
        {monitorData.recentLogins.length === 0 ? (
          <p className="text-gray-500">No recent login activity found.</p>
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