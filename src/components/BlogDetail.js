// src/components/BlogDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

export default function BlogDetail() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const blogRef = ref(db, `blogs/${blogId}`);
    onValue(blogRef, (snapshot) => {
      if (snapshot.exists()) {
        setBlog(snapshot.val());
      }
    });
  }, [blogId]);

  if (!blog) return <p>Loading...</p>;

  return (
    <div className="blog-detail-container">
      <h2>{blog.title}</h2>
      <p><strong>By:</strong> {blog.author}</p>
      <p>{new Date(blog.timestamp).toLocaleString()}</p>
      {blog.imageUrl && <img src={blog.imageUrl} alt="Blog visual" style={{ maxWidth: '100%' }} />}
      <p>{blog.content}</p>
    </div>
  );
}
