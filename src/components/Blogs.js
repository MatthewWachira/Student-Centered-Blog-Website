import React from 'react';
import './Blogs.css';

const mockBlogs = [
  {
    id: 1,
    title: 'How to Succeed at Strathmore',
    author: 'Kimberly Mwangi',
    date: '2025-06-01',
    excerpt: 'Tips and tricks for making the most of your university experience...',
    likes: 12
  },
  {
    id: 2,
    title: 'Balancing Academics and Social Life',
    author: 'John Kinoti',
    date: '2025-06-10',
    excerpt: 'Finding the right balance is key to a fulfilling student life...',
    likes: 8
  },
  {
    id: 3,
    title: 'Top 5 Study Spots on Campus',
    author: 'Mary Wanjiku',
    date: '2025-06-15',
    excerpt: 'Discover the best places to focus and get work done at Strathmore...',
    likes: 15
  }
];

export default function Blogs({ user }) {
  return (
    <div className="blogs-container">
      <div className="blogs-header">
        <h1>Blogs</h1>
        {user && (
          <button className="write-blog-btn">Write a Blog</button>
        )}
      </div>
      <div className="blogs-list">
        {mockBlogs.map(blog => (
          <div key={blog.id} className="blog-card">
            <div className="blog-card-header">
              <h2 className="blog-title">{blog.title}</h2>
              <span className="blog-date">{blog.date}</span>
            </div>
            <p className="blog-excerpt">{blog.excerpt}</p>
            <div className="blog-meta">
              <span className="blog-author">By {blog.author}</span>
              <span className="blog-likes">👍 {blog.likes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
