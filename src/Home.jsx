import { useEffect, useState, useRef } from 'react';
import './Home.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

function Home() {
  const [showMainContent, setShowMainContent] = useState(false);
  const navigate = useNavigate();
  const { ref: myRef, inView: myElementIsVisible } = useInView();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainContent(true);
    }, 2500); // Time to wait before showing the rest

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-container">
      {/* "Hi, reader" animated intro */}
      <div className="hero-header">
        <motion.h1
          className={`home-heading ${showMainContent ? 'pinned' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          Hey, reader.
        </motion.h1>
      </div>

      {/* Main content fades in after header slides up */}
      {showMainContent && (
        <div className="all-content">

          {/* Main content */}
          <motion.div
            className="main-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1.65, ease: 'easeInOut' }}
          >
            <div className="cream-box">
              <h2 className="cream-heading">Welcome to Ex LiTBRis ✨</h2>

              <div className="cream-columns">
                <div className="cream-left">
                  <p><strong>Track your habits and rediscover forgotten reads. Your TBR is waiting... </strong></p>
                  <button className="cream-button" onClick={() => navigate('/login')}>Log in to Track!</button>
                  <button className="cream-button" onClick={() => navigate('/welcome')}>Create Account</button>
                </div>
                <div className="cream-right">
                  <p><strong>It's often said that book buying and reading are two different hobbies.</strong> Yet it still gets stressful when that TBR pile starts to climb. Books sit on shelves for years, forgotten or grown out of, all because there aren't enough hours in the day to keep up with our spending habits.</p>
                  <p>Let's get through the stack together. Through interactive prompts, games, and quizzes, Ex LiTBRis is a fun way to hold yourself accountable, start book buying bans, and finally read down your TBR. <strong>Your TBR has feelings. Let's give it the attention it deserves.</strong></p>
                  <p>Felix, the official mascot, is here for you →</p>
                </div>
              </div>
            </div>

            <div className="cat-photo-container">
              <img src="/tackle-tbr/Felix-small.jpg" alt="Felix" className="cat-photo" />
            </div>
          </motion.div>

          {/* Second Layer Section */}
          <div ref={myRef} className="second-layer">
            {myElementIsVisible && (
              <motion.div
                className="second-layer-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.3 }}
              >
                {/* Left Column */}
                <div className="left-image-container">
                  <img
                    src="/tackle-tbr/cozybook-small.jpeg"
                    alt="A cozy book scene"
                    className="left-image"
                  />
                </div>

                {/* Right Column */}
                <div className="right-stack">
                  {/* Top cream box */}
                  <div className="cream-box">
                    <h2 className="cream-heading">💖 Your TBR pile is calling...</h2>
                    <p>It's time you finally pick up.</p>
                  </div>

                  {/* Bottom row with image + cream box */}
                  <div className="bottom-row">
                    <div className="cream-box second-cream">
                      <h2>On the creator 🌺</h2>
                      <p>Alyssa (/ ah lees ah/ ) is a 23-year-old relentless polymath from Minneapolis. She enjoys algorithms, number theory, genetic studies, evolutionary biology, and theoretical computer science. Oh, and Fantasy novels with dragons and swords, of course.</p>

                      <p>When she's not reading or coding up something new, you'll find her outdoors, running so often that you'll start to wonder what the hell she's training for.</p>

                      <p>Curious? Concerned? Intrigued? Feel free to contact her on her main site, {' '}
                        <a href="https://ahopper17.github.io" target="_blank" rel="noopener noreferrer">
                          ahopper17.github.io
                        </a>.
                      </p>
                    </div>
                    <div className="bottom-image-box">
                      <img
                        src="/tackle-tbr/alyssa.jpg"
                        alt="Alyssa"
                        className="stacked-image"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

