/**
 * 主布局组件
 * 提供应用的整体布局结构，包括导航栏、侧边栏、主内容区等
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  MessageCircle, 
  BookOpen, 
  Globe, 
  Languages, 
  Coins, 
  User, 
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

import { selectAuth } from '../store/slices/authSlice';
import { selectTotalUnreadCount } from '../store/slices/chatSlice';
import { selectUI, toggleSidebar } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { cn } from '../lib/utils';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
  const auth = useSelector(selectAuth);
  const unreadCount = useSelector(selectTotalUnreadCount);
  const ui = useSelector(selectUI);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 导航菜单项
  const navigationItems = [
    {
      name: '仪表板',
      href: '/dashboard',
      icon: Home,
      badge: null,
    },
    {
      name: '聊天',
      href: '/chat',
      icon: MessageCircle,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      name: '学习',
      href: '/learning',
      icon: BookOpen,
      badge: null,
    },
    {
      name: '文化',
      href: '/culture',
      icon: Globe,
      badge: null,
    },
    {
      name: '翻译',
      href: '/translation',
      icon: Languages,
      badge: null,
    },
    {
      name: '区块链',
      href: '/blockchain',
      icon: Coins,
      badge: null,
    },
  ];

  // 处理登出
  const handleLogout = () => {
    dispatch(logout());
  };

  // 切换主题
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // 侧边栏组件
  const Sidebar = ({ className }) => (
    <div className={cn('flex flex-col h-full bg-background border-r', className)}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">CultureBridge</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 搜索框 */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 用户信息 */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="w-8 h-8 mr-3">
                <AvatarImage src={auth.user?.avatar} />
                <AvatarFallback>
                  {auth.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">
                  {auth.user?.name || '用户'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {auth.user?.email}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                个人资料
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                设置
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 mr-2" />
              ) : (
                <Moon className="w-4 h-4 mr-2" />
              )}
              {theme === 'dark' ? '浅色模式' : '深色模式'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* 桌面端侧边栏 */}
      <div className={cn(
        'hidden lg:flex lg:flex-col lg:w-64 transition-all duration-300',
        ui.sidebarCollapsed && 'lg:w-16'
      )}>
        <Sidebar />
      </div>

      {/* 移动端侧边栏 */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-4">
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* 桌面端折叠按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleSidebar())}
              className="hidden lg:flex"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* 页面标题 */}
            <h1 className="text-lg font-semibold">
              {navigationItems.find(item => location.pathname.startsWith(item.href))?.name || 'CultureBridge'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* 通知按钮 */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* 主题切换按钮 */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* 用户头像 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={auth.user?.avatar} />
                    <AvatarFallback>
                      {auth.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">个人资料</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">设置</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

