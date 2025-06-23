import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import Blogs from './components/Blogs';
import BlogEditor from './components/BlogEditor';
import UserProfile from './components/UserProfile';
import AboutUs from './components/AboutUs';
import BlogDetail from './components/BlogDetail';
import EditBlog from './components/EditBlog';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@strathmore.edu')) {
        setLoggedIn(true);
        setUser(user);
      } else if (user) {
        alert('Only @strathmore.edu emails are allowed.');
        signOut(auth);
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    });
    // Expose handleLogin globally for use in HomePage
    window.handleGlobalLogin = handleLogin;
    return () => {
      unsubscribe();
      window.handleGlobalLogin = undefined;
    };
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!email.endsWith('@strathmore.edu')) {
        alert('Only @strathmore.edu emails are allowed.');
        await signOut(auth);
        return;
      }
      setLoggedIn(true);
      setUser(result.user);
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <Router>
      <nav className="main-nav">
        <div className="nav-left">
            <img src="/StrathUniLogo.png" alt="Strathmore University Logo" className="logo" />
        </div>

        <ul className="nav-list">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/blogs" className="nav-link">Blogs</Link></li>
          <li><Link to="/about" className="nav-link">About Us</Link></li>
          <li><Link to="/profile" className="nav-link">Profile</Link></li>
        </ul>

        <div className="nav-actions">
          {loggedIn ? (
            <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="nav-btn login-btn" onClick={handleLogin}>Login</button>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage loggedIn={loggedIn} user={user} />} />
        <Route path="/blogs" element={<Blogs user={user} />} />
        <Route path="/editor" element={<BlogEditor user={user} />} />
        <Route path="/edit/:postId" element={<EditBlog user={user} />} />
        <Route path="/profile" element={<UserProfile user={user} />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blogs/:blogId" element={<BlogDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
