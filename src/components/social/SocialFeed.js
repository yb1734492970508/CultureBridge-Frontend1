import React, { useState, useCallback, useMemo } from 'react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import './SocialFeed.css';

/**
 * 社交动态组件
 * 显示用户动态流和发布功能
 */
const SocialFeed = ({
  feed = [],
  currentUser,
  onCreatePost,
  onLikePost,
  onCommentOnPost,
  onFollowUser,
  onUnfollowUser,
  className = ""
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('latest'); // latest, popular, trending
  const [filterType, setFilterType] = useState('all'); // all, text, image, video, nft

  // 无限滚动
  const {
    items: displayedPosts,
    loading: loadingMore,
    hasMore,
    loadMore
  } = useInfiniteScroll({
    items: feed,
    pageSize: 10
  });

  // 筛选和排序动态
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = displayedPosts;

    // 按类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(post => post.type === filterType);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.likes + b.comments) - (a.likes + a.comments);
        case 'trending':
          const aScore = (b.likes + b.comments) / Math.max(1, (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60));
          const bScore = (b.likes + b.comments) / Math.max(1, (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60));
          return bScore - aScore;
        case 'latest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [displayedPosts, filterType, sortBy]);

  // 处理创建动态
  const handleCreatePost = useCallback(async (postData) => {
    try {
      await onCreatePost(postData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('发布动态失败:', error);
    }
  }, [onCreatePost]);

  // 处理点赞
  const handleLikePost = useCallback(async (postId) => {
    try {
      await onLikePost(postId);
    } catch (error) {
      console.error('点赞失败:', error);
    }
  }, [onLikePost]);

  // 处理评论
  const handleCommentOnPost = useCallback(async (postId, comment) => {
    try {
      await onCommentOnPost(postId, comment);
    } catch (error) {
      console.error('评论失败:', error);
    }
  }, [onCommentOnPost]);

  // 渲染筛选和排序控制
  const renderControls = () => (
    <div className="feed-controls">
      <div className="controls-left">
        <div className="sort-controls">
          <label className="control-label">排序:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="latest">最新</option>
            <option value="popular">热门</option>
            <option value="trending">趋势</option>
          </select>
        </div>

        <div className="filter-controls">
          <label className="control-label">类型:</label>
          <div className="filter-buttons">
            {[
              { value: 'all', label: '全部', icon: '📱' },
              { value: 'text', label: '文字', icon: '📝' },
              { value: 'image', label: '图片', icon: '🖼️' },
              { value: 'video', label: '视频', icon: '🎥' },
              { value: 'nft', label: 'NFT', icon: '🎨' }
            ].map(filter => (
              <button
                key={filter.value}
                className={`filter-button ${filterType === filter.value ? 'active' : ''}`}
                onClick={() => setFilterType(filter.value)}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="controls-right">
        <button
          className="create-post-button"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="button-icon">✏️</span>
          发布动态
        </button>
      </div>
    </div>
  );

  // 渲染快速发布区域
  const renderQuickPost = () => (
    <div className="quick-post">
      <div className="quick-post-avatar">
        <img 
          src={currentUser?.avatar || '/default-avatar.png'} 
          alt={currentUser?.displayName || 'User'}
          className="avatar-image"
        />
      </div>
      <div className="quick-post-input">
        <button
          className="quick-input-button"
          onClick={() => setShowCreateModal(true)}
        >
          分享你的想法...
        </button>
      </div>
      <div className="quick-post-actions">
        <button
          className="quick-action-button"
          onClick={() => setShowCreateModal(true)}
          title="添加图片"
        >
          🖼️
        </button>
        <button
          className="quick-action-button"
          onClick={() => setShowCreateModal(true)}
          title="添加NFT"
        >
          🎨
        </button>
        <button
          className="quick-action-button"
          onClick={() => setShowCreateModal(true)}
          title="添加视频"
        >
          🎥
        </button>
      </div>
    </div>
  );

  // 渲染动态列表
  const renderPosts = () => {
    if (filteredAndSortedPosts.length === 0) {
      return (
        <div className="empty-feed">
          <div className="empty-icon">📱</div>
          <h3>暂无动态</h3>
          <p>
            {filterType === 'all' 
              ? '还没有任何动态，成为第一个发布者吧！'
              : `暂无${filterType === 'text' ? '文字' : filterType === 'image' ? '图片' : filterType === 'video' ? '视频' : 'NFT'}类型的动态`
            }
          </p>
          <button
            className="create-first-post"
            onClick={() => setShowCreateModal(true)}
          >
            发布第一条动态
          </button>
        </div>
      );
    }

    return (
      <div className="posts-list">
        {filteredAndSortedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLike={() => handleLikePost(post.id)}
            onComment={handleCommentOnPost}
            onFollow={() => onFollowUser(post.author.address)}
            onUnfollow={() => onUnfollowUser(post.author.address)}
          />
        ))}

        {/* 加载更多 */}
        {hasMore && (
          <div className="load-more-container">
            {loadingMore ? (
              <div className="loading-more">
                <div className="loading-spinner" />
                <span>加载更多动态...</span>
              </div>
            ) : (
              <button
                className="load-more-button"
                onClick={loadMore}
              >
                加载更多
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`social-feed ${className}`}>
      {/* 控制栏 */}
      {renderControls()}

      {/* 快速发布 */}
      {currentUser && renderQuickPost()}

      {/* 动态列表 */}
      {renderPosts()}

      {/* 创建动态模态框 */}
      {showCreateModal && (
        <CreatePostModal
          currentUser={currentUser}
          onCreatePost={handleCreatePost}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default SocialFeed;

