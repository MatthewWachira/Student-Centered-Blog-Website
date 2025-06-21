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
          <section style={{ marginBottom: '2.2rem' }}>
            <h2>Our Goal</h2>
            <p>
              Our goal is to provide a vibrant digital space where Strathmore University students can freely express themselves through writing, connect with peers, and share ideas that matter. Whether you're an aspiring writer, a passionate thinker, or someone who enjoys exploring diverse opinions, this blog is your space to engage, learn, and be heard.
            </p>
          </section>
          <section style={{ marginBottom: '2.2rem' }}>
            <h2>What We Offer</h2>
            <ul>
              <li><b>Student-Created Content:</b> All blog posts are authored by Strathmore students, ensuring authenticity, relevance, and a sense of shared experience.</li>
              <li><b>Interactive Features:</b> Readers can like, comment on, and engage with posts that spark their interest.</li>
              <li><b>Smart Moderation:</b> With built-in flagging and admin moderation tools, the platform ensures a respectful and safe environment for all users.</li>
              <li><b>Community Engagement:</b> Our platform promotes interaction through thoughtful discussions, allowing users to connect over shared interests and ideas.</li>
            </ul>
          </section>
          <section style={{ marginBottom: '2.2rem' }}>
            <h2>Why We Built This</h2>
            <p>
              We believe that every student has a voice worth hearing. This blog gives students the opportunity to:
            </p>
            <ul>
              <li>Showcase their writing</li>
              <li>Reflect on university life</li>
              <li>Share insights and personal experiences</li>
              <li>Explore academic or creative interests</li>
            </ul>
            <p className="section-summary">
              It’s more than a blog — it’s a growing archive of student stories, opinions, and achievements.
            </p>
          </section>
          <section style={{ marginBottom: '2.2rem' }}>
            <h2>Who Can Join</h2>
            <p>
              Any Strathmore University student can join using their official university email. Verified users can publish posts, interact with others, and build a presence within the student community. Admins help ensure the platform remains a safe and productive space for expression.
            </p>
          </section>
          <section>
            <p className="final">
              This project is a student-led initiative aimed at supporting creativity, freedom of thought, and digital engagement across campus.<br/><br/>
              <span>Let your voice be heard — join the conversation today!</span>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
