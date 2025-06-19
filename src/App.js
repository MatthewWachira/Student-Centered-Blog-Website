import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import Blogs from './components/Blogs';
import BlogEditor from './components/BlogEditor';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import AboutUs from './components/AboutUs';
import BlogDetail from './components/BlogDetail';
import { auth, provider } from './firebase'; // Firebase is initialized in firebase.js
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@strathmore.edu')) {
        setLoggedIn(true);
        setUser(user);
        setIsAdmin(user.email === 'admin@strathmore.edu'); // basic admin check
      } else if (user) {
        alert('Only @strathmore.edu emails are allowed.');
        signOut(auth);
      } else {
        setLoggedIn(false);
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
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
      setIsAdmin(email === 'admin@strathmore.edu');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <Router>
      <nav className="main-nav">
        <ul className="nav-list">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/blogs" className="nav-link">Blogs</Link></li>
          <li><Link to="/about" className="nav-link">About Us</Link></li>
          <li><Link to="/profile" className="nav-link">Profile</Link></li>
          {isAdmin && <li><Link to="/admin" className="nav-link">Admin Panel</Link></li>}
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage loggedIn={loggedIn} onLogin={handleLogin} onLogout={handleLogout} user={user} />} />
        <Route path="/blogs" element={<Blogs user={user} />} />
        <Route path="/editor" element={<BlogEditor user={user} />} />
        <Route path="/profile" element={<UserProfile user={user} />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blogs/:blogId" element={<BlogDetail />} />
        {isAdmin && <Route path="/admin" element={<AdminPanel user={user} />} />}
      </Routes>
    </Router>
  );
}

export default App;
