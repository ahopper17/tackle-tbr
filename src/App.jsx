// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Welcome from './Welcome';
import Login from './Login';
import Dashboard from './Dashboard';

import { useEffect, useState } from "react";

function ViewportDebugger() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "0.5rem 1rem",
        borderRadius: "10px",
        fontSize: "1rem",
        zIndex: 9999,
        fontFamily: "monospace"
      }}
    >
      {size.width} x {size.height}
    </div>
  );
}


function App() {
  return (
    <Router basename="/tackle-tbr">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <ViewportDebugger />
    </Router>
  );
}

export default App;
