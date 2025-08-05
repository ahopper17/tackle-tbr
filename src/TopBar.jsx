// src/TopBar.jsx
import { useState } from 'react';
import './TopBar.css';
import SettingsModal from './SettingsModal';
import { motion } from 'framer-motion';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function TopBar({ user, quote, image }) {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    if (!user) return null; // Don't show topbar if user isn't loaded yet

    return (
        <header className="dashboard-topbar">
            <div className="topbar-left">
                <div className="dashboard-user">Welcome, {user.username}!</div>
            </div>

            <div className="topbar-center">
                <motion.div
                    key={quote}
                    className="dashboard-quote"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        scale: { type: "spring", visualDuration: 0.6, bounce: 0.5 },
                    }}
                >
                    <img src={image} alt="Felix the mascot" className="felix-icon" />
                    <span className="quote-label">Felix says:</span> {quote}
                </motion.div>
            </div>

            <div className="topbar-right">
                <button className="brand-button"
                    onClick={() => navigate('/dashboard')}>
                    <h1 className="dashboard-title">📚 Ex LiTBRis</h1> </button>
                <div className="settings-container">
                    <button className="settings-toggle" onClick={() => setShowModal(true)}>
                        ⚙️
                    </button>
                </div>
            </div>

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
                            setShowModal(false);
                            window.location.reload();
                        }
                    }}
                />
            )}
        </header>
    );
}

export default TopBar;

