import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEmployers, toggleEmployerApproval } from '../services/api';

const Employers = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVerified, setFilterVerified] = useState('all');
  
  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const res = await getAllEmployers();
        setEmployers(res.data);
      } catch (err) {
        setError('Failed to load employers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployers();
  }, []);
  
  const handleApprovalToggle = async (userId, currentStatus) => {
    try {
      await toggleEmployerApproval(userId, !currentStatus);
      
      // Update local state
      setEmployers(employers.map(employer => 
        employer.user_id === userId 
          ? { ...employer, is_verified: !currentStatus ? 1 : 0 } 
          : employer
      ));
    } catch (err) {
      console.error('Failed to update employer status:', err);
      alert('Failed to update employer status');
    }
  };
  
  const filteredEmployers = filterVerified === 'all' 
    ? employers 
    : employers.filter(emp => 
        filterVerified === 'verified' 
          ? emp.is_verified === 1 
          : emp.is_verified === 0
      );
  
  if (loading) return <div className="text-center py-10">Loading employers...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employer Management</h1>
        
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded ${filterVerified === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilterVerified('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded ${filterVerified === 'verified' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilterVerified('verified')}
          >
            Verified
          </button>
          <button 
            className={`px-4 py-2 rounded ${filterVerified === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilterVerified('pending')}
          >
            Pending
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No employers found
                </td>
              </tr>
            ) : (
              filteredEmployers.map((employer) => (
                <tr key={employer.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employer.company_name || 'No company name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employer.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employer.industry || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(employer.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employer.is_verified === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {employer.is_verified === 1 ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleApprovalToggle(employer.user_id, employer.is_verified === 1)}
                      className={`mr-2 px-3 py-1 rounded ${
                        employer.is_verified === 1
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {employer.is_verified === 1 ? 'Reject' : 'Approve'}
                    </button>
                    <Link
                      to={`/employers/${employer.user_id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employers;