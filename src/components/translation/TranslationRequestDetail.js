/**
 * 翻译请求详情组件
 * 用于展示翻译请求的详细信息和状态
 */

import React, { useState, useEffect } from 'react';
import BlockchainConnector from '../../utils/BlockchainConnector';
import RequestStatusTracker from './RequestStatusTracker';
import './TranslationRequestDetail.css';

const TranslationRequestDetail = ({ requestId, onClose }) => {
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translationContent, setTranslationContent] = useState('');
  const [showOriginal, setShowOriginal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // 加载请求详情
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        
        if (!BlockchainConnector.translationMarket) {
          throw new Error('TranslationMarket合约实例未初始化');
        }
        
        // 获取请求详情
        const request = await BlockchainConnector.translationMarket.requests(requestId);
        
        // 格式化请求数据
        const formattedRequest = {
          id: requestId,
          requester: request.requester,
          contentHash: request.contentHash,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage,
          reward: BlockchainConnector.ethers.utils.formatEther(request.reward),
          deadline: new Date(request.deadline.toNumber() * 1000),
          translator: request.translator,
          translationHash: request.translationHash,
          status: BlockchainConnector.getRequestStatusString(request.status),
          createdAt: new Date(request.createdAt.toNumber() * 1000),
          completedAt: request.completedAt.toNumber() > 0 
            ? new Date(request.completedAt.toNumber() * 1000)
            : null,
          quality: request.quality.toNumber(),
          isAIAssisted: request.isAIAssisted,
          // 模拟数据，实际应从IPFS或其他存储获取
          content: '这是原始内容示例，实际应用中应从IPFS获取',
          translation: request.translationHash ? '这是翻译内容示例，实际应用中应从IPFS获取' : ''
        };
        
        setRequestDetails(formattedRequest);
        setLoading(false);
      } catch (err) {
        console.error('获取请求详情失败:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  // 处理状态变化
  const handleStatusChange = (oldStatus, newStatus) => {
    console.log(`状态从 ${oldStatus} 变更为 ${newStatus}`);
    // 可以在这里添加额外的处理逻辑
  };

  // 提交反馈
  const handleSubmitFeedback = async () => {
    try {
      setSubmittingFeedback(true);
      
      if (!BlockchainConnector.translationMarket) {
        throw new Error('TranslationMarket合约实例未初始化');
      }
      
      // 提交质量评分
      const tx = await BlockchainConnector.translationMarket.rateTranslation(
        requestId,
        rating
      );
      
      await tx.wait();
      
      // 更新请求详情
      setRequestDetails(prev => ({
        ...prev,
        quality: rating
      }));
      
      // 重置表单
      setFeedback('');
      setRating(0);
      
      alert('反馈提交成功');
    } catch (err) {
      console.error('提交反馈失败:', err);
      alert(`提交反馈失败: ${err.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // 取消请求
  const handleCancelRequest = async () => {
    try {
      if (!BlockchainConnector.translationMarket) {
        throw new Error('TranslationMarket合约实例未初始化');
      }
      
      if (!window.confirm('确定要取消此翻译请求吗？')) {
        return;
      }
      
      const tx = await BlockchainConnector.translationMarket.cancelRequest(requestId);
      await tx.wait();
      
      // 更新请求状态
      setRequestDetails(prev => ({
        ...prev,
        status: 'Cancelled'
      }));
      
      alert('请求已成功取消');
    } catch (err) {
      console.error('取消请求失败:', err);
      alert(`取消请求失败: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="translation-request-detail loading">
        <div className="detail-spinner"></div>
        <p>加载请求详情...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="translation-request-detail error">
        <h2>加载失败</h2>
        <p>{error}</p>
        <button className="btn-close" onClick={onClose}>关闭</button>
      </div>
    );
  }

  if (!requestDetails) {
    return (
      <div className="translation-request-detail not-found">
        <h2>未找到请求</h2>
        <p>无法找到ID为 {requestId} 的翻译请求</p>
        <button className="btn-close" onClick={onClose}>关闭</button>
      </div>
    );
  }

  return (
    <div className="translation-request-detail">
      <div className="detail-header">
        <h2>翻译请求详情</h2>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>
      
      {/* 状态跟踪器 */}
      <RequestStatusTracker 
        requestId={requestId} 
        onStatusChange={handleStatusChange} 
      />
      
      <div className="detail-content">
        <div className="detail-section">
          <h3>基本信息</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">请求ID</span>
              <span className="detail-value">{requestDetails.id.substring(0, 10)}...</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">创建时间</span>
              <span className="detail-value">{requestDetails.createdAt.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">截止时间</span>
              <span className="detail-value">{requestDetails.deadline.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">奖励</span>
              <span className="detail-value">{requestDetails.reward} CULT</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">源语言</span>
              <span className="detail-value">{requestDetails.sourceLanguage}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">目标语言</span>
              <span className="detail-value">{requestDetails.targetLanguage}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">AI辅助</span>
              <span className="detail-value">{requestDetails.isAIAssisted ? '是' : '否'}</span>
            </div>
            {requestDetails.completedAt && (
              <div className="detail-item">
                <span className="detail-label">完成时间</span>
                <span className="detail-value">{requestDetails.completedAt.toLocaleString()}</span>
              </div>
            )}
            {requestDetails.quality > 0 && (
              <div className="detail-item">
                <span className="detail-label">质量评分</span>
                <span className="detail-value">
                  {Array(5).fill().map((_, i) => (
                    <span key={i} className={`star ${i < requestDetails.quality ? 'filled' : ''}`}>★</span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* 内容展示 */}
        <div className="detail-section">
          <h3>翻译内容</h3>
          <div className="translation-content-container">
            <div className="translation-tabs">
              <button 
                className={`tab-btn ${!showOriginal ? 'active' : ''}`}
                onClick={() => setShowOriginal(false)}
              >
                翻译结果
              </button>
              <button 
                className={`tab-btn ${showOriginal ? 'active' : ''}`}
                onClick={() => setShowOriginal(true)}
              >
                原始内容
              </button>
            </div>
            <div className="translation-content">
              {showOriginal ? (
                <div className="original-content">
                  <p>{requestDetails.content}</p>
                </div>
              ) : (
                <div className="translated-content">
                  {requestDetails.translation ? (
                    <p>{requestDetails.translation}</p>
                  ) : (
                    <p className="no-translation">翻译尚未完成</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 反馈表单 */}
        {requestDetails.status === 'Completed' && (
          <div className="detail-section">
            <h3>提交反馈</h3>
            <div className="feedback-form">
              <div className="rating-container">
                <span className="rating-label">质量评分:</span>
                <div className="star-rating">
                  {Array(5).fill().map((_, i) => (
                    <span 
                      key={i}
                      className={`star ${i < rating ? 'filled' : ''}`}
                      onClick={() => setRating(i + 1)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="请输入您对翻译的反馈意见..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
              <button 
                className="btn-submit-feedback"
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || rating === 0}
              >
                {submittingFeedback ? '提交中...' : '提交反馈'}
              </button>
            </div>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="detail-actions">
          {requestDetails.status === 'Created' && (
            <button 
              className="btn-cancel-request"
              onClick={handleCancelRequest}
            >
              取消请求
            </button>
          )}
          {requestDetails.status === 'Completed' && !requestDetails.quality && (
            <button 
              className="btn-verify"
              onClick={() => alert('验证功能尚未实现')}
            >
              验证翻译
            </button>
          )}
          {requestDetails.status === 'Completed' && (
            <button 
              className="btn-dispute"
              onClick={() => alert('争议功能尚未实现')}
            >
              提出争议
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationRequestDetail;
