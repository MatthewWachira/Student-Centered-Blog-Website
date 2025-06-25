import React, { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import './BlogEditor.css';
import { useNavigate } from 'react-router-dom';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function BlogEditor({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      setImageFile(null);
      alert('Please select a valid image file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage('Please fill in both title and content.');
      return;
    }
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        const imgRef = storageRef(storage, `blogImages/${imageFile.name}_${Date.now()}`);
        await uploadBytes(imgRef, imageFile);
        uploadedImageUrl = await getDownloadURL(imgRef);
      }
      const blogRef = push(ref(db, 'blogs'));
      await set(blogRef, {
        title,
        content,
        author: user.displayName || 'Anonymous',
        authorEmail: user.email,
        uid: user.uid,
        timestamp: Date.now(),
        imageUrl: uploadedImageUrl
      });
      setMessage('Blog posted successfully!');
      setTitle('');
      setContent('');
      setImageFile(null);
      setTimeout(() => {
        navigate('/blogs');
      }, 1000);
    } catch (error) {
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
