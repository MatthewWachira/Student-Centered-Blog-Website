// CompleteSignIn.js
import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function CompleteSignIn() {
  const [message, setMessage] = useState('Completing sign-in...');
  const navigate = useNavigate();

  useEffect(() => {
    const completeLogin = async () => {
      try {
        const email = localStorage.getItem('emailForSignIn');
        if (!email) {
          setMessage("Email not found in localStorage. Please try again.");
          return;
        }

        if (isSignInWithEmailLink(auth, window.location.href)) {
          await signInWithEmailLink(auth, email, window.location.href);
          localStorage.removeItem('emailForSignIn');
          setMessage("Login successful! Redirecting...");

          // ✅ Redirect to homepage after 1 second
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          setMessage("Invalid or expired sign-in link.");
        }
      } catch (error) {
        console.error("Sign-in error:", error);
        setMessage(`Error: ${error.message}`);
      }
    };

    completeLogin();
  }, [navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{message}</h2>
    </div>
  );
}

export default CompleteSignIn;
