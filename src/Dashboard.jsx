// src/Dashboard.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import './Welcome.css';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state?.user;

  if (!user) {
    return (
      <div className="welcome-container">
        <h2 className="welcome-heading">You must be logged in to view this page.</h2>
        <button className="welcome-button" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <h1 className="welcome-heading">Welcome back, {user.username}!</h1>
      <p className="welcome-subheading">
        Your current TBR goal is {user.goal} books by {user.end_date}.
      </p>
      {/* Add more dashboard features here later */}
    </div>
  );
}

export default Dashboard;
