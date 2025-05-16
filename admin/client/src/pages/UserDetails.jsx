import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api.get(`/users/${userId}`)
      .then(res => {
        if (res.data.success === false) {
          setError(res.data.message || 'Failed to fetch user details');
          setUser(null);
        } else {
          setUser(res.data.data || res.data);
        }
      })
      .catch(err => {
      console.error('Failed to fetch user details:', err);
        setError(err.response?.data?.message || 'Failed to fetch user details');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user) return <div>No user found</div>;

  const renderJobSeekerDetails = () => (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="mb-2"><strong>Full Name:</strong> {user.full_name || 'Not set'}</p>
          <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="mb-2"><strong>Username:</strong> @{user.username}</p>
          <p className="mb-2"><strong>Location:</strong> {user.location || 'Not set'}</p>
          <p className="mb-2"><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {user.bio && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Bio</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p>{user.bio}</p>
          </div>
        </div>
      )}

      {user.skills && user.skills.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Skills</h3>
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {user.education && user.education.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Education</h3>
          <div className="bg-gray-50 p-4 rounded">
            {user.education.map((edu, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <p className="font-medium">{edu.degree}</p>
                <p>{edu.institution}</p>
                <p className="text-gray-600">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.experience && user.experience.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Experience</h3>
          <div className="bg-gray-50 p-4 rounded">
            {user.experience.map((exp, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <p className="font-medium">{exp.position}</p>
                <p>{exp.company}</p>
                <p className="text-gray-600">
                  {exp.start_year} - {exp.end_year || 'Present'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderEmployerDetails = () => (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Company Information</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="mb-2"><strong>Company Name:</strong> {user.company_name || 'Not set'}</p>
          <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="mb-2"><strong>Username:</strong> @{user.username}</p>
          <p className="mb-2"><strong>Industry:</strong> {user.industry || 'Not set'}</p>
          <p className="mb-2"><strong>Location:</strong> {user.location || 'Not set'}</p>
          <p className="mb-2"><strong>Website:</strong> {user.website ? (
            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {user.website}
            </a>
          ) : 'Not set'}</p>
          <p className="mb-2"><strong>Contact Email:</strong> {user.contact_email || 'Not set'}</p>
          <p className="mb-2"><strong>Status:</strong> <span className={user.isApproved ? 'text-green-600' : 'text-yellow-600'}>
            {user.isApproved ? 'Approved' : 'Not Approved'}
          </span></p>
          <p className="mb-2"><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {user.description && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Company Description</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p>{user.description}</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <button 
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {user.user_type === 'job_seeker' ? renderJobSeekerDetails() : renderEmployerDetails()}
      </div>
    </div>
  );
};

export default UserDetails;