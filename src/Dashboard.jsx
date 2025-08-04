// src/Dashboard.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { felixQuotes, felixImages } from './FelixContent';
import ProgressBox from './ProgressBox';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';
import SettingsModal from './SettingsModal';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const randomQuote = felixQuotes[Math.floor(Math.random() * felixQuotes.length)];
  const randomImage = felixImages[Math.floor(Math.random() * felixImages.length)];
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showModal, setShowModal] = useState(false);



  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login'); // no session, redirect
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error(profileError.message);
      } else {
        setUser(profile);
      }

      setLoading(false); // ✅ move this *outside* the if/else
    };

    loadProfile();
  }, []);


  if (loading) {
    return <div className="loading-heading"><p>Loading your dashboard...</p></div>;
  }

  if (!user) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-topbar">
          <h1 className="dashboard-title">📚 Ex LiTBRis</h1>
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
        <div className="topbar-left">
          <div className="dashboard-user">Welcome, {user.username}!</div>
        </div>

        <div className="topbar-center">
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
        </div>

        <div className="topbar-right">
          <h1 className="dashboard-title">📚 Ex LiTBRis </h1>
          <div className="settings-container">
            <button
              className="settings-toggle"
              onClick={() => setShowModal(true)}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="tbr-stats-box">
          <ProgressBox user={user} setUser={setUser} />
        </div>

        <div className="activities-box">
          <h1 className="box-header"> Activities </h1>
          <button className="activities-button"
            onClick={() => navigate('/stats')}>📊 Stats & Punishment Log</button>
          <p> Work in progress! Check back soon! </p>
        </div>
      </main>

      {showModal && (
        <SettingsModal
          user={user}
          onClose={() => setShowModal(false)}
          onSave={async (updates) => {
            const { error } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', user.id);

            if (error) {
              console.error('Update failed:', error.message);
              return;
            }

            const { data, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (fetchError) {
              console.error('Failed to fetch updated user:', fetchError.message);
            } else {
              setUser(data);
            }
          }}
        />
      )}

    </div>
  );
}

export default Dashboard;
