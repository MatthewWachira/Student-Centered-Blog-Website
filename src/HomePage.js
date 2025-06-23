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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [likesInfo, setLikesInfo] = useState({}); // <-- Add likesInfo state
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

  // Fetch real-time likes info
  useEffect(() => {
    const likesRef = ref(db, 'likes');
    const unsubscribe = onValue(likesRef, snapshot => {
      setLikesInfo(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    (blog.author && blog.author.toLowerCase().includes(search.toLowerCase()))
  );

  // Trending blogs: top 3 by real-time like count
  const trendingBlogs = [...blogs]
    .map(blog => ({
      ...blog,
      likeCount: likesInfo[blog.id] ? Object.keys(likesInfo[blog.id]).length : 0
    }))
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3);

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
        <button onClick={() => {
          if (user) {
            navigate('/editor');
          } else {
            setShowLoginPrompt(true);
          }
        }}>
          ✍️ Start Writing
        </button>
      </section>
      {showLoginPrompt && (
        <div className="login-prompt-banner">
          <span>
            Please <button className="login-link" onClick={() => window.handleGlobalLogin && window.handleGlobalLogin()}>log in</button> to write a blog.
          </span>
          <button className="close-login-prompt" onClick={() => setShowLoginPrompt(false)}>&times;</button>
        </div>
      )}

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
          <div className="trending-list">
            {trendingBlogs.length === 0 ? (
              <p>No trending blogs yet.</p>
            ) : (
              trendingBlogs.map(blog => (
                <div className="trending-card" key={blog.id}>
                  <h4>{blog.title}</h4>
                  <p><em>By {blog.author}</em></p>
                  <p>👍 {blog.likeCount}</p>
                </div>
              ))
            )}
          </div>
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