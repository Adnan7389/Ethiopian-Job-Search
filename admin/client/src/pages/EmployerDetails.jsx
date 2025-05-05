import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const EmployerDetails = () => {
  const { id } = useParams();
  const [employer, setEmployer] = useState(null);

  useEffect(() => {
    axios.get(`/api/employers/${id}`).then(res => {
      setEmployer(res.data);
    }).catch(err => {
      console.error('Failed to fetch employer details:', err);
    });
  }, [id]);

  if (!employer) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Employer Details</h1>
      <p><strong>Company Name:</strong> {employer.company_name}</p>
      <p><strong>Email:</strong> {employer.email}</p>
      <p><strong>Status:</strong> {employer.status}</p>
    </div>
  );
};

export default EmployerDetails;