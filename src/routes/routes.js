import React from 'react';
import HomePage from '../components/pages/HomePage';
import ForumListPage from '../components/pages/ForumListPage';
import EventsPage from '../components/pages/EventsPage';

// 路由配置
const routes = [
  {
    path: '/',
    element: <HomePage />,
    exact: true,
    title: '首页',
    icon: 'home',
    showInNav: true,
  },
  {
    path: '/forum',
    element: <ForumListPage />,
    exact: true,
    title: '文化论坛',
    icon: 'forum',
    showInNav: true,
  },
  {
    path: '/events',
    element: <EventsPage />,
    exact: true,
    title: '文化活动',
    icon: 'event',
    showInNav: true,
  },
  {
    path: '/forum/:id',
    element: null, // 将在后续实现
    exact: true,
    title: '论坛详情',
    showInNav: false,
  },
  {
    path: '/events/:id',
    element: null, // 将在后续实现
    exact: true,
    title: '活动详情',
    showInNav: false,
  },
  {
    path: '/profile',
    element: null, // 将在后续实现
    exact: true,
    title: '个人资料',
    icon: 'person',
    showInNav: true,
  },
  {
    path: '/resources',
    element: null, // 将在后续实现
    exact: true,
    title: '学习资源',
    icon: 'school',
    showInNav: true,
  },
  {
    path: '*',
    element: (
      <div className="coming-soon">
        <h2>功能开发中</h2>
        <p>该页面正在开发中，敬请期待！</p>
      </div>
    ),
    title: '404',
    showInNav: false,
  },
];

export default routes;
