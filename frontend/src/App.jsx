import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/search" element={<div>Job Search</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;