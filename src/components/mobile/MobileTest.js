import React from 'react';
import '../../styles/components/mobile/MobileTest.css';
import BottomNavigation from './BottomNavigation';
import PullToRefresh from './PullToRefresh';
import SwipeGesture from './SwipeGesture';

/**
 * 移动端测试组件
 * 用于测试移动端组件的功能和交互
 */
const MobileTest = () => {
  const [activeTab, setActiveTab] = React.useState('home');
  const [refreshCount, setRefreshCount] = React.useState(0);
  const [swipeDirection, setSwipeDirection] = React.useState('无');
  const [testResults, setTestResults] = React.useState({
    bottomNav: false,
    pullToRefresh: false,
    swipeGesture: false
  });

  // 处理导航标签变更
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setTestResults(prev => ({...prev, bottomNav: true}));
  };

  // 处理下拉刷新
  const handleRefresh = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setRefreshCount(prev => prev + 1);
        setTestResults(prev => ({...prev, pullToRefresh: true}));
        resolve();
      }, 1500);
    });
  };

  // 处理左右滑动
  const handleSwipeLeft = () => {
    setSwipeDirection('左滑');
    setTestResults(prev => ({...prev, swipeGesture: true}));
  };

  const handleSwipeRight = () => {
    setSwipeDirection('右滑');
    setTestResults(prev => ({...prev, swipeGesture: true}));
  };

  // 检查所有测试是否通过
  const allTestsPassed = Object.values(testResults).every(result => result === true);

  return (
    <div className="mobile-test-container">
      <h1>移动端组件测试</h1>
      
      <div className="test-section">
        <h2>测试说明</h2>
        <p>请在移动设备或使用浏览器的移动设备模拟器进行以下测试：</p>
        <ol>
          <li>点击底部导航栏的不同选项</li>
          <li>下拉页面顶部触发刷新</li>
          <li>左右滑动页面测试手势</li>
        </ol>
      </div>

      <SwipeGesture
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      >
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="test-content">
            <div className="test-section">
              <h2>测试结果</h2>
              <div className="test-result-item">
                <span>底部导航：</span>
                <span className={testResults.bottomNav ? 'passed' : 'pending'}>
                  {testResults.bottomNav ? '通过' : '待测试'}
                </span>
              </div>
              <div className="test-result-item">
                <span>下拉刷新：</span>
                <span className={testResults.pullToRefresh ? 'passed' : 'pending'}>
                  {testResults.pullToRefresh ? '通过' : '待测试'}
                </span>
              </div>
              <div className="test-result-item">
                <span>滑动手势：</span>
                <span className={testResults.swipeGesture ? 'passed' : 'pending'}>
                  {testResults.swipeGesture ? '通过' : '待测试'}
                </span>
              </div>
              <div className="test-summary">
                <span>总体结果：</span>
                <span className={allTestsPassed ? 'all-passed' : 'pending'}>
                  {allTestsPassed ? '所有测试通过' : '测试进行中'}
                </span>
              </div>
            </div>

            <div className="test-section">
              <h2>实时数据</h2>
              <p>当前选中的导航项: <strong>{activeTab}</strong></p>
              <p>刷新次数: <strong>{refreshCount}</strong></p>
              <p>最近滑动方向: <strong>{swipeDirection}</strong></p>
            </div>

            <div className="test-section">
              <h2>多账号协作测试</h2>
              <p>此测试组件已按照多账号协作机制开发，符合以下规范：</p>
              <ul>
                <li>遵循CB-MOBILE账号职责范围</li>
                <li>使用feature/CB-MOBILE-mobile-components分支</li>
                <li>组件设计与CB-DESIGN提供的规范一致</li>
                <li>与CB-FRONTEND账号共享组件接口</li>
              </ul>
            </div>
          </div>
        </PullToRefresh>
      </SwipeGesture>
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default MobileTest;
