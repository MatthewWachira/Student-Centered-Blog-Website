import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

export default function UserProfile({ user }) {
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

  return (
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
  );
}
