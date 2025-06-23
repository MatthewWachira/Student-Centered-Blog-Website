import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import { ref, onValue, remove, update, push, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { deleteUser, updateProfile } from 'firebase/auth';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

export default function UserProfile({ user }) {
  const [userBlogs, setUserBlogs] = useState([]);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allBlogs = Object.entries(data).map(([id, blog]) => ({ id, ...blog }));
        const filteredBlogs = allBlogs.filter(blog => blog.uid === user.uid);
        setUserBlogs(filteredBlogs);
      } else {
        setUserBlogs([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account and all your posts? This action cannot be undone.")) return;

    try {
      const blogDeletes = userBlogs.map(blog => remove(ref(db, `blogs/${blog.id}`)));
      await Promise.all(blogDeletes);
      await deleteUser(auth.currentUser);
      alert("Your account and blog posts have been deleted.");
      navigate('/');
    } catch (error) {
      console.error("Account deletion failed:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("Please log in again to delete your account.");
      } else {
        alert("An error occurred while deleting your account.");
      }
    }
  };

  const handleUpdateName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      alert('Name updated!');
    } catch (error) {
      alert('Failed to update name');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please fill in title and content.');
      return;
    }

    const tags = newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const postRef = push(ref(db, 'blogs'));
    await set(postRef, {
      title: newPostTitle,
      content: newPostContent,
      excerpt: newPostContent.slice(0, 100),
      uid: user.uid,
      author: user.displayName || 'Anonymous',
      authorEmail: user.email,
      timestamp: Date.now(),
      tags
    });

    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags('');
    alert('Blog post created!');
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Delete this blog post?')) {
      await remove(ref(db, `blogs/${postId}`));
    }
  };

  if (!user) {
    return (
      <div className="profile-outer-container">
        <div className="profile-container">
          <div className="profile-login-prompt">
            <h2>Please log in to view your profile</h2>
            <p className="profile-login-message">You must be logged in to access your profile and blog posts.</p>
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
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder">
                {user.displayName ? user.displayName[0] : '?'}
              </div>
            )}
            <div className="profile-info">
              <h2>{user.displayName || 'Your Name'}</h2>
              <p>{user.email || 'your.email@strathmore.edu'}</p>
            </div>
          </div>

          <div className="profile-edit-section">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Edit display name"
            />
            <button onClick={handleUpdateName}>Update Name</button>
          </div>

          <div className="profile-stats">
            <span>Total Posts: {userBlogs.length}</span>
          </div>

          <div className="profile-section">
            <h3 className="section-title">Write a New Post</h3>
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Title"
              className="post-input"
            />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Content"
              className="post-textarea"
            />
            <input
              type="text"
              value={newPostTags}
              onChange={(e) => setNewPostTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="post-input"
            />
            <button className="create-post-btn" onClick={handleCreatePost}>Post</button>
          </div>

          <div className="profile-section">
            <h3 className="section-title">My Blog Posts</h3>
            {userBlogs.length > 0 ? (
              <ul className="profile-post-list">
                {userBlogs
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map(post => {
                    return (
                      <li
                        key={post.id}
                        className="profile-post-item"
                      >
                        <span className="profile-post-title">{post.title}</span>
                        <span className="profile-post-date">{new Date(post.timestamp).toLocaleDateString()}</span>
                        <span className="profile-post-excerpt">
                          {post.excerpt || post.content.slice(0, 80)}...
                        </span>
                        <button onClick={() => navigate(`/edit/${post.id}`)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDeletePost(post.id)} className="delete-btn">Delete</button>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="no-posts-msg">You haven’t written any blog posts yet.<br/>(Your published blogs will appear here.)</p>
            )}
          </div>

          <button className="delete-account-btn" onClick={handleDeleteAccount}>
            🗑️ Delete Account
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
