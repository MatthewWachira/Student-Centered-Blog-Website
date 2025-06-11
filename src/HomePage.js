import React from 'react';
import { auth } from './firebase';
import './HomePage.css';

function HomePage({ loggedIn, onLogin, onLogout }) {
  const handleLogoutClick = () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      onLogout();
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1 className="title">Strathmore Blog</h1>
        {loggedIn ? (
          <button className="loginButton" onClick={handleLogoutClick}>Logout</button>
        ) : (
          <button className="loginButton" onClick={onLogin}>Login with Google</button>
        )}
      </header>

      <main className="main">
        <h2>Welcome {auth.currentUser?.displayName || 'to the Strathmore Student Blog'}!</h2>
        <p>Explore ideas, share stories, and connect with fellow students.</p>
      </main>
    </div>
  );
}

export default HomePage;
