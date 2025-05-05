import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, toggleUserSuspension } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleSuspendToggle = async (userId, currentSuspendedStatus) => {
    try {
      await toggleUserSuspension(userId, !currentSuspendedStatus);
      
      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, is_suspended: !currentSuspendedStatus ? 1 : 0 } 
          : user
      ));
    } catch (err) {
      console.error('Failed to update user suspension status:', err);
      alert('Failed to update user suspension status');
    }
  };
  
  const filteredUsers = filterType === 'all' 
    ? users 
    : users.filter(user => user.user_type === filterType);
  
  if (loading) return <div className="text-center py-10">Loading users...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded ${filterType === 'job_seeker' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilterType('job_seeker')}
          >
            Job Seekers
          </button>
          <button 
            className={`px-4 py-2 rounded ${filterType === 'employer' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilterType('employer')}
          >
            Employers
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Type
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.user_type === 'employer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.user_type === 'employer' ? 'Employer' : 'Job Seeker'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_suspended
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleSuspendToggle(user.user_id, user.is_suspended)}
                      className={`mr-2 px-3 py-1 rounded ${
                        user.is_suspended
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <Link
                      to={`/users/${user.user_id}`}
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

export default Users;