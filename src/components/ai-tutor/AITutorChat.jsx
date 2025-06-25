/**
 * AI导师聊天界面组件
 * 提供与AI导师的实时对话功能
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  MessageCircle,
  CheckCircle,
  Globe,
  Edit,
  RotateCcw,
  Star,
  Clock,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';

const AITutorChat = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionType, setSessionType] = useState('conversation');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    messageCount: 0
  });
  
  const { user } = useSelector(state => state.auth);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchSessionTypes();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionStats(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const fetchSessionTypes = async () => {
    try {
      const response = await fetch('/api/ai-tutor/session-types');
      const data = await response.json();
      if (data.success) {
        setSessionTypes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch session types:', error);
    }
  };

  const startSession = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-tutor/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          session_type: sessionType,
          target_language: targetLanguage
        })
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.data.session_id);
        setSessionActive(true);
        setMessages([{
          role: 'assistant',
          content: data.data.welcome_message,
          timestamp: new Date().toISOString(),
          type: 'welcome'
        }]);
        setSessionStats({ duration: 0, messageCount: 0 });
      } else {
        alert('启动会话失败：' + data.error);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('启动会话失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // 添加用户消息到界面
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      type: 'message'
    };
    setMessages(prev => [...prev, newUserMessage]);
    setSessionStats(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1
    }));

    try {
      const response = await fetch(`/api/ai-tutor/session/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.data.content,
          timestamp: new Date().toISOString(),
          type: 'response',
          corrections: data.data.corrections || [],
          suggestions: data.data.suggestions || [],
          cultural_notes: data.data.cultural_notes || []
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        alert('发送消息失败：' + data.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('发送消息失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/ai-tutor/session/${sessionId}/end`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setSessionActive(false);
        // 显示会话总结
        const summaryMessage = {
          role: 'system',
          content: '会话已结束',
          timestamp: new Date().toISOString(),
          type: 'summary',
          summary: data.data.session_summary,
          feedback: data.data.feedback,
          homework: data.data.homework
        };
        setMessages(prev => [...prev, summaryMessage]);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'conversation':
        return <MessageCircle className="w-5 h-5" />;
      case 'grammar_check':
        return <CheckCircle className="w-5 h-5" />;
      case 'pronunciation':
        return <Mic className="w-5 h-5" />;
      case 'cultural_insight':
        return <Globe className="w-5 h-5" />;
      case 'writing_assistance':
        return <Edit className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem && message.type === 'summary') {
      return (
        <div key={index} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <Award className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-900">会话总结</h3>
          </div>
          
          {message.summary && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">本次会话</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">时长：</span>
                  <span className="font-medium">{message.summary.duration_minutes}分钟</span>
                </div>
                <div>
                  <span className="text-gray-600">消息数：</span>
                  <span className="font-medium">{message.summary.message_count}条</span>
                </div>
              </div>
            </div>
          )}

          {message.feedback && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">学习反馈</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">总体表现：</span>
                  <span className="font-medium text-green-600">{message.feedback.overall_performance}</span>
                </div>
                <div>
                  <span className="text-gray-600">进步分数：</span>
                  <span className="font-medium text-blue-600">{message.feedback.progress_score}/100</span>
                </div>
              </div>
            </div>
          )}

          {message.homework && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">课后作业</h4>
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-sm mb-2">{message.homework.title}</h5>
                <div className="space-y-2">
                  {message.homework.tasks?.map((task, taskIndex) => (
                    <div key={taskIndex} className="text-sm">
                      <div className="font-medium">{task.task}</div>
                      <div className="text-gray-600">{task.description}</div>
                      <div className="text-xs text-gray-500">预计时间：{task.estimated_time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={index}
        className={cn(
          "flex mb-4",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          )}
        >
          <div className="text-sm">{message.content}</div>
          
          {/* 显示纠正建议 */}
          {message.corrections && message.corrections.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-xs font-medium text-yellow-800 mb-1">语法纠正：</div>
              {message.corrections.map((correction, corrIndex) => (
                <div key={corrIndex} className="text-xs text-yellow-700">
                  <span className="line-through">{correction.original}</span>
                  {' → '}
                  <span className="font-medium">{correction.corrected}</span>
                  <div className="text-yellow-600">{correction.explanation}</div>
                </div>
              ))}
            </div>
          )}

          {/* 显示建议 */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <div className="text-xs font-medium text-green-800 mb-1">改进建议：</div>
              {message.suggestions.map((suggestion, suggIndex) => (
                <div key={suggIndex} className="text-xs text-green-700">
                  <div className="font-medium">{suggestion.suggestion}</div>
                  <div className="text-green-600">{suggestion.explanation}</div>
                </div>
              ))}
            </div>
          )}

          {/* 显示文化注释 */}
          {message.cultural_notes && message.cultural_notes.length > 0 && (
            <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
              <div className="text-xs font-medium text-purple-800 mb-1">文化洞察：</div>
              {message.cultural_notes.map((note, noteIndex) => (
                <div key={noteIndex} className="text-xs text-purple-700">
                  <div className="font-medium">{note.note}</div>
                  <div className="text-purple-600">({note.context})</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs opacity-70 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white">
      {/* 头部 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI个人导师</h1>
              <p className="text-sm text-gray-600">
                {sessionActive ? '会话进行中' : '选择会话类型开始学习'}
              </p>
            </div>
          </div>
          
          {sessionActive && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {formatDuration(sessionStats.duration)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MessageCircle className="w-4 h-4 mr-1" />
                {sessionStats.messageCount}条消息
              </div>
              <button
                onClick={endSession}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                结束会话
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 会话设置 */}
      {!sessionActive && (
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会话类型
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sessionTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标语言
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="english">英语</option>
                <option value="japanese">日语</option>
                <option value="korean">韩语</option>
                <option value="french">法语</option>
                <option value="german">德语</option>
                <option value="spanish">西班牙语</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={startSession}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '启动中...' : '开始会话'}
              </button>
            </div>
          </div>
          
          {/* 会话类型说明 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionTypes.map((type) => (
              <div
                key={type.type}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-colors",
                  sessionType === type.type
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
                onClick={() => setSessionType(type.type)}
              >
                <div className="flex items-center mb-2">
                  {getSessionTypeIcon(type.type)}
                  <h3 className="font-medium text-gray-900 ml-2">{type.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <div className="text-xs text-gray-500">
                  预计时长：{type.estimated_duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !sessionActive && (
          <div className="text-center text-gray-500 mt-20">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">欢迎使用AI个人导师</h3>
            <p>选择会话类型和目标语言，开始您的个性化学习之旅</p>
          </div>
        )}
        
        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      {sessionActive && (
        <div className="border-t bg-white p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="输入您的消息..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                "p-3 rounded-lg transition-colors",
                isRecording
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITutorChat;

