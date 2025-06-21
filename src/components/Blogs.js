import React, { useEffect, useState } from 'react';
import './Blogs.css';
import SearchBar from './SearchBar';
import { ref, onValue, remove, update, set, child, push } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

export default function Blogs({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [likesInfo, setLikesInfo] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

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

  const handleDeleteComment = (blogId, commentId) => {
    if (window.confirm('Delete this comment?')) {
      remove(ref(db, `comments/${blogId}/${commentId}`));
    }
  };

  const canEditOrDelete = (blog) => {
    if (!user || blog.uid !== user.uid) return false;
    const now = Date.now();
    return now - blog.timestamp <= 40 * 60 * 1000;
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    (blog.author && blog.author.toLowerCase().includes(search.toLowerCase()))
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

              return (
                <div
                  key={blogId}
                  className={`blog-card ${expandedId === blogId ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(blogId)}
                  style={{ width: expandedId === blogId ? '40%' : '36%' }}
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
                        <div className="blog-title">{blog.title}</div>
                        <div className="blog-date">{new Date(blog.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="blog-body-row">
                    <p className={`blog-excerpt ${expandedId === blogId ? 'full' : ''}`}>
                      {expandedId === blogId ? blog.content : blog.excerpt || blog.content.slice(0, 100) + '...'}
                    </p>

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
                      <div className="comments-section" onClick={(e) => e.stopPropagation()}>
                        <h4>Comments</h4>
                        {Object.entries(blogComments).map(([commentId, c]) => (
                          <div className="comment" key={commentId}>
                            <p><strong>{c.author}</strong>: {c.content}</p>
                            {user?.uid === c.uid && (
                              <button className="delete-comment" onClick={(e) => { e.stopPropagation(); handleDeleteComment(blogId, commentId); }}>Delete</button>
                            )}
                          </div>
                        ))}

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

                      <div className="blog-meta">
                        <span className="blog-author">By {blog.author}</span>

                        <button
                          className={`like-button ${hasLiked ? 'liked' : ''}`}
                          onClick={(e) => handleLikeToggle(e, blogId)}
                        >
                          👍 {Object.keys(likeUsers).length}
                        </button>

                        {blog.uid === user?.uid && Object.keys(likeUsers).length > 0 && (
                          <div className="likes-list">
                            <strong>Liked by:</strong>
                            <ul>
                              {Object.values(likeUsers).map((name, idx) => (
                                <li key={idx}>{name}</li>
                              ))}
                            </ul>
                          </div>
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