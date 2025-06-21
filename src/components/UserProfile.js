import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import Footer from './Footer';

export default function UserProfile({ user, onLogin }) {
  const [userBlogs, setUserBlogs] = useState([]);

  useEffect(() => {
    if (!user) return;

    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allBlogs = Object.entries(data).map(([id, blog]) => ({ id, ...blog }));
        const filteredBlogs = allBlogs.filter(blog => blog.authorEmail === user.email);
        setUserBlogs(filteredBlogs);
      } else {
        setUserBlogs([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="profile-outer-container">
        <div className="profile-container">
          <div className="profile-login-prompt">
            <h2>Please log in to view your profile</h2>
            <p className="profile-login-message">You must be logged in to access your profile and blog posts.</p>
            {/* Optionally, add a login button if you want: */}
            {/* <button className="profile-login-btn" onClick={onLogin}>Login</button> */}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-outer-container">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            {user && user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder">
                {user && user.displayName ? user.displayName[0] : '?'}
              </div>
            )}
            <div className="profile-info">
              <h2>{user?.displayName || 'Your Name'}</h2>
              <p>{user?.email || 'your.email@strathmore.edu'}</p>
            </div>
          </div>

          <div className="profile-section">
            <h3>My Blog Posts</h3>
            {userBlogs.length > 0 ? (
              <ul className="profile-post-list">
                {userBlogs.map(post => (
                  <li key={post.id} className="profile-post-item">
                    <span className="profile-post-title">{post.title}</span>
                    <span className="profile-post-date">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No blog posts yet.</p>
            )}
            <p className="profile-note">(Your published blogs will appear here.)</p>
          </div>

          <button className="delete-account-btn" disabled>
            Delete Account (Coming Soon)
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
