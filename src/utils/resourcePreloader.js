// 资源预加载器
export const preloadCriticalResources = () => {
  // 预加载关键字体
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap',
  ];
  
  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'style';
    link.onload = function() { this.rel = 'stylesheet'; };
    document.head.appendChild(link);
  });

  // 预加载关键图片
  const criticalImages = [
    '/static/images/logo.svg',
    '/static/images/hero-bg.webp',
    '/static/images/culture-icons.svg',
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // 预连接到外部域名
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.culturebridge.io',
    'https://cdn.culturebridge.io',
  ];
  
  preconnectDomains.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

export default { preloadCriticalResources };

