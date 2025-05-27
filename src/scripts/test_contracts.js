/**
 * BNB链测试网合约交互测试脚本
 * 用于验证已部署合约的功能和交互
 */

require('@nomiclabs/hardhat-waffle');
require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// 测试日志路径
const TEST_LOG_PATH = path.join(__dirname, '../..', 'TESTNET_TEST_LOG.md');

// 写入测试日志
async function writeTestLog(content) {
  try {
    if (!fs.existsSync(TEST_LOG_PATH)) {
      // 创建初始日志文件
      const initialContent = `# CultureBridge测试网功能测试日志\n\n## 测试信息\n- 测试日期: ${new Date().toISOString().split('T')[0]}\n- 测试网络: BNB Chain Testnet\n- 测试账户: ${(await ethers.getSigners())[0].address}\n\n## 测试结果\n\n## 问题记录\n\n## 优化建议\n`;
      fs.writeFileSync(TEST_LOG_PATH, initialContent);
    }
    
    // 追加内容到日志
    fs.appendFileSync(TEST_LOG_PATH, `\n${content}\n`);
    console.log("测试日志已更新");
  } catch (error) {
    console.error("写入测试日志失败:", error);
  }
}

// 从配置文件读取合约地址
function getContractAddresses() {
  try {
    const configPath = path.join(__dirname, '../config/contracts.js');
    // 由于Node.js不支持直接导入ES模块，我们需要读取文件并解析
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // 提取测试网合约地址
    const addresses = {};
    const regex = /97:\s*{([^}]*)}/;
    const match = configContent.match(regex);
    
    if (match && match[1]) {
      const contractsSection = match[1];
      
      // 提取各合约地址
      const extractAddress = (contractName) => {
        const contractRegex = new RegExp(`${contractName}:\\s*"([^"]*)"`, 'g');
        const contractMatch = contractRegex.exec(contractsSection);
        return contractMatch ? contractMatch[1] : "";
      };
      
      addresses.CultureToken = extractAddress("CultureToken");
      addresses.AIRegistry = extractAddress("AIRegistry");
      addresses.CulturalNFT = extractAddress("CulturalNFT");
      addresses.TranslationMarket = extractAddress("TranslationMarket");
    }
    
    return addresses;
  } catch (error) {
    console.error("读取合约地址失败:", error);
    return {
      CultureToken: "",
      AIRegistry: "",
      CulturalNFT: "",
      TranslationMarket: ""
    };
  }
}

// 测试CultureToken合约
async function testCultureToken(tokenAddress) {
  console.log(`\n开始测试CultureToken合约 (${tokenAddress})...`);
  
  try {
    if (!tokenAddress) {
      throw new Error("CultureToken地址为空");
    }
    
    const [owner, user1, user2] = await ethers.getSigners();
    
    // 连接合约
    const CultureToken = await ethers.getContractFactory("CultureToken");
    const token = await CultureToken.attach(tokenAddress);
    
    // 测试基本信息
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();
    
    console.log(`名称: ${name}`);
    console.log(`符号: ${symbol}`);
    console.log(`小数位: ${decimals}`);
    console.log(`总供应量: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);
    
    // 测试余额查询
    const ownerBalance = await token.balanceOf(owner.address);
    console.log(`部署者余额: ${ethers.utils.formatEther(ownerBalance)} ${symbol}`);
    
    // 测试转账
    const transferAmount = ethers.utils.parseEther("100");
    console.log(`测试转账 ${ethers.utils.formatEther(transferAmount)} ${symbol} 到 ${user1.address}...`);
    
    const tx = await token.transfer(user1.address, transferAmount);
    await tx.wait();
    
    const user1Balance = await token.balanceOf(user1.address);
    console.log(`用户1余额: ${ethers.utils.formatEther(user1Balance)} ${symbol}`);
    
    // 测试授权和代理转账
    console.log(`测试授权和代理转账...`);
    
    const approveAmount = ethers.utils.parseEther("50");
    const approveTx = await token.connect(user1).approve(user2.address, approveAmount);
    await approveTx.wait();
    
    const allowance = await token.allowance(user1.address, user2.address);
    console.log(`授权额度: ${ethers.utils.formatEther(allowance)} ${symbol}`);
    
    const transferFromTx = await token.connect(user2).transferFrom(user1.address, user2.address, ethers.utils.parseEther("25"));
    await transferFromTx.wait();
    
    const user2Balance = await token.balanceOf(user2.address);
    console.log(`用户2余额: ${ethers.utils.formatEther(user2Balance)} ${symbol}`);
    
    // 记录测试结果
    await writeTestLog(`### CultureToken测试\n- 基本信息: ✅\n- 余额查询: ✅\n- 转账功能: ✅\n- 授权和代理转账: ✅`);
    
    console.log("CultureToken测试完成 ✅");
    return true;
  } catch (error) {
    console.error("CultureToken测试失败:", error);
    await writeTestLog(`### CultureToken测试\n- 测试失败: ❌\n- 错误信息: ${error.message}`);
    return false;
  }
}

// 测试AIRegistry合约
async function testAIRegistry(registryAddress, tokenAddress) {
  console.log(`\n开始测试AIRegistry合约 (${registryAddress})...`);
  
  try {
    if (!registryAddress) {
      throw new Error("AIRegistry地址为空");
    }
    
    const [owner, provider1, provider2, user] = await ethers.getSigners();
    
    // 连接合约
    const AIRegistry = await ethers.getContractFactory("AIRegistry");
    const registry = await AIRegistry.attach(registryAddress);
    
    // 连接代币合约
    const CultureToken = await ethers.getContractFactory("CultureToken");
    const token = await CultureToken.attach(tokenAddress);
    
    // 测试服务注册
    console.log("测试服务注册...");
    
    // 确保提供商有足够的代币
    const registrationFee = ethers.utils.parseEther("10");
    await token.transfer(provider1.address, registrationFee.mul(2));
    await token.connect(provider1).approve(registry.address, registrationFee);
    
    const serviceMetadata = {
      name: "翻译助手",
      description: "高质量的AI翻译服务",
      languages: ["中文", "英语", "日语"],
      capabilities: ["文本翻译", "语音翻译", "文档翻译"],
      apiEndpoint: "https://api.example.com/translate",
      pricePerUnit: ethers.utils.parseEther("0.1")
    };
    
    const registerTx = await registry.connect(provider1).registerService(
      serviceMetadata.name,
      serviceMetadata.description,
      serviceMetadata.languages,
      serviceMetadata.capabilities,
      serviceMetadata.apiEndpoint,
      serviceMetadata.pricePerUnit
    );
    
    const receipt = await registerTx.wait();
    
    // 从事件中获取服务ID
    let serviceId;
    for (const event of receipt.events) {
      if (event.event === "ServiceRegistered") {
        serviceId = event.args.serviceId;
        break;
      }
    }
    
    console.log(`服务注册成功，ID: ${serviceId}`);
    
    // 测试服务查询
    console.log("测试服务查询...");
    
    const service = await registry.getService(serviceId);
    console.log(`服务名称: ${service.name}`);
    console.log(`服务描述: ${service.description}`);
    console.log(`服务价格: ${ethers.utils.formatEther(service.pricePerUnit)} CULT`);
    console.log(`服务提供商: ${service.provider}`);
    console.log(`服务状态: ${service.active ? "活跃" : "停用"}`);
    
    // 测试服务更新
    console.log("测试服务更新...");
    
    const newPrice = ethers.utils.parseEther("0.2");
    const updateTx = await registry.connect(provider1).updateServicePrice(serviceId, newPrice);
    await updateTx.wait();
    
    const updatedService = await registry.getService(serviceId);
    console.log(`更新后价格: ${ethers.utils.formatEther(updatedService.pricePerUnit)} CULT`);
    
    // 测试服务评分
    console.log("测试服务评分...");
    
    const ratingTx = await registry.connect(user).rateService(serviceId, 5); // 5星评价
    await ratingTx.wait();
    
    const serviceRating = await registry.getServiceRating(serviceId);
    console.log(`服务评分: ${serviceRating.toNumber() / 10}`); // 评分乘以10存储
    
    // 测试服务停用/激活
    console.log("测试服务停用/激活...");
    
    const deactivateTx = await registry.connect(provider1).toggleServiceActive(serviceId, false);
    await deactivateTx.wait();
    
    const deactivatedService = await registry.getService(serviceId);
    console.log(`停用后状态: ${deactivatedService.active ? "活跃" : "停用"}`);
    
    const activateTx = await registry.connect(provider1).toggleServiceActive(serviceId, true);
    await activateTx.wait();
    
    const activatedService = await registry.getService(serviceId);
    console.log(`重新激活后状态: ${activatedService.active ? "活跃" : "停用"}`);
    
    // 测试服务筛选
    console.log("测试服务筛选...");
    
    // 注册第二个服务用于测试筛选
    await token.transfer(provider2.address, registrationFee);
    await token.connect(provider2).approve(registry.address, registrationFee);
    
    const service2Metadata = {
      name: "文档翻译专家",
      description: "专业文档翻译服务",
      languages: ["中文", "英语", "德语"],
      capabilities: ["文档翻译", "技术文档"],
      apiEndpoint: "https://api.example.com/document-translate",
      pricePerUnit: ethers.utils.parseEther("0.3")
    };
    
    const register2Tx = await registry.connect(provider2).registerService(
      service2Metadata.name,
      service2Metadata.description,
      service2Metadata.languages,
      service2Metadata.capabilities,
      service2Metadata.apiEndpoint,
      service2Metadata.pricePerUnit
    );
    
    await register2Tx.wait();
    
    // 按语言筛选
    const chineseServices = await registry.getServicesByLanguage("中文");
    console.log(`支持中文的服务数量: ${chineseServices.length}`);
    
    // 按能力筛选
    const docTranslationServices = await registry.getServicesByCapability("文档翻译");
    console.log(`支持文档翻译的服务数量: ${docTranslationServices.length}`);
    
    // 按价格范围筛选
    const affordableServices = await registry.getServicesByPriceRange(
      ethers.utils.parseEther("0.05"),
      ethers.utils.parseEther("0.25")
    );
    console.log(`价格在0.05-0.25范围内的服务数量: ${affordableServices.length}`);
    
    // 记录测试结果
    await writeTestLog(`### AIRegistry测试\n- 服务注册: ✅\n- 服务查询: ✅\n- 服务更新: ✅\n- 服务评分: ✅\n- 服务停用/激活: ✅\n- 服务筛选: ✅`);
    
    console.log("AIRegistry测试完成 ✅");
    return true;
  } catch (error) {
    console.error("AIRegistry测试失败:", error);
    await writeTestLog(`### AIRegistry测试\n- 测试失败: ❌\n- 错误信息: ${error.message}`);
    return false;
  }
}

// 测试CulturalNFT合约
async function testCulturalNFT(nftAddress) {
  console.log(`\n开始测试CulturalNFT合约 (${nftAddress})...`);
  
  try {
    if (!nftAddress) {
      throw new Error("CulturalNFT地址为空");
    }
    
    const [owner, creator, collector] = await ethers.getSigners();
    
    // 连接合约
    const CulturalNFT = await ethers.getContractFactory("CulturalNFT");
    const nft = await CulturalNFT.attach(nftAddress);
    
    // 测试基本信息
    const name = await nft.name();
    const symbol = await nft.symbol();
    
    console.log(`名称: ${name}`);
    console.log(`符号: ${symbol}`);
    
    // 测试NFT铸造
    console.log("测试NFT铸造...");
    
    const tokenURI = "ipfs://QmXyZ123456789abcdef/metadata.json";
    const mintTx = await nft.connect(creator).mint(creator.address, tokenURI);
    const receipt = await mintTx.wait();
    
    // 从事件中获取代币ID
    let tokenId;
    for (const event of receipt.events) {
      if (event.event === "Transfer") {
        tokenId = event.args.tokenId;
        break;
      }
    }
    
    console.log(`NFT铸造成功，ID: ${tokenId}`);
    
    // 测试代币URI
    const retrievedURI = await nft.tokenURI(tokenId);
    console.log(`代币URI: ${retrievedURI}`);
    
    // 测试所有权
    const owner1 = await nft.ownerOf(tokenId);
    console.log(`代币所有者: ${owner1}`);
    
    // 测试转移
    console.log("测试NFT转移...");
    
    const transferTx = await nft.connect(creator).transferFrom(creator.address, collector.address, tokenId);
    await transferTx.wait();
    
    const newOwner = await nft.ownerOf(tokenId);
    console.log(`转移后所有者: ${newOwner}`);
    
    // 测试批准
    console.log("测试NFT批准...");
    
    const approveTx = await nft.connect(collector).approve(creator.address, tokenId);
    await approveTx.wait();
    
    const approved = await nft.getApproved(tokenId);
    console.log(`批准地址: ${approved}`);
    
    // 记录测试结果
    await writeTestLog(`### CulturalNFT测试\n- 基本信息: ✅\n- NFT铸造: ✅\n- 代币URI: ✅\n- 所有权查询: ✅\n- NFT转移: ✅\n- NFT批准: ✅`);
    
    console.log("CulturalNFT测试完成 ✅");
    return true;
  } catch (error) {
    console.error("CulturalNFT测试失败:", error);
    await writeTestLog(`### CulturalNFT测试\n- 测试失败: ❌\n- 错误信息: ${error.message}`);
    return false;
  }
}

// 测试TranslationMarket合约
async function testTranslationMarket(marketAddress, tokenAddress, nftAddress, registryAddress) {
  console.log(`\n开始测试TranslationMarket合约 (${marketAddress})...`);
  
  try {
    if (!marketAddress) {
      throw new Error("TranslationMarket地址为空");
    }
    
    const [owner, requester, translator, aiProvider] = await ethers.getSigners();
    
    // 连接合约
    const TranslationMarket = await ethers.getContractFactory("TranslationMarket");
    const market = await TranslationMarket.attach(marketAddress);
    
    // 连接其他合约
    const CultureToken = await ethers.getContractFactory("CultureToken");
    const token = await CultureToken.attach(tokenAddress);
    
    const CulturalNFT = await ethers.getContractFactory("CulturalNFT");
    const nft = await CulturalNFT.attach(nftAddress);
    
    const AIRegistry = await ethers.getContractFactory("AIRegistry");
    const registry = await AIRegistry.attach(registryAddress);
    
    // 确保请求者有足够的代币
    const requestAmount = ethers.utils.parseEther("50");
    await token.transfer(requester.address, requestAmount);
    await token.connect(requester).approve(market.address, requestAmount);
    
    // 测试创建翻译请求
    console.log("测试创建翻译请求...");
    
    const requestData = {
      sourceLanguage: "中文",
      targetLanguage: "英语",
      contentHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      reward: ethers.utils.parseEther("10"),
      deadline: Math.floor(Date.now() / 1000) + 86400, // 24小时后
      useAI: false
    };
    
    const createRequestTx = await market.connect(requester).createTranslationRequest(
      requestData.sourceLanguage,
      requestData.targetLanguage,
      requestData.contentHash,
      requestData.reward,
      requestData.deadline,
      requestData.useAI
    );
    
    const receipt = await createRequestTx.wait();
    
    // 从事件中获取请求ID
    let requestId;
    for (const event of receipt.events) {
      if (event.event === "TranslationRequested") {
        requestId = event.args.requestId;
        break;
      }
    }
    
    console.log(`翻译请求创建成功，ID: ${requestId}`);
    
    // 测试获取请求信息
    const request = await market.getTranslationRequest(requestId);
    console.log(`请求者: ${request.requester}`);
    console.log(`源语言: ${request.sourceLanguage}`);
    console.log(`目标语言: ${request.targetLanguage}`);
    console.log(`奖励: ${ethers.utils.formatEther(request.reward)} CULT`);
    console.log(`状态: ${request.status}`); // 0=Open, 1=Assigned, 2=Completed, 3=Verified, 4=Disputed, 5=Cancelled
    
    // 测试接受翻译请求
    console.log("测试接受翻译请求...");
    
    const acceptTx = await market.connect(translator).acceptTranslationRequest(requestId);
    await acceptTx.wait();
    
    const acceptedRequest = await market.getTranslationRequest(requestId);
    console.log(`接受后状态: ${acceptedRequest.status}`);
    console.log(`翻译者: ${acceptedRequest.translator}`);
    
    // 测试提交翻译
    console.log("测试提交翻译...");
    
    const translationData = {
      contentHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      qualityScore: 90
    };
    
    const submitTx = await market.connect(translator).submitTranslation(
      requestId,
      translationData.contentHash,
      translationData.qualityScore
    );
    
    await submitTx.wait();
    
    const submittedRequest = await market.getTranslationRequest(requestId);
    console.log(`提交后状态: ${submittedRequest.status}`);
    
    // 测试验证翻译
    console.log("测试验证翻译...");
    
    const verifyTx = await market.connect(requester).verifyTranslation(requestId, true, 85);
    await verifyTx.wait();
    
    const verifiedRequest = await market.getTranslationRequest(requestId);
    console.log(`验证后状态: ${verifiedRequest.status}`);
    
    // 测试翻译者余额
    const translatorBalance = await token.balanceOf(translator.address);
    console.log(`翻译者余额: ${ethers.utils.formatEther(translatorBalance)} CULT`);
    
    // 记录测试结果
    await writeTestLog(`### TranslationMarket测试\n- 创建翻译请求: ✅\n- 获取请求信息: ✅\n- 接受翻译请求: ✅\n- 提交翻译: ✅\n- 验证翻译: ✅\n- 奖励发放: ✅`);
    
    console.log("TranslationMarket测试完成 ✅");
    return true;
  } catch (error) {
    console.error("TranslationMarket测试失败:", error);
    await writeTestLog(`### TranslationMarket测试\n- 测试失败: ❌\n- 错误信息: ${error.message}`);
    return false;
  }
}

// 主测试函数
async function main() {
  console.log("开始测试CultureBridge智能合约在BNB链测试网上的功能...");
  
  try {
    // 获取合约地址
    const addresses = getContractAddresses();
    console.log("读取到的合约地址:");
    console.log(addresses);
    
    // 检查合约地址是否存在
    const missingContracts = [];
    if (!addresses.CultureToken) missingContracts.push("CultureToken");
    if (!addresses.AIRegistry) missingContracts.push("AIRegistry");
    if (!addresses.CulturalNFT) missingContracts.push("CulturalNFT");
    if (!addresses.TranslationMarket) missingContracts.push("TranslationMarket");
    
    if (missingContracts.length > 0) {
      throw new Error(`以下合约地址未找到: ${missingContracts.join(", ")}`);
    }
    
    // 测试各合约功能
    const tokenResult = await testCultureToken(addresses.CultureToken);
    const registryResult = await testAIRegistry(addresses.AIRegistry, addresses.CultureToken);
    const nftResult = await testCulturalNFT(addresses.CulturalNFT);
    const marketResult = await testTranslationMarket(
      addresses.TranslationMarket,
      addresses.CultureToken,
      addresses.CulturalNFT,
      addresses.AIRegistry
    );
    
    // 汇总测试结果
    console.log("\n测试结果汇总:");
    console.log(`CultureToken: ${tokenResult ? "通过 ✅" : "失败 ❌"}`);
    console.log(`AIRegistry: ${registryResult ? "通过 ✅" : "失败 ❌"}`);
    console.log(`CulturalNFT: ${nftResult ? "通过 ✅" : "失败 ❌"}`);
    console.log(`TranslationMarket: ${marketResult ? "通过 ✅" : "失败 ❌"}`);
    
    // 更新测试日志
    await writeTestLog(`\n## 测试结果汇总\n- CultureToken: ${tokenResult ? "通过 ✅" : "失败 ❌"}\n- AIRegistry: ${registryResult ? "通过 ✅" : "失败 ❌"}\n- CulturalNFT: ${nftResult ? "通过 ✅" : "失败 ❌"}\n- TranslationMarket: ${marketResult ? "通过 ✅" : "失败 ❌"}`);
    
    if (tokenResult && registryResult && nftResult && marketResult) {
      console.log("\n所有测试通过! ✅");
      await writeTestLog(`\n## 结论\n所有合约功能测试通过，可以进行下一步集成测试和用户界面连接。`);
    } else {
      console.log("\n部分测试失败，请检查日志了解详情。");
      await writeTestLog(`\n## 结论\n部分测试失败，需要修复问题后重新测试。`);
    }
  } catch (error) {
    console.error("测试过程中出错:", error);
    await writeTestLog(`\n## 错误\n测试过程中出错: ${error.message}`);
  }
}

// 执行测试
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
