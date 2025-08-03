import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TiltCard from './TiltCard';
import './Card.css';

const Card = ({ frontText, punishment, isFlipped, onClick }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!isFlipped) {
      setAnimating(false);
    }
  }, [isFlipped]);

  const handleFlip = () => {
    if (!animating && !isFlipped) {
      setAnimating(true);
      onClick();
    }
  };

  return (
    <TiltCard>
      <div className="flip-card" onClick={handleFlip}>
        <div className="flip-card-inner-wrapper">
          <motion.div
            className="flip-card-inner"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            onAnimationComplete={() => setAnimating(false)}
          >
            <div className="flip-card-front">
              <img src="/tackle-tbr/Felix-sleepy.jpg" alt="Felix" className="felix-icon-card" />
              <p>{frontText}</p>
            </div>
            <div className="flip-card-back">
              <div className="back-box">
                <p>{punishment}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </TiltCard>
  );
};

export default Card;



