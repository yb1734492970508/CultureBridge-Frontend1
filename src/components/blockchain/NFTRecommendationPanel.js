import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import './NFTRecommendationPanel.css';
import NFTRecommendationService from './NFTRecommendationService';
import NFTMarketplaceItem from './NFTMarketplaceItem';

/**
 * NFT推荐面板组件
 * 提供个性化NFT推荐展示
 */
const NFTRecommendationPanel = ({
  nfts = [],
  currentNFT = null,
  className = '',
  maxRecommendations = 4,
  onNFTClick,
  currentAccount = null
}) => {
  // 推荐服务实例
  const recommendationService = useMemo(() => new NFTRecommendationService({
    maxRecommendations: 10,
    enablePersonalization: true,
    similarityThreshold: 0.3,
    maxHistoryItems: 50
  }), []);
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('youMayLike');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 获取推荐
  useEffect(() => {
    const fetchRecommendations = () => {
      setIsLoading(true);
      
      let recommendedNFTs = [];
      
      switch (activeTab) {
        case 'youMayLike':
          recommendedNFTs = recommendationService.getYouMayLikeRecommendations(nfts, maxRecommendations);
          break;
        case 'similar':
          recommendedNFTs = recommendationService.getSimilarNFTs(nfts, currentNFT, maxRecommendations);
          break;
        case 'trending':
          recommendedNFTs = recommendationService.getTrendingNFTs(nfts, maxRecommendations);
          break;
        case 'newlyListed':
          recommendedNFTs = recommendationService.getNewlyListedNFTs(nfts, maxRecommendations);
          break;
        case 'endingSoon':
          recommendedNFTs = recommendationService.getEndingSoonNFTs(nfts, maxRecommendations);
          break;
        default:
          recommendedNFTs = recommendationService.getYouMayLikeRecommendations(nfts, maxRecommendations);
      }
      
      setRecommendations(recommendedNFTs);
      setIsLoading(false);
    };
    
    fetchRecommendations();
  }, [activeTab, nfts, currentNFT, maxRecommendations, recommendationService]);
  
  // 记录NFT浏览
  const handleNFTClick = (nft) => {
    recommendationService.recordView(nft);
    
    if (onNFTClick) {
      onNFTClick(nft);
    }
  };
  
  // 渲染推荐标签页
  const renderTabs = () => {
    const tabs = [
      { id: 'youMayLike', label: '猜你喜欢', alwaysShow: true },
      { id: 'similar', label: '类似NFT', showWhen: !!currentNFT },
      { id: 'trending', label: '热门NFT', alwaysShow: true },
      { id: 'newlyListed', label: '新上架', alwaysShow: true },
      { id: 'endingSoon', label: '即将结束', alwaysShow: true }
    ];
    
    return (
      <div className="recommendation-tabs">
        {tabs.map(tab => (
          (tab.alwaysShow || tab.showWhen) && (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          )
        ))}
      </div>
    );
  };
  
  // 渲染推荐内容
  const renderRecommendations = () => {
    if (isLoading) {
      return (
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>加载推荐中...</p>
        </div>
      );
    }
    
    if (recommendations.length === 0) {
      return (
        <div className="no-recommendations">
          <p>暂无推荐内容</p>
        </div>
      );
    }
    
    return (
      <div className="recommendations-grid">
        {recommendations.map((nft, index) => (
          <NFTMarketplaceItem
            key={`recommendation-${nft.id}-${index}`}
            nft={nft}
            onClick={() => handleNFTClick(nft)}
            currentAccount={currentAccount}
            showSelectionControls={false}
            className="recommendation-item"
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className={`nft-recommendation-panel ${className}`}>
      <div className="recommendation-header">
        <h3>推荐NFT</h3>
        {renderTabs()}
      </div>
      
      <div className="recommendation-content">
        {renderRecommendations()}
      </div>
    </div>
  );
};

NFTRecommendationPanel.propTypes = {
  nfts: PropTypes.array,
  currentNFT: PropTypes.object,
  className: PropTypes.string,
  maxRecommendations: PropTypes.number,
  onNFTClick: PropTypes.func,
  currentAccount: PropTypes.string
};

export default NFTRecommendationPanel;
