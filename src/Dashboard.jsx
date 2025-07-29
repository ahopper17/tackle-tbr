// src/Dashboard.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { felixQuotes, felixImages } from './FelixContent';


function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const randomQuote = felixQuotes[Math.floor(Math.random() * felixQuotes.length)];
  const randomImage = felixImages[Math.floor(Math.random() * felixImages.length)];

  const user = location.state?.user;

  if (!user) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-topbar">
          <h1 className="dashboard-title">📚 Project TBR</h1>
        </header>
        <main className="dashboard-main">
          <h2 className="dashboard-heading">You must be logged in to view this page.</h2>
          <button className="dashboard-button" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-topbar">
        <div className="dashboard-user">Welcome, {user.username}!</div>
        <div className="dashboard-quote">
          <img src={randomImage} alt="Felix the mascot" className="felix-icon" />
          <span className="quote-label">Felix says:</span> {randomQuote}
        </div>
        <h1 className="dashboard-title">📚 Project TBR</h1>
      </header>
      <main className="dashboard-main">
        <div className="tbr-stats-box">
          <h1 className="box-header"> Progress </h1>
          <p> Work in progress! Check back soon!</p>
        </div>

        <div className="activities-box">
          <h1 className="box-header"> Activities </h1>
          <p> Work in progress! Check back soon! </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
