import React, { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import CommentSection from './CommentSection';
import './PostCard.css';

/**
 * 动态卡片组件
 * 显示单条社交动态
 */
const PostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onFollow,
  onUnfollow,
  className = ""
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  // 检查是否已点赞
  const isLiked = post.likedBy?.includes(currentUser?.address);
  
  // 检查是否已关注作者
  const isFollowing = post.author?.isFollowing;

  // 处理点赞
  const handleLike = useCallback(() => {
    onLike();
  }, [onLike]);

  // 处理关注
  const handleFollow = useCallback(() => {
    if (isFollowing) {
      onUnfollow();
    } else {
      onFollow();
    }
  }, [isFollowing, onFollow, onUnfollow]);

  // 处理评论
  const handleComment = useCallback((comment) => {
    onComment(post.id, comment);
  }, [onComment, post.id]);

  // 格式化时间
  const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: zhCN
    });
  };

  // 渲染作者信息
  const renderAuthor = () => (
    <div className="post-author">
      <div className="author-avatar">
        <img 
          src={post.author.avatar || '/default-avatar.png'} 
          alt={post.author.displayName}
          className="avatar-image"
        />
        {post.author.verified && (
          <div className="verified-badge" title="已验证">✓</div>
        )}
      </div>

      <div className="author-info">
        <div className="author-name">
          {post.author.displayName || `${post.author.address.slice(0, 6)}...${post.author.address.slice(-4)}`}
        </div>
        <div className="post-time">
          {formatTime(post.createdAt)}
        </div>
      </div>

      {currentUser?.address !== post.author.address && (
        <div className="author-actions">
          <button
            className={`follow-button ${isFollowing ? 'following' : ''}`}
            onClick={handleFollow}
          >
            {isFollowing ? '已关注' : '关注'}
          </button>
        </div>
      )}
    </div>
  );

  // 渲染内容
  const renderContent = () => {
    const shouldTruncate = post.content.length > 200 && !showFullContent;
    const displayContent = shouldTruncate 
      ? post.content.slice(0, 200) + '...'
      : post.content;

    return (
      <div className="post-content">
        <div className="content-text">
          {displayContent}
          {shouldTruncate && (
            <button
              className="show-more-button"
              onClick={() => setShowFullContent(true)}
            >
              显示更多
            </button>
          )}
          {showFullContent && post.content.length > 200 && (
            <button
              className="show-less-button"
              onClick={() => setShowFullContent(false)}
            >
              收起
            </button>
          )}
        </div>

        {/* 媒体内容 */}
        {post.media && post.media.length > 0 && (
          <div className="post-media">
            {post.media.map((media, index) => (
              <div key={index} className="media-item">
                {media.type === 'image' && (
                  <img 
                    src={media.url} 
                    alt="Post media"
                    className="media-image"
                  />
                )}
                {media.type === 'video' && (
                  <video 
                    src={media.url}
                    controls
                    className="media-video"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* NFT内容 */}
        {post.nft && (
          <div className="post-nft">
            <div className="nft-card">
              <div className="nft-image">
                <img 
                  src={post.nft.image} 
                  alt={post.nft.name}
                  className="nft-image-content"
                />
              </div>
              <div className="nft-info">
                <div className="nft-name">{post.nft.name}</div>
                <div className="nft-collection">{post.nft.collection}</div>
                <div className="nft-price">
                  {post.nft.price} ETH
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="post-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染互动按钮
  const renderActions = () => (
    <div className="post-actions">
      <button
        className={`action-button like-button ${isLiked ? 'liked' : ''}`}
        onClick={handleLike}
      >
        <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
        <span className="action-count">{post.likes || 0}</span>
      </button>

      <button
        className="action-button comment-button"
        onClick={() => setShowComments(!showComments)}
      >
        <span className="action-icon">💬</span>
        <span className="action-count">{post.comments || 0}</span>
      </button>

      <button className="action-button share-button">
        <span className="action-icon">🔗</span>
        <span className="action-text">分享</span>
      </button>

      <button className="action-button bookmark-button">
        <span className="action-icon">🔖</span>
        <span className="action-text">收藏</span>
      </button>
    </div>
  );

  // 渲染统计信息
  const renderStats = () => {
    if (!post.likes && !post.comments && !post.shares) return null;

    return (
      <div className="post-stats">
        {post.likes > 0 && (
          <span className="stat-item">
            {post.likes} 个赞
          </span>
        )}
        {post.comments > 0 && (
          <span className="stat-item">
            {post.comments} 条评论
          </span>
        )}
        {post.shares > 0 && (
          <span className="stat-item">
            {post.shares} 次分享
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`post-card ${className}`}>
      {/* 作者信息 */}
      {renderAuthor()}

      {/* 内容 */}
      {renderContent()}

      {/* 统计信息 */}
      {renderStats()}

      {/* 互动按钮 */}
      {renderActions()}

      {/* 评论区域 */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.commentsList || []}
          currentUser={currentUser}
          onComment={handleComment}
        />
      )}
    </div>
  );
};

export default PostCard;

