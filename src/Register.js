import React, { useState } from 'react';
import './Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email.endsWith('@strathmore.edu')) {
      setEmailError('Please use your Strathmore email address!');
      isValid = false;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      isValid = false;
    }

    if (!isValid) return;

    // TODO: Add registration logic
    console.log('Registration submitted:', { email, password });
  };

  return (
    <div className="register-container">
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Strathmore Email</label>
          <input
            type="email"
            id="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className={`error-message ${emailError ? 'visible' : ''}`}>
            {emailError || ' '}
          </p>}
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && <p className={`error-message ${passwordError ? 'visible' : ''}`}>
            {passwordError || ' '}
            </p>}
        </div>

        <button type="submit">Register</button>

        <p className="options">
          Already have an account? <a href="/">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;
