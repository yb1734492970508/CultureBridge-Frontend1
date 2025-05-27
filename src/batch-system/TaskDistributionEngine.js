// 批处理自动化协作系统 - 任务分发引擎

/**
 * 任务分发引擎
 * 
 * 该模块负责智能分配任务给多个Manus账号，
 * 确保任务均衡分配、积分合理消耗，并处理任务依赖关系。
 */

const EventEmitter = require('events');

class TaskDistributionEngine extends EventEmitter {
  constructor(credentialManager) {
    super();
    this.credentialManager = credentialManager;
    this.tasks = new Map();
    this.accountTasks = new Map();
    this.accountCredits = new Map();
    this.taskDependencies = new Map();
    this.taskPriorities = new Map();
    this.taskStatus = new Map();
    this.maxCreditsPerAccount = 300; // 每个账号每天最大积分消耗
  }

  /**
   * 初始化任务分发引擎
   * @returns {Promise<boolean>} - 初始化是否成功
   */
  async initialize() {
    try {
      // 获取所有账号ID
      const accountIds = this.credentialManager.getAllAccountIds();
      
      // 初始化每个账号的任务列表和积分消耗
      for (const accountId of accountIds) {
        this.accountTasks.set(accountId, []);
        this.accountCredits.set(accountId, 0);
      }
      
      return true;
    } catch (error) {
      console.error('初始化任务分发引擎失败:', error);
      return false;
    }
  }

  /**
   * 添加任务
   * @param {string} taskId - 任务ID
   * @param {Object} taskData - 任务数据
   * @param {number} priority - 任务优先级（1-10，10为最高）
   * @param {Array<string>} dependencies - 依赖任务ID列表
   * @param {number} estimatedCredits - 估计消耗的积分
   * @returns {boolean} - 添加是否成功
   */
  addTask(taskId, taskData, priority = 5, dependencies = [], estimatedCredits = 10) {
    try {
      // 检查任务ID是否已存在
      if (this.tasks.has(taskId)) {
        throw new Error(`任务ID ${taskId} 已存在`);
      }
      
      // 存储任务数据
      this.tasks.set(taskId, {
        id: taskId,
        data: taskData,
        estimatedCredits,
        assignedTo: null,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null
      });
      
      // 存储任务优先级
      this.taskPriorities.set(taskId, priority);
      
      // 存储任务依赖
      this.taskDependencies.set(taskId, dependencies);
      
      // 设置任务状态为待分配
      this.taskStatus.set(taskId, 'pending');
      
      // 触发任务添加事件
      this.emit('taskAdded', taskId);
      
      return true;
    } catch (error) {
      console.error(`添加任务 ${taskId} 失败:`, error);
      return false;
    }
  }

  /**
   * 批量添加任务
   * @param {Array<Object>} tasks - 任务列表
   * @returns {boolean} - 添加是否成功
   */
  addBulkTasks(tasks) {
    try {
      for (const task of tasks) {
        this.addTask(
          task.id,
          task.data,
          task.priority || 5,
          task.dependencies || [],
          task.estimatedCredits || 10
        );
      }
      
      return true;
    } catch (error) {
      console.error('批量添加任务失败:', error);
      return false;
    }
  }

  /**
   * 获取可执行任务列表
   * @returns {Array<string>} - 可执行任务ID列表
   */
  getExecutableTasks() {
    const executableTasks = [];
    
    // 遍历所有待分配的任务
    for (const [taskId, status] of this.taskStatus.entries()) {
      if (status !== 'pending') continue;
      
      // 检查任务依赖是否已完成
      const dependencies = this.taskDependencies.get(taskId) || [];
      const allDependenciesCompleted = dependencies.every(depId => 
        this.taskStatus.get(depId) === 'completed'
      );
      
      if (allDependenciesCompleted) {
        executableTasks.push(taskId);
      }
    }
    
    // 按优先级排序
    return executableTasks.sort((a, b) => {
      const priorityA = this.taskPriorities.get(a) || 5;
      const priorityB = this.taskPriorities.get(b) || 5;
      return priorityB - priorityA; // 高优先级在前
    });
  }

  /**
   * 分配任务给账号
   * @param {string} taskId - 任务ID
   * @param {string} accountId - 账号ID
   * @returns {boolean} - 分配是否成功
   */
  assignTask(taskId, accountId) {
    try {
      // 检查任务是否存在且状态为待分配
      if (!this.tasks.has(taskId) || this.taskStatus.get(taskId) !== 'pending') {
        throw new Error(`任务 ${taskId} 不存在或状态不是待分配`);
      }
      
      // 检查账号是否存在
      if (!this.accountTasks.has(accountId)) {
        throw new Error(`账号 ${accountId} 不存在`);
      }
      
      // 获取任务数据
      const task = this.tasks.get(taskId);
      
      // 检查账号积分是否足够
      const currentCredits = this.accountCredits.get(accountId) || 0;
      if (currentCredits + task.estimatedCredits > this.maxCreditsPerAccount) {
        throw new Error(`账号 ${accountId} 积分不足，当前: ${currentCredits}, 需要: ${task.estimatedCredits}, 最大: ${this.maxCreditsPerAccount}`);
      }
      
      // 更新任务分配信息
      task.assignedTo = accountId;
      task.startedAt = new Date();
      this.tasks.set(taskId, task);
      
      // 更新任务状态
      this.taskStatus.set(taskId, 'assigned');
      
      // 更新账号任务列表
      const accountTasks = this.accountTasks.get(accountId) || [];
      accountTasks.push(taskId);
      this.accountTasks.set(accountId, accountTasks);
      
      // 更新账号积分消耗
      this.accountCredits.set(accountId, currentCredits + task.estimatedCredits);
      
      // 触发任务分配事件
      this.emit('taskAssigned', { taskId, accountId });
      
      return true;
    } catch (error) {
      console.error(`分配任务 ${taskId} 给账号 ${accountId} 失败:`, error);
      return false;
    }
  }

  /**
   * 自动分配任务
   * @returns {number} - 成功分配的任务数量
   */
  autoAssignTasks() {
    try {
      let assignedCount = 0;
      
      // 获取可执行任务
      const executableTasks = this.getExecutableTasks();
      if (executableTasks.length === 0) {
        return 0;
      }
      
      // 获取所有账号ID
      const accountIds = Array.from(this.accountTasks.keys());
      
      // 按当前积分消耗排序账号（积分消耗少的优先）
      const sortedAccounts = accountIds.sort((a, b) => {
        const creditsA = this.accountCredits.get(a) || 0;
        const creditsB = this.accountCredits.get(b) || 0;
        return creditsA - creditsB;
      });
      
      // 为每个任务找到合适的账号
      for (const taskId of executableTasks) {
        const task = this.tasks.get(taskId);
        
        // 寻找合适的账号
        for (const accountId of sortedAccounts) {
          const currentCredits = this.accountCredits.get(accountId) || 0;
          
          // 检查账号积分是否足够
          if (currentCredits + task.estimatedCredits <= this.maxCreditsPerAccount) {
            // 分配任务
            if (this.assignTask(taskId, accountId)) {
              assignedCount++;
              break;
            }
          }
        }
      }
      
      return assignedCount;
    } catch (error) {
      console.error('自动分配任务失败:', error);
      return 0;
    }
  }

  /**
   * 完成任务
   * @param {string} taskId - 任务ID
   * @param {number} actualCredits - 实际消耗的积分
   * @returns {boolean} - 完成是否成功
   */
  completeTask(taskId, actualCredits) {
    try {
      // 检查任务是否存在且状态为已分配
      if (!this.tasks.has(taskId) || this.taskStatus.get(taskId) !== 'assigned') {
        throw new Error(`任务 ${taskId} 不存在或状态不是已分配`);
      }
      
      // 获取任务数据
      const task = this.tasks.get(taskId);
      const accountId = task.assignedTo;
      
      // 更新任务完成信息
      task.completedAt = new Date();
      this.tasks.set(taskId, task);
      
      // 更新任务状态
      this.taskStatus.set(taskId, 'completed');
      
      // 更新账号积分消耗（调整为实际消耗）
      const estimatedCredits = task.estimatedCredits;
      const currentCredits = this.accountCredits.get(accountId) || 0;
      this.accountCredits.set(accountId, currentCredits - estimatedCredits + actualCredits);
      
      // 触发任务完成事件
      this.emit('taskCompleted', { taskId, accountId, actualCredits });
      
      return true;
    } catch (error) {
      console.error(`完成任务 ${taskId} 失败:`, error);
      return false;
    }
  }

  /**
   * 获取账号任务列表
   * @param {string} accountId - 账号ID
   * @returns {Array<Object>} - 任务列表
   */
  getAccountTasks(accountId) {
    try {
      // 检查账号是否存在
      if (!this.accountTasks.has(accountId)) {
        throw new Error(`账号 ${accountId} 不存在`);
      }
      
      // 获取账号任务ID列表
      const taskIds = this.accountTasks.get(accountId) || [];
      
      // 获取任务详情
      return taskIds.map(taskId => {
        const task = this.tasks.get(taskId);
        const status = this.taskStatus.get(taskId);
        return { ...task, status };
      });
    } catch (error) {
      console.error(`获取账号 ${accountId} 任务列表失败:`, error);
      return [];
    }
  }

  /**
   * 获取账号积分消耗
   * @param {string} accountId - 账号ID
   * @returns {number} - 积分消耗
   */
  getAccountCredits(accountId) {
    try {
      // 检查账号是否存在
      if (!this.accountCredits.has(accountId)) {
        throw new Error(`账号 ${accountId} 不存在`);
      }
      
      return this.accountCredits.get(accountId) || 0;
    } catch (error) {
      console.error(`获取账号 ${accountId} 积分消耗失败:`, error);
      return 0;
    }
  }

  /**
   * 获取所有账号积分消耗
   * @returns {Object} - 账号积分消耗映射
   */
  getAllAccountCredits() {
    return Object.fromEntries(this.accountCredits);
  }

  /**
   * 获取任务状态
   * @param {string} taskId - 任务ID
   * @returns {string} - 任务状态
   */
  getTaskStatus(taskId) {
    return this.taskStatus.get(taskId) || 'unknown';
  }

  /**
   * 获取所有任务状态
   * @returns {Object} - 任务状态映射
   */
  getAllTaskStatus() {
    return Object.fromEntries(this.taskStatus);
  }

  /**
   * 重置每日积分消耗
   * @returns {boolean} - 重置是否成功
   */
  resetDailyCredits() {
    try {
      // 获取所有账号ID
      const accountIds = this.credentialManager.getAllAccountIds();
      
      // 重置每个账号的积分消耗
      for (const accountId of accountIds) {
        this.accountCredits.set(accountId, 0);
      }
      
      // 触发积分重置事件
      this.emit('creditsReset');
      
      return true;
    } catch (error) {
      console.error('重置每日积分消耗失败:', error);
      return false;
    }
  }

  /**
   * 设置每个账号每日最大积分消耗
   * @param {number} maxCredits - 最大积分消耗
   */
  setMaxCreditsPerAccount(maxCredits) {
    this.maxCreditsPerAccount = maxCredits;
  }

  /**
   * 获取任务执行统计
   * @returns {Object} - 任务统计信息
   */
  getTaskStats() {
    let pending = 0;
    let assigned = 0;
    let completed = 0;
    
    for (const status of this.taskStatus.values()) {
      if (status === 'pending') pending++;
      else if (status === 'assigned') assigned++;
      else if (status === 'completed') completed++;
    }
    
    return {
      total: this.tasks.size,
      pending,
      assigned,
      completed
    };
  }
}

module.exports = TaskDistributionEngine;
