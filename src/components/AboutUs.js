// AboutUs.js
import React from 'react';
import './AboutUs.css';
import Footer from './Footer';

export default function AboutUs() {
  return (
    <div className="aboutus-outer-container">
      <div className="aboutus-container">
        <div className="aboutus-content">
          <h1>About Us</h1>
          <p className="intro">
            Welcome to the Strathmore Student Blog — a platform built by students, for students.
          </p>

          <section>
            <h2>Our Goal</h2>
            <p>
              Our goal is to provide a vibrant digital space where Strathmore University students can freely express themselves through writing, connect with peers, and share ideas that matter.
            </p>
          </section>

          <section>
            <h2>What We Offer</h2>
            <ul>
              <li><b>Student-Created Content:</b> All blog posts are authored by Strathmore students, ensuring authenticity and relevance.</li>
              <li><b>Interactive Features:</b> Readers can like, comment on, and engage with posts that spark their interest.</li>
              <li><b>Smart Moderation:</b> Built-in flagging and admin moderation tools promote safety and respect.</li>
              <li><b>Community Engagement:</b> Our platform encourages connection through thoughtful discussions.</li>
            </ul>
          </section>

          <section>
            <h2>Why We Built This</h2>
            <p>We believe that every student has a voice worth hearing. This blog gives students the opportunity to:</p>
            <ul>
              <li>Showcase their writing</li>
              <li>Reflect on university life</li>
              <li>Share insights and experiences</li>
              <li>Explore academic or creative interests</li>
            </ul>
            <p className="section-summary">
              It’s more than a blog — it’s a growing archive of student stories, opinions, and achievements.
            </p>
          </section>

          <section>
            <h2>Who Can Join</h2>
            <p>
              Any Strathmore University student can join using their official university email. Verified users can publish posts, interact with others, and build a presence within the student community.
            </p>
          </section>

          <section>
            <p className="final">
              This project is a student-led initiative aimed at supporting creativity, freedom of thought, and digital engagement across campus.<br /><br />
              <span>Let your voice be heard — join the conversation today!</span>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
