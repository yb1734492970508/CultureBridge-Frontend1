import React, { useState, useEffect } from 'react';
import './LanguageLearningHub.css';

const LanguageLearningHub = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  const [currentLesson, setCurrentLesson] = useState(0);

  const languages = [
    {
      id: 'spanish',
      name: 'Spanish',
      flag: '🇪🇸',
      level: 'Intermediate',
      progress: 68,
      speakers: '500M+',
      difficulty: 'Medium'
    },
    {
      id: 'japanese',
      name: 'Japanese',
      flag: '🇯🇵',
      level: 'Beginner',
      progress: 23,
      speakers: '125M+',
      difficulty: 'Hard'
    },
    {
      id: 'french',
      name: 'French',
      flag: '🇫🇷',
      level: 'Advanced',
      progress: 89,
      speakers: '280M+',
      difficulty: 'Medium'
    },
    {
      id: 'mandarin',
      name: 'Mandarin',
      flag: '🇨🇳',
      level: 'Beginner',
      progress: 15,
      speakers: '1.1B+',
      difficulty: 'Hard'
    }
  ];

  const lessons = {
    spanish: [
      {
        title: "Ordering Food at a Restaurant",
        type: "Conversation",
        duration: "15 min",
        difficulty: "Intermediate",
        completed: true
      },
      {
        title: "Describing Your Hometown",
        type: "Speaking",
        duration: "20 min",
        difficulty: "Intermediate",
        completed: true
      },
      {
        title: "Past Tense Storytelling",
        type: "Grammar",
        duration: "25 min",
        difficulty: "Intermediate",
        completed: false
      },
      {
        title: "Cultural Expressions",
        type: "Culture",
        duration: "18 min",
        difficulty: "Advanced",
        completed: false
      }
    ]
  };

  const currentLanguage = languages.find(lang => lang.id === selectedLanguage);
  const currentLessons = lessons[selectedLanguage] || [];

  return (
    <div className="language-learning-hub">
      <div className="hub-header">
        <div className="container">
          <h1>Language Learning Hub</h1>
          <p>Master languages through immersive cultural experiences</p>
        </div>
      </div>

      <div className="hub-content">
        <div className="container">
          <div className="learning-dashboard">
            {/* Language Selection */}
            <div className="language-selector">
              <h2>Your Languages</h2>
              <div className="languages-grid">
                {languages.map(language => (
                  <div
                    key={language.id}
                    onClick={() => setSelectedLanguage(language.id)}
                    className={`language-card ${selectedLanguage === language.id ? 'active' : ''}`}
                  >
                    <div className="language-flag">{language.flag}</div>
                    <div className="language-info">
                      <h3>{language.name}</h3>
                      <span className="language-level">{language.level}</span>
                    </div>
                    <div className="language-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${language.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{language.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Language Details */}
            <div className="language-details">
              <div className="language-header">
                <div className="language-title">
                  <span className="language-flag-large">{currentLanguage?.flag}</span>
                  <div>
                    <h2>{currentLanguage?.name}</h2>
                    <div className="language-stats">
                      <span className="stat">
                        <span className="stat-icon">👥</span>
                        {currentLanguage?.speakers} speakers
                      </span>
                      <span className="stat">
                        <span className="stat-icon">📊</span>
                        {currentLanguage?.difficulty} difficulty
                      </span>
                    </div>
                  </div>
                </div>
                <div className="language-actions">
                  <button className="action-button primary">Continue Learning</button>
                  <button className="action-button secondary">Find Partner</button>
                </div>
              </div>

              {/* Lessons */}
              <div className="lessons-section">
                <h3>Recent Lessons</h3>
                <div className="lessons-list">
                  {currentLessons.map((lesson, index) => (
                    <div key={index} className={`lesson-item ${lesson.completed ? 'completed' : ''}`}>
                      <div className="lesson-status">
                        {lesson.completed ? '✅' : '⏳'}
                      </div>
                      <div className="lesson-content">
                        <h4>{lesson.title}</h4>
                        <div className="lesson-meta">
                          <span className="lesson-type">{lesson.type}</span>
                          <span className="lesson-duration">{lesson.duration}</span>
                          <span className="lesson-difficulty">{lesson.difficulty}</span>
                        </div>
                      </div>
                      <button className="lesson-action">
                        {lesson.completed ? 'Review' : 'Start'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Tools */}
              <div className="practice-tools">
                <h3>Practice Tools</h3>
                <div className="tools-grid">
                  <div className="tool-card">
                    <div className="tool-icon">🎤</div>
                    <h4>Pronunciation</h4>
                    <p>Practice speaking with AI feedback</p>
                    <button className="tool-button">Practice Now</button>
                  </div>
                  <div className="tool-card">
                    <div className="tool-icon">📝</div>
                    <h4>Writing</h4>
                    <p>Improve your writing skills</p>
                    <button className="tool-button">Start Writing</button>
                  </div>
                  <div className="tool-card">
                    <div className="tool-icon">👂</div>
                    <h4>Listening</h4>
                    <p>Train your ear with native content</p>
                    <button className="tool-button">Listen Now</button>
                  </div>
                  <div className="tool-card">
                    <div className="tool-icon">🎯</div>
                    <h4>Vocabulary</h4>
                    <p>Expand your word knowledge</p>
                    <button className="tool-button">Study Words</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageLearningHub;

