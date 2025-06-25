/**
 * 404页面
 * 页面未找到时显示的组件
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Globe } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-6xl font-bold text-primary mb-2">
            404
          </CardTitle>
          <CardDescription className="text-xl">
            页面未找到
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300">
            抱歉，您访问的页面不存在或已被移动。
            让我们帮您找到正确的方向。
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回仪表板
              </Link>
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>如果您认为这是一个错误，请联系我们的技术支持。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;

