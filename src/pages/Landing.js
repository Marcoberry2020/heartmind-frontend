 import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <header className="hero fade-in">
        <h1 className="title slide-up">HeartMind AI</h1>
        <p className="subtitle fade-in-delayed">
          Your intelligent healing companion  empowering you to recover, reflect, and rise stronger after heartbreak.
        </p>
      </header>

      <div className="actions fade-in-delayed">
        <Link to="/signup" className="btn primary pulse">Start Healing</Link>
        <Link to="/login" className="btn ghost">Log In</Link>
      </div>

      <section className="features">
        <div className="feature card slide-up">
          <h3> Deep Conversations</h3>
          <p>
            Speak freely. HeartMind listens and responds with empathy  offering warmth, validation, and mindful insight.
          </p>
        </div>

        <div className="feature card slide-up">
          <h3> Guided Journaling</h3>
          <p>
            Reflect with daily prompts designed to bring self-awareness, peace, and emotional clarity.
          </p>
        </div>

        <div className="feature card slide-up">
          <h3>Inner Renewal</h3>
          <p>
            Rebuild your strength with affirmations, reflections, and actionable steps toward emotional growth.
          </p>
        </div>
      </section>

      <footer className="disclaimer fade-in">
        <p>
          ❤️ HeartMind AI offers emotional guidance  not professional therapy. If you’re in crisis, please reach out for help.
        </p>
      </footer>
    </div>
  );
}
