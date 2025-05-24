import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/components/common/Pagination.css';

/**
 * 分页组件
 * 用于在分页视图模式下导航不同页面
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // 计算要显示的页码范围
  const getPageRange = () => {
    const range = [];
    const maxVisiblePages = 5; // 最多显示的页码数量
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大可见页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // 否则，显示当前页附近的页码
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = start + maxVisiblePages - 1;
      
      if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      // 添加第一页
      if (start > 1) {
        range.push(1);
        if (start > 2) {
          range.push('...');
        }
      }
      
      // 添加中间页码
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          range.push(i);
        }
      }
      
      // 添加最后一页
      if (end < totalPages) {
        if (end < totalPages - 1) {
          range.push('...');
        }
        range.push(totalPages);
      }
    }
    
    return range;
  };
  
  // 处理页码点击
  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };
  
  // 处理上一页点击
  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  // 处理下一页点击
  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  // 如果只有一页，不显示分页
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className="pagination">
      <button 
        className="pagination-button prev" 
        onClick={handlePrevClick}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      
      <div className="pagination-pages">
        {getPageRange().map((page, index) => (
          <button
            key={index}
            className={`pagination-page ${page === currentPage ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button 
        className="pagination-button next" 
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired
};

export default Pagination;
