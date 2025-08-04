import { useState, useEffect } from 'react';
import './Welcome.css';
import { supabase } from './supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


function Welcome() {
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({});

  const steps = [
    {
      type: 'message',
      text: "Hi, reader! Let's get that TBR down!"
    },
    {
      type: 'input',
      question: "How many books are on your TBR?",
      inputKey: "tbr_count",
      placeholder: "e.g. 42"
    },
    {
      type: 'message',
      text: "You better get reading then!"
    },
    {
      type: 'input',
      question: "How many books do you usually read a month?",
      inputKey: "average_books_month",
      placeholder: "e.g. 3"
    },
    {
      type: 'message',
      text: "Look at you making your way through your stack!"
    },
    {
      type: 'input',
      question: "What's your current TBR pile goal?",
      extraInfo: "Start small! You can always update your goal later.",
      inputKey: "goal",
      placeholder: "e.g. 25"
    },
    {
      type: 'message',
      text: "We'll get you there!"
    },
    {
      type: 'input',
      question: "When do you want to reach your goal by?",
      inputKey: "end_date",
      inputType: 'date',
      placeholder: ''
    },
    {
      type: 'message',
      text: "Well, we better get cracking!"
    },
    {
      type: 'input',
      question: "Do you want to be on a book buying ban?",
      inputKey: 'buying_ban_active',
      inputType: 'boolean'
    },
    {
      type: 'message',
      text: "Alright, let's get you started..."
    },
    {
      type: 'login',
      question: 'Finish setting up your account!',
    }

  ];

  const currentStep = steps[stepIndex];

  function goToNextStep() {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      console.log('All done!', formData);
      // Later: navigate to dashboard or save to Supabase
    }
  }

  return (
    <div className="welcome-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <StepContent
            step={currentStep}
            formData={formData}
            setFormData={setFormData}
            goToNextStep={goToNextStep}
            navigate={navigate}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepContent({ step, className, formData, setFormData, goToNextStep, navigate }) {

  useEffect(() => {
    if (step.type === 'message') {
      const timer = setTimeout(() => {
        goToNextStep();
      }, 2000); // 2 seconds — adjust if you want longer

      return () => clearTimeout(timer); // cleanup
    }
  }, [step, goToNextStep]);

  if (step.type === 'message') {
    return (
      <div className={`welcome-message ${className}`}>
        <h1 className="welcome-heading">{step.text}</h1>
      </div>
    );
  }

  if (step.type === 'input') {
    const handleChange = (e) => {
      setFormData({ ...formData, [step.inputKey]: e.target.value });
    };

    const value = formData[step.inputKey] || '';

    const handleAdvance = () => {
      if (value.trim() === '') {
        alert('Please fill out this field before continuing.');
        return;
      }
      goToNextStep();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleAdvance();
      }
    };

    // Boolean input: yes/no buttons
    if (step.inputType === 'boolean') {
      return (
        <div className={className}>
          <h2 className="welcome-subheading">{step.question}</h2>
          <div className="boolean-button-group">
            <button
              className="welcome-button"
              onClick={() => {
                setFormData({ ...formData, [step.inputKey]: true });
                goToNextStep();
              }}
            >
              Yes
            </button>
            <button
              className="welcome-button"
              onClick={() => {
                setFormData({ ...formData, [step.inputKey]: false });
                goToNextStep();
              }}
            >
              No
            </button>
          </div>
        </div>
      );
    }

    // Default input (text, number, date, etc.)
    return (
      <div className={className}>
        <h2 className="welcome-subheading">{step.question}</h2>
        <div className="input-button-group">
          <input
            type={step.inputType || 'text'}
            value={formData[step.inputKey] || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="welcome-input"
            placeholder={step.placeholder}
          />
          <button className="welcome-button" onClick={handleAdvance}>
            Next
          </button>
        </div>
        <p className="welcome-subheading">{step.extraInfo}</p>
      </div>
    );
  }

  if (step.type === 'login') {
    return (
      <div className={className}>
        <h2 className="welcome-subheading">{step.question}</h2>
        <div className="input-button-group">
          <input
            type="username"
            placeholder="Username"
            className="welcome-input"
            value={formData.username || ''}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="welcome-input"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            className="welcome-button"
            onClick={async () => {
              const { username, password, ...profileData } = formData;

              if (!username || !password) {
                alert("Please enter a username and password.");
                return;
              }

              const email = `${username.toLowerCase()}@tbr.com`;

              // 1. Sign up the user in Auth
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
              });

              if (signUpError) {
                alert("Signup failed: " + signUpError.message);
                return;
              }

              const { user } = signUpData;

              // 2. Insert the profile linked to Auth user ID
              const starting_tbr = parseInt(profileData.tbr_count);

              const { error: profileError } = await supabase.from("profiles").insert([
                {
                  id: user.id, // linked to Auth user
                  username,
                  starting_tbr,
                  tbr_count: starting_tbr,
                  goal: parseInt(profileData.goal),
                  average_books_month: parseFloat(profileData.average_books_month),
                  end_date: profileData.end_date,
                  buying_ban_active: profileData.buying_ban_active,
                  start_date: new Date(),
                }
              ]);

              if (profileError) {
                alert("Error creating profile: " + profileError.message);
              } else {
                navigate('/dashboard');
              }
            }}
          >
            Create Account
          </button>

        </div>
      </div>
    );
  }

  return null;
}

export default Welcome;


