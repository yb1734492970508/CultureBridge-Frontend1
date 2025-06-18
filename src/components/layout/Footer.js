import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: {
      title: '产品',
      links: [
        { label: '语言学习', href: '/learning' },
        { label: '文化交流', href: '/community' },
        { label: '实时聊天', href: '/chat' },
        { label: '奖励系统', href: '/rewards' },
      ],
    },
    company: {
      title: '公司',
      links: [
        { label: '关于我们', href: '/about' },
        { label: '联系我们', href: '/contact' },
        { label: '加入我们', href: '/careers' },
        { label: '新闻动态', href: '/news' },
      ],
    },
    support: {
      title: '支持',
      links: [
        { label: '帮助中心', href: '/help' },
        { label: '用户指南', href: '/guide' },
        { label: '常见问题', href: '/faq' },
        { label: '反馈建议', href: '/feedback' },
      ],
    },
    legal: {
      title: '法律',
      links: [
        { label: '隐私政策', href: '/privacy' },
        { label: '服务条款', href: '/terms' },
        { label: '用户协议', href: '/agreement' },
        { label: '版权声明', href: '/copyright' },
      ],
    },
  };
  
  const socialLinks = [
    { name: '微信', icon: '💬', href: '#' },
    { name: '微博', icon: '📱', href: '#' },
    { name: 'QQ', icon: '🐧', href: '#' },
    { name: '邮箱', icon: '📧', href: 'mailto:contact@culturebridge.com' },
  ];
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* 品牌信息 */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">🌉</span>
              <span className="footer-logo-text">CultureBridge</span>
            </div>
            <p className="footer-description">
              连接世界文化，让学习成为一种乐趣。通过创新的语言学习和文化交流平台，
              我们致力于打破语言障碍，促进全球文化理解与交流。
            </p>
            <div className="social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="social-link"
                  title={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="social-icon">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
          
          {/* 链接分组 */}
          <div className="footer-links">
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="footer-section">
                <h3 className="footer-section-title">{section.title}</h3>
                <ul className="footer-section-links">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="footer-link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* 底部信息 */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>© {currentYear} CultureBridge. 保留所有权利。</p>
              <p>让世界因文化交流而更加美好</p>
            </div>
            
            <div className="footer-meta">
              <span className="footer-version">v2.0.0</span>
              <span className="footer-separator">•</span>
              <span className="footer-status">
                <span className="status-indicator"></span>
                服务正常
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

