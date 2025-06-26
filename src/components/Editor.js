//Editor.js
import React, { useState } from 'react';
import { ref as dbRef, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Editor.css';

export default function Editor({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !title || !content) return;

    setIsSubmitting(true);

    let imageUrl = '';
    if (imageFile) {
      const imageStorageRef = storageRef(storage, `blogImages/${Date.now()}-${imageFile.name}`);
      await uploadBytes(imageStorageRef, imageFile);
      imageUrl = await getDownloadURL(imageStorageRef);
    }

    const blogRef = push(dbRef(db, 'blogs'));
    await set(blogRef, {
      title,
      content,
      excerpt: content.slice(0, 100) + '...',
      imageUrl,
      timestamp: Date.now(),
      uid: user.uid,
      author: user.displayName || 'Anonymous',
    });

    setIsSubmitting(false);
    navigate('/');
  };

  return (
    <div className="editor-container">
      <h2>Create a New Blog Post</h2>
      <form onSubmit={handleSubmit} className="editor-form">
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Write your blog content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="10"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish Blog'}
        </button>
      </form>
    </div>
  );
}
