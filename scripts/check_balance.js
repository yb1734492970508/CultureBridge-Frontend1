/**
 * 检查BNB链测试网账户余额
 * 用于验证部署账户是否有足够的BNB进行合约部署
 */

require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("检查BNB链测试网账户余额...");
  
  try {
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log(`部署账户地址: ${deployer.address}`);
    
    // 获取账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceInBNB = ethers.utils.formatEther(balance);
    
    console.log(`账户余额: ${balanceInBNB} BNB`);
    
    // 判断余额是否足够部署
    const minBalanceForDeployment = 0.1; // 最低需要0.1 BNB用于部署
    if (parseFloat(balanceInBNB) < minBalanceForDeployment) {
      console.log(`\n警告: 账户余额不足，无法进行合约部署!`);
      console.log(`最低需要 ${minBalanceForDeployment} BNB，当前仅有 ${balanceInBNB} BNB`);
      console.log(`\n请通过以下方式获取测试网BNB:`);
      console.log(`1. 访问BNB链测试网水龙头: ${process.env.TESTNET_FAUCET_URL}`);
      console.log(`2. 输入您的部署账户地址: ${deployer.address}`);
      console.log(`3. 完成验证并领取测试网BNB`);
      console.log(`4. 等待几分钟后再次运行此脚本检查余额`);
    } else {
      console.log(`\n账户余额充足，可以进行合约部署!`);
      console.log(`建议部署余额: ${minBalanceForDeployment} BNB，当前余额: ${balanceInBNB} BNB`);
    }
  } catch (error) {
    console.error("检查余额失败:", error);
  }
}

// 执行脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
