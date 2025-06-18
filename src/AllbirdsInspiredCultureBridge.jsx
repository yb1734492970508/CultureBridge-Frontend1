import React, { useState, useEffect } from 'react';
import './AllbirdsInspiredCultureBridge.css';
import CultureExplorer from './components/CultureExplorer';
import LanguageLearningHub from './components/LanguageLearningHub';

const AllbirdsInspiredCultureBridge = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Experience the world's most immersive cultural exchange platform",
      subtitle: "Connect with learners from 150+ countries and explore authentic cultural experiences",
      cta: "Start Your Journey"
    },
    {
      title: "Learn languages through real cultural connections",
      subtitle: "Practice with native speakers while discovering their traditions and stories",
      cta: "Find Language Partners"
    },
    {
      title: "Share your culture, discover others",
      subtitle: "Become a cultural ambassador and help others understand your heritage",
      cta: "Share Your Story"
    }
  ];

  const features = [
    {
      icon: "🌊",
      title: "Cultural Immersion",
      description: "Dive deep into authentic cultural experiences guided by local experts and community members."
    },
    {
      icon: "🗣️",
      title: "Language Exchange",
      description: "Practice languages naturally through meaningful conversations about culture and daily life."
    },
    {
      icon: "🌍",
      title: "Global Community",
      description: "Join a diverse community of learners, teachers, and cultural enthusiasts from around the world."
    }
  ];

  const culturalSpotlights = [
    {
      title: "Japanese Tea Ceremony",
      description: "Discover the meditative art of tea preparation",
      image: "🍵",
      participants: "1,247 learners"
    },
    {
      title: "Spanish Flamenco",
      description: "Feel the passion of traditional Andalusian dance",
      image: "💃",
      participants: "892 dancers"
    },
    {
      title: "Nordic Hygge",
      description: "Embrace the Danish art of cozy living",
      image: "🕯️",
      participants: "2,156 practitioners"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const renderHomePage = () => (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{heroSlides[currentSlide].title}</h1>
            <p>{heroSlides[currentSlide].subtitle}</p>
            <button className="cta-button primary">
              {heroSlides[currentSlide].cta}
            </button>
          </div>
          <div className="hero-visual">
            <div className="globe-illustration">🌍</div>
          </div>
        </div>
        
        {/* Slide indicators */}
        <div className="slide-indicators">
          <button className="slide-nav prev" onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}>‹</button>
          <div className="indicators">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          <button className="slide-nav next" onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}>›</button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose CultureBridge?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Spotlights */}
      <section className="spotlights-section">
        <div className="container">
          <h2>Cultural Spotlights</h2>
          <p>Explore featured cultural experiences from our community</p>
          <div className="spotlights-grid">
            {culturalSpotlights.map((spotlight, index) => (
              <div key={index} className="spotlight-card">
                <div className="spotlight-image">{spotlight.image}</div>
                <div className="spotlight-content">
                  <h3>{spotlight.title}</h3>
                  <p>{spotlight.description}</p>
                  <span className="participants">{spotlight.participants}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <h2>Ready to Bridge Cultures?</h2>
          <p>Join thousands of learners connecting across languages and cultures</p>
          <div className="cta-buttons">
            <button className="cta-button primary">Join Free</button>
            <button className="cta-button secondary">Read Stories</button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderPage = () => {
    switch(currentPage) {
      case 'cultures':
        return <CultureExplorer />;
      case 'languages':
        return <LanguageLearningHub />;
      case 'stories':
        return (
          <div className="stories-page">
            <div className="container">
              <h1>Cultural Stories</h1>
              <p>Coming soon - Real stories from our global community</p>
            </div>
          </div>
        );
      case 'community':
        return (
          <div className="community-page">
            <div className="container">
              <h1>Community</h1>
              <p>Coming soon - Connect with learners worldwide</p>
            </div>
          </div>
        );
      default:
        return renderHomePage();
    }
  };

  return (
    <div className="allbirds-inspired-app">
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo" onClick={() => setCurrentPage('home')}>
              <span className="logo-icon">🌉</span>
              <span className="logo-text">CultureBridge</span>
            </div>
          </div>
          
          <div className="nav-center">
            <a 
              href="#" 
              className={currentPage === 'cultures' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage('cultures'); }}
            >
              Cultures
            </a>
            <a 
              href="#" 
              className={currentPage === 'languages' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage('languages'); }}
            >
              Languages
            </a>
            <a 
              href="#" 
              className={currentPage === 'stories' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage('stories'); }}
            >
              Stories
            </a>
            <a 
              href="#" 
              className={currentPage === 'community' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage('community'); }}
            >
              Community
            </a>
          </div>
          
          <div className="nav-right">
            <button className="nav-button secondary">Sign In</button>
            <button className="nav-button primary">Join Free</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>CultureBridge</h4>
              <p>Connecting cultures, bridging languages</p>
            </div>
            <div className="footer-section">
              <h4>Learn</h4>
              <a href="#">Cultures</a>
              <a href="#">Languages</a>
              <a href="#">Stories</a>
            </div>
            <div className="footer-section">
              <h4>Community</h4>
              <a href="#">Join</a>
              <a href="#">Events</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 CultureBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AllbirdsInspiredCultureBridge;

