import { useState, useEffect, useRef } from 'react';
import './ProgressBox.css';
import { supabase } from './supabaseClient';
import { punishmentList } from './punishments';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import PunishmentPicker from './PunishmentPicker';

function ProgressBox({ user, setUser }) {
    const goal = user.goal ?? 30;
    const startingTBR = user.starting_tbr ?? 30;
    const currentTBR = user.tbr_count ?? 15;
    const average_books_month = user.average_books_month ?? 5;
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [newGoal, setNewGoal] = useState(goal);
    const booksLeft = Math.max(0, currentTBR - goal);
    const today = new Date();
    const endDate = new Date(`${user.end_date}T00:00:00`);
    const timeDiff = endDate.getTime() - today.getTime();
    const monthsLeft = Math.max(0, timeDiff / (1000 * 60 * 60 * 24 * 30.44)); // avg month length
    const requiredPace = booksLeft / monthsLeft;
    const onTrack = average_books_month >= requiredPace;
    const monthsToZero = currentTBR / average_books_month;
    const yearsToZero = monthsToZero / 12;
    const timeDiffMs = endDate.getTime() - today.getTime();
    const daysLeft = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
    const finishedEarly = currentTBR <= goal && daysLeft > 0;
    const [showPunishment, setShowPunishment] = useState(false);
    const [punishment, setPunishment] = useState('');
    const [showLockModal, setShowLockModal] = useState(false);
    const [showMissedGoalModal, setShowMissedGoalModal] = useState(false);
    const [lockTarget, setLockTarget] = useState(user.ban_lock_target ?? '');
    const [justUnlocked, setJustUnlocked] = useState(false);
    const previousTBR = useRef(currentTBR);
    const { width, height } = useWindowSize();
    const [showCongratsModal, setShowCongratsModal] = useState(false);
    const [showStartTBRModal, setShowStartTBRModal] = useState(false);
    const [newEndDate, setNewEndDate] = useState(user.end_date || '');
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [showPicker, setShowPicker] = useState(false);





    let rawProgress = (startingTBR - currentTBR) / (startingTBR - goal);
    const percent = Math.min(100, Math.max(0, Math.round(rawProgress * 100)));


    const formattedEndDate = endDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    useEffect(() => {
        if (currentTBR > startingTBR) {
            setShowStartTBRModal(true);
        }
    }, [currentTBR, startingTBR]);

    useEffect(() => {
        const missedGoal =
            today >= endDate &&
            currentTBR > goal &&
            !user.missed_goal_acknowledged;

        if (missedGoal) {
            setShowMissedGoalModal(true);
        }
    }, [currentTBR, goal, user.end_date]);


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

    useEffect(() => {
        const wasAboveTarget = previousTBR.current > user?.ban_lock_target;
        const nowAtOrBelowTarget = user?.tbr_count <= user?.ban_lock_target;

        if (
            user?.buying_ban_active &&
            user?.ban_lock_active &&
            wasAboveTarget &&
            nowAtOrBelowTarget
        ) {
            setJustUnlocked(true);

            const unlockBan = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .update({
                        ban_lock_active: false,
                        ban_lock_target: null
                    })
                    .eq('username', user.username)
                    .select()
                    .single();

                if (error) {
                    console.error("Error clearing ban lock:", error.message);
                } else {
                    setUser(data); // update local state with cleared lock
                }
            };

            unlockBan();
        }

        previousTBR.current = user?.tbr_count;
    }, [user]);



    useEffect(() => {
        const checkGoalAchievement = async () => {
            if (currentTBR <= goal && !user.goal_achieved) {
                // Trigger confetti and show modal
                setShowCongratsModal(true);

                // Update user in Supabase to mark the goal as achieved
                const { data, error } = await supabase
                    .from('profiles')
                    .update({ goal_achieved: true })
                    .eq('username', user.username)
                    .select()
                    .single();

                if (error) {
                    console.error("Error updating goalAchieved:", error.message);
                } else {
                    setUser(data);
                }
            }
        };

        checkGoalAchievement();
    }, [currentTBR, goal]);

    {
        import.meta.env.DEV && (
            <div className="dev-tools">
                <button onClick={() => setShowDeadlineModal(true)}>Test Deadline Modal</button>
            </div>
        )
    }


    return (
        <div className="progress-box">
            {/* <button onClick={() => setShowDeadlineModal(true)}>Test Deadline Modal</button>
            <button onClick={() => setShowMissedGoalModal(true)}>Test Missed Goal Modal</button> */}
            <h2 className="progress-header">Progress</h2>
            <div className="tbr-indicator">
                <span>You currently have <strong>{currentTBR}</strong> books on your TBR 📚</span>
            </div>

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

            <div className="tbr-stats-row">
                <p className="tbr-stat">
                    At your current pace of <span className="highlight">{average_books_month}</span> books/month, you'll need about <span className="highlight">{monthsToZero.toFixed(1)}</span> months (or <span className="highlight">{yearsToZero.toFixed(1)}</span> years) to read your whole TBR — if no new books sneak in! 📚
                </p>

                {!user.chill_mode && !user.missed_goal_acknowledged ? (
                    <p className="tbr-stat">
                        To reach your goal of <span className="highlight">{goal}</span> books by <span className="highlight">{formattedEndDate}</span>, you'd need to read <span className="highlight">{requiredPace.toFixed(1)}</span> books/month. You're {onTrack ? "on track ✅ Keep it up!" : "a bit behind 😬 Get reading!"}
                    </p>
                ) : (
                    <p className="tbr-stat no-deadline">
                        No deadline right now — you're reading at your own pace 📚💆‍♀️
                        <div className="progress-buttons">
                            <button className="edit-deadline-button" onClick={() => setShowDeadlineModal(true)}>
                                Set a deadline
                            </button>
                        </div>
                    </p>
                )}

            </div>

            <div className="buying-ban-status">
                <p>
                    Book Buying Ban:{' '}
                    <span className={user.buying_ban_active ? 'ban-active' : 'ban-inactive'}>
                        {user.buying_ban_active ? 'Active' : 'Inactive'}
                    </span>
                </p>

                {user.buying_ban_active ? (
                    user.ban_lock_active && currentTBR > user.ban_lock_target ? (
                        <p className="locked-warning">
                            🔒 Ban locked until your TBR is {user.ban_lock_target} or lower.
                        </p>
                    ) : (
                        <div className="ban-button-row">
                            {user.buying_ban_active && !user.ban_lock_target && (
                                <button
                                    className="ban-button"
                                    onClick={() => setShowLockModal(true)}
                                >
                                    🔒 Lock Ban Until TBR is Lower
                                </button>
                            )}

                            {user.buying_ban_active && (!user.ban_lock_active || currentTBR <= user.ban_lock_target) && (
                                <button
                                    className="ban-button"
                                    onClick={async () => {
                                        const { data, error } = await supabase
                                            .from('profiles')
                                            .update({
                                                buying_ban_active: false,
                                                ban_lock_target: null,
                                                ban_lock_active: false,
                                            })
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
                                    🎉 Lift Ban
                                </button>
                            )}
                        </div>
                    )
                ) : (
                    <button
                        className="ban-button"
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

            <AnimatePresence>
                {justUnlocked && (
                    <div className="modal-overlay">
                        <Confetti width={width} height={height} numberOfPieces={300} gravity={0.3} />
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.5 }}
                        >
                            🎉 Congratulations! You've unlocked your book buying ban! Don't go too crazy now! 🎉
                            <div className="modal-buttons">

                                <button className="save-button"
                                    onClick={() => setJustUnlocked(false)}>Yay!</button>
                            </div>

                        </motion.div></div>
                )}
            </AnimatePresence>

            {showDeadlineModal && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3>📅 Set a New Deadline</h3>
                        <p>Pick a new deadline to reach your goal of <strong>{goal}</strong> unread books.</p>

                        <input
                            type="date"
                            value={newEndDate ? newEndDate : ''}
                            onChange={(e) => setNewEndDate(e.target.value)}
                            className="goal-input"
                        />

                        <div className="modal-buttons">
                            <button
                                className="save-button"
                                onClick={async () => {
                                    if (!newEndDate) {
                                        alert("Please pick a date!");
                                        return;
                                    }

                                    const { data, error } = await supabase
                                        .from('profiles')
                                        .update({
                                            end_date: newEndDate,
                                            missed_goal_acknowledged: false,
                                            chill_mode: false,
                                        })
                                        .eq('username', user.username)
                                        .select()
                                        .single();

                                    if (error) {
                                        console.error("Error updating deadline:", error.message);
                                    } else {
                                        setUser(data);
                                        setShowDeadlineModal(false);
                                    }
                                }}
                            >
                                Save Deadline
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => setShowDeadlineModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showMissedGoalModal && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3>📆 Time's Up!</h3>
                        <p>Your goal deadline has passed, and you're currently at <strong>{currentTBR}</strong> books — above your goal of <strong>{goal}</strong>. You were only <strong>{booksLeft}</strong> books away!</p>
                        <p>No worries! Want to set a new deadline?</p>

                        <div className="deadline-picker">
                            <label htmlFor="new-end-date">Extend Deadline:</label>
                            <input
                                id="new-end-date"
                                type="date"
                                value={newEndDate.split('T')[0]} // Ensure date format is YYYY-MM-DD
                                onChange={(e) => setNewEndDate(e.target.value)}
                                className="goal-input"
                            />
                            <button
                                className="save-button"
                                onClick={async () => {
                                    if (!newEndDate) {
                                        alert("Please pick a new date!");
                                        return;
                                    }

                                    const { data, error } = await supabase
                                        .from('profiles')
                                        .update({ end_date: newEndDate, missed_goal_acknowledged: false })
                                        .eq('username', user.username)
                                        .select()
                                        .single();

                                    if (error) {
                                        console.error("Error updating deadline:", error.message);
                                    } else {
                                        setUser(data);
                                        setShowMissedGoalModal(false);
                                    }
                                }}
                            >
                                Save New Date
                            </button>
                        </div>

                        <button
                            className="cancel-button-date"
                            onClick={async () => {
                                const { data, error } = await supabase
                                    .from('profiles')
                                    .update({ missed_goal_acknowledged: true })
                                    .eq('username', user.username)
                                    .select()
                                    .single();

                                if (error) {
                                    console.error("Error acknowledging missed goal:", error.message);
                                } else {
                                    setUser(data); // ✅ update local state
                                    setShowMissedGoalModal(false); // ✅ close modal after update
                                }
                            }}
                        >
                            Keep Going
                        </button>

                    </motion.div>
                </div>
            )}

            {showCongratsModal && (
                <div className="modal-overlay">
                    <Confetti width={width} height={height} numberOfPieces={300} gravity={0.3} />
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                    >
                        {currentTBR === 0 ? (
                            <>
                                <h3>Oh my GOD! You've done it!! 🎉🥳👏</h3>
                                <p><strong>Felix pads into view, blinking slowly.</strong></p>
                                <p><strong><em>“You're free,”</em> he says, <em>“for now...”</em></strong></p>
                                <p><strong>He curls up beside your empty TBR and falls asleep. You did it.</strong></p>
                                <p>
                                    Thank you so much for using my app! Now, that you're at ZERO (!), you don't really need me anymore. Go buy some books! Feel free to go into settings and adjust your starting TBR once you do if you still want to hang out with me and Felix. 💖
                                </p>
                                <div className="modal-buttons">
                                    <button
                                        className="cancel-button"
                                        onClick={async () => {
                                            const { data, error } = await supabase
                                                .from('profiles')
                                                .update({ missed_goal_acknowledged: true })
                                                .eq('username', user.username)
                                                .select()
                                                .single();

                                            if (error) {
                                                console.error("Error marking goal as acknowledged:", error.message);
                                            } else {
                                                setUser(data);
                                                setShowCongratsModal(false);
                                            }
                                        }}
                                    >
                                        Yay!! I'm a star! ⭐️
                                    </button>

                                </div>
                            </>
                        ) : (
                            <>
                                <h3>🎉 Goal Reached!</h3>
                                <p>You've reached your goal of {goal} books! 🥳</p>
                                {finishedEarly && (
                                    <p>⏳ You finished <strong>{daysLeft}</strong> days early. Well done!</p>
                                )}
                                <p>Want to keep the momentum going with a new goal?</p>
                                <div className="modal-buttons">
                                    <button className="save-button" onClick={() => {
                                        setShowGoalModal(true);
                                        setShowCongratsModal(false);
                                    }}>Let's go lower!</button>
                                    <button
                                        className="cancel-button"
                                        onClick={async () => {
                                            const { data, error } = await supabase
                                                .from('profiles')
                                                .update({ missed_goal_acknowledged: true })
                                                .eq('username', user.username)
                                                .select()
                                                .single();

                                            if (error) {
                                                console.error("Error marking goal as acknowledged:", error.message);
                                            } else {
                                                setUser(data);
                                                setShowCongratsModal(false);
                                            }
                                        }}
                                    >
                                        I'll maintain here.
                                    </button>

                                </div>
                            </>
                        )}

                    </motion.div>
                </div>
            )
            }

            {
                showStartTBRModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>📈 Your TBR has grown!</h3>
                            <p>
                                You now have <strong>{currentTBR}</strong> books — more than your original starting point of <strong>{startingTBR}</strong>.
                            </p>
                            <p>
                                Your starting TBR has been updated to reflect your current number.
                            </p>
                            <div className="modal-buttons">
                                <button
                                    className="save-button"
                                    onClick={async () => {
                                        const { data, error } = await supabase
                                            .from('profiles')
                                            .update({ starting_tbr: currentTBR })
                                            .eq('username', user.username)
                                            .select()
                                            .single();

                                        if (error) {
                                            console.error("Error updating starting TBR:", error.message);
                                        } else {
                                            setUser(data);
                                            setShowStartTBRModal(false);
                                        }
                                    }}
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showLockModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Lock the Book Buying Ban</h3>
                            <p>Set a TBR number that you must reach before you're allowed to lift your ban.</p>
                            <input
                                type="number"
                                value={lockTarget}
                                onChange={(e) => setLockTarget(Number(e.target.value))}
                                className="goal-input"
                                min={0}
                            />
                            <div className="modal-buttons">
                                <button
                                    className="ban-button"
                                    onClick={async () => {
                                        const { data, error } = await supabase
                                            .from('profiles')
                                            .update({
                                                ban_lock_target: lockTarget,
                                                ban_lock_active: true
                                            })
                                            .eq('username', user.username)
                                            .select()
                                            .single();
                                        if (error) console.error("Lock save error:", error.message);
                                        else {
                                            setUser(data);
                                            setShowLockModal(false);
                                        }
                                    }}
                                >
                                    Lock Ban
                                </button>
                                <button className="cancel-button"
                                    onClick={() => setShowLockModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showPunishment && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>🚨 Book Buying Ban Violation! </h3>
                            <button className="save-button" onClick={() => {
                                setShowPunishment(false); // close the modal first
                                setTimeout(() => {
                                    setShowPicker(true); // then show the animation
                                }, 200); // 150–300ms usually feels smooth
                            }}
                            >
                                Pick my Punishment!
                            </button>
                        </div>
                    </div>
                )
            }

            {showPicker && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <PunishmentPicker
                            punishmentList={punishmentList}
                            onDone={() => setShowPicker(false)}
                        />
                    </div>
                </div>
            )}


            {
                showGoalModal && (
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
                                    className="save-button"
                                    onClick={async () => {
                                        if (newGoal > startingTBR) {
                                            alert("That goal's too high! You're supposed to reduce your TBR, not add to it. 📚📈😅");
                                            return;
                                        }

                                        const { data, error } = await supabase
                                            .from('profiles')
                                            .update({ goal: newGoal, goalAchieved: false }) // reset flag
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
                                    className="cancel-button"
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
                )
            }
        </div >
    );
}

export default ProgressBox;
