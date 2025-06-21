import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import './BlogEditor.css';

export default function EditBlog({ user }) {
  const { postId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBlog() {
      setLoading(true);
      setError('');
      try {
        const blogRef = ref(db, `blogs/${postId}`);
        const snapshot = await get(blogRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTitle(data.title || '');
          setContent(data.content || '');
        } else {
          setError('Blog post not found.');
        }
      } catch (err) {
        setError('Failed to fetch blog post.');
      }
      setLoading(false);
    }
    fetchBlog();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content.');
      return;
    }
    try {
      const blogRef = ref(db, `blogs/${postId}`);
      await update(blogRef, { title, content });
      setMessage('Blog updated successfully!');
      setTimeout(() => navigate('/blogs'), 1200);
    } catch (err) {
      setError('Failed to update blog. Please try again.');
    }
  };

  return (
    <div className="editor-container">
      <h2>Edit Blog Post</h2>
      {loading ? (
        <div className="editor-message loading">Loading...</div>
      ) : error ? (
        <div className="editor-message error">{error}</div>
      ) : (
        <form className="editor-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="editor-input"
          />
          <textarea
            placeholder="Write your blog content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="editor-textarea"
            rows="10"
          />
          <button type="submit" className="editor-submit-btn">Save Changes</button>
          {message && <p className="editor-message">{message}</p>}
        </form>
      )}
    </div>
  );
}
