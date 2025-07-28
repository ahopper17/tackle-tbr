import React, { useEffect, useState } from 'react';
import './Home.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [showMainContent, setShowMainContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainContent(true);
    }, 2500); // Time to wait before showing the rest

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-container">
      {/* "Hi, reader" animated intro */}
      <motion.h1
        className={`home-heading ${showMainContent ? 'pinned' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      >
        Hey, reader.
      </motion.h1>

      {/* Main content fades in after header slides up */}
      {showMainContent && (
         <div className="all-content">

          {/* Main content */}
          <motion.div
            className="main-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1, ease: 'easeInOut' }}
          >
            <div className="cream-box">
              <h2 className="cream-heading">Welcome to Project TBR ✨</h2>

              <div className="cream-columns">
                <div className="cream-left">
                  <p><strong>Track your habits and rediscover forgotten reads. Your TBR is waiting... </strong></p>
                  <button className="cream-button" onClick={() => navigate('/login')}>Log In to PTBR</button>
                  <button className="cream-button"onClick={() => navigate('/welcome')}>Create Account</button>
                </div>
                <div className="cream-right">
                  <p><strong>It's often said that book buying and reading are two different hobbies.</strong> Yet it still gets stressful when that TBR pile starts to climb. Books sit on shelves for years, forgotten or grown out of, all because there aren't enough hours in the day to keep up with our spending habits.</p>
                  <p>Let's get through the stack together. Through interactive prompts, games, and quizzes, Project TBR is a fun way to hold yourself accountable, start book buying bans, and finally read down your TBR. <strong>Your TBR has feelings. Let's give it the attention it deserves.</strong></p>
                  <p>Felix, the official mascot, is here for you →</p>
                </div>
              </div>
            </div>

            <div className="cat-photo-container">
              <img src="/tackle-tbr/Felix-small.jpg" alt="Felix" className="cat-photo" />
            </div>
          </motion.div>

          {/* Secondary content */}
          {/* <motion.div
            className="secondary-content"
            initial={{ opacity: 0, y: 30 }}
            // whileInView={{ opacity: 1, y: 0 }}
            // viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            >
            <div className="cream-box">
              <h2>A little more about PTBR 📚</h2>
              <p>
                This isn't just a tracker — it's a bookish playground. Take polls, spin the TBR wheel, earn badges,
                and maybe even curb your impulse book buying (no promises).
              </p>
            </div>

            <div className="cat-photo-container">
              <img src="/TBRapp/cozybook.jpeg" alt="A cozy book scene" className="cat-photo" />
            </div>
          </motion.div> */}
        </div>  
      )}    
    </div>
  );
}

export default Home;

