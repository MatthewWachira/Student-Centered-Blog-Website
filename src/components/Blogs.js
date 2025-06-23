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
  const [replyInputs, setReplyInputs] = useState({}); // { [commentId]: replyText }
  const [replyingTo, setReplyingTo] = useState({}); // { [commentId]: true/false }
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    return onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedBlogs = Object.entries(data).map(([id, blog]) => ({
          id,
          ...blog,
        }));
        setBlogs(loadedBlogs.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setBlogs([]);
      }
    });
  }, []);

  useEffect(() => {
    const likesRef = ref(db, 'likes');
    return onValue(likesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setLikesInfo(data);
    });
  }, []);

  useEffect(() => {
    const commentsRef = ref(db, 'comments');
    return onValue(commentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setComments(data);
    });
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setNewComment('');
  };

  const handleDelete = (e, blogId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      remove(ref(db, `blogs/${blogId}`));
      remove(ref(db, `likes/${blogId}`));
      remove(ref(db, `comments/${blogId}`));
    }
  };

  const handleLikeToggle = async (e, blogId) => {
    e.stopPropagation();
    if (!user) return;

    const userId = user.uid;
    const blogLikes = likesInfo[blogId] || {};
    const userLiked = blogLikes[userId];

    const likesRef = ref(db);
    if (userLiked) {
      await update(child(likesRef, `likes/${blogId}`), { [userId]: null });
      await update(child(likesRef, `userLikes/${userId}`), { [blogId]: null });
    } else {
      await update(child(likesRef, `likes/${blogId}`), { [userId]: user.displayName || 'Anonymous' });
      await set(child(likesRef, `userLikes/${userId}/${blogId}`), true);
    }
  };

  const handleCommentSubmit = async (e, blogId) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const commentRef = ref(db, `comments/${blogId}`);
    const newCommentRef = push(commentRef);
    await set(newCommentRef, {
      uid: user.uid,
      author: user.displayName || 'Anonymous',
      content: newComment,
      timestamp: Date.now(),
    });
    setNewComment('');
  };

  // Update: handleDeleteComment to accept a path array
  const handleDeleteComment = (blogId, commentPathArr) => {
    if (window.confirm('Delete this comment?')) {
      const path = ['comments', blogId, ...commentPathArr].join('/');
      remove(ref(db, path));
    }
  };

  // Add reply to a comment
  const handleReplySubmit = async (e, blogId, commentId) => {
    e.preventDefault();
    const replyText = replyInputs[commentId];
    if (!user || !replyText || !replyText.trim()) return;
    const replyRef = push(ref(db, `comments/${blogId}/${commentId}/replies`));
    await set(replyRef, {
      uid: user.uid,
      author: user.displayName || 'Anonymous',
      content: replyText,
      timestamp: Date.now(),
    });
    setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
    setReplyingTo((prev) => ({ ...prev, [commentId]: false }));
  };

  const canEditOrDelete = (blog) => {
    return user && blog.uid === user.uid;
  };

  // Get sort/filter from query string
  const query = new URLSearchParams(location.search);
  const sort = query.get('filter');

  // Compute like counts for all blogs
  const blogsWithLikes = blogs.map(blog => ({
    ...blog,
    likeCount: likesInfo[blog.id] ? Object.keys(likesInfo[blog.id]).length : 0
  }));

  // Sort by most liked or latest if requested
  let sortedBlogs = blogsWithLikes;
  if (sort === 'popular') {
    sortedBlogs = [...blogsWithLikes].sort((a, b) => b.likeCount - a.likeCount);
  } else if (sort === 'latest') {
    sortedBlogs = [...blogsWithLikes].sort((a, b) => b.timestamp - a.timestamp);
  }

  const filteredBlogs = sortedBlogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    (blog.author && blog.author.toLowerCase().includes(search.toLowerCase()))
  );

  // Update: renderComment to only allow replying to top-level comments
  const renderComment = (blogId, commentId, c, depth = 0, pathArr = []) => (
    <div className={`comment${depth > 0 ? ' reply-comment' : ''}`} key={commentId}>
      <p><strong>{c.author}</strong>: {c.content}</p>
      <div className="comment-actions-row">
        {user?.uid === c.uid && (
          <button className="delete-comment" onClick={(e) => { e.stopPropagation(); handleDeleteComment(blogId, [...pathArr, commentId]); }}>Delete</button>
        )}
        {depth === 0 && (
          <button className="reply-btn" onClick={(e) => { e.stopPropagation(); setReplyingTo((prev) => ({ ...prev, [commentId]: !prev[commentId] })); }}>
            Reply
          </button>
        )}
      </div>
      {depth === 0 && replyingTo[commentId] && (
        <form className="reply-form" onSubmit={(e) => handleReplySubmit(e, blogId, commentId)}>
          <input
            type="text"
            value={replyInputs[commentId] || ''}
            onChange={(e) => setReplyInputs((prev) => ({ ...prev, [commentId]: e.target.value }))}
            placeholder="Write a reply..."
          />
          <button type="submit">Post</button>
        </form>
      )}
      {c.replies && (
        <div className="replies-list">
          {Object.entries(c.replies).map(([replyId, reply]) =>
            renderComment(blogId, replyId, reply, depth + 1, [...pathArr, commentId, 'replies'])
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="blogs-outer-container">
      <div className="blogs-container">
        <div className="blogs-header">
          <h1>Blogs</h1>
          {user && (
            <button className="write-blog-btn" onClick={() => navigate('/editor')}>
              Write a Blog
            </button>
          )}
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or author..." />

        <div className="blogs-list">
          {filteredBlogs.length === 0 ? (
            <p className="empty-state">No matching blogs found. Please try a different title or author.</p>
          ) : (
            filteredBlogs.map((blog) => {
              const blogId = blog.id;
              const likeUsers = likesInfo[blogId] || {};
              const hasLiked = user && !!likeUsers[user.uid];
              const blogComments = comments[blogId] || {};
              const commentCount = Object.keys(blogComments).length;
              const likeCount = Object.keys(likeUsers).length;

              // For scrolling to comments
              const commentSectionId = `comments-${blogId}`;

              const handleCommentIconClick = (e) => {
                e.stopPropagation();
                if (expandedId === blogId) {
                  const el = document.getElementById(commentSectionId);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  toggleExpand(blogId);
                  setTimeout(() => {
                    const el = document.getElementById(commentSectionId);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 300);
                }
              };

              return (
                <div
                  key={blogId}
                  className={`blog-card ${expandedId === blogId ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(blogId)}
                >
                  {expandedId === blogId && (
                    <button
                      className="close-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(null);
                      }}
                    >
                      &times;
                    </button>
                  )}

                  <div className="blog-card-header">
                    <div className="blog-avatar-author">
                      <div className="avatar" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem'}}>{blog.author?.[0] || '?'}</div>
                      <div>
                        <div className="blog-title main-title">{blog.title}</div>
                        <div className="blog-meta-row">
                          <span className="blog-date">{new Date(blog.timestamp).toLocaleDateString()}</span>
                          <span className="blog-author">By {blog.author}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="blog-body-row">
                    <p className={`blog-excerpt ${expandedId === blogId ? 'full' : ''}`}>
                      {expandedId === blogId ? blog.content : blog.excerpt || blog.content.slice(0, 100) + '...'}
                    </p>
                  </div>

                  <div className="blog-card-actions">
                    <button
                      className={`like-button ${hasLiked ? 'liked' : ''}`}
                      onClick={(e) => handleLikeToggle(e, blogId)}
                    >
                      👍 {likeCount}
                    </button>
                    <button
                      className="comment-count-btn"
                      onClick={handleCommentIconClick}
                    >
                      💬 {commentCount}
                    </button>
                    {user && blog.uid === user.uid && (
                      <div className="blog-actions">
                        <button className="edit-blog-btn" onClick={(e) => { e.stopPropagation(); navigate(`/edit/${blogId}`); }}>Edit</button>
                        {canEditOrDelete(blog) && (
                          <button className="delete-blog-btn" onClick={(e) => handleDelete(e, blogId)}>Delete</button>
                        )}
                      </div>
                    )}
                  </div>

                  {expandedId === blogId && (
                    <>
                      <div className="comments-section" id={commentSectionId} onClick={(e) => e.stopPropagation()}>
                        <h4>Comments</h4>
                        {Object.entries(blogComments).map(([commentId, c]) =>
                          renderComment(blogId, commentId, c)
                        )}
                        {user && (
                          <form onSubmit={(e) => handleCommentSubmit(e, blogId)} className="comment-form">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                            />
                            <button type="submit">Post</button>
                          </form>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}