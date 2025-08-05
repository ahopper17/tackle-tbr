import { useState } from "react";
import ReactSpeedometer from "react-d3-speedometer";
import "./QuizMeter.css";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const toGauge = (score) => ((clamp(score, -10, 10) + 10) / 20) * 100; // 0..100

export default function QuizMeter() {
    const questions = [
        {
            text: "Does this book genuinely excite you?",
            answers: [
                { label: "Yes! I'm dying to read this book!", impact: 2 },
                { label: "I want to read it, but I'm not crazy about it.", impact: 1 },
                { label: "Not really. There are a lot of books I'd rather read.", impact: -1 },
            ]
        },
        {
            text: "How long has it been on your shelf?",
            answers: [
                { label: "Over 2 years", impact: -2 },
                { label: "About a year", impact: -1 },
                { label: "Less than a month", impact: 2 },
            ]
        },
        {
            text: "If you saw it in a bookshop today, would you buy it?",
            answers: [
                { label: "Absolutely!", impact: 3 },
                { label: "Maybe, if I saw it while in the right mood.", impact: 1 },
                { label: "No, I wouldn't add it to my TBR right now.", impact: -2 },
            ]
        },
        {
            text: "Is the book well received on Goodreads or by other reviewers?",
            answers: [
                { label: "Yes! It has a 4+ star rating!", impact: 1 },
                { label: "Middle of the road. Some people like it, some don't.", impact: 0 },
                { label: "It doesn't seem to be well-liked.", impact: -1 },
            ]
        },
        {
            text: "Have you DNF'd it before?",
            answers: [
                { label: "No, I haven't touched it yet", impact: 2 },
                { label: "Yes, but I just wasn't in the mood for it.", impact: -1 },
                { label: "Yes, and I found it really difficult to read.", impact: -3 },
            ]
        },
        {
            text: "Is it a later installment of a series?",
            answers: [
                { label: "Yes, and I'm determined to finish it.", impact: 4 },
                { label: "Yes, and I didn't like the first books.", impact: -3 },
                { label: "No, it's the first book in a series or a standalone.", impact: 0 },
            ]
        },
        {
            text: "Have you read from the author before?",
            answers: [
                { label: "Yes, and I really enjoyed what I read!", impact: 3 },
                { label: "Yes, and I thought it was okay or I didn't like it.", impact: -2 },
                { label: "No, I haven't read from this author before.", impact: 0 },
            ]
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [rawScore, setRawScore] = useState(0);         // can exceed ±10
    const [hitMaxDuringQuiz, setHitMaxDuringQuiz] = useState(false);

    const handleAnswer = (impact) => {
        setRawScore((prev) => {
            const next = prev + impact;
            if (Math.abs(clamp(next, -10, 10)) === 10) setHitMaxDuringQuiz(true);
            return next;
        });
        setCurrentIndex((i) => Math.min(i + 1, questions.length));
    };

    const finished = currentIndex >= questions.length;

    // verdict from the *raw* score (not clamped)
    const verdict =
        rawScore >= 8 ? "Read it!" :
            rawScore <= -8 ? "Unhaul it!" :
                rawScore >= 3 ? "Leaning read." :
                    rawScore <= -3 ? "Leaning unhaul." :
                        "Undetermined...";

    const caption =
        rawScore >= 8 ? "Sounds like a keeper! You seem very excited for this book, so it doesn't make sense to get rid of it now. Put it at the top of your stack and read it soon!" :
            rawScore <= -8 ? "You don't seem to care for this book at all. It's sitting and collecting dust, and you just don't want to be the one to read it. Unhaul it so someone else might get to love it!" :
                rawScore >= 3 ? "You still want to read this, but you aren't that excited. Read a chapter or two and figure out if it's for you!" :
                    rawScore <= -3 ? "You're leaning towards getting rid of this, but a part of you is still hanging on. Commit to reading it soon, otherwise it might be it's time to find a new home." :
                        "You just don't know with this book! Read a chapter of it and see where you stand!";


    const gaugeValue = toGauge(rawScore);

    return (
        <div className="quiz-container">
            {!finished ? (
                <div className="quiz-question">
                    <h2>{questions[currentIndex].text}</h2>

                    <div className="button-row">
                        {questions[currentIndex].answers.map((ans, idx) => (
                            <button key={idx} onClick={() => handleAnswer(ans.impact)}>
                                {ans.label}
                            </button>
                        ))}
                    </div>

                    <div className="gauge-wrap">
                        <ReactSpeedometer
                            value={gaugeValue}
                            minValue={0}
                            maxValue={100}
                            width={560}
                            height={320}
                            segments={5555}
                            maxSegmentLabels={0}
                            currentValueText=""
                            startColor="#d16d84"
                            endColor="#8bc34a"
                            needleColor="#3a3a3a"
                            needleHeightRatio={0.75}
                            ringWidth={50}
                            needleTransitionDuration={2000}
                            needleTransition="easeElastic"
                        />
                    </div>
                </div>
            ) : (
                <div className="quiz-result">
                    <h2>{verdict}</h2>
                    <p className="quiz-caption">
                        {caption}
                    </p>
                    <div className="gauge-wrap result">
                        <ReactSpeedometer
                            value={gaugeValue}
                            minValue={0}
                            maxValue={100}
                            width={560}
                            height={320}
                            segments={555}
                            maxSegmentLabels={0}
                            currentValueText=""
                            startColor="#d16d84"
                            endColor="#8bc34a"
                            needleColor="#3a3a3a"
                            needleHeightRatio={0.75}
                            ringWidth={50}
                            needleTransitionDuration={1100}
                            needleTransition="easeElastic"
                        />
                    </div>

                    <button onClick={() => { setCurrentIndex(0); setRawScore(0); setHitMaxDuringQuiz(false); }}>
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}


