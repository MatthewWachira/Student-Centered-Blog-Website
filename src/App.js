// App.js
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import HomePage from './HomePage';
import Blogs from './components/Blogs';
import BlogEditor from './components/BlogEditor';
import UserProfile from './components/UserProfile';
import AboutUs from './components/AboutUs';
import BlogDetail from './components/BlogDetail';
import EditBlog from './components/EditBlog';
import AdminDashboard from './components/AdminDashboard';

import { auth, provider } from './firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  ref,
  onValue,
  set as setDb,
} from 'firebase/database';

import { db } from './firebase';
import './App.css';

function AppContent() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminChecked, setAdminChecked] = useState(false);
  const [adminRedirected, setAdminRedirected] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const email = firebaseUser.email;

      if (!email.endsWith('@strathmore.edu')) {
        alert('Only @strathmore.edu emails are allowed.');
        await signOut(auth);
        return;
      }

      // Only write to DB if user does not already exist
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      onValue(userRef, (snapshot) => {
        if (!snapshot.exists()) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            isAdmin: false,
          };
          setDb(userRef, userData);
        }
      }, { onlyOnce: true });

      setUser(firebaseUser);
      setLoggedIn(true);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email.endsWith('@strathmore.edu')) {
        console.log("✅ Logged-in User UID:", firebaseUser.uid);
        setUser(firebaseUser);
        setLoggedIn(true);

        const adminRef = ref(db, `users/${firebaseUser.uid}/isAdmin`);
        onValue(adminRef, (snapshot) => {
          const isUserAdmin = snapshot.val() === true;
          console.log("Admin Check:", isUserAdmin);
          setIsAdmin(isUserAdmin);
          setAdminChecked(true);
        });
      } else if (firebaseUser) {
        alert('Only @strathmore.edu emails are allowed.');
        signOut(auth);
        setUser(null);
        setLoggedIn(false);
        setIsAdmin(false);
        setAdminChecked(true);
      } else {
        setUser(null);
        setLoggedIn(false);
        setIsAdmin(false);
        setAdminChecked(true);
      }

      setLoading(false);
    });

    window.handleGlobalLogin = handleLogin;

    return () => {
      unsubscribe();
      window.handleGlobalLogin = undefined;
    };
  }, []);

  

  if (loading || !adminChecked) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <nav className="main-nav">
        <div className="nav-left">
          <img
            src="/StrathUniLogo.png"
            alt="Strathmore University Logo"
            className="logo"
          />
        </div>
        <ul className="nav-list">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/blogs" className="nav-link">Blogs</Link></li>
          <li><Link to="/about" className="nav-link">About Us</Link></li>
          <li><Link to="/profile" className="nav-link">Profile</Link></li>
          {isAdmin && (
            <li><Link to="/admin" className="nav-link">Admin Dashboard</Link></li>
          )}
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
        <Route path="/admin" element={<AdminDashboard currentUser={user} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
