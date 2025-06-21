// HomePage.js
import React, { useState, useEffect } from 'react';
import './HomePage.css';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';

function HomePage({ loggedIn, user }) {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const loadedBlogs = Object.entries(data).map(([id, blog]) => ({ id, ...blog }));
        setBlogs(loadedBlogs);
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    (blog.author && blog.author.toLowerCase().includes(search.toLowerCase()))
  );

  const trendingBlogs = [...blogs].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3);

  return (
    <div className="home-container">
      <header className="header">
        <h1 className="title">Strathmore University Blog</h1>
      </header>

      <section className="announcement-banner">
        📢 <strong>New:</strong> You will soon be able to upload pictures with your posts!
      </section>

      <section className="quick-nav">
        <button onClick={() => navigate('/blogs?filter=latest')}>🆕 Latest Posts</button>
        <button onClick={() => navigate('/blogs?filter=popular')}>🔥 Most Liked</button>
        <button onClick={() => navigate('/blogs?filter=campus')}>🏫 Campus Life</button>
        <button onClick={() => navigate('/editor')}>✍️ Start Writing</button>
      </section>

      <main className="main">
        <section className="featured-blogs">
          <h3>🌟 Featured Blogs</h3>
          <div className="featured-list">
            {filteredBlogs.length === 0 ? (
              <p>No matching blogs found. Please try a different title or author</p>
            ) : (
              filteredBlogs.map(blog => (
                <div key={blog.id} className="featured-blog-card">
                  {blog.thumbnail && <img src={blog.thumbnail} alt={blog.title} className="blog-thumbnail" />}
                  <h4>{blog.title}</h4>
                  <p><em>by {blog.author}</em></p>
                  <p>{blog.excerpt || blog.content.slice(0, 100) + '...'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="trending-blogs">
          <h3>🔥 Trending</h3>
          {trendingBlogs.map(blog => (
            <div className="trending-card" key={blog.id}>
              <h4>{blog.title}</h4>
              <p><em>By {blog.author}</em></p>
              <p>👍 {blog.likes || 0}</p>
            </div>
          ))}
        </section>

        <section className="testimonial">
          <blockquote>
            “Writing here helped me land my first internship.” – Brian K., BIT student
          </blockquote>
        </section>

        <section className="events-section">
          <h3>📆 Upcoming Events</h3>
          <ul className="event-list">
            <li><strong>Career Fair</strong> – June 18</li>
            <li><strong>AI in Africa Talk</strong> – June 22</li>
            <li><strong>Hackathon</strong> – July 3</li>
          </ul>
        </section>

        <section className="top-contributors">
          <h3>🏆 Top Contributors</h3>
          <ul>
            <li>Mary Wanjiku – 12 posts</li>
            <li>John Kinoti – 9 posts</li>
            <li>Brian Kiptoo – 7 posts</li>
          </ul>
        </section>

        <section className="category-filters">
          <h3>📚 Explore by Category</h3>
          <div className="filter-buttons">
            <button>#Academics</button>
            <button>#Career</button>
            <button>#Entertainment</button>
            <button>#Tech</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;