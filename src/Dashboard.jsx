// src/Dashboard.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { felixQuotes, felixImages } from './FelixContent';
import ProgressBox from './ProgressBox';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const randomQuote = felixQuotes[Math.floor(Math.random() * felixQuotes.length)];
  const randomImage = felixImages[Math.floor(Math.random() * felixImages.length)];
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchFreshUser = async () => {
      const username = location.state?.user?.username;
      if (username) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) {
          console.error('Error fetching fresh user data:', error.message);
        } else {
          setUser(data);
        }
      }
      setLoading(false);
    };

    fetchFreshUser();
  }, []);

  if (loading) {
    return <div className="loading-heading"><p>Loading your dashboard...</p></div>;
  }

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

        <motion.div
          key={randomQuote}
          className="dashboard-quote"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            scale: { type: "spring", visualDuration: 0.6, bounce: 0.5 },
          }}
        >
          <img src={randomImage} alt="Felix the mascot" className="felix-icon" />
          <span className="quote-label">Felix says:</span> {randomQuote}
        </motion.div>

        <h1 className="dashboard-title">📚 Project TBR</h1>
      </header>
      <main className="dashboard-main">
        <div className="tbr-stats-box">
          <ProgressBox user={user} setUser={setUser} />
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
