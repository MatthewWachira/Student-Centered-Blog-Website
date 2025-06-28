import React, { useState, useEffect } from 'react';
import './HomePage.css';
import Footer from './components/Footer';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';

function HomePage({ loggedIn, user }) {
  const [blogs, setBlogs] = useState([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [likesInfo, setLikesInfo] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const loadedBlogs = Object.entries(data).map(([id, blog]) => ({ id, ...blog }));
        setBlogs(loadedBlogs.sort((a, b) => b.timestamp - a.timestamp));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const likesRef = ref(db, 'likes');
    const unsubscribe = onValue(likesRef, snapshot => {
      setLikesInfo(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  const blogsWithLikes = blogs.map(blog => ({
    ...blog,
    likeCount: likesInfo[blog.id] ? Object.keys(likesInfo[blog.id]).length : 0
  }));

  const trendingBlogs = [...blogsWithLikes]
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3);

  const contributorCounts = blogs.reduce((acc, blog) => {
    if (!acc[blog.author]) acc[blog.author] = 0;
    acc[blog.author]++;
    return acc;
  }, {});

  const topContributors = Object.entries(contributorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1 className="title">Strathmore University Blog</h1>
      </header>

      <section className="start-writing-cta">
  <button onClick={() => {
    if (user) {
      navigate('/editor');
    } else {
      setShowLoginPrompt(true);
    }
  }}>
    ✍️ Start Writing Your Blog
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
            {blogsWithLikes.slice(0, 3).map(blog => (
              <div key={blog.id}
                   className={`featured-blog-card ${expandedId === blog.id ? 'expanded' : ''}`}
                   onClick={() => toggleExpand(blog.id)}>
                <h4>{blog.title}</h4>
                <p><em>by {blog.author}</em></p>
                <p className="blog-snippet">
                  {expandedId === blog.id ? blog.content : (blog.excerpt || blog.content.slice(0, 100) + '...')}
                </p>
              </div>
            ))}
          </div>
        </section>

 <section className="top-contributors">
          <h3>🏆 Top Contributors This Month</h3>
          <div className="contributors-grid">
            {topContributors.map(([author, count]) => (
              <div key={author} className="contributor-card">
                <div className="contributor-avatar">{author[0]?.toUpperCase()}</div>
                <div className="contributor-info">
                  <h4>{author}</h4>
                  <p>{count} post{count > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="trending-blogs-with-image">
          <div className="trending-blogs-content">
            <h3>🔥 Trending</h3>
            <div className="trending-list">
              {trendingBlogs.map(blog => (
                <div className={`trending-card ${expandedId === blog.id ? 'expanded' : ''}`} key={blog.id}
                     onClick={() => toggleExpand(blog.id)}>
                  <h4>{blog.title}</h4>
                  <p><em>By {blog.author}</em></p>
                  <p className="blog-snippet">
                    {expandedId === blog.id ? blog.content : (blog.excerpt || blog.content.slice(0, 100) + '...')}
                  </p>
                  <p>👍 {blog.likeCount}</p>
                </div>
              ))}
            </div>
          </div>
          <img src="/StrathUniPic1.jpeg" alt="Strathmore University" className="trending-side-image" />
        </section>

      

      
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
