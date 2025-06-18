import React, { useState, useEffect } from 'react';
import './RewardSystem.css';

const RewardSystem = ({ user, onPointsUpdate }) => {
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, title: '完成一节语言课程', points: 50, completed: false, icon: '📚' },
    { id: 2, title: '参与文化讨论', points: 30, completed: false, icon: '💬' },
    { id: 3, title: '分享文化内容', points: 40, completed: false, icon: '📤' },
    { id: 4, title: '帮助其他学习者', points: 60, completed: false, icon: '🤝' }
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: '初学者', description: '完成第一节课程', icon: '🌱', unlocked: true },
    { id: 2, title: '文化探索者', description: '探索5种不同文化', icon: '🌍', unlocked: true },
    { id: 3, title: '语言大师', description: '掌握3种语言基础', icon: '🗣️', unlocked: false },
    { id: 4, title: '社区贡献者', description: '帮助100位学习者', icon: '⭐', unlocked: false }
  ]);

  const [rewardStore, setRewardStore] = useState([
    { id: 1, title: '专属头像框', cost: 100, icon: '🖼️', type: 'cosmetic' },
    { id: 2, title: '高级课程解锁', cost: 200, icon: '🔓', type: 'feature' },
    { id: 3, title: '私人导师1小时', cost: 500, icon: '👨‍🏫', type: 'service' },
    { id: 4, title: '文化体验券', cost: 300, icon: '🎫', type: 'experience' }
  ]);

  const completeTask = (taskId) => {
    setDailyTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: true }
          : task
      )
    );
    
    const task = dailyTasks.find(t => t.id === taskId);
    if (task && onPointsUpdate) {
      onPointsUpdate(task.points);
    }
  };

  const purchaseReward = (rewardId) => {
    const reward = rewardStore.find(r => r.id === rewardId);
    if (reward && user.points >= reward.cost) {
      // 扣除积分并给予奖励
      onPointsUpdate(-reward.cost);
      alert(`成功购买 ${reward.title}！`);
    } else {
      alert('积分不足！');
    }
  };

  const calculateProgress = () => {
    const completedTasks = dailyTasks.filter(task => task.completed).length;
    return (completedTasks / dailyTasks.length) * 100;
  };

  return (
    <div className="reward-system">
      <div className="reward-header">
        <h2>奖励系统</h2>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{user.points}</span>
            <span className="stat-label">积分</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{user.level}</span>
            <span className="stat-label">等级</span>
          </div>
        </div>
      </div>

      <div className="daily-tasks">
        <h3>每日任务</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <div className="tasks-list">
          {dailyTasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <span className="task-icon">{task.icon}</span>
              <div className="task-content">
                <h4>{task.title}</h4>
                <span className="task-points">+{task.points} 积分</span>
              </div>
              {!task.completed && (
                <button 
                  className="complete-btn"
                  onClick={() => completeTask(task.id)}
                >
                  完成
                </button>
              )}
              {task.completed && (
                <span className="completed-icon">✅</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="achievements">
        <h3>成就徽章</h3>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <span className="achievement-icon">{achievement.icon}</span>
              <h4>{achievement.title}</h4>
              <p>{achievement.description}</p>
              {!achievement.unlocked && <div className="lock-overlay">🔒</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="reward-store">
        <h3>奖励商店</h3>
        <div className="store-grid">
          {rewardStore.map(reward => (
            <div key={reward.id} className="store-item">
              <span className="store-icon">{reward.icon}</span>
              <h4>{reward.title}</h4>
              <div className="store-cost">
                <span className="cost-value">{reward.cost}</span>
                <span className="cost-currency">积分</span>
              </div>
              <button 
                className="purchase-btn"
                onClick={() => purchaseReward(reward.id)}
                disabled={user.points < reward.cost}
              >
                {user.points >= reward.cost ? '购买' : '积分不足'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardSystem;

