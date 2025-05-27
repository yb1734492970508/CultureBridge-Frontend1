// 批处理自动化协作系统 - 反馈收集与优化模块

/**
 * 反馈收集与优化模块
 * 
 * 该模块负责收集用户反馈，监控系统性能，
 * 并提供自动优化建议，帮助持续改进批处理系统。
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class FeedbackOptimizer extends EventEmitter {
  constructor(configPath) {
    super();
    this.configPath = configPath || path.join(process.cwd(), 'feedback-data.json');
    this.feedbackData = {
      usageStats: {
        startCount: 0,
        taskAssignments: 0,
        completedTasks: 0,
        errorCount: 0,
        lastUsed: null
      },
      performanceMetrics: {
        avgTaskAssignTime: 0,
        avgTaskCompletionTime: 0,
        avgCreditEfficiency: 0, // 实际消耗积分/估计消耗积分的比率
        accountUtilization: {} // 每个账号的利用率
      },
      userFeedback: [],
      systemSuggestions: []
    };
    this.isInitialized = false;
  }

  /**
   * 初始化反馈优化器
   * @returns {Promise<boolean>} - 初始化是否成功
   */
  async initialize() {
    try {
      // 如果存在反馈数据文件，则加载
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        this.feedbackData = JSON.parse(data);
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('初始化反馈优化器失败:', error);
      return false;
    }
  }

  /**
   * 记录系统使用情况
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   */
  logUsage(eventType, data = {}) {
    if (!this.isInitialized) {
      console.error('反馈优化器未初始化');
      return;
    }
    
    // 更新最后使用时间
    this.feedbackData.usageStats.lastUsed = new Date().toISOString();
    
    // 根据事件类型更新统计数据
    switch (eventType) {
      case 'systemStart':
        this.feedbackData.usageStats.startCount++;
        break;
      case 'taskAssigned':
        this.feedbackData.usageStats.taskAssignments++;
        this._updateTaskAssignmentMetrics(data);
        break;
      case 'taskCompleted':
        this.feedbackData.usageStats.completedTasks++;
        this._updateTaskCompletionMetrics(data);
        break;
      case 'error':
        this.feedbackData.usageStats.errorCount++;
        this._logError(data);
        break;
      default:
        // 记录其他类型的事件
        break;
    }
    
    // 保存更新后的数据
    this._saveData();
    
    // 触发事件
    this.emit('usageLogged', { eventType, data });
  }

  /**
   * 添加用户反馈
   * @param {Object} feedback - 用户反馈
   * @returns {boolean} - 添加是否成功
   */
  addUserFeedback(feedback) {
    if (!this.isInitialized) {
      console.error('反馈优化器未初始化');
      return false;
    }
    
    // 验证反馈数据
    if (!feedback.rating || !feedback.comment) {
      console.error('反馈数据不完整');
      return false;
    }
    
    // 添加时间戳
    feedback.timestamp = new Date().toISOString();
    
    // 添加到反馈列表
    this.feedbackData.userFeedback.push(feedback);
    
    // 保存更新后的数据
    this._saveData();
    
    // 触发事件
    this.emit('feedbackAdded', feedback);
    
    // 生成优化建议
    this._generateOptimizationSuggestions();
    
    return true;
  }

  /**
   * 获取系统性能报告
   * @returns {Object} - 性能报告
   */
  getPerformanceReport() {
    if (!this.isInitialized) {
      console.error('反馈优化器未初始化');
      return null;
    }
    
    // 计算额外的性能指标
    const completionRate = this.feedbackData.usageStats.completedTasks / 
                          (this.feedbackData.usageStats.taskAssignments || 1);
    
    const errorRate = this.feedbackData.usageStats.errorCount / 
                     (this.feedbackData.usageStats.startCount || 1);
    
    // 构建性能报告
    return {
      usageStats: { ...this.feedbackData.usageStats },
      performanceMetrics: { ...this.feedbackData.performanceMetrics },
      derivedMetrics: {
        completionRate,
        errorRate,
        systemHealth: 1 - (errorRate / 10) // 简单的健康度计算
      },
      suggestions: this._getTopSuggestions(3)
    };
  }

  /**
   * 获取用户反馈摘要
   * @returns {Object} - 反馈摘要
   */
  getFeedbackSummary() {
    if (!this.isInitialized) {
      console.error('反馈优化器未初始化');
      return null;
    }
    
    // 如果没有反馈，返回空摘要
    if (this.feedbackData.userFeedback.length === 0) {
      return {
        count: 0,
        averageRating: 0,
        topIssues: [],
        topPraises: []
      };
    }
    
    // 计算平均评分
    const totalRating = this.feedbackData.userFeedback.reduce(
      (sum, feedback) => sum + feedback.rating, 
      0
    );
    const averageRating = totalRating / this.feedbackData.userFeedback.length;
    
    // 分析反馈内容，提取常见问题和赞扬
    const issues = [];
    const praises = [];
    
    this.feedbackData.userFeedback.forEach(feedback => {
      if (feedback.rating <= 3) {
        // 评分低于等于3分的视为问题
        if (feedback.issues && feedback.issues.length > 0) {
          issues.push(...feedback.issues);
        } else if (feedback.comment) {
          issues.push(feedback.comment);
        }
      } else {
        // 评分高于3分的视为赞扬
        if (feedback.praises && feedback.praises.length > 0) {
          praises.push(...feedback.praises);
        } else if (feedback.comment) {
          praises.push(feedback.comment);
        }
      }
    });
    
    // 简单统计最常见的问题和赞扬
    const topIssues = this._getTopItems(issues, 3);
    const topPraises = this._getTopItems(praises, 3);
    
    return {
      count: this.feedbackData.userFeedback.length,
      averageRating,
      topIssues,
      topPraises
    };
  }

  /**
   * 生成优化建议报告
   * @param {string} outputPath - 输出文件路径
   * @returns {Promise<boolean>} - 生成是否成功
   */
  async generateOptimizationReport(outputPath) {
    if (!this.isInitialized) {
      console.error('反馈优化器未初始化');
      return false;
    }
    
    try {
      // 获取性能报告和反馈摘要
      const performanceReport = this.getPerformanceReport();
      const feedbackSummary = this.getFeedbackSummary();
      
      // 生成完整的优化报告
      const report = {
        generatedAt: new Date().toISOString(),
        systemVersion: '1.0.0',
        performanceReport,
        feedbackSummary,
        optimizationSuggestions: this.feedbackData.systemSuggestions,
        actionItems: this._generateActionItems()
      };
      
      // 将报告写入文件
      const reportJson = JSON.stringify(report, null, 2);
      fs.writeFileSync(outputPath, reportJson);
      
      // 生成人类可读的Markdown报告
      const mdReportPath = outputPath.replace(/\.json$/, '.md');
      await this._generateMarkdownReport(report, mdReportPath);
      
      return true;
    } catch (error) {
      console.error('生成优化建议报告失败:', error);
      return false;
    }
  }

  /**
   * 重置使用统计
   * @returns {boolean} - 重置是否成功
   */
  resetUsageStats() {
    if (!this.isInitialized) {
      console.error('反馈优化器未初始化');
      return false;
    }
    
    // 保存历史数据
    const historyPath = this.configPath.replace(/\.json$/, `-history-${Date.now()}.json`);
    fs.writeFileSync(historyPath, JSON.stringify(this.feedbackData, null, 2));
    
    // 重置使用统计
    this.feedbackData.usageStats = {
      startCount: 0,
      taskAssignments: 0,
      completedTasks: 0,
      errorCount: 0,
      lastUsed: new Date().toISOString()
    };
    
    // 重置性能指标
    this.feedbackData.performanceMetrics = {
      avgTaskAssignTime: 0,
      avgTaskCompletionTime: 0,
      avgCreditEfficiency: 0,
      accountUtilization: {}
    };
    
    // 保留用户反馈和系统建议
    
    // 保存更新后的数据
    this._saveData();
    
    return true;
  }

  /**
   * 更新任务分配指标
   * @private
   * @param {Object} data - 任务分配数据
   */
  _updateTaskAssignmentMetrics(data) {
    const { taskId, accountId, assignTime } = data;
    
    if (!assignTime) return;
    
    // 更新平均任务分配时间
    const currentAvg = this.feedbackData.performanceMetrics.avgTaskAssignTime;
    const currentCount = this.feedbackData.usageStats.taskAssignments - 1;
    
    this.feedbackData.performanceMetrics.avgTaskAssignTime = 
      (currentAvg * currentCount + assignTime) / (currentCount + 1);
    
    // 更新账号利用率
    const utilization = this.feedbackData.performanceMetrics.accountUtilization;
    utilization[accountId] = (utilization[accountId] || 0) + 1;
  }

  /**
   * 更新任务完成指标
   * @private
   * @param {Object} data - 任务完成数据
   */
  _updateTaskCompletionMetrics(data) {
    const { taskId, accountId, completionTime, estimatedCredits, actualCredits } = data;
    
    if (!completionTime) return;
    
    // 更新平均任务完成时间
    const currentAvg = this.feedbackData.performanceMetrics.avgTaskCompletionTime;
    const currentCount = this.feedbackData.usageStats.completedTasks - 1;
    
    this.feedbackData.performanceMetrics.avgTaskCompletionTime = 
      (currentAvg * currentCount + completionTime) / (currentCount + 1);
    
    // 更新积分效率
    if (estimatedCredits && actualCredits) {
      const efficiency = actualCredits / estimatedCredits;
      const currentEfficiency = this.feedbackData.performanceMetrics.avgCreditEfficiency;
      
      this.feedbackData.performanceMetrics.avgCreditEfficiency = 
        (currentEfficiency * currentCount + efficiency) / (currentCount + 1);
    }
  }

  /**
   * 记录错误
   * @private
   * @param {Object} data - 错误数据
   */
  _logError(data) {
    // 可以在这里实现更详细的错误日志记录
    console.error('系统错误:', data.message || data);
  }

  /**
   * 保存数据到文件
   * @private
   */
  _saveData() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.feedbackData, null, 2));
    } catch (error) {
      console.error('保存反馈数据失败:', error);
    }
  }

  /**
   * 生成优化建议
   * @private
   */
  _generateOptimizationSuggestions() {
    const suggestions = [];
    
    // 基于任务完成率的建议
    const completionRate = this.feedbackData.usageStats.completedTasks / 
                          (this.feedbackData.usageStats.taskAssignments || 1);
    
    if (completionRate < 0.8) {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        issue: '任务完成率低',
        suggestion: '检查任务分配算法，确保任务与账号能力匹配',
        impact: '提高整体系统效率和积分利用率'
      });
    }
    
    // 基于错误率的建议
    const errorRate = this.feedbackData.usageStats.errorCount / 
                     (this.feedbackData.usageStats.startCount || 1);
    
    if (errorRate > 0.2) {
      suggestions.push({
        type: 'reliability',
        priority: 'critical',
        issue: '系统错误率高',
        suggestion: '增强错误处理和恢复机制，添加更详细的日志记录',
        impact: '提高系统稳定性和用户体验'
      });
    }
    
    // 基于积分效率的建议
    const creditEfficiency = this.feedbackData.performanceMetrics.avgCreditEfficiency;
    
    if (creditEfficiency > 1.2) {
      suggestions.push({
        type: 'resource',
        priority: 'medium',
        issue: '积分消耗估计不准确（实际高于估计）',
        suggestion: '调整任务积分估算算法，提高预测准确性',
        impact: '更好地控制积分消耗，避免超出限制'
      });
    } else if (creditEfficiency < 0.8) {
      suggestions.push({
        type: 'resource',
        priority: 'low',
        issue: '积分利用率低（实际低于估计）',
        suggestion: '优化任务分配，确保充分利用每个账号的积分额度',
        impact: '最大化积分利用，提高开发效率'
      });
    }
    
    // 基于账号利用率的建议
    const utilization = this.feedbackData.performanceMetrics.accountUtilization;
    const accountIds = Object.keys(utilization);
    
    if (accountIds.length > 0) {
      const totalAssignments = accountIds.reduce((sum, id) => sum + utilization[id], 0);
      const avgAssignments = totalAssignments / accountIds.length;
      
      // 检查账号利用不均衡
      const imbalanced = accountIds.some(id => {
        const ratio = utilization[id] / avgAssignments;
        return ratio > 2 || ratio < 0.5;
      });
      
      if (imbalanced) {
        suggestions.push({
          type: 'balance',
          priority: 'medium',
          issue: '账号利用不均衡',
          suggestion: '改进负载均衡算法，确保任务更均匀地分配给所有账号',
          impact: '提高整体资源利用效率，避免部分账号过载'
        });
      }
    }
    
    // 添加时间戳
    const timestamp = new Date().toISOString();
    suggestions.forEach(s => s.timestamp = timestamp);
    
    // 添加到系统建议列表
    this.feedbackData.systemSuggestions.push(...suggestions);
    
    // 限制建议列表大小
    if (this.feedbackData.systemSuggestions.length > 50) {
      this.feedbackData.systemSuggestions = this.feedbackData.systemSuggestions.slice(-50);
    }
    
    // 保存更新后的数据
    this._saveData();
    
    // 触发事件
    if (suggestions.length > 0) {
      this.emit('suggestionsGenerated', suggestions);
    }
  }

  /**
   * 获取前N个最常见的项目
   * @private
   * @param {Array<string>} items - 项目列表
   * @param {number} count - 返回数量
   * @returns {Array<{item: string, count: number}>} - 最常见项目列表
   */
  _getTopItems(items, count) {
    const itemCounts = {};
    
    // 统计每个项目出现的次数
    items.forEach(item => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });
    
    // 转换为数组并排序
    const sortedItems = Object.entries(itemCounts)
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count);
    
    // 返回前N个
    return sortedItems.slice(0, count);
  }

  /**
   * 获取前N个最高优先级的建议
   * @private
   * @param {number} count - 返回数量
   * @returns {Array<Object>} - 建议列表
   */
  _getTopSuggestions(count) {
    // 优先级映射
    const priorityMap = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    // 按优先级排序
    const sortedSuggestions = [...this.feedbackData.systemSuggestions]
      .sort((a, b) => {
        const priorityA = priorityMap[a.priority] || 0;
        const priorityB = priorityMap[b.priority] || 0;
        return priorityB - priorityA;
      });
    
    // 返回前N个
    return sortedSuggestions.slice(0, count);
  }

  /**
   * 生成行动项目
   * @private
   * @returns {Array<Object>} - 行动项目列表
   */
  _generateActionItems() {
    const actionItems = [];
    const suggestions = this._getTopSuggestions(5);
    
    // 将建议转换为行动项目
    suggestions.forEach(suggestion => {
      actionItems.push({
        title: `解决: ${suggestion.issue}`,
        description: suggestion.suggestion,
        priority: suggestion.priority,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    });
    
    // 添加基于用户反馈的行动项目
    const feedbackSummary = this.getFeedbackSummary();
    
    feedbackSummary.topIssues.forEach(issue => {
      actionItems.push({
        title: `改进: ${issue.item.substring(0, 50)}...`,
        description: `基于用户反馈: "${issue.item}"`,
        priority: 'high',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    });
    
    return actionItems;
  }

  /**
   * 生成Markdown格式的报告
   * @private
   * @param {Object} report - 报告数据
   * @param {string} outputPath - 输出文件路径
   * @returns {Promise<boolean>} - 生成是否成功
   */
  async _generateMarkdownReport(report, outputPath) {
    try {
      let markdown = `# CultureBridge 批处理自动化系统优化报告\n\n`;
      markdown += `**生成时间:** ${new Date(report.generatedAt).toLocaleString()}\n`;
      markdown += `**系统版本:** ${report.systemVersion}\n\n`;
      
      // 性能报告部分
      markdown += `## 系统性能报告\n\n`;
      markdown += `### 使用统计\n\n`;
      markdown += `- **启动次数:** ${report.performanceReport.usageStats.startCount}\n`;
      markdown += `- **任务分配次数:** ${report.performanceReport.usageStats.taskAssignments}\n`;
      markdown += `- **任务完成次数:** ${report.performanceReport.usageStats.completedTasks}\n`;
      markdown += `- **错误次数:** ${report.performanceReport.usageStats.errorCount}\n`;
      markdown += `- **最后使用时间:** ${new Date(report.performanceReport.usageStats.lastUsed).toLocaleString()}\n\n`;
      
      markdown += `### 性能指标\n\n`;
      markdown += `- **平均任务分配时间:** ${report.performanceReport.performanceMetrics.avgTaskAssignTime.toFixed(2)}ms\n`;
      markdown += `- **平均任务完成时间:** ${report.performanceReport.performanceMetrics.avgTaskCompletionTime.toFixed(2)}s\n`;
      markdown += `- **平均积分效率:** ${report.performanceReport.performanceMetrics.avgCreditEfficiency.toFixed(2)}\n`;
      markdown += `- **任务完成率:** ${(report.performanceReport.derivedMetrics.completionRate * 100).toFixed(2)}%\n`;
      markdown += `- **错误率:** ${(report.performanceReport.derivedMetrics.errorRate * 100).toFixed(2)}%\n`;
      markdown += `- **系统健康度:** ${(report.performanceReport.derivedMetrics.systemHealth * 100).toFixed(2)}%\n\n`;
      
      // 账号利用率
      markdown += `### 账号利用率\n\n`;
      markdown += `| 账号ID | 任务分配次数 |\n`;
      markdown += `|--------|------------|\n`;
      
      const utilization = report.performanceReport.performanceMetrics.accountUtilization;
      Object.entries(utilization).forEach(([accountId, count]) => {
        markdown += `| ${accountId} | ${count} |\n`;
      });
      
      markdown += `\n`;
      
      // 用户反馈摘要
      markdown += `## 用户反馈摘要\n\n`;
      markdown += `- **反馈总数:** ${report.feedbackSummary.count}\n`;
      markdown += `- **平均评分:** ${report.feedbackSummary.averageRating.toFixed(2)}/5\n\n`;
      
      if (report.feedbackSummary.topIssues.length > 0) {
        markdown += `### 主要问题\n\n`;
        report.feedbackSummary.topIssues.forEach((issue, index) => {
          markdown += `${index + 1}. **${issue.item}** (提及 ${issue.count} 次)\n`;
        });
        markdown += `\n`;
      }
      
      if (report.feedbackSummary.topPraises.length > 0) {
        markdown += `### 主要赞扬\n\n`;
        report.feedbackSummary.topPraises.forEach((praise, index) => {
          markdown += `${index + 1}. **${praise.item}** (提及 ${praise.count} 次)\n`;
        });
        markdown += `\n`;
      }
      
      // 优化建议
      markdown += `## 优化建议\n\n`;
      
      if (report.optimizationSuggestions.length > 0) {
        markdown += `| 优先级 | 问题 | 建议 | 影响 |\n`;
        markdown += `|--------|------|------|------|\n`;
        
        report.optimizationSuggestions.slice(-5).forEach(suggestion => {
          markdown += `| ${suggestion.priority} | ${suggestion.issue} | ${suggestion.suggestion} | ${suggestion.impact} |\n`;
        });
      } else {
        markdown += `*暂无优化建议*\n`;
      }
      
      markdown += `\n`;
      
      // 行动项目
      markdown += `## 建议行动项目\n\n`;
      
      if (report.actionItems.length > 0) {
        markdown += `| 优先级 | 行动项目 | 描述 |\n`;
        markdown += `|--------|----------|------|\n`;
        
        report.actionItems.forEach(item => {
          markdown += `| ${item.priority} | ${item.title} | ${item.description} |\n`;
        });
      } else {
        markdown += `*暂无行动项目*\n`;
      }
      
      // 写入文件
      fs.writeFileSync(outputPath, markdown);
      
      return true;
    } catch (error) {
      console.error('生成Markdown报告失败:', error);
      return false;
    }
  }
}

module.exports = FeedbackOptimizer;
