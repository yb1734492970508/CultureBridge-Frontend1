import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit3, 
  Camera, 
  MapPin, 
  Calendar, 
  Globe, 
  Award,
  Star,
  TrendingUp,
  Users,
  MessageCircle,
  Languages,
  Save,
  X
} from 'lucide-react';

const UserProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    languages: user?.languages || ['中文', '英语'],
    interests: user?.interests || ['文化交流', '语言学习', '旅行'],
    avatar: user?.avatar || null
  });
  const [stats, setStats] = useState({
    totalMessages: 1250,
    totalTranslations: 340,
    friendsCount: 89,
    joinDate: user?.joinDate || '2024-01-15',
    level: user?.level || 'SILVER',
    experience: 2850,
    nextLevelExp: 5000
  });

  const handleSave = () => {
    // 这里应该调用API保存用户资料
    console.log('保存用户资料:', profile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // 重置为原始数据
    setProfile({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      languages: user?.languages || ['中文', '英语'],
      interests: user?.interests || ['文化交流', '语言学习', '旅行'],
      avatar: user?.avatar || null
    });
    setIsEditing(false);
  };

  const addLanguage = (language) => {
    if (language && !profile.languages.includes(language)) {
      setProfile({
        ...profile,
        languages: [...profile.languages, language]
      });
    }
  };

  const removeLanguage = (language) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter(lang => lang !== language)
    });
  };

  const addInterest = (interest) => {
    if (interest && !profile.interests.includes(interest)) {
      setProfile({
        ...profile,
        interests: [...profile.interests, interest]
      });
    }
  };

  const removeInterest = (interest) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(int => int !== interest)
    });
  };

  const getLevelColor = (level) => {
    const colors = {
      BRONZE: 'text-amber-600 bg-amber-100',
      SILVER: 'text-gray-600 bg-gray-100',
      GOLD: 'text-yellow-600 bg-yellow-100',
      PLATINUM: 'text-purple-600 bg-purple-100',
      DIAMOND: 'text-blue-600 bg-blue-100'
    };
    return colors[level] || colors.BRONZE;
  };

  const getProgressPercentage = () => {
    return (stats.experience / stats.nextLevelExp) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
            <p className="text-gray-600 mt-2">管理您的个人信息和偏好设置</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit3 size={18} />
              编辑资料
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                保存
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X size={18} />
                取消
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：基本信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息卡片 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
              
              <div className="space-y-4">
                {/* 头像 */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {isEditing && (
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <Camera size={14} />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{profile.username}</h3>
                    <p className="text-gray-500">CultureBridge用户</p>
                  </div>
                </div>

                {/* 用户名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.username}</p>
                  )}
                </div>

                {/* 邮箱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email || '未设置'}</p>
                  )}
                </div>

                {/* 个人简介 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="介绍一下自己..."
                    />
                  ) : (
                    <p className="text-gray-900">{profile.bio || '这个人很懒，什么都没有留下...'}</p>
                  )}
                </div>

                {/* 位置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="您的所在地"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900">
                      <MapPin size={16} className="text-gray-500" />
                      {profile.location || '未设置'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 语言技能 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">语言技能</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.languages.map((language, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <Globe size={14} />
                    {language}
                    {isEditing && (
                      <button
                        onClick={() => removeLanguage(language)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="添加语言"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addLanguage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* 兴趣爱好 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">兴趣爱好</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <Star size={14} />
                    {interest}
                    {isEditing && (
                      <button
                        onClick={() => removeInterest(interest)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="添加兴趣"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addInterest(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 右侧：统计信息 */}
          <div className="space-y-6">
            {/* 用户等级 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">用户等级</h3>
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getLevelColor(stats.level)}`}>
                  <Award size={16} className="mr-2" />
                  {stats.level}
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.experience}</div>
                  <div className="text-sm text-gray-500">/ {stats.nextLevelExp} 经验值</div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    距离下一等级还需 {stats.nextLevelExp - stats.experience} 经验值
                  </div>
                </div>
              </div>
            </div>

            {/* 活动统计 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">活动统计</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-600">发送消息</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.totalMessages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Languages size={16} className="text-green-500" />
                    <span className="text-sm text-gray-600">翻译次数</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.totalTranslations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-500" />
                    <span className="text-sm text-gray-600">好友数量</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.friendsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-orange-500" />
                    <span className="text-sm text-gray-600">加入时间</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.joinDate}</span>
                </div>
              </div>
            </div>

            {/* 成就徽章 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">成就徽章</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs text-gray-600">翻译达人</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-1">💬</div>
                  <div className="text-xs text-gray-600">聊天之星</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-xs text-gray-600">文化使者</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs text-gray-600">新星用户</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

