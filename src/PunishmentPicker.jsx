import { useState } from 'react';
import './PunishmentPicker.css';
import Card from './Card';

function PunishmentPicker({ punishmentList, onDone }) {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const shuffled = useState(() =>
        punishmentList.sort(() => Math.random() - 0.5).slice(0, 3)
    )[0];

    const handleCardClick = (index) => {
        if (selectedIndex === null) {
            setSelectedIndex(index);
        }
    };

    return (
        <div className="punishment-picker">
            <h1>Pick your punishment 😈 </h1>
            <div className="card-row">
                {shuffled.map((punishment, index) => (
                    <Card
                        key={index}
                        punishment={punishment}
                        isFlipped={selectedIndex === index}
                        onClick={() => handleCardClick(index)}
                    />
                ))}
            </div>

            {selectedIndex !== null && (
                <button className="done-button" onClick={onDone}>
                    Accept your fate 😔 (Hey, you've done this to yourself)
                </button>
            )}
        </div>
    );
}

export default PunishmentPicker;



