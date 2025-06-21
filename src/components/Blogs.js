import React, { useEffect, useState } from 'react';
import './Blogs.css';
import SearchBar from './SearchBar';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

export default function Blogs({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
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

  const filteredBlogs = blogs.filter(blog =>
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
            <p>No matching blogs found. Please try a different title or author</p>
          ) : (
            filteredBlogs.map((blog) => (
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

                <div className="blog-body-row">
                  <p className={`blog-excerpt ${expandedId === blog.id ? 'full' : ''}`}>
                    {expandedId === blog.id
                      ? blog.content
                      : blog.excerpt || blog.content.slice(0, 100) + '...'}
                  </p>

                  {user && blog.uid === user.uid && (
                    <button
                      className="edit-blog-btn"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/edit/${blog.id}`);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="blog-meta">
                  <span className="blog-author">By {blog.author}</span>
                  <span className="blog-likes">👍 {blog.likes || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
