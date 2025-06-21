import React, { useState } from 'react';
import { auth } from './firebase';
import './HomePage.css';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';

const mockFeaturedBlogs = [
  {
    id: 1,
    title: 'How to Succeed at Strathmore',
    author: 'Kimberly Mwangi',
    excerpt: 'Tips and tricks for making the most of your university experience...'
  },
  {
    id: 2,
    title: 'Balancing Academics and Social Life',
    author: 'John Kinoti',
    excerpt: 'Finding the right balance is key to a fulfilling student life...'
  },
  {
    id: 3,
    title: 'Top 5 Study Spots on Campus',
    author: 'Mary Wanjiku',
    excerpt: 'Discover the best places to focus and get work done at Strathmore...'
  }
];

function HomePage({ loggedIn, user }) {
  const [search, setSearch] = useState('');
  const filteredBlogs = mockFeaturedBlogs.filter(blog =>
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    blog.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-container">
      <header className="header">
        <div className="logo-title-container">
          <h1 className="title">Strathmore University Blog</h1>
        </div>
      </header>

      <section className="hero">
        <div className="hero-title">Welcome {loggedIn && user ? user.displayName : 'to the Strathmore Student Blog'}!</div>
        <div className="hero-tagline">
          A vibrant space to share ideas, stories, and connect with the Strathmore community.<br/>
          <span style={{ color: '#fff', fontWeight: 500 }}>Join us and make your voice heard!</span>
        </div>
      </section>

      <main className="main">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or author..." />
        <section className="featured-blogs">
          <h3>Featured Blogs</h3>
          <div className="featured-list">
            {filteredBlogs.length === 0 ? (
              <p style={{ color: '#fff', textAlign: 'center', width: '100%' }}>No matching blogs found. Please try a different title or author</p>
            ) : (
              filteredBlogs.map(blog => (
                <div key={blog.id} className="featured-blog-card">
                  <h4>{blog.title}</h4>
                  <p><em>by {blog.author}</em></p>
                  <p>{blog.excerpt}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
