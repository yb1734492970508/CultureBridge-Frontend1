import React, { useState, useEffect } from 'react';
import '../../styles/pages/EventsPage.css';

const EventsPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [reminderEvents, setReminderEvents] = useState([]);
  
  // 模拟文化活动数据
  const culturalEvents = [
    {
      id: 1,
      title: '中国春节文化展',
      date: new Date(2025, 4, 20), // 月份从0开始，4代表5月
      location: '北京，中国',
      category: 'exhibition',
      description: '探索中国春节的传统习俗、美食和庆祝活动，体验中国最重要的传统节日文化。',
      organizer: '中国文化协会',
      image: 'chinese-new-year.jpg',
      address: '北京市朝阳区国贸中心',
      coordinates: {
        lat: 39.9042,
        lng: 116.4074
      },
      website: 'https://example.com/chinese-new-year',
      contact: 'contact@chineseculture.org',
      ticketPrice: '免费入场'
    },
    {
      id: 2,
      title: '日本樱花节',
      date: new Date(2025, 4, 15),
      location: '东京，日本',
      category: 'festival',
      description: '欣赏美丽的樱花盛开，参与传统的赏樱活动，了解樱花在日本文化中的重要意义。',
      organizer: '日本旅游局',
      image: 'sakura-festival.jpg',
      address: '东京都新宿御苑',
      coordinates: {
        lat: 35.6852,
        lng: 139.7100
      },
      website: 'https://example.com/sakura-festival',
      contact: 'info@japantourism.org',
      ticketPrice: '500日元'
    },
    {
      id: 3,
      title: '印度排灯节工作坊',
      date: new Date(2025, 4, 25),
      location: '线上活动',
      category: 'workshop',
      description: '学习制作传统的排灯节装饰，了解这一重要印度节日背后的文化和宗教意义。',
      organizer: '印度文化中心',
      image: 'diwali-workshop.jpg',
      address: '线上Zoom会议',
      coordinates: null,
      website: 'https://example.com/diwali-workshop',
      contact: 'workshop@indianculture.org',
      ticketPrice: '15美元'
    },
    {
      id: 4,
      title: '非洲鼓乐表演',
      date: new Date(2025, 4, 18),
      location: '纽约，美国',
      category: 'performance',
      description: '体验来自非洲不同地区的传统鼓乐，了解鼓在非洲文化中的重要地位和象征意义。',
      organizer: '非洲文化艺术协会',
      image: 'african-drums.jpg',
      address: '纽约市林肯中心',
      coordinates: {
        lat: 40.7725,
        lng: -73.9835
      },
      website: 'https://example.com/african-drums',
      contact: 'tickets@africanarts.org',
      ticketPrice: '25美元'
    },
    {
      id: 5,
      title: '拉丁美食节',
      date: new Date(2025, 4, 22),
      location: '墨西哥城，墨西哥',
      category: 'food',
      description: '品尝来自拉丁美洲各国的特色美食，了解食物与当地文化的深厚联系。',
      organizer: '拉丁美洲美食协会',
      image: 'latin-food.jpg',
      address: '墨西哥城历史中心广场',
      coordinates: {
        lat: 19.4326,
        lng: -99.1332
      },
      website: 'https://example.com/latin-food',
      contact: 'info@latinfood.org',
      ticketPrice: '免费入场，食物另计'
    },
    {
      id: 6,
      title: '欧洲电影周',
      date: new Date(2025, 4, 10),
      location: '巴黎，法国',
      category: 'film',
      description: '观看来自欧洲各国的优秀电影作品，探索不同国家的文化特色和艺术表达。',
      organizer: '欧洲电影协会',
      image: 'european-film.jpg',
      address: '巴黎电影艺术中心',
      coordinates: {
        lat: 48.8566,
        lng: 2.3522
      },
      website: 'https://example.com/european-film',
      contact: 'festival@europeanfilm.org',
      ticketPrice: '8欧元/场'
    },
    {
      id: 7,
      title: '阿拉伯书法艺术展',
      date: new Date(2025, 4, 28),
      location: '迪拜，阿联酋',
      category: 'exhibition',
      description: '欣赏阿拉伯书法的精美艺术，了解其历史发展和在伊斯兰文化中的重要地位。',
      organizer: '阿拉伯艺术基金会',
      image: 'arabic-calligraphy.jpg',
      address: '迪拜文化艺术中心',
      coordinates: {
        lat: 25.2048,
        lng: 55.2708
      },
      website: 'https://example.com/arabic-calligraphy',
      contact: 'art@arabicfoundation.org',
      ticketPrice: '30迪拉姆'
    },
    {
      id: 8,
      title: '北欧神话讲座',
      date: new Date(2025, 4, 12),
      location: '线上活动',
      category: 'lecture',
      description: '深入了解北欧神话的丰富内容，探索其对现代文化的影响和启示。',
      organizer: '斯堪的纳维亚研究中心',
      image: 'nordic-mythology.jpg',
      address: '线上Zoom讲座',
      coordinates: null,
      website: 'https://example.com/nordic-mythology',
      contact: 'info@nordicstudies.org',
      ticketPrice: '免费，需提前注册'
    }
  ];

  // 活动类别
  const eventCategories = [
    { id: 'all', name: '全部活动' },
    { id: 'festival', name: '节日庆典' },
    { id: 'exhibition', name: '展览展示' },
    { id: 'workshop', name: '工作坊' },
    { id: 'performance', name: '表演活动' },
    { id: 'food', name: '美食活动' },
    { id: 'film', name: '电影放映' },
    { id: 'lecture', name: '讲座论坛' }
  ];

  // 根据选择的类别筛选活动
  const filteredEvents = selectedCategory === 'all' 
    ? culturalEvents 
    : culturalEvents.filter(event => event.category === selectedCategory);

  // 获取当月的天数
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 获取当月第一天是星期几
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // 生成日历数据
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // 添加上个月的天数
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, events: [] });
    }

    // 添加当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayEvents = filteredEvents.filter(event => 
        event.date.getDate() === day && 
        event.date.getMonth() === currentMonth && 
        event.date.getFullYear() === currentYear
      );
      days.push({ day, events: dayEvents });
    }

    return days;
  };

  // 月份名称
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  // 切换到上个月
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 切换到下个月
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 格式化日期
  const formatDate = (date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 打开活动详情
  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // 关闭活动详情
  const closeEventDetails = () => {
    setShowEventDetails(false);
  };

  // 添加活动提醒
  const toggleEventReminder = (event) => {
    if (reminderEvents.some(e => e.id === event.id)) {
      setReminderEvents(reminderEvents.filter(e => e.id !== event.id));
    } else {
      setReminderEvents([...reminderEvents, event]);
    }
  };

  // 检查活动是否已设置提醒
  const isEventReminded = (eventId) => {
    return reminderEvents.some(event => event.id === eventId);
  };

  // 从本地存储加载提醒活动
  useEffect(() => {
    const savedReminders = localStorage.getItem('eventReminders');
    if (savedReminders) {
      try {
        const parsedReminders = JSON.parse(savedReminders);
        // 将字符串日期转换回Date对象
        const processedReminders = parsedReminders.map(event => ({
          ...event,
          date: new Date(event.date)
        }));
        setReminderEvents(processedReminders);
      } catch (error) {
        console.error('Failed to parse saved reminders:', error);
      }
    }
  }, []);

  // 保存提醒活动到本地存储
  useEffect(() => {
    if (reminderEvents.length > 0) {
      localStorage.setItem('eventReminders', JSON.stringify(reminderEvents));
    }
  }, [reminderEvents]);

  return (
    <div className="events-page">
      <section className="events-header">
        <h1>文化活动日历</h1>
        <p>探索全球各地的文化活动，拓展您的文化视野</p>
      </section>

      <section className="events-filter">
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            日历视图
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            列表视图
          </button>
        </div>

        <div className="category-filter">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {eventCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {viewMode === 'calendar' ? (
        <section className="calendar-view">
          <div className="calendar-header">
            <button className="month-nav" onClick={goToPreviousMonth}>
              &lt;
            </button>
            <h2>{monthNames[currentMonth]} {currentYear}</h2>
            <button className="month-nav" onClick={goToNextMonth}>
              &gt;
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekday">日</div>
            <div className="weekday">一</div>
            <div className="weekday">二</div>
            <div className="weekday">三</div>
            <div className="weekday">四</div>
            <div className="weekday">五</div>
            <div className="weekday">六</div>

            {generateCalendarDays().map((dayData, index) => (
              <div 
                key={index} 
                className={`calendar-day ${!dayData.day ? 'empty-day' : ''} ${dayData.events.length > 0 ? 'has-events' : ''}`}
              >
                {dayData.day && (
                  <>
                    <div className="day-number">{dayData.day}</div>
                    {dayData.events.length > 0 && (
                      <div className="day-events">
                        {dayData.events.map(event => (
                          <div 
                            key={event.id} 
                            className="calendar-event"
                            onClick={() => openEventDetails(event)}
                          >
                            <div className={`event-marker ${event.category}`}></div>
                            <div className="event-title">{event.title}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="list-view">
          {filteredEvents.length > 0 ? (
            <div className="events-list">
              {filteredEvents.sort((a, b) => a.date - b.date).map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-image">
                    <div className={`event-category-badge ${event.category}`}>
                      {eventCategories.find(cat => cat.id === event.category)?.name}
                    </div>
                  </div>
                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <div className="event-date">
                        <i className="event-icon date-icon"></i>
                        {formatDate(event.date)}
                      </div>
                      <div className="event-location">
                        <i className="event-icon location-icon"></i>
                        {event.location}
                      </div>
                    </div>
                    <p className="event-description">{event.description}</p>
                    <div className="event-organizer">主办方: {event.organizer}</div>
                    <div className="event-actions">
                      <button 
                        className="event-details-btn"
                        onClick={() => openEventDetails(event)}
                      >
                        查看详情
                      </button>
                      <button 
                        className={`event-reminder-btn ${isEventReminded(event.id) ? 'active' : ''}`}
                        onClick={() => toggleEventReminder(event)}
                      >
                        {isEventReminded(event.id) ? '取消提醒' : '设置提醒'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              <p>当前没有符合条件的活动</p>
            </div>
          )}
        </section>
      )}

      {/* 活动详情弹窗 */}
      {showEventDetails && selectedEvent && (
        <div className="event-details-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeEventDetails}>×</button>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <div className={`event-category-badge ${selectedEvent.category}`}>
                {eventCategories.find(cat => cat.id === selectedEvent.category)?.name}
              </div>
            </div>
            <div className="modal-body">
              <div className="event-detail-image"></div>
              <div className="event-info-grid">
                <div className="event-info-item">
                  <h4>日期时间</h4>
                  <p>{formatDate(selectedEvent.date)}</p>
                </div>
                <div className="event-info-item">
                  <h4>地点</h4>
                  <p>{selectedEvent.location}</p>
                </div>
                <div className="event-info-item">
                  <h4>主办方</h4>
                  <p>{selectedEvent.organizer}</p>
                </div>
                <div className="event-info-item">
                  <h4>票价</h4>
                  <p>{selectedEvent.ticketPrice}</p>
                </div>
              </div>
              <div className="event-description-full">
                <h4>活动详情</h4>
                <p>{selectedEvent.description}</p>
              </div>
              {selectedEvent.coordinates && (
                <div className="event-map">
                  <h4>活动地图</h4>
                  <div className="map-placeholder">
                    <p>地址: {selectedEvent.address}</p>
                    <p>坐标: {selectedEvent.coordinates.lat}, {selectedEvent.coordinates.lng}</p>
                    <div className="map-image"></div>
                  </div>
                </div>
              )}
              <div className="event-contact">
                <h4>联系方式</h4>
                <p>{selectedEvent.contact}</p>
                <p>网站: <a href={selectedEvent.website} target="_blank" rel="noopener noreferrer">{selectedEvent.website}</a></p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className={`reminder-btn ${isEventReminded(selectedEvent.id) ? 'active' : ''}`}
                onClick={() => toggleEventReminder(selectedEvent)}
              >
                {isEventReminded(selectedEvent.id) ? '取消提醒' : '设置活动提醒'}
              </button>
              <a href={selectedEvent.website} target="_blank" rel="noopener noreferrer" className="website-btn">
                访问官方网站
              </a>
            </div>
          </div>
        </div>
      )}

      <section className="upcoming-events">
        <h2 className="section-title">即将到来的活动</h2>
        <div className="upcoming-events-grid">
          {culturalEvents
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date - b.date)
            .slice(0, 3)
            .map(event => (
              <div key={event.id} className="upcoming-event-card">
                <div className="upcoming-event-image"></div>
                <div className="upcoming-event-content">
                  <h3>{event.title}</h3>
                  <div className="upcoming-event-date">{formatDate(event.date)}</div>
                  <div className="upcoming-event-location">{event.location}</div>
                  <div className="upcoming-event-actions">
                    <button 
                      className="upcoming-event-btn"
                      onClick={() => openEventDetails(event)}
                    >
                      了解更多
                    </button>
                    <button 
                      className={`reminder-icon ${isEventReminded(event.id) ? 'active' : ''}`}
                      onClick={() => toggleEventReminder(event)}
                      title={isEventReminded(event.id) ? '取消提醒' : '设置提醒'}
                    >
                      🔔
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 我的活动提醒 */}
      {reminderEvents.length > 0 && (
        <section className="my-reminders">
          <h2 className="section-title">我的活动提醒</h2>
          <div className="reminders-list">
            {reminderEvents
              .sort((a, b) => a.date - b.date)
              .map(event => (
                <div key={event.id} className="reminder-item">
                  <div className="reminder-content">
                    <h3>{event.title}</h3>
                    <div className="reminder-date">{formatDate(event.date)}</div>
                    <div className="reminder-location">{event.location}</div>
                  </div>
                  <button 
                    className="remove-reminder"
                    onClick={() => toggleEventReminder(event)}
                    title="取消提醒"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}

      <section className="events-cta">
        <div className="cta-content">
          <h2>组织您自己的文化活动</h2>
          <p>分享您的文化，创建活动，邀请社区成员参与</p>
          <button className="primary-button">创建活动</button>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
