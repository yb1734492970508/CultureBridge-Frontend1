import React from 'react';
import '../../styles/layout/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>CultureBridge</h3>
          <p>连接世界，促进文化交流</p>
          <div className="social-links">
            <a href="#" aria-label="微信"><i className="social-icon wechat"></i></a>
            <a href="#" aria-label="微博"><i className="social-icon weibo"></i></a>
            <a href="#" aria-label="QQ"><i className="social-icon qq"></i></a>
            <a href="#" aria-label="Twitter"><i className="social-icon twitter"></i></a>
            <a href="#" aria-label="Facebook"><i className="social-icon facebook"></i></a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>快速链接</h4>
          <ul className="footer-links">
            <li><a href="/">首页</a></li>
            <li><a href="/forum">文化论坛</a></li>
            <li><a href="/learning">语言学习</a></li>
            <li><a href="/events">文化活动</a></li>
            <li><a href="/community">社区</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>支持</h4>
          <ul className="footer-links">
            <li><a href="/help">帮助中心</a></li>
            <li><a href="/contact">联系我们</a></li>
            <li><a href="/faq">常见问题</a></li>
            <li><a href="/feedback">反馈建议</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>法律</h4>
          <ul className="footer-links">
            <li><a href="/terms">服务条款</a></li>
            <li><a href="/privacy">隐私政策</a></li>
            <li><a href="/cookies">Cookie政策</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CultureBridge. 保留所有权利。</p>
        <p>由热爱文化交流的团队创建</p>
      </div>
    </footer>
  );
};

export default Footer;
