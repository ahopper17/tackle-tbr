import './SettingsModal.css';
import { useState } from 'react';

function SettingsModal({ user, onClose, onSave }) {
    const [startingTBR, setStartingTBR] = useState(user.starting_tbr || '');
    const [goalDate, setGoalDate] = useState(user.end_date || '');
    const [pace, setPace] = useState(user.average_books_month || '');
    const [tbrCount, setTBRcount] = useState(user.tbr_count || '');


    const handleSave = () => {
        const updatedData = {
            starting_tbr: Number(startingTBR),
            tbr_count: Number(tbrCount),
            end_date: goalDate,
            average_books_month: Number(pace),
        };
        console.log('Saving this data:', updatedData);

        onSave(updatedData);
        onClose();
    };

    return (
        <div className="settings-modal-overlay">
            <div className="settings-modal-content">
                <h2>Update Your Settings</h2>

                <div className="settings-field">
                    <label>Starting TBR</label>
                    <input
                        className="settings-input"
                        type="number"
                        value={startingTBR}
                        onChange={(e) => setStartingTBR(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <label>Current TBR count</label>
                    <input
                        className="settings-input"
                        type="number"
                        value={tbrCount}
                        onChange={(e) => setTBRcount(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <label>Goal Date</label>
                    <input
                        className="settings-input"
                        type="date"
                        value={goalDate}
                        onChange={(e) => setGoalDate(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <label>Current Pace (books/month)</label>
                    <input
                        className="settings-input"
                        type="number"
                        step="0.1"
                        value={pace}
                        onChange={(e) => setPace(e.target.value)}
                    />
                </div>

                <div className="settings-modal-buttons">
                    <button className="save-settings-button" onClick={handleSave}>Save</button>
                    <button className="cancel-settings-button" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
