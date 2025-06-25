/**
 * 文化页面组件
 * 展示文化内容和交流功能
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Globe, 
  Users, 
  BookOpen, 
  Heart, 
  Share2, 
  MessageCircle,
  Star,
  Calendar,
  MapPin,
  Camera
} from 'lucide-react';

const CulturePage = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);

  // 模拟文化数据
  useEffect(() => {
    const mockCultures = [
      {
        id: 1,
        name: '中国传统文化',
        description: '五千年历史的深厚文化底蕴',
        image: '/api/placeholder/300/200',
        participants: 1250,
        rating: 4.8,
        tags: ['历史', '传统', '艺术'],
        location: '中国',
        events: 15
      },
      {
        id: 2,
        name: '日本文化',
        description: '精致优雅的东方美学',
        image: '/api/placeholder/300/200',
        participants: 980,
        rating: 4.7,
        tags: ['美学', '传统', '现代'],
        location: '日本',
        events: 12
      },
      {
        id: 3,
        name: '欧洲文化',
        description: '多元化的西方文明',
        image: '/api/placeholder/300/200',
        participants: 1500,
        rating: 4.9,
        tags: ['艺术', '历史', '多元'],
        location: '欧洲',
        events: 20
      }
    ];

    setTimeout(() => {
      setCultures(mockCultures);
      setLoading(false);
    }, 1000);
  }, []);

  const CultureCard = ({ culture }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{culture.name}</h3>
            <p className="text-sm opacity-90">{culture.description}</p>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white bg-opacity-20 text-white">
              <Star className="w-3 h-3 mr-1" />
              {culture.rating}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            {culture.participants} 参与者
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            {culture.events} 活动
          </div>
        </div>
        
        <div className="flex items-center mb-3">
          <MapPin className="w-4 h-4 mr-1 text-gray-500" />
          <span className="text-sm text-gray-600">{culture.location}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {culture.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            <BookOpen className="w-4 h-4 mr-1" />
            探索
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const FeaturedEvents = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">精选活动</h3>
      {[1, 2, 3].map((event) => (
        <Card key={event} className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">文化摄影大赛</h4>
              <p className="text-sm text-gray-600 mb-2">
                用镜头记录世界各地的文化之美
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>📅 2024年7月15日</span>
                <span>👥 500+ 参与者</span>
                <span>🏆 丰厚奖品</span>
              </div>
            </div>
            <Button size="sm">参加</Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const CommunityStats = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">50K+</div>
        <div className="text-sm text-gray-600">活跃用户</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-green-600">200+</div>
        <div className="text-sm text-gray-600">文化主题</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">1M+</div>
        <div className="text-sm text-gray-600">交流次数</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-orange-600">95%</div>
        <div className="text-sm text-gray-600">满意度</div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部横幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <Globe className="inline-block w-10 h-10 mr-3" />
            文化探索
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            发现世界各地的精彩文化，与全球朋友分享交流体验
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="explore">文化探索</TabsTrigger>
            <TabsTrigger value="events">活动中心</TabsTrigger>
            <TabsTrigger value="community">社区</TabsTrigger>
            <TabsTrigger value="stats">数据统计</TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cultures.map((culture) => (
                <CultureCard key={culture.id} culture={culture} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FeaturedEvents />
              </div>
              <div>
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">即将开始</h3>
                  <div className="space-y-3">
                    {['文化讲座', '语言交换', '美食分享'].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item}</span>
                        <Badge variant="outline" className="text-xs">今天</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">社区动态</h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((post) => (
                      <div key={post} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            U{post}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">用户{post}</span>
                              <Badge variant="outline" className="text-xs">文化爱好者</Badge>
                              <span className="text-xs text-gray-500">2小时前</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              刚刚参加了日本茶道体验活动，真的很有意思！学到了很多传统文化知识。
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <button className="flex items-center gap-1 hover:text-blue-600">
                                <Heart className="w-3 h-3" />
                                12
                              </button>
                              <button className="flex items-center gap-1 hover:text-blue-600">
                                <MessageCircle className="w-3 h-3" />
                                5
                              </button>
                              <button className="flex items-center gap-1 hover:text-blue-600">
                                <Share2 className="w-3 h-3" />
                                分享
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <div>
                <CommunityStats />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
                <div className="text-gray-600">覆盖国家</div>
              </Card>
              <Card className="p-6 text-center">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
                <div className="text-gray-600">注册用户</div>
              </Card>
              <Card className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">文化课程</div>
              </Card>
              <Card className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-orange-600 mb-2">1M+</div>
                <div className="text-gray-600">交流消息</div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CulturePage;

