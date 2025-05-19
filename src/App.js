import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/pages/HomePage';
import ForumListPage from './components/pages/ForumListPage';
import EventsPage from './components/pages/EventsPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forum" element={<ForumListPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="*" element={
            <div className="coming-soon">
              <h2>功能开发中</h2>
              <p>该页面正在开发中，敬请期待！</p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
