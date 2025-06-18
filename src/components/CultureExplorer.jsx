import React, { useState, useEffect } from 'react';
import './CultureExplorer.css';

const CultureExplorer = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const cultures = [
    {
      id: 1,
      title: "Japanese Tea Ceremony",
      description: "Discover the meditative art of Japanese tea preparation and its deep cultural significance.",
      category: "traditions",
      country: "Japan",
      image: "🍵",
      difficulty: "Beginner",
      duration: "45 min",
      participants: 1247
    },
    {
      id: 2,
      title: "Spanish Flamenco",
      description: "Experience the passionate rhythms and expressive movements of traditional Spanish dance.",
      category: "arts",
      country: "Spain",
      image: "💃",
      difficulty: "Intermediate",
      duration: "60 min",
      participants: 892
    },
    {
      id: 3,
      title: "Nordic Hygge",
      description: "Embrace the Danish philosophy of cozy contentment and simple pleasures.",
      category: "lifestyle",
      country: "Denmark",
      image: "🕯️",
      difficulty: "Beginner",
      duration: "30 min",
      participants: 2156
    },
    {
      id: 4,
      title: "Indian Holi Festival",
      description: "Join the vibrant celebration of colors and learn about this joyous spring festival.",
      category: "festivals",
      country: "India",
      image: "🎨",
      difficulty: "Beginner",
      duration: "40 min",
      participants: 1834
    },
    {
      id: 5,
      title: "Italian Pasta Making",
      description: "Master the traditional techniques of handmade pasta from Italian nonnas.",
      category: "cuisine",
      country: "Italy",
      image: "🍝",
      difficulty: "Intermediate",
      duration: "90 min",
      participants: 3421
    },
    {
      id: 6,
      title: "Moroccan Storytelling",
      description: "Immerse yourself in the ancient oral tradition of Moroccan storytelling.",
      category: "traditions",
      country: "Morocco",
      image: "📚",
      difficulty: "Beginner",
      duration: "35 min",
      participants: 567
    }
  ];

  const categories = [
    { id: 'all', name: 'All Cultures', icon: '🌍' },
    { id: 'traditions', name: 'Traditions', icon: '🏛️' },
    { id: 'arts', name: 'Arts', icon: '🎭' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🏠' },
    { id: 'festivals', name: 'Festivals', icon: '🎉' },
    { id: 'cuisine', name: 'Cuisine', icon: '🍽️' }
  ];

  const filteredCultures = cultures.filter(culture => {
    const matchesCategory = selectedCategory === 'all' || culture.category === selectedCategory;
    const matchesSearch = culture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         culture.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="culture-explorer">
      <div className="explorer-header">
        <div className="container">
          <h1>Explore World Cultures</h1>
          <p>Discover authentic cultural experiences from around the globe</p>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search cultures, countries, or traditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-button">🔍</button>
          </div>
        </div>
      </div>

      <div className="explorer-content">
        <div className="container">
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          <div className="cultures-grid">
            {filteredCultures.map(culture => (
              <div key={culture.id} className="culture-card">
                <div className="culture-image">
                  <span className="culture-emoji">{culture.image}</span>
                  <div className="culture-overlay">
                    <span className="difficulty-badge">{culture.difficulty}</span>
                  </div>
                </div>
                
                <div className="culture-content">
                  <div className="culture-header">
                    <h3 className="culture-title">{culture.title}</h3>
                    <span className="culture-country">{culture.country}</span>
                  </div>
                  
                  <p className="culture-description">{culture.description}</p>
                  
                  <div className="culture-meta">
                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <span className="meta-text">{culture.duration}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">👥</span>
                      <span className="meta-text">{culture.participants.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button className="explore-button">
                    Explore Culture
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCultures.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No cultures found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CultureExplorer;

