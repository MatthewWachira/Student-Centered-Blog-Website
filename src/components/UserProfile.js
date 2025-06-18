import React from 'react';
import './UserProfile.css';

export default function UserProfile({ user }) {
  // Mock blog posts for demonstration
  const mockPosts = [
    { id: 1, title: 'My First Blog', date: '2025-06-01' },
    { id: 2, title: 'Campus Life Reflections', date: '2025-06-10' }
  ];

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          {user && user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="profile-avatar placeholder">{user && user.displayName ? user.displayName[0] : '?'}</div>
          )}
          <div className="profile-info">
            <h2>{user ? user.displayName : 'Your Name'}</h2>
            <p>{user ? user.email : 'your.email@strathmore.edu'}</p>
          </div>
        </div>
        <div className="profile-section">
          <h3>My Blog Posts</h3>
          <ul className="profile-post-list">
            {mockPosts.map(post => (
              <li key={post.id} className="profile-post-item">
                <span className="profile-post-title">{post.title}</span>
                <span className="profile-post-date">{post.date}</span>
              </li>
            ))}
          </ul>
          <p className="profile-note">(Your published blogs will appear here.)</p>
        </div>
        <button className="delete-account-btn" disabled>Delete Account (Coming Soon)</button>
      </div>
    </div>
  );
}
