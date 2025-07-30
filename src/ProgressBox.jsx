import { useState } from 'react';
import './ProgressBox.css';
import { supabase } from './supabaseClient';
import { punishmentList } from './punishments';

function ProgressBox({ user, setUser }) {
    const goal = user.goal ?? 30;
    const startingTBR = user.starting_tbr ?? 30;
    const currentTBR = user.tbr_count ?? 15;
    const average_books_month = user.average_books_month ?? 5;
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [newGoal, setNewGoal] = useState(goal);
    const booksLeft = Math.max(0, currentTBR - goal);
    const today = new Date();
    const endDate = new Date(user.end_date);
    const timeDiff = endDate.getTime() - today.getTime();
    const monthsLeft = Math.max(0, timeDiff / (1000 * 60 * 60 * 24 * 30.44)); // avg month length
    const requiredPace = booksLeft / monthsLeft;
    const onTrack = average_books_month >= requiredPace;
    const monthsToZero = currentTBR / average_books_month;
    const yearsToZero = monthsToZero / 12;
    const [showPunishment, setShowPunishment] = useState(false);
    const [punishment, setPunishment] = useState('');



    const percent = Math.min(
        100,
        Math.round(((startingTBR - currentTBR) / (startingTBR - goal)) * 100)
    );

    const formattedEndDate = endDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });


    const updateTBRinSupabase = async (newTBR) => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ tbr_count: newTBR })
            .eq('username', user.username)
            .select()
            .single();

        if (error) {
            console.error("Error updating TBR:", error.message);
        } else {
            setUser(data);
        }
    };

    const handleTBRChange = (delta) => {
        const newTBR = Math.max(0, currentTBR + delta);
        updateTBRinSupabase(newTBR);

        if (delta > 0 && user.buying_ban_active) {
            const random = punishmentList[Math.floor(Math.random() * punishmentList.length)];
            setPunishment(random);
            setShowPunishment(true);
        }
    };

    return (
        <div className="progress-box">
            <h2 className="box-header">Progress</h2>
            <div className="progress-bar-background">
                <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
            </div>

            <p>
                You've got <strong>{booksLeft}</strong> books left to read out of{' '}
                <strong>{startingTBR - goal}</strong> to reach your goal of <strong>{goal}</strong>.
            </p>

            <div className="progress-buttons">
                <button onClick={() => handleTBRChange(-1)}>Read one</button>
                <button onClick={() => handleTBRChange(-1)}>Unhauled one</button>
                <button onClick={() => handleTBRChange(1)}>Bought one</button>
                <button className="edit-goal-button" onClick={() => setShowGoalModal(true)}>
                    Update Goal
                </button>
            </div>

            <p>
                At your current pace of <strong>{average_books_month}</strong> books/month, you'll need about <strong>{monthsToZero.toFixed(1)}</strong> months (or <strong>{yearsToZero.toFixed(1)}</strong> years) to read your whole TBR — if no new books sneak in! 📚
            </p>
            <p>
                To reach your goal of <strong>{goal}</strong> books by <strong>{formattedEndDate}</strong>, you'd need to read <strong>{requiredPace.toFixed(1)}</strong> books/month. You're {onTrack ? "on track ✅" : "a bit behind 😬"}.
            </p>

            <div className="buying-ban-status">
                <p>
                    Book Buying Ban:{' '}
                    <span className={user.buying_ban_active ? 'ban-active' : 'ban-inactive'}>
                        {user.buying_ban_active ? 'Active' : 'Inactive'}
                    </span>
                </p>

                {user.buying_ban_active ? (
                    <button
                        className="ban-toggle-button"
                        onClick={async () => {
                            const { data, error } = await supabase
                                .from('profiles')
                                .update({ buying_ban_active: false })
                                .eq('username', user.username)
                                .select()
                                .single();

                            if (error) {
                                console.error("Error lifting ban:", error.message);
                            } else {
                                setUser(data);
                            }
                        }}
                    >
                        Lift Ban
                    </button>
                ) : (
                    <button
                        className="ban-toggle-button"
                        onClick={async () => {
                            const { data, error } = await supabase
                                .from('profiles')
                                .update({ buying_ban_active: true })
                                .eq('username', user.username)
                                .select()
                                .single();

                            if (error) {
                                console.error("Error starting new ban:", error.message);
                            } else {
                                setUser(data);
                            }
                        }}
                    >
                        Start New Ban
                    </button>
                )}
            </div>

            {showPunishment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>🚨 Book Buying Ban Violation!</h3>
                        <p>{punishment}</p>
                        <button onClick={() => setShowPunishment(false)}>Got it!</button>
                    </div>
                </div>
            )}

            {showGoalModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Update Your TBR Goal</h3>
                        <input
                            type="number"
                            value={newGoal}
                            onChange={(e) => setNewGoal(Number(e.target.value))}
                            className="goal-input"
                        />
                        <div className="modal-buttons">
                            <button
                                className="save-goal-button"
                                onClick={async () => {
                                    const { data, error } = await supabase
                                        .from('profiles')
                                        .update({ goal: newGoal })
                                        .eq('username', user.username)
                                        .select()
                                        .single();

                                    if (error) {
                                        console.error("Error updating goal:", error.message);
                                    } else {
                                        setUser(data);
                                        setShowGoalModal(false);
                                    }
                                }}
                            >
                                Save
                            </button>
                            <button
                                className="cancel-goal-button"
                                onClick={() => {
                                    setNewGoal(goal);
                                    setShowGoalModal(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProgressBox;
