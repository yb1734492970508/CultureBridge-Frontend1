import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/components/common/RangeSlider.css';

/**
 * 范围滑块组件
 * 用于选择数值范围，如价格区间、评分区间等
 */
const RangeSlider = ({ min, max, step, values, onChange }) => {
  // 处理最小值变化
  const handleMinChange = (e) => {
    const newMin = Math.min(parseInt(e.target.value), values[1]);
    onChange([newMin, values[1]]);
  };
  
  // 处理最大值变化
  const handleMaxChange = (e) => {
    const newMax = Math.max(parseInt(e.target.value), values[0]);
    onChange([values[0], newMax]);
  };
  
  // 计算滑块位置百分比
  const getLeftPercent = () => {
    return ((values[0] - min) / (max - min)) * 100;
  };
  
  const getRightPercent = () => {
    return 100 - ((values[1] - min) / (max - min)) * 100;
  };
  
  return (
    <div className="range-slider">
      <div className="range-slider-track">
        <div 
          className="range-slider-fill"
          style={{
            left: `${getLeftPercent()}%`,
            right: `${getRightPercent()}%`
          }}
        ></div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={values[0]}
          onChange={handleMinChange}
          className="range-slider-input min"
          aria-label="最小值"
        />
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={values[1]}
          onChange={handleMaxChange}
          className="range-slider-input max"
          aria-label="最大值"
        />
      </div>
    </div>
  );
};

RangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired
};

RangeSlider.defaultProps = {
  step: 1
};

export default RangeSlider;
