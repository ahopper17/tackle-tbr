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
        .order('created_at', { ascending: false })

      if (!error) setPunishments(data);
    };

    fetchPunishments();
  }, [user]);

  // Prevent crash while loading
  if (!user) return <p className="loading-message">Loading your stats...</p>;

  const markAsDone = async (id) => {
    const timestamp = new Date().toISOString();
    const { error } = await supabase
      .from('punishment_log')
      .update({ completed: true, completed_at: timestamp })
      .eq('id', id)
      .eq('user_id', user.id); // extra safety

    if (!error) {
      setPunishments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, completed: true, completed_at: timestamp } : p))
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

  const getFelixComment = (days) => {
    if (days <= 1) return "Felix is impressed. ⚡";
    if (days <= 3) return "Respectable pace. ✅";
    if (days <= 7) return "Took your time... 🐢";
    return "Felix weeps for your efficiency. 😩";
  };

  // --- Derived Stats ---
  const completed = punishments.filter(p => p.completed).length;
  const total = punishments.length;
  const completionRate = total > 0 ? (completed / total * 100).toFixed(0) : 0;

  const avgCompletionTimeDays = (() => {
    const durations = punishments
      .filter(p => p.completed && p.completed_at)
      .map(p => {
        const created = new Date(p.created_at);
        const completed = new Date(p.completed_at);
        const diffMs = completed - created;
        return diffMs / (1000 * 60 * 60 * 24); // days
      });

    if (durations.length === 0) return null;

    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return avg.toFixed(1);
  })();

  const bookBuyRatio = user.books_read > 0
    ? (user.books_bought / user.books_read).toFixed(2)
    : '∞';

  const clearCompletedPunishments = async () => {
    const completedIds = punishments
      .filter(p => p.completed && !p.hidden)
      .map(p => p.id);

    if (completedIds.length === 0) return;

    const { error } = await supabase
      .from('punishment_log')
      .update({ hidden: true })
      .in('id', completedIds);

    if (!error) {
      setPunishments(prev =>
        prev.map(p =>
          completedIds.includes(p.id) ? { ...p, hidden: true } : p
        )
      );
    }
  };

  return (
    <div className="stats-page">
      <div className="stats-box">
        <h2>📊 Your Stats</h2>
        <ul className="stats-list">
          <li>📅 You joined on: {new Date(user.start_date).toLocaleDateString()}</li>
          <li>Total books read: <strong>{user.books_read}</strong></li>
          <li>Books unhauled: <strong>{user.books_removed}</strong></li>
          <li>Books bought: <strong>{user.books_bought}</strong></li>
          <li>Ban broken: <strong>{punishments.length} times</strong></li>
          <li>Punishment completion rate: <strong>{completionRate}%</strong></li>
          <li>
            Avg. time to complete punishment:{' '}
            <strong>{avgCompletionTimeDays ? `${avgCompletionTimeDays} days` : 'N/A'}</strong>
          </li>
          <li>Books bought-to-read ratio: <strong>{bookBuyRatio}</strong> bought per read</li>
        </ul>

      </div>

      <div className="punishment-log-box">
        <div className="punishment-header">
          <h2>😈 Punishment Log</h2>
          {completed > 0 && (
            <button className="clear-btn" onClick={clearCompletedPunishments}>
              🧹 Clear completed
            </button>
          )}
        </div>

        {punishments.length === 0 ? (
          <p className="empty-log">You haven't been punished yet... lucky you.</p>
        ) : (
          <ul className="punishment-list">
            {[...punishments]
              .filter(p => !p.hidden)
              .sort((a, b) => a.completed - b.completed)
              .map((p) => (
                <li key={p.id} className={`punishment-item ${p.completed ? 'completed' : ''}`}>
                  <div className="punishment-main">
                    <span className="punishment-text">{p.punishment}</span>
                    {p.completed && p.completed_at && (() => {
                      const days = Math.ceil((new Date(p.completed_at) - new Date(p.created_at)) / (1000 * 60 * 60 * 24));
                      return (
                        <span className="punishment-duration">
                          ⏱ Took {days} days. {getFelixComment(days)}
                        </span>
                      );
                    })()}
                    {!p.completed && (
                      <div className="punishment-actions">
                        <button className="done-btn" onClick={() => markAsDone(p.id)}>
                          ✅ Done
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="delete-x" onClick={() => deletePunishment(p.id)}>x</div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PunishmentLogAndStats;

