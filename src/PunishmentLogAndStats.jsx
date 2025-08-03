import { useEffect, useState } from 'react';
import './PunishmentLogAndStats.css';
import { supabase } from './supabaseClient';

function PunishmentLogAndStats() {
  const [user, setUser] = useState(null);
  const [punishments, setPunishments] = useState([]);

  // Fetch user profile from Supabase
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) return;

      // Get the user profile using auth.uid
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!profileError) setUser(profile);
    };

    fetchUserAndProfile();
  }, []);

  // Fetch punishments once user is loaded
  useEffect(() => {
    if (!user) return;

    const fetchPunishments = async () => {
      const { data, error } = await supabase
        .from('punishment_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setPunishments(data);
    };

    fetchPunishments();
  }, [user]);

  // Prevent crash while loading
  if (!user) return <p className="loading-message">Loading your stats...</p>;

  const markAsDone = async (id) => {
    const { error } = await supabase
      .from('punishment_log')
      .update({ completed: true })
      .eq('id', id)
      .eq('user_id', user.id); // extra safety

    if (!error) {
      setPunishments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, completed: true } : p))
      );
    }
  };

  const deletePunishment = async (id) => {
    const { error } = await supabase
      .from('punishment_log')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // extra safety

    if (!error) {
      setPunishments((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="stats-page">
      <div className="stats-box">
        <h2>📊 Your Stats</h2>
        <ul className="stats-list">
          <li>Total books read: <strong>—</strong></li>
          <li>Books unhauled: <strong>—</strong></li>
          <li>Books bought during ban: <strong>{punishments.length}</strong></li>
        </ul>
      </div>

      <div className="punishment-log-box">
        <h2>😈 Punishment Log</h2>
        {punishments.length === 0 ? (
          <p className="empty-log">You haven't been punished yet... lucky you.</p>
        ) : (
          <ul className="punishment-list">
            {punishments.map((p) => (
              <li key={p.id} className={`punishment-item ${p.completed ? 'completed' : ''}`}>
                <span className="punishment-text">{p.punishment}</span>
                <div className="punishment-actions">
                  {!p.completed && (
                    <button className="done-btn" onClick={() => markAsDone(p.id)}>
                      ✅ Done
                    </button>
                  )}
                  <button className="delete-btn" onClick={() => deletePunishment(p.id)}>
                    ❌ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PunishmentLogAndStats;

