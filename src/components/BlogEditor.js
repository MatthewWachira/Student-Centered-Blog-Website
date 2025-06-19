import React, { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import './BlogEditor.css';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function BlogEditor({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage('Please fill in both title and content.');
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const storage = getStorage();
        const imgRef = storageRef(storage, `blogImages/${image.name}_${Date.now()}`);
        await uploadBytes(imgRef, image);
        imageUrl = await getDownloadURL(imgRef);
      }

      const blogRef = push(ref(db, 'blogs'));
      await set(blogRef, {
        title,
        content,
        author: user.displayName || 'Anonymous',
        authorEmail: user.email,
        uid: user.uid,
        timestamp: Date.now(),
        likes: 0,
        imageUrl: imageUrl || ''
      });

      setMessage('Blog posted successfully!');
      setTitle('');
      setContent('');
      setImage(null);

      setTimeout(() => {
        navigate('/blogs');
      }, 1000);
    } catch (error) {
      console.error("Error posting blog:", error.code, error.message);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="editor-container">
      <h2>Write a New Blog</h2>
      <form className="editor-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="editor-input"
        />
        <textarea
          placeholder="Write your blog content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-textarea"
          rows="10"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="editor-input"
        />
        <button type="submit" className="editor-submit-btn">Publish</button>
        {message && <p className="editor-message">{message}</p>}
      </form>
    </div>
  );
}
