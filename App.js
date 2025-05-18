import React from 'react';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>CultureBridge</h1>
        <p>连接世界，促进文化交流</p>
      </header>
      <main>
        <section className="welcome-section">
          <h2>欢迎来到CultureBridge</h2>
          <p>这是一个跨文化交流平台，旨在连接不同文化背景的人们，促进文化理解与交流。</p>
        </section>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} CultureBridge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
