// src/components/BlogCard.js
import React, { useState } from 'react';
import { ref, set, update, push, remove } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './BlogCard.css';

export default function BlogCard({ blog, user, likesInfo, comments, isExpanded = false }) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [newComment, setNewComment] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagConfirmed, setFlagConfirmed] = useState(false);
  const navigate = useNavigate();

  const blogId = blog.id;
  const blogLikes = likesInfo[blogId] || {};
  const hasLiked = user && blogLikes[user.uid];
  const commentCount = Object.keys(comments || {}).length;

  const handleToggle = () => setExpanded(!expanded);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return setShowLoginPrompt(true);
    const userId = user.uid;
    const likesRef = ref(db);
    if (hasLiked) {
      await update(ref(db, `likes/${blogId}`), { [userId]: null });
      await update(ref(db, `userLikes/${userId}`), { [blogId]: null });
    } else {
      await update(ref(db, `likes/${blogId}`), { [userId]: user.displayName || 'Anonymous' });
      await set(ref(db, `userLikes/${userId}/${blogId}`), true);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setShowLoginPrompt(true);
    if (!newComment.trim()) return;
    const newRef = push(ref(db, `comments/${blogId}`));
    await set(newRef, {
      uid: user.uid,
      author: user.displayName || 'Anonymous',
      content: newComment,
      timestamp: Date.now()
    });
    setNewComment('');
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post?')) return;
    await remove(ref(db, `blogs/${blogId}`));
    await remove(ref(db, `likes/${blogId}`));
    await remove(ref(db, `comments/${blogId}`));
  };

  const handleFlag = async () => {
    if (!user) return setShowLoginPrompt(true);
    if (!flagReason) return;
    const flagRef = push(ref(db, 'flags'));
    await set(flagRef, {
      postId: blogId,
      reason: flagReason,
      flaggedBy: user.uid,
      timestamp: Date.now()
    });
    setFlagConfirmed(true);
    setTimeout(() => {
      setShowFlagModal(false);
      setFlagReason('');
      setFlagConfirmed(false);
    }, 1500);
  };

  return (
    <div className={`blog-card ${expanded ? 'expanded' : ''}`} onClick={handleToggle}>
      {expanded && (
        <button className="close-button" onClick={(e) => { e.stopPropagation(); setExpanded(false); }}>&times;</button>
      )}

      <div className="blog-card-header">
        <div className="blog-avatar-author">
          <div className="avatar">{blog.author?.[0] || '?'}</div>
          <div>
            <div className="blog-title main-title">{blog.title}</div>
            <div className="blog-meta-row">
              <span className="blog-date">{new Date(blog.timestamp).toLocaleDateString()}</span>
              <span className="blog-author">By {blog.author}</span>
            </div>
          </div>
        </div>
      </div>

      {expanded && blog.imageUrl && (
        <div className="expanded-blog-image-container">
          <img src={blog.imageUrl} alt="" className="expanded-blog-image" />
        </div>
      )}

      <div className="blog-body-row">
        <p className={`blog-excerpt ${expanded ? 'full' : ''}`}>
          {expanded ? blog.content : (blog.excerpt || blog.content.slice(0, 100) + '...')}
        </p>
      </div>

      <div className="blog-card-actions">
        <button className={`like-button ${hasLiked ? 'liked' : ''}`} onClick={handleLike}>
          👍 {Object.keys(blogLikes).length}
        </button>

        <button className="comment-count-btn" onClick={(e) => { e.stopPropagation(); setExpanded(true); }}>
          💬 {commentCount}
        </button>

        <button className="flag-btn" title="Report post" onClick={(e) => {
          e.stopPropagation();
          if (!user) return setShowLoginPrompt(true);
          setShowFlagModal(true);
        }}>🚩</button>

        {user && blog.uid === user.uid && (
          <div className="blog-actions">
            <button className="edit-blog-btn" onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit/${blogId}`);
            }}>Edit</button>

            <button className="delete-blog-btn" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="comments-section" onClick={(e) => e.stopPropagation()}>
          <h4>Comments</h4>
          {Object.entries(comments || {}).map(([id, c]) => (
            <div className="comment" key={id}>
              <p><strong>{c.author}</strong>: {c.content}</p>
            </div>
          ))}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
              />
              <button type="submit">Post</button>
            </form>
          ) : (
            <p className="login-to-comment">Please log in to comment.</p>
          )}
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="flag-modal-overlay" onClick={() => setShowFlagModal(false)}>
          <div className="flag-modal" onClick={(e) => e.stopPropagation()}>
            {!flagConfirmed ? (
              <>
                <h4>Report Post</h4>
                <select value={flagReason} onChange={(e) => setFlagReason(e.target.value)}>
                  <option value="">-- Choose reason --</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Spam or Misleading">Spam or Misleading</option>
                  <option value="Harassment or Hate Speech">Harassment or Hate Speech</option>
                  <option value="Other">Other</option>
                </select>
                <div className="modal-buttons">
                  <button onClick={handleFlag} disabled={!flagReason}>Submit</button>
                  <button onClick={() => setShowFlagModal(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <p style={{ textAlign: 'center', color: 'green' }}>✅ Thank you. Your report has been submitted.</p>
            )}
          </div>
        </div>
      )}

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="login-prompt-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="login-prompt" onClick={(e) => e.stopPropagation()}>
            <p>You must be logged in to perform this action.</p>
            <button onClick={() => {
              setShowLoginPrompt(false);
              if (window.handleGlobalLogin) window.handleGlobalLogin();
            }}>Log In</button>
          </div>
        </div>
      )}
    </div>
  );
}
