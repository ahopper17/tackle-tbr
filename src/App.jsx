// src/App.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Home from './Home';
import Welcome from './Welcome';
import Login from './Login';
import Dashboard from './Dashboard';
import QuizMeter from './QuizMeter';
import PunishmentLogAndStats from './PunishmentLogAndStats';
import TopBar from './TopBar';
import { felixQuotes, felixImages } from './FelixContent';
import { supabase } from './supabaseClient';

function LayoutWithTopBar() {
  const [user, setUser] = useState(null);

  const quote = useMemo(
    () => felixQuotes[Math.floor(Math.random() * felixQuotes.length)],
    []
  );
  const image = useMemo(
    () => felixImages[Math.floor(Math.random() * felixImages.length)],
    []
  );

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUser(error ? null : profile);
      if (error) console.error('Error loading profile:', error.message);
    };

    loadProfile();
  }, []);

  return (
    <>
      <TopBar user={user} quote={quote} image={image} />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Router basename="/tackle-tbr">
      <Routes>
        {/* No topbar on these */}
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Topbar only for these routes */}
        <Route element={<LayoutWithTopBar />}>
          <Route path="/stats" element={<PunishmentLogAndStats />} />
          <Route path="/meter" element={<QuizMeter />} />
        </Route>
      </Routes>
    </Router>
  );
}


