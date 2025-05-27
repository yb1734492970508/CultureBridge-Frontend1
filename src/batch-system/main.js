#!/usr/bin/env node

/**
 * CultureBridge 批处理自动化系统 - 主控脚本
 * 
 * 该脚本是批处理自动化系统的入口点，负责协调所有组件工作，
 * 实现多账号自动化协作开发CultureBridge项目。
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');

// 导入核心模块
const CredentialManager = require('./CredentialManager');
const TaskDistributionEngine = require('./TaskDistributionEngine');
const AccountManager = require('./AccountManager');
const ReportGenerator = require('./ReportGenerator');
const GitHubIntegration = require('./GitHubIntegration');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 全局配置
const CONFIG_DIR = path.join(process.cwd(), '.culture-bridge');
const CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.enc');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

// 全局变量
let credentialManager;
let taskEngine;
let accountManager;
let reportGenerator;
let githubIntegration;
let config = {
  maxCreditsPerAccount: 300,
  mainAccountId: '',
  taskDefinitions: [],
  githubToken: '',
  githubRepo: 'yb1734492970508/CultureBridge-Frontend1'
};

/**
 * 显示欢迎信息
 */
function showWelcome() {
  console.log(
    chalk.cyan(
      figlet.textSync('CultureBridge', { horizontalLayout: 'full' })
    )
  );
  console.log(chalk.green('批处理自动化系统 v1.0.0'));
  console.log(chalk.yellow('支持多账号协作开发，自动控制积分消耗\n'));
}

/**
 * 确保配置目录存在
 */
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * 加载配置
 */
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
      config = { ...config, ...JSON.parse(configData) };
      return true;
    } catch (error) {
      console.error('加载配置失败:', error);
      return false;
    }
  }
  return false;
}

/**
 * 保存配置
 */
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('保存配置失败:', error);
    return false;
  }
}

/**
 * 安全地询问密码（不显示输入）
 * @param {string} prompt - 提示信息
 * @returns {Promise<string>} - 用户输入的密码
 */
function askPassword(prompt) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    
    stdout.write(prompt);
    
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    
    let password = '';
    
    stdin.on('data', function listener(char) {
      char = char.toString('utf8');
      
      // 按下Ctrl+C退出
      if (char === '\u0003') {
        stdout.write('\n');
        process.exit(1);
      }
      
      // 按下回车完成输入
      if (char === '\r' || char === '\n') {
        stdout.write('\n');
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', listener);
        resolve(password);
        return;
      }
      
      // 按下退格键删除字符
      if (char === '\u0008' || char === '\u007F') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          stdout.write('\u0008 \u0008'); // 删除显示的字符
        }
        return;
      }
      
      // 添加字符到密码
      password += char;
      stdout.write('*');
    });
  });
}

/**
 * 询问用户输入
 * @param {string} prompt - 提示信息
 * @returns {Promise<string>} - 用户输入
 */
function askQuestion(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 初始化系统
 */
async function initializeSystem() {
  showWelcome();
  ensureConfigDir();
  
  const configExists = loadConfig();
  
  if (!configExists) {
    console.log(chalk.yellow('首次运行，需要进行初始化设置...'));
    
    // 设置主账号ID
    config.mainAccountId = await askQuestion(chalk.cyan('请输入主控账号识别码: '));
    
    // 设置GitHub令牌
    config.githubToken = await askQuestion(chalk.cyan('请输入GitHub访问令牌: '));
    
    // 设置GitHub仓库
    const defaultRepo = 'yb1734492970508/CultureBridge-Frontend1';
    const repoInput = await askQuestion(chalk.cyan(`请输入GitHub仓库 (默认: ${defaultRepo}): `));
    config.githubRepo = repoInput || defaultRepo;
    
    // 设置每账号最大积分
    const creditsInput = await askQuestion(chalk.cyan('请输入每个账号每日最大积分消耗 (默认: 300): '));
    config.maxCreditsPerAccount = parseInt(creditsInput || '300', 10);
    
    // 保存配置
    saveConfig();
    
    console.log(chalk.green('配置已保存！'));
  }
  
  // 创建凭证管理器
  credentialManager = new CredentialManager(CREDENTIALS_PATH);
  
  // 如果凭证文件不存在，需要设置主密码
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.log(chalk.yellow('需要设置主密码来加密存储API密钥...'));
    
    const masterPassword = await askPassword(chalk.cyan('请设置主密码: '));
    const confirmPassword = await askPassword(chalk.cyan('请再次输入主密码确认: '));
    
    if (masterPassword !== confirmPassword) {
      console.log(chalk.red('两次密码输入不一致，初始化失败！'));
      process.exit(1);
    }
    
    await credentialManager.initialize(masterPassword);
    console.log(chalk.green('主密码设置成功！'));
  } else {
    // 如果凭证文件存在，需要输入主密码解锁
    const masterPassword = await askPassword(chalk.cyan('请输入主密码解锁系统: '));
    const initialized = await credentialManager.initialize(masterPassword);
    
    if (!initialized) {
      console.log(chalk.red('主密码不正确，解锁失败！'));
      process.exit(1);
    }
    
    console.log(chalk.green('系统解锁成功！'));
  }
  
  // 初始化其他组件
  taskEngine = new TaskDistributionEngine(credentialManager);
  await taskEngine.initialize();
  taskEngine.setMaxCreditsPerAccount(config.maxCreditsPerAccount);
  
  accountManager = new AccountManager(credentialManager);
  await accountManager.initialize();
  
  reportGenerator = new ReportGenerator(taskEngine, accountManager);
  
  githubIntegration = new GitHubIntegration(config.githubToken, config.githubRepo);
  await githubIntegration.initialize();
  
  console.log(chalk.green('系统初始化完成！'));
}

/**
 * 添加账号API密钥
 */
async function addAccountApiKey() {
  console.log(chalk.yellow('\n===== 添加账号API密钥 ====='));
  
  const accountId = await askQuestion(chalk.cyan('请输入账号识别码: '));
  const apiKey = await askPassword(chalk.cyan('请输入API密钥: '));
  
  const credentials = {
    apiKey,
    addedAt: new Date().toISOString()
  };
  
  const success = credentialManager.addCredential(accountId, credentials);
  
  if (success) {
    await credentialManager.saveCredentials();
    console.log(chalk.green(`账号 ${accountId} 的API密钥添加成功！`));
  } else {
    console.log(chalk.red(`账号 ${accountId} 的API密钥添加失败！`));
  }
}

/**
 * 批量添加账号API密钥
 */
async function bulkAddAccountApiKeys() {
  console.log(chalk.yellow('\n===== 批量添加账号API密钥 ====='));
  
  const accountCount = await askQuestion(chalk.cyan('请输入要添加的账号数量: '));
  const count = parseInt(accountCount, 10);
  
  if (isNaN(count) || count <= 0) {
    console.log(chalk.red('无效的账号数量！'));
    return;
  }
  
  const credentialsList = [];
  
  for (let i = 0; i < count; i++) {
    console.log(chalk.yellow(`\n--- 添加第 ${i + 1}/${count} 个账号 ---`));
    
    const accountId = await askQuestion(chalk.cyan('请输入账号识别码: '));
    const apiKey = await askPassword(chalk.cyan('请输入API密钥: '));
    
    credentialsList.push({
      accountId,
      credentials: {
        apiKey,
        addedAt: new Date().toISOString()
      }
    });
  }
  
  const success = credentialManager.addBulkCredentials(credentialsList);
  
  if (success) {
    await credentialManager.saveCredentials();
    console.log(chalk.green(`成功批量添加 ${count} 个账号的API密钥！`));
  } else {
    console.log(chalk.red('批量添加账号API密钥失败！'));
  }
}

/**
 * 查看账号列表
 */
function viewAccounts() {
  console.log(chalk.yellow('\n===== 账号列表 ====='));
  
  const accountIds = credentialManager.getAllAccountIds();
  
  if (accountIds.length === 0) {
    console.log(chalk.red('没有找到任何账号！'));
    return;
  }
  
  console.log(chalk.cyan(`共有 ${accountIds.length} 个账号：`));
  
  accountIds.forEach((accountId, index) => {
    const isMain = accountId === config.mainAccountId;
    const mainLabel = isMain ? chalk.green(' (主控账号)') : '';
    console.log(chalk.white(`${index + 1}. ${accountId}${mainLabel}`));
  });
}

/**
 * 启动批处理系统
 */
async function startBatchSystem() {
  console.log(chalk.yellow('\n===== 启动批处理系统 ====='));
  
  // 检查账号数量
  const accountIds = credentialManager.getAllAccountIds();
  
  if (accountIds.length < 2) {
    console.log(chalk.red('至少需要2个账号才能启动批处理系统！'));
    return;
  }
  
  console.log(chalk.cyan(`当前共有 ${accountIds.length} 个账号，每个账号每日最大积分消耗: ${config.maxCreditsPerAccount}`));
  
  // 确认启动
  const confirm = await askQuestion(chalk.cyan('确认启动批处理系统？(y/n): '));
  
  if (confirm.toLowerCase() !== 'y') {
    console.log(chalk.yellow('已取消启动！'));
    return;
  }
  
  // 加载任务定义
  if (!config.taskDefinitions || config.taskDefinitions.length === 0) {
    console.log(chalk.yellow('没有找到任务定义，将使用默认任务...'));
    
    // 默认任务定义
    config.taskDefinitions = [
      {
        id: 'task1',
        data: { type: 'development', module: 'frontend', description: '优化移动端UI组件' },
        priority: 8,
        dependencies: [],
        estimatedCredits: 100
      },
      {
        id: 'task2',
        data: { type: 'development', module: 'backend', description: '实现BNB链智能合约' },
        priority: 9,
        dependencies: [],
        estimatedCredits: 120
      },
      {
        id: 'task3',
        data: { type: 'testing', module: 'frontend', description: '测试移动端UI组件' },
        priority: 7,
        dependencies: ['task1'],
        estimatedCredits: 80
      },
      {
        id: 'task4',
        data: { type: 'testing', module: 'backend', description: '测试BNB链智能合约' },
        priority: 7,
        dependencies: ['task2'],
        estimatedCredits: 90
      },
      {
        id: 'task5',
        data: { type: 'integration', module: 'full-stack', description: '集成前端和智能合约' },
        priority: 6,
        dependencies: ['task3', 'task4'],
        estimatedCredits: 110
      }
    ];
    
    saveConfig();
  }
  
  // 添加任务到任务引擎
  taskEngine.addBulkTasks(config.taskDefinitions);
  
  // 启动进度显示
  const spinner = ora('正在启动批处理系统...').start();
  
  try {
    // 自动分配任务
    const assignedCount = taskEngine.autoAssignTasks();
    
    spinner.succeed(`成功分配 ${assignedCount} 个任务！`);
    
    // 显示任务分配情况
    console.log(chalk.yellow('\n===== 任务分配情况 ====='));
    
    for (const accountId of accountIds) {
      const tasks = taskEngine.getAccountTasks(accountId);
      const credits = taskEngine.getAccountCredits(accountId);
      
      console.log(chalk.cyan(`账号 ${accountId}:`));
      console.log(chalk.white(`  分配任务数: ${tasks.length}`));
      console.log(chalk.white(`  预计积分消耗: ${credits}/${config.maxCreditsPerAccount}`));
      
      if (tasks.length > 0) {
        console.log(chalk.white('  任务列表:'));
        tasks.forEach((task, index) => {
          console.log(chalk.white(`    ${index + 1}. ${task.data.description} (${task.estimatedCredits} 积分)`));
        });
      }
      
      console.log('');
    }
    
    // 显示任务统计
    const stats = taskEngine.getTaskStats();
    console.log(chalk.yellow('===== 任务统计 ====='));
    console.log(chalk.white(`总任务数: ${stats.total}`));
    console.log(chalk.white(`待分配: ${stats.pending}`));
    console.log(chalk.white(`已分配: ${stats.assigned}`));
    console.log(chalk.white(`已完成: ${stats.completed}`));
    
    // 生成报告
    const reportPath = path.join(process.cwd(), 'batch-report.md');
    await reportGenerator.generateReport(reportPath);
    
    console.log(chalk.green(`\n批处理系统已成功启动！报告已生成: ${reportPath}`));
    
  } catch (error) {
    spinner.fail('启动批处理系统失败！');
    console.error(chalk.red(error.message));
  }
}

/**
 * 重置每日积分消耗
 */
async function resetDailyCredits() {
  console.log(chalk.yellow('\n===== 重置每日积分消耗 ====='));
  
  // 确认重置
  const confirm = await askQuestion(chalk.cyan('确认重置所有账号的每日积分消耗？(y/n): '));
  
  if (confirm.toLowerCase() !== 'y') {
    console.log(chalk.yellow('已取消重置！'));
    return;
  }
  
  const success = taskEngine.resetDailyCredits();
  
  if (success) {
    console.log(chalk.green('成功重置所有账号的每日积分消耗！'));
  } else {
    console.log(chalk.red('重置每日积分消耗失败！'));
  }
}

/**
 * 显示主菜单
 */
async function showMainMenu() {
  while (true) {
    console.log(chalk.yellow('\n===== CultureBridge 批处理自动化系统 ====='));
    console.log(chalk.white('1. 添加账号API密钥'));
    console.log(chalk.white('2. 批量添加账号API密钥'));
    console.log(chalk.white('3. 查看账号列表'));
    console.log(chalk.white('4. 启动批处理系统'));
    console.log(chalk.white('5. 重置每日积分消耗'));
    console.log(chalk.white('0. 退出'));
    
    const choice = await askQuestion(chalk.cyan('\n请选择操作 (0-5): '));
    
    switch (choice) {
      case '1':
        await addAccountApiKey();
        break;
      case '2':
        await bulkAddAccountApiKeys();
        break;
      case '3':
        viewAccounts();
        break;
      case '4':
        await startBatchSystem();
        break;
      case '5':
        await resetDailyCredits();
        break;
      case '0':
        console.log(chalk.green('感谢使用 CultureBridge 批处理自动化系统！'));
        rl.close();
        process.exit(0);
        break;
      default:
        console.log(chalk.red('无效的选择，请重新输入！'));
    }
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 解析命令行参数
    program
      .version('1.0.0')
      .description('CultureBridge 批处理自动化系统')
      .option('-i, --init', '初始化系统')
      .option('-a, --add-account', '添加账号API密钥')
      .option('-b, --bulk-add', '批量添加账号API密钥')
      .option('-l, --list', '查看账号列表')
      .option('-s, --start', '启动批处理系统')
      .option('-r, --reset', '重置每日积分消耗')
      .parse(process.argv);
    
    const options = program.opts();
    
    // 初始化系统
    await initializeSystem();
    
    // 根据命令行参数执行相应操作
    if (options.addAccount) {
      await addAccountApiKey();
      rl.close();
    } else if (options.bulkAdd) {
      await bulkAddAccountApiKeys();
      rl.close();
    } else if (options.list) {
      viewAccounts();
      rl.close();
    } else if (options.start) {
      await startBatchSystem();
      rl.close();
    } else if (options.reset) {
      await resetDailyCredits();
      rl.close();
    } else {
      // 显示主菜单
      await showMainMenu();
    }
  } catch (error) {
    console.error(chalk.red('发生错误:'), error);
    process.exit(1);
  }
}

// 启动程序
main();
