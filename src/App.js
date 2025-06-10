import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';
import HomePage from './HomePage';
import Login from './Login';
import CompleteSignIn from './CompleteSignIn';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      signOut(auth).then(() => setLoggedIn(false));
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage loggedIn={loggedIn} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/complete-signin" element={<CompleteSignIn />} />
      </Routes>
    </Router>
  );
}

export default App;
