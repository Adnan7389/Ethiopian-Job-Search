import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import JobCard from './components/JobCard/JobCard';
import FormInput from './components/FormInput/FormInput';
import Button from './components/Button/Button';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';


function App() {
  
    const sampleJob = {
      job_id: 1,
      job_title: 'Software Engineer',
      company_name: 'TechCorp',
      location: 'Addis Ababa',
      job_type: 'full_time',
      salary_min: 50000,
      salary_max: 70000
    };
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <Routes>
        <Route
            path="/"
            element={
              <>
                <JobCard job={sampleJob} onApply={(id) => alert(`Apply to job ${id}`)} />
                <FormInput label="Test Input" name="test" type="text" register={() => {}} />
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary" disabled>
                  Disabled Button
                </Button>
                <LoadingSpinner />
              </>
            }
          />
          <Route path="/search" element={<div>Job Search</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;