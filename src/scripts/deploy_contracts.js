/**
 * 更新部署脚本以集成部署状态管理
 * 用于部署CultureBridge项目的所有智能合约到BNB链测试网
 */

require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const deploymentManager = require('../config/deploymentManager');

// 部署日志路径
const DEPLOYMENT_LOG_PATH = path.join(__dirname, '../..', 'TESTNET_DEPLOYMENT_LOG.md');

// 写入部署日志
async function writeDeploymentLog(content) {
  try {
    if (!fs.existsSync(DEPLOYMENT_LOG_PATH)) {
      // 创建初始日志文件
      const initialContent = `# CultureBridge测试网部署日志\n\n## 部署信息\n- 部署日期: ${new Date().toISOString().split('T')[0]}\n- 部署网络: BNB Chain Testnet\n- 部署账户: ${(await ethers.getSigners())[0].address}\n\n## 合约地址\n\n## 初始配置\n\n## 验证状态\n\n## 功能测试结果\n\n## 问题记录\n\n## 后续优化建议\n`;
      fs.writeFileSync(DEPLOYMENT_LOG_PATH, initialContent);
    }
    
    // 追加内容到日志
    fs.appendFileSync(DEPLOYMENT_LOG_PATH, `\n${content}\n`);
    console.log("部署日志已更新");
  } catch (error) {
    console.error("写入部署日志失败:", error);
  }
}

// 更新前端合约配置
async function updateContractConfig(contractName, address) {
  try {
    const configPath = path.join(__dirname, '../config/contracts.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // 使用正则表达式更新合约地址
    const regex = new RegExp(`(${contractName}:\\s*)".*?"`, 'g');
    configContent = configContent.replace(regex, `$1"${address}"`);
    
    fs.writeFileSync(configPath, configContent);
    console.log(`前端配置已更新: ${contractName} = ${address}`);
  } catch (error) {
    console.error("更新前端配置失败:", error);
  }
}

// 部署CultureToken合约
async function deployCultureToken() {
  console.log("开始部署CultureToken合约...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 初始化部署状态
    deploymentManager.initDeployment('testnet', deployer.address);
    
    // 部署合约 - 修正：CultureToken构造函数不需要参数，ERC20名称和符号在构造函数内部设置
    const CultureToken = await ethers.getContractFactory("CultureToken");
    const token = await CultureToken.deploy();
    
    await token.deployed();
    console.log(`CultureToken部署成功: ${token.address}`);
    
    // 更新部署状态
    deploymentManager.updateContractAddress('testnet', 'CultureToken', token.address);
    
    // 更新部署日志
    await writeDeploymentLog(`- CultureToken: ${token.address}`);
    
    // 更新前端配置
    await updateContractConfig("CultureToken", token.address);
    
    // 验证合约 - 修正：验证参数为空数组，与构造函数一致
    try {
      console.log("正在验证CultureToken合约...");
      await hre.run("verify:verify", {
        address: token.address,
        constructorArguments: [],
      });
      console.log("CultureToken合约验证成功");
      await writeDeploymentLog(`- CultureToken: 已验证`);
      
      // 更新验证状态
      deploymentManager.updateVerificationStatus('testnet', 'CultureToken', true);
    } catch (error) {
      console.error("合约验证失败:", error);
      await writeDeploymentLog(`- CultureToken: 验证失败 - ${error.message}`);
    }
    
    return token.address;
  } catch (error) {
    console.error("CultureToken部署失败:", error);
    await writeDeploymentLog(`## 错误\n- CultureToken部署失败: ${error.message}`);
    throw error;
  }
}

// 部署AIRegistry合约
async function deployAIRegistry(tokenAddress) {
  console.log("开始部署AIRegistry合约...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 部署合约
    const AIRegistry = await ethers.getContractFactory("AIRegistry");
    const registry = await AIRegistry.deploy(tokenAddress);
    
    await registry.deployed();
    console.log(`AIRegistry部署成功: ${registry.address}`);
    
    // 更新部署状态
    deploymentManager.updateContractAddress('testnet', 'AIRegistry', registry.address);
    
    // 更新部署日志
    await writeDeploymentLog(`- AIRegistry: ${registry.address}`);
    
    // 更新前端配置
    await updateContractConfig("AIRegistry", registry.address);
    
    // 验证合约
    try {
      console.log("正在验证AIRegistry合约...");
      await hre.run("verify:verify", {
        address: registry.address,
        constructorArguments: [tokenAddress],
      });
      console.log("AIRegistry合约验证成功");
      await writeDeploymentLog(`- AIRegistry: 已验证`);
      
      // 更新验证状态
      deploymentManager.updateVerificationStatus('testnet', 'AIRegistry', true);
    } catch (error) {
      console.error("合约验证失败:", error);
      await writeDeploymentLog(`- AIRegistry: 验证失败 - ${error.message}`);
    }
    
    return registry.address;
  } catch (error) {
    console.error("AIRegistry部署失败:", error);
    await writeDeploymentLog(`## 错误\n- AIRegistry部署失败: ${error.message}`);
    throw error;
  }
}

// 部署CulturalNFT合约
async function deployCulturalNFT() {
  console.log("开始部署CulturalNFT合约...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 部署合约
    const CulturalNFT = await ethers.getContractFactory("CulturalNFT");
    const nft = await CulturalNFT.deploy("CulturalNFT", "CNFT");
    
    await nft.deployed();
    console.log(`CulturalNFT部署成功: ${nft.address}`);
    
    // 更新部署状态
    deploymentManager.updateContractAddress('testnet', 'CulturalNFT', nft.address);
    
    // 更新部署日志
    await writeDeploymentLog(`- CulturalNFT: ${nft.address}`);
    
    // 更新前端配置
    await updateContractConfig("CulturalNFT", nft.address);
    
    // 验证合约
    try {
      console.log("正在验证CulturalNFT合约...");
      await hre.run("verify:verify", {
        address: nft.address,
        constructorArguments: ["CulturalNFT", "CNFT"],
      });
      console.log("CulturalNFT合约验证成功");
      await writeDeploymentLog(`- CulturalNFT: 已验证`);
      
      // 更新验证状态
      deploymentManager.updateVerificationStatus('testnet', 'CulturalNFT', true);
    } catch (error) {
      console.error("合约验证失败:", error);
      await writeDeploymentLog(`- CulturalNFT: 验证失败 - ${error.message}`);
    }
    
    return nft.address;
  } catch (error) {
    console.error("CulturalNFT部署失败:", error);
    await writeDeploymentLog(`## 错误\n- CulturalNFT部署失败: ${error.message}`);
    throw error;
  }
}

// 部署TranslationMarket合约
async function deployTranslationMarket(tokenAddress, nftAddress, registryAddress) {
  console.log("开始部署TranslationMarket合约...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 部署合约
    const TranslationMarket = await ethers.getContractFactory("TranslationMarket");
    const market = await TranslationMarket.deploy(tokenAddress, nftAddress, registryAddress);
    
    await market.deployed();
    console.log(`TranslationMarket部署成功: ${market.address}`);
    
    // 更新部署状态
    deploymentManager.updateContractAddress('testnet', 'TranslationMarket', market.address);
    
    // 更新部署日志
    await writeDeploymentLog(`- TranslationMarket: ${market.address}`);
    
    // 更新前端配置
    await updateContractConfig("TranslationMarket", market.address);
    
    // 验证合约
    try {
      console.log("正在验证TranslationMarket合约...");
      await hre.run("verify:verify", {
        address: market.address,
        constructorArguments: [tokenAddress, nftAddress, registryAddress],
      });
      console.log("TranslationMarket合约验证成功");
      await writeDeploymentLog(`- TranslationMarket: 已验证`);
      
      // 更新验证状态
      deploymentManager.updateVerificationStatus('testnet', 'TranslationMarket', true);
    } catch (error) {
      console.error("合约验证失败:", error);
      await writeDeploymentLog(`- TranslationMarket: 验证失败 - ${error.message}`);
    }
    
    return market.address;
  } catch (error) {
    console.error("TranslationMarket部署失败:", error);
    await writeDeploymentLog(`## 错误\n- TranslationMarket部署失败: ${error.message}`);
    throw error;
  }
}

// 主部署函数
async function main() {
  console.log("开始部署CultureBridge智能合约到BNB链测试网...");
  
  try {
    // 1. 部署CultureToken
    const tokenAddress = await deployCultureToken();
    
    // 2. 部署AIRegistry
    const registryAddress = await deployAIRegistry(tokenAddress);
    
    // 3. 部署CulturalNFT
    const nftAddress = await deployCulturalNFT();
    
    // 4. 部署TranslationMarket
    const marketAddress = await deployTranslationMarket(tokenAddress, nftAddress, registryAddress);
    
    console.log("\n部署完成! 合约地址:");
    console.log(`- CultureToken: ${tokenAddress}`);
    console.log(`- AIRegistry: ${registryAddress}`);
    console.log(`- CulturalNFT: ${nftAddress}`);
    console.log(`- TranslationMarket: ${marketAddress}`);
    
    // 更新部署日志
    await writeDeploymentLog(`\n## 部署完成\n所有合约已成功部署到BNB链测试网。`);
    
    // 获取最终部署状态
    const deploymentStatus = deploymentManager.getDeploymentStatus();
    console.log("最终部署状态:", JSON.stringify(deploymentStatus, null, 2));
  } catch (error) {
    console.error("部署过程中出错:", error);
    await writeDeploymentLog(`\n## 部署失败\n部署过程中出错: ${error.message}`);
  }
}

// 执行部署
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
