/**
 * 用户资料页面组件
 * 展示和编辑用户个人信息
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  User, 
  Settings, 
  Trophy, 
  Heart, 
  MessageCircle,
  Calendar,
  MapPin,
  Camera,
  Edit,
  Save,
  Star,
  Globe
} from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '张文化',
    email: 'zhangwenhua@example.com',
    bio: '热爱文化交流的全球旅行者，喜欢探索不同国家的传统文化和现代生活方式。',
    location: '北京, 中国',
    joinDate: '2023年3月',
    languages: ['中文', '英语', '日语'],
    interests: ['传统文化', '语言学习', '美食', '摄影'],
    avatar: '/api/placeholder/120/120'
  });

  const [stats, setStats] = useState({
    posts: 45,
    followers: 1250,
    following: 380,
    points: 2850,
    level: 'Gold',
    achievements: 12
  });

  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'post',
      content: '分享了一篇关于中国茶文化的文章',
      time: '2小时前',
      likes: 23,
      comments: 5
    },
    {
      id: 2,
      type: 'achievement',
      content: '获得了"文化探索者"徽章',
      time: '1天前',
      badge: '文化探索者'
    },
    {
      id: 3,
      type: 'interaction',
      content: '参与了日本文化讨论',
      time: '2天前',
      participants: 15
    }
  ]);

  const handleSaveProfile = () => {
    setIsEditing(false);
    // 这里应该调用API保存用户信息
    console.log('保存用户资料:', userProfile);
  };

  const ProfileHeader = () => (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {userProfile.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {stats.level}
              </Badge>
            </div>
            
            <p className="text-gray-600 mb-3">{userProfile.bio}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {userProfile.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                加入于 {userProfile.joinDate}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {userProfile.languages.join(', ')}
              </div>
            </div>
            
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="font-bold text-lg">{stats.posts}</div>
                <div className="text-sm text-gray-500">帖子</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{stats.followers}</div>
                <div className="text-sm text-gray-500">关注者</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{stats.following}</div>
                <div className="text-sm text-gray-500">关注中</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{stats.points}</div>
                <div className="text-sm text-gray-500">积分</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                <Edit className="w-4 h-4 mr-1" />
                {isEditing ? '取消编辑' : '编辑资料'}
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-1" />
                设置
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProfileForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>编辑个人资料</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              value={userProfile.name}
              onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={userProfile.email}
              onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="bio">个人简介</Label>
          <Textarea
            id="bio"
            value={userProfile.bio}
            onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="location">位置</Label>
          <Input
            id="location"
            value={userProfile.location}
            onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSaveProfile}>
            <Save className="w-4 h-4 mr-1" />
            保存更改
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityFeed = () => (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {userProfile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm mb-1">{activity.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{activity.time}</span>
                {activity.likes && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {activity.likes}
                  </span>
                )}
                {activity.comments && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {activity.comments}
                  </span>
                )}
                {activity.badge && (
                  <Badge variant="outline" className="text-xs">
                    {activity.badge}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const AchievementGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[
        { name: '文化探索者', icon: '🌍', description: '探索了10个不同文化' },
        { name: '语言大师', icon: '🗣️', description: '掌握了3种语言' },
        { name: '社交达人', icon: '👥', description: '获得了100个关注者' },
        { name: '内容创作者', icon: '✍️', description: '发布了50篇帖子' },
        { name: '点赞之王', icon: '❤️', description: '获得了1000个点赞' },
        { name: '评论专家', icon: '💬', description: '发表了200条评论' },
      ].map((achievement, index) => (
        <Card key={index} className="p-4 text-center hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">{achievement.icon}</div>
          <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
          <p className="text-xs text-gray-600">{achievement.description}</p>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">个人资料</TabsTrigger>
            <TabsTrigger value="activity">动态</TabsTrigger>
            <TabsTrigger value="achievements">成就</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {isEditing ? (
              <ProfileForm />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>兴趣爱好</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.interests.map((interest, index) => (
                          <Badge key={index} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>语言能力</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {userProfile.languages.map((language, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{language}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">我的成就</h2>
              <p className="text-gray-600">已获得 {stats.achievements} 个成就徽章</p>
            </div>
            <AchievementGrid />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>账户设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">邮件通知</h3>
                    <p className="text-sm text-gray-600">接收新消息和活动通知</p>
                  </div>
                  <Button variant="outline" size="sm">开启</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">隐私设置</h3>
                    <p className="text-sm text-gray-600">控制个人信息的可见性</p>
                  </div>
                  <Button variant="outline" size="sm">设置</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">语言偏好</h3>
                    <p className="text-sm text-gray-600">选择界面显示语言</p>
                  </div>
                  <Button variant="outline" size="sm">中文</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;

