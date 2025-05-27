/**
 * 部署状态管理工具
 * 用于跟踪和更新BNB链测试网和主网的合约部署状态
 */

const fs = require('fs');
const path = require('path');

// 部署状态文件路径
const DEPLOYMENT_STATUS_PATH = path.join(__dirname, 'deployments/deployment-status.json');

// 读取部署状态
function getDeploymentStatus() {
  try {
    if (!fs.existsSync(DEPLOYMENT_STATUS_PATH)) {
      console.error('部署状态文件不存在');
      return null;
    }
    
    const statusData = fs.readFileSync(DEPLOYMENT_STATUS_PATH, 'utf8');
    return JSON.parse(statusData);
  } catch (error) {
    console.error('读取部署状态失败:', error);
    return null;
  }
}

// 更新部署状态
function updateDeploymentStatus(network, updates) {
  try {
    if (!['testnet', 'mainnet'].includes(network)) {
      throw new Error('无效的网络类型，必须是 testnet 或 mainnet');
    }
    
    const status = getDeploymentStatus();
    if (!status) {
      throw new Error('无法获取当前部署状态');
    }
    
    // 更新指定网络的状态
    Object.assign(status[network], updates);
    
    // 写入更新后的状态
    fs.writeFileSync(DEPLOYMENT_STATUS_PATH, JSON.stringify(status, null, 2));
    console.log(`${network} 部署状态已更新`);
    
    return true;
  } catch (error) {
    console.error('更新部署状态失败:', error);
    return false;
  }
}

// 更新合约地址
function updateContractAddress(network, contractName, address) {
  try {
    if (!['CultureToken', 'AIRegistry', 'CulturalNFT', 'TranslationMarket'].includes(contractName)) {
      throw new Error('无效的合约名称');
    }
    
    const status = getDeploymentStatus();
    if (!status) {
      throw new Error('无法获取当前部署状态');
    }
    
    // 更新合约地址
    status[network].contracts[contractName] = address;
    
    // 写入更新后的状态
    fs.writeFileSync(DEPLOYMENT_STATUS_PATH, JSON.stringify(status, null, 2));
    console.log(`${network} ${contractName} 地址已更新: ${address}`);
    
    return true;
  } catch (error) {
    console.error('更新合约地址失败:', error);
    return false;
  }
}

// 更新合约验证状态
function updateVerificationStatus(network, contractName, verified) {
  try {
    if (!['CultureToken', 'AIRegistry', 'CulturalNFT', 'TranslationMarket'].includes(contractName)) {
      throw new Error('无效的合约名称');
    }
    
    const status = getDeploymentStatus();
    if (!status) {
      throw new Error('无法获取当前部署状态');
    }
    
    // 更新验证状态
    status[network].verificationStatus[contractName] = verified;
    
    // 写入更新后的状态
    fs.writeFileSync(DEPLOYMENT_STATUS_PATH, JSON.stringify(status, null, 2));
    console.log(`${network} ${contractName} 验证状态已更新: ${verified ? '已验证' : '未验证'}`);
    
    return true;
  } catch (error) {
    console.error('更新验证状态失败:', error);
    return false;
  }
}

// 初始化部署信息
function initDeployment(network, deploymentAccount) {
  try {
    const status = getDeploymentStatus();
    if (!status) {
      throw new Error('无法获取当前部署状态');
    }
    
    // 更新部署信息
    status[network].deploymentDate = new Date().toISOString();
    status[network].deploymentAccount = deploymentAccount;
    
    // 重置合约地址和验证状态
    Object.keys(status[network].contracts).forEach(contract => {
      status[network].contracts[contract] = '';
      status[network].verificationStatus[contract] = false;
    });
    
    // 写入更新后的状态
    fs.writeFileSync(DEPLOYMENT_STATUS_PATH, JSON.stringify(status, null, 2));
    console.log(`${network} 部署信息已初始化`);
    
    return true;
  } catch (error) {
    console.error('初始化部署信息失败:', error);
    return false;
  }
}

// 导出函数
module.exports = {
  getDeploymentStatus,
  updateDeploymentStatus,
  updateContractAddress,
  updateVerificationStatus,
  initDeployment
};
