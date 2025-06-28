// src/components/Blogs.js
import React, { useEffect, useState } from 'react';
import './Blogs.css';
import SearchBar from './SearchBar';
import { ref, onValue, remove, update, set, child, push } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';

export default function Blogs({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [likesInfo, setLikesInfo] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingTo, setReplyingTo] = useState({});
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flaggingBlogId, setFlaggingBlogId] = useState(null);
  const [reason, setReason] = useState('');
  const [flagConfirmed, setFlagConfirmed] = useState(false);
  const [loginAlert, setLoginAlert] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    return onValue(blogsRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, blog]) => ({ id, ...blog }));
        setBlogs(loaded.sort((a, b) => b.timestamp - a.timestamp));
      } else setBlogs([]);
    });
  }, []);

  useEffect(() => {
    const likesRef = ref(db, 'likes');
    return onValue(likesRef, snap => setLikesInfo(snap.val() || {}));
  }, []);

  useEffect(() => {
    const commentsRef = ref(db, 'comments');
    return onValue(commentsRef, snap => setComments(snap.val() || {}));
  }, []);

  const toggleExpand = id => {
    setExpandedId(expandedId === id ? null : id);
    setNewComment('');
  };

  const handleDelete = (e, blogId) => {
    e.stopPropagation();
    if (window.confirm('Delete this post?')) {
      remove(ref(db, `blogs/${blogId}`));
      remove(ref(db, `likes/${blogId}`));
      remove(ref(db, `comments/${blogId}`));
    }
  };

  const handleLikeToggle = async (e, blogId) => {
    e.stopPropagation();
    if (!user) {
      setLoginAlert('You must be logged in to like posts.');
      return;
    }
    const userId = user.uid;
    const blogLikes = likesInfo[blogId] || {};
    const likesRef = ref(db);
    if (blogLikes[userId]) {
      await update(child(likesRef, `likes/${blogId}`), { [userId]: null });
      await update(child(likesRef, `userLikes/${userId}`), { [blogId]: null });
    } else {
      await update(child(likesRef, `likes/${blogId}`), { [userId]: user.displayName || 'Anonymous' });
      await set(child(likesRef, `userLikes/${userId}/${blogId}`), true);
    }
  };

  const handleCommentSubmit = async (e, blogId) => {
    e.preventDefault();
    if (!user) {
      setLoginAlert('You must be logged in to comment.');
      return;
    }
    if (!newComment.trim()) return;
    const commentRef = ref(db, `comments/${blogId}`);
    const newRef = push(commentRef);
    await set(newRef, {
      uid: user.uid,
      author: user.displayName || 'Anonymous',
      content: newComment,
      timestamp: Date.now()
    });
    setNewComment('');
  };

  const handleDeleteComment = (blogId, pathArr) => {
    if (window.confirm('Delete this comment?')) {
      remove(ref(db, ['comments', blogId, ...pathArr].join('/')));
    }
  };

  const handleReplySubmit = async (e, blogId, commentId) => {
    e.preventDefault();
    if (!user) {
      setLoginAlert('You must be logged in to reply.');
      return;
    }
    const text = replyInputs[commentId];
    if (!text.trim()) return;
    const replyRef = push(ref(db, `comments/${blogId}/${commentId}/replies`));
    await set(replyRef, {
      uid: user.uid,
      author: user.displayName || 'Anonymous',
      content: text,
      timestamp: Date.now()
    });
    setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
    setReplyingTo(prev => ({ ...prev, [commentId]: false }));
  };

  const openFlagModal = (e, blogId) => {
    e.stopPropagation();
    if (!user) {
      setLoginAlert('You must be logged in to flag posts.');
      return;
    }
    setFlaggingBlogId(blogId);
    setShowFlagModal(true);
    setReason('');
    setFlagConfirmed(false);
  };

  const handleFlagSubmit = async () => {
    if (!user || !reason || !flaggingBlogId) return;
    const flagRef = push(ref(db, 'flags'));
    await set(flagRef, {
      postId: flaggingBlogId,
      reason,
      flaggedBy: user.uid,
      timestamp: Date.now()
    });
    setFlagConfirmed(true);
    setTimeout(() => setShowFlagModal(false), 1500);
  };

  const renderComment = (bId, cId, c, depth = 0, pathArr = []) => (
    <div className={`comment${depth > 0 ? ' reply-comment' : ''}`} key={cId}>
      <p><strong>{c.author}</strong>: {c.content}</p>
      <div className="comment-actions-row">
        {user?.uid === c.uid && (
          <button className="delete-comment" onClick={e => { e.stopPropagation(); handleDeleteComment(bId, [...pathArr, cId]); }}>
            Delete
          </button>
        )}
        {depth === 0 && (
          <button className="reply-btn" onClick={e => { e.stopPropagation(); setReplyingTo(prev => ({ ...prev, [cId]: !prev[cId] })); }}>
            Reply
          </button>
        )}
      </div>
      {depth === 0 && replyingTo[cId] && (
        <form className="reply-form" onSubmit={e => handleReplySubmit(e, bId, cId)}>
          <input value={replyInputs[cId] || ''} onChange={e => setReplyInputs(prev => ({ ...prev, [cId]: e.target.value }))} placeholder="Write reply..." />
          <button type="submit">Post</button>
        </form>
      )}
      {c.replies && (
        <div className="replies-list">
          {Object.entries(c.replies).map(([rId, r]) => renderComment(bId, rId, r, depth + 1, [...pathArr, cId, 'replies']))}
        </div>
      )}
    </div>
  );

  const blogsWithLikes = blogs.map(b => ({
    ...b,
    likeCount: likesInfo[b.id] ? Object.keys(likesInfo[b.id]).length : 0
  }));

  const sort = new URLSearchParams(location.search).get('filter');
  let sorted = blogsWithLikes;
  if (sort === 'popular') sorted = [...blogsWithLikes].sort((a, b) => b.likeCount - a.likeCount);
  else if (sort === 'latest') sorted = [...blogsWithLikes].sort((a, b) => b.timestamp - a.timestamp);

  const filteredBlogs = sorted.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="blogs-outer-container">
      <div className="blogs-container">
        <div className="blogs-header">
          <h1>Blogs</h1>
          {user && <button className="write-blog-btn" onClick={() => navigate('/editor')}>Write a Blog</button>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or author..." />
        {loginAlert && <div className="login-alert">{loginAlert}</div>}
        <div className="blogs-list">
          {filteredBlogs.length === 0 ? (
            <p className="empty-state">No matching blogs found.</p>
          ) : (
            filteredBlogs.map(blog => {
              const blogId = blog.id;
              const hasLiked = user && likesInfo[blogId]?.[user.uid];
              const blogComments = comments[blogId] || {};
              const commentCount = Object.keys(blogComments).length;
              return (
                <div key={blogId}
                  className={`blog-card ${expandedId === blogId ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(blogId)}>
                  {expandedId === blogId && (
                    <button className="close-button" onClick={e => { e.stopPropagation(); setExpandedId(null); }}>&times;</button>
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
                  {expandedId === blogId && blog.imageUrl && (
                    <div className="expanded-blog-image-container">
                      <img src={blog.imageUrl} alt="" className="expanded-blog-image" />
                    </div>
                  )}
                  <div className="blog-body-row">
                    <p className={`blog-excerpt ${expandedId === blogId ? 'full' : ''}`}>
                      {expandedId === blogId ? blog.content : (blog.excerpt || blog.content.slice(0, 100) + '...')}
                    </p>
                  </div>
                  <div className="blog-card-actions">
                    <button className={`like-button ${hasLiked ? 'liked' : ''}`} onClick={e => handleLikeToggle(e, blogId)}>
                      👍 {blog.likeCount}
                    </button>
                    <button className="comment-count-btn" onClick={e => { e.stopPropagation(); toggleExpand(blogId); }}>
                      💬 {commentCount}
                    </button>
                    <button className="flag-btn" onClick={e => openFlagModal(e, blogId)} title="Report post">🚩</button>
                    {user && blog.uid === user.uid && (
                      <div className="blog-actions">
                        <button className="edit-blog-btn" onClick={e => { e.stopPropagation(); navigate(`/edit/${blogId}`); }}>Edit</button>
                        <button className="delete-blog-btn" onClick={e => handleDelete(e, blogId)}>Delete</button>
                      </div>
                    )}
                  </div>
                  {expandedId === blogId && (
                    <div className="comments-section" onClick={e => e.stopPropagation()}>
                      <h4>Comments</h4>
                      {Object.entries(blogComments).map(([cId, c]) => renderComment(blogId, cId, c))}
                      {user && (
                        <form onSubmit={e => handleCommentSubmit(e, blogId)} className="comment-form">
                          <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." />
                          <button type="submit">Post</button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showFlagModal && (
        <div className="flag-modal-overlay" onClick={() => setShowFlagModal(false)}>
          <div className="flag-modal" onClick={e => e.stopPropagation()}>
            {!flagConfirmed ? (
              <>
                <h4>Report Post</h4>
                <select value={reason} onChange={e => setReason(e.target.value)}>
                  <option value="">-- Choose reason --</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Spam or Misleading">Spam or Misleading</option>
                  <option value="Harassment or Hate Speech">Harassment or Hate Speech</option>
                  <option value="Other">Other</option>
                </select>
                <div className="modal-buttons">
                  <button onClick={handleFlagSubmit} disabled={!reason}>Submit</button>
                  <button onClick={() => setShowFlagModal(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <p style={{ textAlign: 'center', color: 'green' }}>✅ Thank you. Your report has been submitted.</p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
