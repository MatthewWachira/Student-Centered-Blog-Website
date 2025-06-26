import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import { ref, onValue, remove, update, push, set } from 'firebase/database';
import { auth, db, storage } from '../firebase';
import { deleteUser, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

export default function UserProfile({ user }) {
  const [userBlogs, setUserBlogs] = useState([]);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [showNameForm, setShowNameForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);

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

  const toggleExpand = (postId) => {
    setExpandedPostId(prev => (prev === postId ? null : postId));
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account and all your posts?")) return;
    try {
      const blogDeletes = userBlogs.map(blog => remove(ref(db, `blogs/${blog.id}`)));
      await Promise.all(blogDeletes);
      await deleteUser(auth.currentUser);
      alert("Account and blog posts deleted.");
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("Please log in again to delete your account.");
      } else {
        alert("Failed to delete account.");
      }
    }
  };

  const handleUploadProfilePhoto = async () => {
    if (!newPhoto) return;
    const storagePath = `profilePhotos/${user.uid}_${Date.now()}`;
    const storageRefPath = storageRef(storage, storagePath);
    try {
      console.log("Uploading profile photo...");
      console.log("Auth user:", auth.currentUser?.uid);
      console.log("Photo file:", newPhoto.name);

      const snapshot = await uploadBytes(storageRefPath, newPhoto);
      const url = await getDownloadURL(snapshot.ref);
      await updateProfile(auth.currentUser, { photoURL: url });
      alert("Profile photo updated!");
    } catch (err) {
      console.error("Failed to upload profile photo:", err);
      alert("Failed to upload photo.");
    }
  };

  const handleUpdateName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      const blogsRef = ref(db, 'blogs');
      onValue(blogsRef, async (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const updates = {};
          Object.entries(data).forEach(([id, blog]) => {
            if (blog.uid === user.uid && blog.author !== displayName) {
              updates[`blogs/${id}/author`] = displayName;
            }
            if (blog.comments) {
              const updateCommentAuthors = (commentsObj, pathArr = []) => {
                Object.entries(commentsObj).forEach(([commentId, comment]) => {
                  if (comment.uid === user.uid && comment.author !== displayName) {
                    updates[`comments/${id}/${[...pathArr, commentId].join('/')}/author`] = displayName;
                  }
                  if (comment.replies) {
                    updateCommentAuthors(comment.replies, [...pathArr, commentId, 'replies']);
                  }
                });
              };
              updateCommentAuthors(blog.comments);
            }
          });
          if (Object.keys(updates).length > 0) {
            await update(ref(db), updates);
          }
        }
      }, { onlyOnce: true });
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
    let imageUrl = '';
    if (newPostImage) {
      const imageRef = storageRef(storage, `blogImages/${Date.now()}_${newPostImage.name}`);
      try {
        console.log("Uploading blog image...");
        console.log("Auth user:", auth.currentUser?.uid);
        console.log("Image file:", newPostImage.name);

        const snapshot = await uploadBytes(imageRef, newPostImage);
        imageUrl = await getDownloadURL(snapshot.ref);
        console.log("Image uploaded, URL:", imageUrl);
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Image upload failed.");
        return;
      }
    }

    const tags = newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const postRef = push(ref(db, 'blogs'));

    try {
      await set(postRef, {
        title: newPostTitle,
        content: newPostContent,
        excerpt: newPostContent.slice(0, 100),
        uid: user.uid,
        author: user.displayName || 'Anonymous',
        authorEmail: user.email,
        timestamp: Date.now(),
        tags,
        imageUrl
      });

      console.log("Post created:", newPostTitle);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostTags('');
      setNewPostImage(null);
      setShowPostForm(false);
      alert('Blog post created!');
    } catch (err) {
      console.error("Failed to save blog post:", err);
      alert("Failed to create blog post.");
    }
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
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="profile-info">
              <h2>{user.displayName || 'Your Name'}</h2>
              <p>{user.email || 'your.email@strathmore.edu'}</p>
            </div>
          </div>

          <div className="profile-edit-section">
            <button onClick={() => setShowNameForm(!showNameForm)}>Edit Name</button>
            {showNameForm && (
              <div className="form-group">
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Edit display name" />
                <button onClick={handleUpdateName}>Submit</button>
              </div>
            )}
            <button onClick={() => setShowPhotoForm(!showPhotoForm)}>Update Profile Photo</button>
            {showPhotoForm && (
              <div className="form-group">
                <input type="file" accept="image/*" onChange={(e) => setNewPhoto(e.target.files[0])} />
                <button onClick={handleUploadProfilePhoto}>Upload</button>
              </div>
            )}
          </div>

          <div className="profile-stats">
            <span>Total Posts: {userBlogs.length}</span>
          </div>

          <div className="profile-section">
            <button onClick={() => setShowPostForm(!showPostForm)}>
              {showPostForm ? 'Cancel New Post' : 'Write a New Post'}
            </button>
            {showPostForm && (
              <div className="post-form">
                <h3 className="section-title">Write a New Post</h3>
                <input type="text" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Title" className="post-input" />
                <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Content" className="post-textarea" />
                <input type="text" value={newPostTags} onChange={(e) => setNewPostTags(e.target.value)} placeholder="Tags (comma separated)" className="post-input" />
                <input type="file" accept="image/*" onChange={(e) => setNewPostImage(e.target.files[0])} className="post-input" />
                <button className="create-post-btn" onClick={handleCreatePost}>Post</button>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h3 className="section-title">My Blog Posts</h3>
            {userBlogs.length > 0 ? (
              <ul className="profile-post-list">
                {userBlogs.sort((a, b) => b.timestamp - a.timestamp).map(post => (
                  <li key={post.id} className="profile-post-item" onClick={() => toggleExpand(post.id)}>
                    {post.imageUrl && <img src={post.imageUrl} alt="blog" className="profile-post-thumbnail" />}
                    <span className="profile-post-title">{post.title}</span>
                    <span className="profile-post-date">{new Date(post.timestamp).toLocaleDateString()}</span>
                    <span className="profile-post-excerpt">{post.excerpt || post.content.slice(0, 80)}...</span>
                    <div className="post-controls bottom-right">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/edit/${post.id}`); }} className="edit-btn">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className="delete-btn">Delete</button>
                    </div>
                    {expandedPostId === post.id && (
                      <div className="expanded-post" onClick={(e) => e.stopPropagation()}>
                        <h4>{post.title}</h4>
                        <p>{post.content}</p>
                        {post.tags?.length > 0 && (
                          <p><strong>Tags:</strong> {post.tags.join(', ')}</p>
                        )}
                        <button className="delete-btn" onClick={() => setExpandedPostId(null)}>Close</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-posts-msg">You haven’t written any blog posts yet.<br />(Your published blogs will appear here.)</p>
            )}
          </div>

          <button className="delete-account-btn" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
