/**
 * 本地Hardhat网络智能合约部署脚本
 * 用于部署CultureBridge项目的所有智能合约到本地开发环境
 */

require('@nomiclabs/hardhat-waffle');
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// 部署日志路径
const DEPLOYMENT_LOG_PATH = path.join(__dirname, '../..', 'LOCAL_DEPLOYMENT_LOG.md');

// 写入部署日志
async function writeDeploymentLog(content) {
  try {
    if (!fs.existsSync(DEPLOYMENT_LOG_PATH)) {
      // 创建初始日志文件
      const initialContent = `# CultureBridge本地部署日志\n\n## 部署信息\n- 部署日期: ${new Date().toISOString().split('T')[0]}\n- 部署网络: Hardhat本地网络\n- 部署账户: ${(await ethers.getSigners())[0].address}\n\n## 合约地址\n\n## 初始配置\n\n## 功能测试结果\n\n## 问题记录\n\n## 后续优化建议\n`;
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
    const configPath = path.join(__dirname, '../src/config/contracts.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // 使用正则表达式更新合约地址
    const regex = new RegExp(`(hardhat:\\s*\\{[\\s\\S]*?${contractName}:\\s*)".*?"`, 'g');
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
    
    // 部署合约 - CultureToken构造函数不需要参数
    const CultureToken = await ethers.getContractFactory("CultureToken");
    const token = await CultureToken.deploy();
    
    await token.deployed();
    console.log(`CultureToken部署成功: ${token.address}`);
    
    // 更新部署日志
    await writeDeploymentLog(`- CultureToken: ${token.address}`);
    
    // 更新前端配置
    await updateContractConfig("CultureToken", token.address);
    
    return token.address;
  } catch (error) {
    console.error("CultureToken部署失败:", error);
    await writeDeploymentLog(`## 错误\n- CultureToken部署失败: ${error.message}`);
    throw error;
  }
}

// 部署AIRegistry合约
async function deployAIRegistry() {
  console.log("开始部署AIRegistry合约...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 部署合约 - AIRegistry构造函数不需要参数
    const AIRegistry = await ethers.getContractFactory("AIRegistry");
    const registry = await AIRegistry.deploy();
    
    await registry.deployed();
    console.log(`AIRegistry部署成功: ${registry.address}`);
    
    // 更新部署日志
    await writeDeploymentLog(`- AIRegistry: ${registry.address}`);
    
    // 更新前端配置
    await updateContractConfig("AIRegistry", registry.address);
    
    return registry.address;
  } catch (error) {
    console.error("AIRegistry部署失败:", error);
    await writeDeploymentLog(`## 错误\n- AIRegistry部署失败: ${error.message}`);
    throw error;
  }
}

// 部署CulturalNFT合约
async function deployCulturalNFT(tokenAddress) {
  console.log("开始部署CulturalNFT合约...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 部署合约 - CulturalNFT构造函数只需要CultureToken地址参数
    const CulturalNFT = await ethers.getContractFactory("CulturalNFT");
    console.log(`准备部署CulturalNFT，参数: ${tokenAddress}`);
    const nft = await CulturalNFT.deploy(tokenAddress);
    
    await nft.deployed();
    console.log(`CulturalNFT部署成功: ${nft.address}`);
    
    // 更新部署日志
    await writeDeploymentLog(`- CulturalNFT: ${nft.address}`);
    
    // 更新前端配置
    await updateContractConfig("CulturalNFT", nft.address);
    
    return nft.address;
  } catch (error) {
    console.error("CulturalNFT部署失败:", error);
    await writeDeploymentLog(`## 错误\n- CulturalNFT部署失败: ${error.message}`);
    throw error;
  }
}

// 部署TranslationMarket合约
async function deployTranslationMarket(tokenAddress) {
  console.log("开始部署TranslationMarket合约...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户: ${deployer.address}`);
    
    // 部署合约 - TranslationMarket构造函数只需要CultureToken地址参数
    const TranslationMarket = await ethers.getContractFactory("TranslationMarket");
    console.log(`准备部署TranslationMarket，参数: ${tokenAddress}`);
    const market = await TranslationMarket.deploy(tokenAddress);
    
    await market.deployed();
    console.log(`TranslationMarket部署成功: ${market.address}`);
    
    // 更新部署日志
    await writeDeploymentLog(`- TranslationMarket: ${market.address}`);
    
    // 更新前端配置
    await updateContractConfig("TranslationMarket", market.address);
    
    return market.address;
  } catch (error) {
    console.error("TranslationMarket部署失败:", error);
    await writeDeploymentLog(`## 错误\n- TranslationMarket部署失败: ${error.message}`);
    throw error;
  }
}

// 主部署函数
async function main() {
  console.log("开始部署CultureBridge智能合约到本地Hardhat网络...");
  
  try {
    // 1. 部署CultureToken
    const tokenAddress = await deployCultureToken();
    
    // 2. 部署AIRegistry
    const registryAddress = await deployAIRegistry();
    
    // 3. 部署CulturalNFT - 只传递CultureToken地址
    const nftAddress = await deployCulturalNFT(tokenAddress);
    
    // 4. 部署TranslationMarket - 只传递CultureToken地址
    const marketAddress = await deployTranslationMarket(tokenAddress);
    
    console.log("\n部署完成! 合约地址:");
    console.log(`- CultureToken: ${tokenAddress}`);
    console.log(`- AIRegistry: ${registryAddress}`);
    console.log(`- CulturalNFT: ${nftAddress}`);
    console.log(`- TranslationMarket: ${marketAddress}`);
    
    // 更新部署日志
    await writeDeploymentLog(`\n## 部署完成\n所有合约已成功部署到本地Hardhat网络。`);
    
    // 保存部署地址到JSON文件，方便前端和测试使用
    const deploymentInfo = {
      network: "hardhat",
      CultureToken: tokenAddress,
      AIRegistry: registryAddress,
      CulturalNFT: nftAddress,
      TranslationMarket: marketAddress,
      deployedAt: new Date().toISOString()
    };
    
    // 确保目录存在
    const deploymentDir = path.join(__dirname, '../src/config/deployments');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentDir, 'local-deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("部署信息已保存到配置文件");
    
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
