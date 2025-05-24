import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/components/common/MultiSelect.css';

/**
 * 多选组件
 * 用于选择多个选项，如服务类型、语言等
 */
const MultiSelect = ({ options, selected, onChange, placeholder }) => {
  // 处理选项点击
  const handleOptionClick = (value) => {
    if (selected.includes(value)) {
      // 如果已选中，则移除
      onChange(selected.filter(item => item !== value));
    } else {
      // 如果未选中，则添加
      onChange([...selected, value]);
    }
  };
  
  // 处理全选/取消全选
  const handleToggleAll = () => {
    if (selected.length === options.length) {
      // 如果全部选中，则取消全选
      onChange([]);
    } else {
      // 否则全选
      onChange(options.map(option => option.value));
    }
  };
  
  return (
    <div className="multi-select">
      <div className="multi-select-header">
        <div className="selected-count">
          已选择 {selected.length} / {options.length}
        </div>
        <button 
          className="toggle-all-button"
          onClick={handleToggleAll}
          type="button"
        >
          {selected.length === options.length ? '取消全选' : '全选'}
        </button>
      </div>
      
      <div className="multi-select-options">
        {options.length === 0 ? (
          <div className="empty-message">暂无选项</div>
        ) : (
          options.map(option => (
            <div 
              key={option.value}
              className={`multi-select-option ${selected.includes(option.value) ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.value)}
            >
              <div className="checkbox">
                {selected.includes(option.value) && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="option-label">{option.label}</div>
            </div>
          ))
        )}
      </div>
      
      {selected.length === 0 && (
        <div className="placeholder">{placeholder}</div>
      )}
    </div>
  );
};

MultiSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

MultiSelect.defaultProps = {
  placeholder: '请选择'
};

export default MultiSelect;
