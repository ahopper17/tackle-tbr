import './SettingsModal.css';
import { useState } from 'react';
import Switch from 'react-switch';

function SettingsModal({ user, onClose, onSave }) {
    const [startingTBR, setStartingTBR] = useState(user.starting_tbr || '');
    const [goalDate, setGoalDate] = useState(user.end_date || '');
    const [pace, setPace] = useState(user.average_books_month || '');
    const [tbrCount, setTBRcount] = useState(user.tbr_count || '');
    const [chillMode, setChillMode] = useState(user.chill_mode || false);


    const handleSave = () => {
        const updatedData = {
            starting_tbr: Number(startingTBR),
            tbr_count: Number(tbrCount),
            end_date: goalDate,
            average_books_month: Number(pace),
            chill_mode: chillMode,
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
                    <div className = "settings-header">Starting TBR</div>
                    <input
                        className="settings-input"
                        type="number"
                        value={startingTBR}
                        onChange={(e) => setStartingTBR(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <div className="settings-header">Current TBR count</div>
                    <input
                        className="settings-input"
                        type="number"
                        value={tbrCount}
                        onChange={(e) => setTBRcount(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <div className="settings-header">Goal Date</div>
                    <input
                        className="settings-input"
                        type="date"
                        value={goalDate}
                        onChange={(e) => setGoalDate(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <div className="settings-header">Current Pace (books/month)</div>
                    <input
                        className="settings-input"
                        type="number"
                        step="0.1"
                        value={pace}
                        onChange={(e) => setPace(e.target.value)}
                    />
                </div>

                <div className="settings-field">
                    <div className="settings-header">Chill Mode</div>
                    <Switch
                        id="chill-switch"
                        onChange={setChillMode}
                        checked={chillMode}
                        onColor="#e8aeb7"
                        offColor="#ccc"
                        onHandleColor="#fff"
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={20}
                        width={42}
                        handleDiameter={18}
                    />
                    <p className="chill-caption">Remove the deadline pressure and just read at your own pace. 📚😌</p>
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
