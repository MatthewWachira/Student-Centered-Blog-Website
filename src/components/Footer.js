import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-flex">
        <div className="footer-left">
          <div className="footer-site-row">
            <span className="footer-site-name">Strathmore University Blog</span>
          </div>
          <nav className="footer-nav">
            <a href="/" className="footer-link">Home</a>
            <span className="footer-sep">|</span>
            <a href="/blogs" className="footer-link">Blogs</a>
            <span className="footer-sep">|</span>
            <a href="/about" className="footer-link">About Us</a>
            <span className="footer-sep">|</span>
            <a href="/profile" className="footer-link">Profile</a>
          </nav>
        </div>
        <div className="footer-right">
          <div className="footer-contact">
            Contact: <a href="mailto:studentblog@strathmore.edu">studentblog@strathmore.edu</a>
          </div>
          <div className="footer-social">
            <a href="https://twitter.com/StrathU" target="_blank" rel="noopener noreferrer">
            <img src="/WhiteXLogo.png" alt="Twitter" className="footer-social-icon" />
            </a>
            <a href="https://www.linkedin.com/school/strathmore-university" target="_blank" rel="noopener noreferrer">
            <img src="/WhiteLinkedInLogo.png" alt="LinkedIn" className="footer-social-icon" />
            </a>
            <a href="https://www.youtube.com/@StrathmoreUniversity" target="_blank" rel="noopener noreferrer">
            <img src="/WhiteYoutubeLogo.png" alt="Youtube" className="footer-social-icon youtube-icon" />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copyright">© 2025 Strathmore University</span>
      </div>
    </footer>
  );
}
