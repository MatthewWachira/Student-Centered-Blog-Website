import React, { useEffect, useState } from 'react';
import './Blogs.css';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Blogs({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedBlogs = Object.entries(data).map(([id, blog]) => ({
          id,
          ...blog
        }));
        setBlogs(loadedBlogs.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setBlogs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="blogs-container">
      <div className="blogs-header">
        <h1>Blogs</h1>
        {user && (
          <button className="write-blog-btn" onClick={() => navigate('/editor')}>
            Write a Blog
          </button>
        )}
      </div>

      <div className="blogs-list">
        {blogs.length === 0 ? (
          <p>No blogs yet. Be the first to write one!</p>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.id}
              className={`blog-card ${expandedId === blog.id ? 'expanded' : ''}`}
              onClick={() => toggleExpand(blog.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="blog-card-header">
                <h2 className="blog-title">{blog.title}</h2>
                <span className="blog-date">
                  {new Date(blog.timestamp).toLocaleDateString()}
                </span>
              </div>

              <p className={`blog-excerpt ${expandedId === blog.id ? 'full' : ''}`}>
                {expandedId === blog.id
                  ? blog.content
                  : blog.excerpt || blog.content.slice(0, 100) + '...'}
              </p>

              <div className="blog-meta">
                <span className="blog-author">By {blog.author}</span>
                <span className="blog-likes">👍 {blog.likes || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
