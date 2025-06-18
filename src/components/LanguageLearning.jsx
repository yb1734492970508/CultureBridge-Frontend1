import React, { useState, useEffect } from 'react';
import './LanguageLearning.css';

const LanguageLearning = ({ user, onProgressUpdate }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('japanese');
  const [learningMode, setLearningMode] = useState('lesson'); // lesson, practice, quiz
  
  const languages = [
    { id: 'japanese', name: '日语', flag: '🇯🇵', level: 'Intermediate', progress: 65 },
    { id: 'french', name: '法语', flag: '🇫🇷', level: 'Beginner', progress: 30 },
    { id: 'spanish', name: '西班牙语', flag: '🇪🇸', level: 'Advanced', progress: 85 },
    { id: 'korean', name: '韩语', flag: '🇰🇷', level: 'Beginner', progress: 15 }
  ];

  const lessons = {
    japanese: [
      {
        id: 1,
        title: '基础问候语',
        description: '学习日常问候用语',
        content: [
          { japanese: 'こんにちは', romaji: 'konnichiwa', chinese: '你好', audio: '🔊' },
          { japanese: 'おはよう', romaji: 'ohayou', chinese: '早上好', audio: '🔊' },
          { japanese: 'こんばんは', romaji: 'konbanwa', chinese: '晚上好', audio: '🔊' },
          { japanese: 'ありがとう', romaji: 'arigatou', chinese: '谢谢', audio: '🔊' }
        ],
        completed: true
      },
      {
        id: 2,
        title: '数字和时间',
        description: '学习数字表达和时间概念',
        content: [
          { japanese: 'いち', romaji: 'ichi', chinese: '一', audio: '🔊' },
          { japanese: 'に', romaji: 'ni', chinese: '二', audio: '🔊' },
          { japanese: 'さん', romaji: 'san', chinese: '三', audio: '🔊' },
          { japanese: '今何時ですか', romaji: 'ima nanji desu ka', chinese: '现在几点了？', audio: '🔊' }
        ],
        completed: false
      }
    ],
    french: [
      {
        id: 1,
        title: 'Salutations de base',
        description: 'Apprendre les salutations quotidiennes',
        content: [
          { french: 'Bonjour', chinese: '你好', audio: '🔊' },
          { french: 'Bonsoir', chinese: '晚上好', audio: '🔊' },
          { french: 'Merci', chinese: '谢谢', audio: '🔊' },
          { french: 'Au revoir', chinese: '再见', audio: '🔊' }
        ],
        completed: false
      }
    ]
  };

  const quizQuestions = [
    {
      id: 1,
      question: '如何用日语说"谢谢"？',
      options: ['こんにちは', 'ありがとう', 'すみません', 'さようなら'],
      correct: 1,
      explanation: 'ありがとう (arigatou) 是日语中"谢谢"的表达方式'
    },
    {
      id: 2,
      question: '"Bonjour"在法语中是什么意思？',
      options: ['晚安', '你好', '再见', '谢谢'],
      correct: 1,
      explanation: 'Bonjour 是法语中"你好"的意思，通常在白天使用'
    }
  ];

  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [practiceWords, setPracticeWords] = useState([
    { word: 'こんにちは', translation: '你好', learned: false },
    { word: 'ありがとう', translation: '谢谢', learned: false },
    { word: 'すみません', translation: '对不起', learned: false }
  ]);

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.id === selectedLanguage);
  };

  const startLesson = (lesson) => {
    setCurrentLesson(lesson);
    setLearningMode('lesson');
  };

  const completeLesson = () => {
    if (currentLesson) {
      // 标记课程为已完成
      const updatedLessons = { ...lessons };
      updatedLessons[selectedLanguage] = updatedLessons[selectedLanguage].map(lesson =>
        lesson.id === currentLesson.id ? { ...lesson, completed: true } : lesson
      );
      
      // 更新进度
      if (onProgressUpdate) {
        onProgressUpdate(50); // 完成课程获得50积分
      }
      
      setCurrentLesson(null);
      alert('恭喜完成课程！获得50积分！');
    }
  };

  const handleQuizAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === quizQuestions[currentQuiz].correct) {
      setQuizScore(quizScore + 1);
    }
    
    setTimeout(() => {
      if (currentQuiz < quizQuestions.length - 1) {
        setCurrentQuiz(currentQuiz + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        // 测验完成
        alert(`测验完成！得分：${quizScore + (answerIndex === quizQuestions[currentQuiz].correct ? 1 : 0)}/${quizQuestions.length}`);
        setCurrentQuiz(0);
        setQuizScore(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
      }
    }, 2000);
  };

  const toggleWordLearned = (index) => {
    setPracticeWords(words =>
      words.map((word, i) =>
        i === index ? { ...word, learned: !word.learned } : word
      )
    );
  };

  const renderLanguageSelector = () => (
    <div className="language-selector">
      <h3>选择学习语言</h3>
      <div className="languages-grid">
        {languages.map(language => (
          <div
            key={language.id}
            className={`language-card ${selectedLanguage === language.id ? 'selected' : ''}`}
            onClick={() => setSelectedLanguage(language.id)}
          >
            <span className="language-flag">{language.flag}</span>
            <h4>{language.name}</h4>
            <span className="language-level">{language.level}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${language.progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{language.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModeSelector = () => (
    <div className="mode-selector">
      <button
        className={`mode-btn ${learningMode === 'lesson' ? 'active' : ''}`}
        onClick={() => setLearningMode('lesson')}
      >
        📚 课程学习
      </button>
      <button
        className={`mode-btn ${learningMode === 'practice' ? 'active' : ''}`}
        onClick={() => setLearningMode('practice')}
      >
        ✍️ 单词练习
      </button>
      <button
        className={`mode-btn ${learningMode === 'quiz' ? 'active' : ''}`}
        onClick={() => setLearningMode('quiz')}
      >
        🧠 知识测验
      </button>
    </div>
  );

  const renderLessons = () => (
    <div className="lessons-container">
      <h3>{getCurrentLanguage()?.name} 课程</h3>
      <div className="lessons-list">
        {lessons[selectedLanguage]?.map(lesson => (
          <div key={lesson.id} className={`lesson-card ${lesson.completed ? 'completed' : ''}`}>
            <div className="lesson-info">
              <h4>{lesson.title}</h4>
              <p>{lesson.description}</p>
              {lesson.completed && <span className="completed-badge">✅ 已完成</span>}
            </div>
            <button
              className="start-lesson-btn"
              onClick={() => startLesson(lesson)}
            >
              {lesson.completed ? '复习' : '开始'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentLesson = () => (
    <div className="current-lesson">
      <div className="lesson-header">
        <button className="back-btn" onClick={() => setCurrentLesson(null)}>← 返回</button>
        <h3>{currentLesson.title}</h3>
      </div>
      
      <div className="lesson-content">
        {currentLesson.content.map((item, index) => (
          <div key={index} className="word-card">
            <div className="word-main">
              {item.japanese && <span className="japanese">{item.japanese}</span>}
              {item.french && <span className="french">{item.french}</span>}
              {item.romaji && <span className="romaji">{item.romaji}</span>}
            </div>
            <div className="word-translation">{item.chinese}</div>
            <button className="audio-btn">{item.audio}</button>
          </div>
        ))}
      </div>
      
      <button className="complete-lesson-btn" onClick={completeLesson}>
        完成课程
      </button>
    </div>
  );

  const renderPractice = () => (
    <div className="practice-container">
      <h3>单词练习</h3>
      <div className="practice-words">
        {practiceWords.map((word, index) => (
          <div key={index} className={`practice-word ${word.learned ? 'learned' : ''}`}>
            <div className="word-content">
              <span className="word">{word.word}</span>
              <span className="translation">{word.translation}</span>
            </div>
            <button
              className="learn-btn"
              onClick={() => toggleWordLearned(index)}
            >
              {word.learned ? '✅' : '📝'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuiz = () => (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>知识测验</h3>
        <span className="quiz-progress">{currentQuiz + 1}/{quizQuestions.length}</span>
      </div>
      
      <div className="quiz-question">
        <h4>{quizQuestions[currentQuiz].question}</h4>
        <div className="quiz-options">
          {quizQuestions[currentQuiz].options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option ${
                selectedAnswer === index
                  ? index === quizQuestions[currentQuiz].correct
                    ? 'correct'
                    : 'incorrect'
                  : ''
              }`}
              onClick={() => handleQuizAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>
        
        {showExplanation && (
          <div className="quiz-explanation">
            <p>{quizQuestions[currentQuiz].explanation}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="language-learning">
      <div className="learning-header">
        <h2>语言学习中心</h2>
        <div className="user-progress">
          <span>总进度: {getCurrentLanguage()?.progress}%</span>
        </div>
      </div>

      {!currentLesson && renderLanguageSelector()}
      {!currentLesson && renderModeSelector()}

      {currentLesson ? renderCurrentLesson() : (
        <div className="learning-content">
          {learningMode === 'lesson' && renderLessons()}
          {learningMode === 'practice' && renderPractice()}
          {learningMode === 'quiz' && renderQuiz()}
        </div>
      )}
    </div>
  );
};

export default LanguageLearning;

