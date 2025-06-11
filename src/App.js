import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@strathmore.edu')) {
        setLoggedIn(true);
      } else if (user) {
        alert('Only @strathmore.edu emails are allowed.');
        signOut(auth);
        setLoggedIn(false);
      } else {
        setLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email.endsWith('@strathmore.edu')) {
        alert("Only @strathmore.edu emails are allowed.");
        await signOut(auth);
        setLoggedIn(false);
        return;
      }

      setLoggedIn(true);
    } catch (error) {
      console.error('Google Sign-In failed:', error.message);
      alert('Login failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
    } catch (error) {
      console.error('Sign-out failed:', error.message);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage loggedIn={loggedIn} onLogin={handleLogin} onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
