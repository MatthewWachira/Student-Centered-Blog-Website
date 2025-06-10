import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import banner from './assets/banner.jpg'; // Make sure this image exists

function HomePage({ loggedIn, onLogout }) {
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
          <Link to="/login">
            <button className="loginButton">Login</button>
          </Link>
        )}
      </header>

      <main className="main">
      
        <h2>Welcome to the Strathmore Student Blog!</h2>
        <p>Explore ideas, share stories, and connect with fellow students.</p>
      </main>
    </div>
  );
}

export default HomePage;
