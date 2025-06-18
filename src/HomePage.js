import React from 'react';
import { auth } from './firebase';
import './HomePage.css';

const mockFeaturedBlogs = [
  {
    id: 1,
    title: 'How to Succeed at Strathmore',
    author: 'Kimberly Mwangi',
    excerpt: 'Tips and tricks for making the most of your university experience...'
  },
  {
    id: 2,
    title: 'Balancing Academics and Social Life',
    author: 'John Kinoti',
    excerpt: 'Finding the right balance is key to a fulfilling student life...'
  },
  {
    id: 3,
    title: 'Top 5 Study Spots on Campus',
    author: 'Mary Wanjiku',
    excerpt: 'Discover the best places to focus and get work done at Strathmore...'
  }
];

function HomePage({ loggedIn, onLogin, onLogout, user }) {
  const handleLogoutClick = () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      onLogout();
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="logo-title-container">
          <img src="/StrathUniLogo.png" alt="Strathmore University Logo" className="logo" />
          <h1 className="title">Strathmore University Blog</h1>
        </div>
        {loggedIn ? (
          <button className="loginButton" onClick={handleLogoutClick}>Logout</button>
        ) : (
          <button className="loginButton" onClick={onLogin}>Login with Google</button>
        )}
      </header>

      <section className="hero">
        <div className="hero-title">Welcome {loggedIn && user ? user.displayName : 'to the Strathmore Student Blog'}!</div>
        <div className="hero-tagline">
          A vibrant space to share ideas, stories, and connect with the Strathmore community.<br/>
          <span style={{ color: '#fff', fontWeight: 500 }}>Join us and make your voice heard!</span>
        </div>
      </section>

      <main className="main">
        <section className="featured-blogs">
          <h3>Featured Blogs</h3>
          <div className="featured-list">
            {mockFeaturedBlogs.map(blog => (
              <div key={blog.id} className="featured-blog-card">
                <h4>{blog.title}</h4>
                <p><em>by {blog.author}</em></p>
                <p>{blog.excerpt}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
