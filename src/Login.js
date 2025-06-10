import React, { useState } from 'react';
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from './firebase'; // make sure you export auth from firebase.js
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const actionCodeSettings = {
      url: 'http://localhost:3000/complete-signin',
      handleCodeInApp: true,
    };

    if (!email.endsWith('@strathmore.edu')) {
      setMessage('Only @strathmore.edu emails are allowed.');
      return;
    }

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Verification email sent. Please check your inbox.');
      setEmail('');
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      setMessage(`Error: ${error.message}`);
    }
  };
  


  return (
    <div className="login-container">
  <div className="login-box">
    <h2>Login to Strathmore Blog</h2>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Enter your @strathmore.edu email"
    />
    <button onClick={handleSubmit}>Send Sign-In Link</button>

    {message && <div className="login-message">{message}</div>}
  </div>
</div>

  );
}

export default Login;
