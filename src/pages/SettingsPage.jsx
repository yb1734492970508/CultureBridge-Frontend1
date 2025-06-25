/**
 * 设置页面组件
 * 应用程序设置和用户偏好配置
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  MessageCircle,
  Lock,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // 通用设置
    language: 'zh-CN',
    theme: 'light',
    fontSize: 'medium',
    
    // 通知设置
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationVolume: [70],
    
    // 隐私设置
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataCollection: false,
    
    // 安全设置
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    
    // 显示设置
    animationsEnabled: true,
    autoPlayVideos: false,
    showPreviewImages: true,
    compactMode: false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const GeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            语言和地区
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>界面语言</Label>
              <p className="text-sm text-gray-600">选择应用程序的显示语言</p>
            </div>
            <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">中文</SelectItem>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="ja-JP">日本語</SelectItem>
                <SelectItem value="ko-KR">한국어</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>时区</Label>
              <p className="text-sm text-gray-600">自动检测或手动设置时区</p>
            </div>
            <Select defaultValue="auto">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">自动检测</SelectItem>
                <SelectItem value="asia/shanghai">北京时间</SelectItem>
                <SelectItem value="asia/tokyo">东京时间</SelectItem>
                <SelectItem value="america/new_york">纽约时间</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            外观设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>主题模式</Label>
              <p className="text-sm text-gray-600">选择浅色、深色或跟随系统</p>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'light', icon: Sun, label: '浅色' },
                { value: 'dark', icon: Moon, label: '深色' },
                { value: 'system', icon: Monitor, label: '系统' }
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={settings.theme === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('theme', value)}
                  className="flex items-center gap-1"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>字体大小</Label>
              <p className="text-sm text-gray-600">调整界面文字大小</p>
            </div>
            <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange('fontSize', value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">小</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="large">大</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>动画效果</Label>
              <p className="text-sm text-gray-600">启用界面动画和过渡效果</p>
            </div>
            <Switch
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => handleSettingChange('animationsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            通知偏好
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <Label>邮件通知</Label>
                <p className="text-sm text-gray-600">接收重要更新和消息的邮件通知</p>
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-500" />
              <div>
                <Label>推送通知</Label>
                <p className="text-sm text-gray-600">在设备上接收即时推送通知</p>
              </div>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-gray-500" />
              <div>
                <Label>消息通知</Label>
                <p className="text-sm text-gray-600">新消息和评论的通知</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            声音设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>通知声音</Label>
              <p className="text-sm text-gray-600">播放通知提示音</p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
            />
          </div>
          
          {settings.soundEnabled && (
            <div className="space-y-2">
              <Label>音量大小</Label>
              <Slider
                value={settings.notificationVolume}
                onValueChange={(value) => handleSettingChange('notificationVolume', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>静音</span>
                <span>{settings.notificationVolume[0]}%</span>
                <span>最大</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const PrivacySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            个人资料可见性
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>资料可见性</Label>
              <p className="text-sm text-gray-600">控制谁可以查看你的个人资料</p>
            </div>
            <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange('profileVisibility', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">公开</SelectItem>
                <SelectItem value="friends">仅朋友</SelectItem>
                <SelectItem value="private">私密</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>在线状态</Label>
              <p className="text-sm text-gray-600">显示你的在线状态给其他用户</p>
            </div>
            <Switch
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>允许私信</Label>
              <p className="text-sm text-gray-600">允许其他用户向你发送私信</p>
            </div>
            <Switch
              checked={settings.allowDirectMessages}
              onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            数据和隐私
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>数据收集</Label>
              <p className="text-sm text-gray-600">允许收集匿名使用数据以改善服务</p>
            </div>
            <Switch
              checked={settings.dataCollection}
              onCheckedChange={(checked) => handleSettingChange('dataCollection', checked)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              下载我的数据
            </Button>
            <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
              删除账户
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            账户安全
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>双重认证</Label>
              <p className="text-sm text-gray-600">为账户添加额外的安全保护</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
              {!settings.twoFactorAuth && (
                <Button size="sm" variant="outline">设置</Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>登录提醒</Label>
              <p className="text-sm text-gray-600">新设备登录时发送邮件提醒</p>
            </div>
            <Switch
              checked={settings.loginAlerts}
              onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>会话超时</Label>
              <p className="text-sm text-gray-600">自动登出的时间（分钟）</p>
            </div>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-20"
              min="5"
              max="120"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>密码管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full">更改密码</Button>
          <Button variant="outline" className="w-full">查看活跃会话</Button>
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
            登出所有设备
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">设置</h1>
          <p className="text-gray-600">管理你的账户设置和偏好</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              通用
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              通知
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              隐私
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              安全
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacySettings />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">需要帮助？</h3>
          <p className="text-blue-700 text-sm mb-3">
            如果你在使用过程中遇到任何问题，请查看我们的帮助文档或联系客服。
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">帮助中心</Button>
            <Button size="sm" variant="outline">联系客服</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

