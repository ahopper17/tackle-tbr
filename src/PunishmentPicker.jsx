import { useState } from 'react';
import './PunishmentPicker.css';
import Card from './Card';
import { supabase } from './supabaseClient';

function PunishmentPicker({ punishmentList, onDone, user }) {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const shuffled = useState(() =>
        punishmentList.sort(() => Math.random() - 0.5).slice(0, 3)
    )[0];

    const handleCardClick = (index) => {
        if (selectedIndex === null) {
            setSelectedIndex(index);
        }
    };

    const handleAcceptPunishment = async () => {
        const selectedPunishment = shuffled[selectedIndex];

        const { error } = await supabase
            .from('punishment_log')
            .insert([
                {
                    user_id: user.id, // ← match auth.uid()
                    punishment: selectedPunishment,
                    completed: false,
                },
            ]);

        if (error) {
            console.error("Error saving punishment:", error.message);
            alert("Oops! Something went wrong saving your punishment.");
        } else {
            onDone();
        }
    };

    return (
        <div className="punishment-picker">
            <h1>Pick your punishment 😈</h1>
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
                <button className="done-button"
                    onClick={async () => {
                        const selectedPunishment = shuffled[selectedIndex];

                        const { data, error } = await supabase
                            .from('punishment_log')
                            .insert([
                                {
                                    user_id: user.id, // ⚠️ use user.id if that's your Supabase UID
                                    punishment: selectedPunishment,
                                    completed: false,
                                },
                            ])
                            .select(); // ✅ helpful for debugging

                        if (error) {
                            console.error("Insert failed:", error); // 🔥 full error info
                            alert("Oops! Something went wrong saving your punishment.");
                        } else {
                            console.log("Insert success:", data); // ✅ confirm success
                            onDone();
                        }
                    }}
                >
                    Accept your fate 😔 (Hey, you've done this to yourself)
                </button>
            )}
        </div>
    );
}

export default PunishmentPicker;


