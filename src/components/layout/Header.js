import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/layout/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>CultureBridge</h1>
          </Link>
        </div>
        
        <button className="mobile-menu-button" onClick={toggleMenu} aria-label="菜单">
          <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" className="nav-link">首页</Link></li>
            <li><Link to="/forum" className="nav-link">文化论坛</Link></li>
            <li><Link to="/learning" className="nav-link">语言学习</Link></li>
            <li><Link to="/events" className="nav-link">文化活动</Link></li>
            <li><Link to="/community" className="nav-link">社区</Link></li>
          </ul>
        </nav>
        
        <div className={`user-actions ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/auth" className="auth-button login">登录</Link>
          <Link to="/auth" className="auth-button register">注册</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
