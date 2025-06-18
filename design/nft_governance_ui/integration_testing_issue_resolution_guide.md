# NFT and Governance System Integration Testing Issue Resolution Guide (CB-DESIGN for CB-FEATURES - Day 18)
# NFT与治理系统集成测试问题解决指南 (CB-DESIGN for CB-FEATURES - Day 18)

## 1. Overview
## 1. 概述

This document provides detailed solutions and implementation guidelines for key issues identified during the integration testing on Day 17. These solutions are based on the CB-DESIGN team's deep understanding of the system architecture, aiming to assist the CB-FEATURES team in quickly resolving issues and ensuring smooth integration testing.
本文档针对第17天集成测试中发现的关键问题，提供详细的解决方案和实施指南。这些解决方案基于CB-DESIGN团队对系统架构的深入理解，旨在协助CB-FEATURES团队快速解决问题，确保集成测试顺利进行。

## 2. Issue UE-003-P1: Contract Gas Insufficient Error Handling
## 2. 问题UE-003-P1：合约Gas不足错误处理

### 2.1 Problem Description
### 2.1 问题描述

When a contract call fails due to insufficient Gas, the achievement service layer fails to correctly capture and display user-friendly error messages, instead returning a generic server error.
当合约调用因Gas不足失败时，成就服务层未能正确捕获并向用户展示友好的错误提示，而是返回了通用服务器错误。

### 2.2 Root Cause Analysis
### 2.2 根本原因分析

1. The achievement service layer does not handle contract call errors by specific types.
2. Error messages are not passed from the contract layer to the frontend layer.
3. Lack of user-friendly prompts for different error types.
1. 成就服务层未对合约调用错误进行细分类型处理
2. 错误信息未从合约层传递到前端层
3. 缺少针对不同错误类型的用户友好提示

### 2.3 Solution
### 2.3 解决方案

#### 2.3.1 Service Layer Error Handling Enhancement
#### 2.3.1 服务层错误处理增强

```javascript
// 成就服务层错误处理增强
async function unlockAchievement(userId, achievementId) {
  try {
    // 获取用户钱包地址
    const userWallet = await getUserWallet(userId);
    if (!userWallet) {
      return {
        success: false,
        error: {
          code: 'WALLET_NOT_FOUND',
          message: '未找到关联钱包，请先绑定钱包'
        }
      };
    }
    
    // 获取成就详情
    const achievement = await getAchievementDetails(achievementId);
    if (!achievement) {
      return {
        success: false,
        error: {
          code: 'ACHIEVEMENT_NOT_FOUND',
          message: '成就不存在'
        }
      };
    }
    
    // 调用合约解锁成就
    const contract = new ethers.Contract(
      config.contracts.achievement.address,
      config.contracts.achievement.abi,
      provider
    );
    
    const signer = new ethers.Wallet(config.privateKey, provider);
    const contractWithSigner = contract.connect(signer);
    
    // 使用try-catch细分处理合约调用错误
    try {
      const tx = await contractWithSigner.mintAchievement(
        userWallet.address,
        achievement.tokenId,
        achievement.uri,
        achievement.rarity
      );
      
      const receipt = await tx.wait();
      
      // 记录成功解锁
      await recordAchievementUnlock(userId, achievementId, receipt.transactionHash);
      
      return {
        success: true,
        data: {
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber
        }
      };
    } catch (contractError) {
      console.error('Contract error:', contractError);
      
      // 细分合约错误类型
      if (contractError.message.includes('gas') || 
          contractError.message.includes('underpriced')) {
        return {
          success: false,
          error: {
            code: 'GAS_INSUFFICIENT',
            message: 'Gas费用不足，请稍后重试或联系管理员',
            details: contractError.message,
            recoverable: true
          }
        };
      }
      
      if (contractError.message.includes('nonce')) {
        return {
          success: false,
          error: {
            code: 'NONCE_ERROR',
            message: '交易序号错误，请稍后重试',
            details: contractError.message,
            recoverable: true
          }
        };
      }
      
      if (contractError.message.includes('already minted') || 
          contractError.message.includes('already exists')) {
        return {
          success: false,
          error: {
            code: 'ALREADY_UNLOCKED',
            message: '该成就已解锁',
            details: contractError.message,
            recoverable: false
          }
        };
      }
      
      // 默认合约错误
      return {
        success: false,
        error: {
          code: 'CONTRACT_ERROR',
          message: '智能合约执行失败',
          details: contractError.message,
          recoverable: true
        }
      };
    }
  } catch (error) {
    console.error('Service error:', error);
    
    // 服务层错误
    return {
      success: false,
      error: {
        code: 'SERVICE_ERROR',
        message: '服务执行失败',
        details: error.message
      }
    };
  }
}
```

#### 2.3.2 API Response Format Standardization
#### 2.3.2 API响应格式标准化

```javascript
// API响应格式标准化
router.post('/achievements/:id/unlock', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const result = await unlockAchievement(userId, id);
  
  if (result.success) {
    return res.status(200).json({
      success: true,
      data: result.data
    });
  } else {
    // 根据错误类型设置适当的HTTP状态码
    let statusCode = 500;
    
    switch (result.error.code) {
      case 'WALLET_NOT_FOUND':
      case 'ACHIEVEMENT_NOT_FOUND':
        statusCode = 404;
        break;
      case 'ALREADY_UNLOCKED':
        statusCode = 409;
        break;
      case 'GAS_INSUFFICIENT':
      case 'NONCE_ERROR':
      case 'CONTRACT_ERROR':
        statusCode = 400;
        break;
      default:
        statusCode = 500;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: result.error.code,
        message: result.error.message,
        recoverable: result.error.recoverable
      }
    });
  }
});
```

#### 2.3.3 Frontend Error Handling and User Prompts
#### 2.3.3 前端错误处理与用户提示

```javascript
// 前端错误处理与用户提示
async function handleUnlockAchievement(achievementId) {
  setLoading(true);
  setError(null);
  
  try {
    const response = await api.post(`/achievements/${achievementId}/unlock`);
    
    if (response.data.success) {
      // 显示成功动画
      showUnlockAnimation(achievementId);
      return true;
    }
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    
    let errorMessage = '解锁成就失败，请稍后重试';
    let isRecoverable = true;
    
    // 解析API错误响应
    if (error.response && error.response.data && error.response.data.error) {
      const apiError = error.response.data.error;
      
      // 使用API返回的错误信息
      errorMessage = apiError.message;
      
      // 特定错误类型的处理
      switch (apiError.code) {
        case 'GAS_INSUFFICIENT':
          errorMessage = 'Gas费用不足，系统将在稍后自动重试。您也可以手动重试解锁。';
          // 可以在这里添加自动重试逻辑
          break;
        case 'ALREADY_UNLOCKED':
          errorMessage = '该成就已解锁，请刷新页面查看最新状态。';
          isRecoverable = false;
          // 刷新成就状态
          refreshAchievements();
          break;
        case 'WALLET_NOT_FOUND':
          errorMessage = '未找到关联钱包，请先在个人设置中绑定钱包。';
          // 可以添加跳转到钱包绑定页面的逻辑
          break;
      }
    }
    
    // 设置错误状态，显示给用户
    setError({
      message: errorMessage,
      recoverable: isRecoverable
    });
    
    return false;
  } finally {
    setLoading(false);
  }
}
```

### 2.4 Implementation Steps
### 2.4 实施步骤

1. The CB-FEATURES team updates the error handling logic of the achievement service layer.
2. Standardize the API error response format.
3. The frontend team enhances error handling and user prompts.
4. Add an automatic retry mechanism (optional).
5. Conduct integration testing and verification.
1. CB-FEATURES团队更新成就服务层的错误处理逻辑
2. 标准化API错误响应格式
3. 前端团队增强错误处理和用户提示
4. 添加自动重试机制（可选）
5. 进行集成测试验证

### 2.5 Test Verification Method
### 2.5 测试验证方法

1. Simulate insufficient Gas scenario: This error can be triggered by setting an extremely low Gas limit.
2. Verify that error messages are correctly passed to the frontend.
3. Verify that users receive friendly error prompts.
4. Verify that the automatic retry mechanism works correctly (if implemented).
1. 模拟Gas不足场景：可以通过设置极低的Gas限制来触发此错误
2. 验证错误信息是否正确传递到前端
3. 验证用户是否收到友好的错误提示
4. 验证自动重试机制是否正常工作（如果实施）

## 3. Issue VM-002-P1: NFT Weight Accumulation Logic
## 3. 问题VM-002-P1：NFT权重累加逻辑

### 3.1 Problem Description
### 3.1 问题描述

In the NFT weight calculation logic, when holding multiple NFTs of the same type but different IDs (e.g., multiple "Early Contributor" NFTs), the weight is not correctly accumulated.
NFT权重计算逻辑中，对于持有多个同类型但不同ID的NFT（例如多个"早期贡献者"NFT），权重未能正确叠加。

### 3.2 Root Cause Analysis
### 3.2 根本原因分析

1. The `getVotes` function in the contract only considers the NFT type when calculating NFT weight, and does not correctly accumulate the weight of multiple NFTs of the same type.
2. The service layer does not perform additional verification and processing when calling the contract to get voting weight.
1. 合约中的`getVotes`函数在计算NFT权重时，只考虑了NFT类型，而没有正确累加同类型多个NFT的权重
2. 服务层在调用合约获取投票权重时，没有进行额外的验证和处理

### 3.3 Solution
### 3.3 解决方案

#### 3.3.1 Smart Contract Fix (CB-BACKEND Responsible)
#### 3.3.1 智能合约修复（CB-BACKEND负责）

```solidity
// 修复NFT权重累加逻辑
function getVotes(address account) public view override returns (uint256) {
    // 基础代币投票权重
    uint256 tokenVotes = super.getVotes(account);
    
    // NFT投票权重
    uint256 nftVotes = 0;
    
    // 获取账户拥有的所有NFT
    uint256[] memory tokenIds = achievementNFT.getTokensOfOwner(account);
    
    // 遍历所有NFT并累加权重
    for (uint256 i = 0; i < tokenIds.length; i++) {
        uint256 tokenId = tokenIds[i];
        uint8 rarity = achievementNFT.getRarity(tokenId);
        
        // 根据稀有度计算权重
        uint256 weight = 0;
        if (rarity == 1) { // Common
            weight = 100 * 10**decimals();
        } else if (rarity == 2) { // Rare
            weight = 300 * 10**decimals();
        } else if (rarity == 3) { // Epic
            weight = 600 * 10**decimals();
        } else if (rarity == 4) { // Legendary
            weight = 1000 * 10**decimals();
        }
        
        // 累加权重
        nftVotes += weight;
    }
    
    return tokenVotes + nftVotes;
}
```

#### 3.3.2 Service Layer Adaptation (CB-FEATURES Responsible)
#### 3.3.2 服务层适配（CB-FEATURES负责）

```javascript
// 服务层适配NFT权重累加逻辑
async function calculateVotingPower(userId) {
  try {
    // 获取用户钱包地址
    const userWallet = await getUserWallet(userId);
    if (!userWallet) {
      return {
        success: false,
        error: {
          code: 'WALLET_NOT_FOUND',
          message: '未找到关联钱包'
        }
      };
    }
    
    // 调用合约获取投票权重
    const governanceContract = new ethers.Contract(
      config.contracts.governance.address,
      config.contracts.governance.abi,
      provider
    );
    
    const votingPower = await governanceContract.getVotes(userWallet.address);
    
    // 获取用户持有的NFT详情（用于前端展示）
    const nftContract = new ethers.Contract(
      config.contracts.achievement.address,
      config.contracts.achievement.abi,
      provider
    );
    
    const tokenIds = await nftContract.getTokensOfOwner(userWallet.address);
    const nftDetails = [];
    
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      const rarity = await nftContract.getRarity(tokenId);
      const uri = await nftContract.tokenURI(tokenId);
      
      // 获取NFT元数据
      const metadata = await fetchMetadata(uri);
      
      nftDetails.push({
        tokenId: tokenId.toString(),
        rarity,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        weight: calculateNFTWeight(rarity) // 辅助函数计算权重
      });
    }
    
    // 返回投票权重和NFT详情
    return {
      success: true,
      data: {
        totalVotingPower: ethers.utils.formatUnits(votingPower, 18),
        nftDetails
      }
    };
  } catch (error) {
    console.error('Error calculating voting power:', error);
    
    return {
      success: false,
      error: {
        code: 'CALCULATION_ERROR',
        message: '计算投票权重失败',
        details: error.message
      }
    };
  }
}

// 辅助函数：根据稀有度计算NFT权重
function calculateNFTWeight(rarity) {
  switch (rarity) {
    case 1: // Common
      return 100;
    case 2: // Rare
      return 300;
    case 3: // Epic
      return 600;
    case 4: // Legendary
      return 1000;
    default:
      return 0;
  }
}
```

#### 3.3.3 Frontend Display Optimization
#### 3.3.3 前端展示优化

```jsx
// 前端展示NFT投票权重
const VotingPowerBreakdown = ({ votingPower, nftDetails }) => {
  const tokenVotingPower = votingPower - nftDetails.reduce((sum, nft) => sum + nft.weight, 0);
  
  return (
    <div className={styles.votingPowerBreakdown}>
      <h3>投票权重明细</h3>
      
      <div className={styles.breakdownItem}>
        <span>代币投票权重:</span>
        <span>{tokenVotingPower.toLocaleString()}</span>
      </div>
      
      <h4>NFT加成:</h4>
      {nftDetails.length > 0 ? (
        <div className={styles.nftList}>
          {nftDetails.map(nft => (
            <div key={nft.tokenId} className={styles.nftItem}>
              <img src={nft.image} alt={nft.name} className={styles.nftImage} />
              <div className={styles.nftInfo}>
                <h5>{nft.name}</h5>
                <span className={styles.rarityBadge}>
                  {getRarityLabel(nft.rarity)}
                </span>
                <span className={styles.nftWeight}>+{nft.weight.toLocaleString()} 投票权</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noNft}>您还没有持有任何NFT成就</p>
      )}
      
      <div className={styles.totalVotingPower}>
        <span>总投票权重:</span>
        <span>{votingPower.toLocaleString()}</span>
      </div>
    </div>
  );
};

// 辅助函数：获取稀有度标签
function getRarityLabel(rarity) {
  switch (rarity) {
    case 1:
      return '普通';
    case 2:
      return '稀有';
    case 3:
      return '史诗';
    case 4:
      return '传说';
    default:
      return '未知';
  }
}
```

### 3.4 Implementation Steps
### 3.4 实施步骤

1. The CB-BACKEND team fixes the `getVotes` function in the contract.
2. The CB-FEATURES team adapts the service layer logic.
3. The CB-FRONTEND team optimizes the frontend display.
4. Conduct integration testing and verification.
1. CB-BACKEND团队修复合约中的`getVotes`函数
2. CB-FEATURES团队适配服务层逻辑
3. CB-FRONTEND团队优化前端展示
4. 进行集成测试验证

### 3.5 Test Verification Method
### 3.5 测试验证方法

1. Create test accounts holding multiple NFTs of the same type but different IDs.
2. Verify that voting weights are correctly accumulated.
3. Verify that the frontend display correctly shows the weight contribution of each NFT.
4. Test weight calculation for different rarity combinations.
1. 创建测试账户，持有多个同类型但不同ID的NFT
2. 验证投票权重是否正确累加
3. 验证前端展示是否正确显示每个NFT的权重贡献
4. 测试不同稀有度组合的权重计算

## 4. Integration Test Progress Tracking
## 4. 集成测试进度跟踪

### 4.1 Today's Test Plan
### 4.1 今日测试计划

| Test ID | Test Scenario | Priority | Responsible | Planned Time | Dependencies |
|---|---|---|---|---|---|
| VM-005 | Voting power delegation process | High | CB-FEATURES | Morning | None |
| VM-006 | Snapshot mechanism test | High | CB-FEATURES | Morning | None |
| NG-002 | NFT affects governance weight | High | CB-FEATURES | Afternoon | VM-002-P1 fix |
| NG-003 | Governance activity affects NFT attributes | Medium | CB-FEATURES | Afternoon | None |
| NG-005 | Governance contribution enhances NFT level | Medium | CB-FEATURES | Afternoon | None |
| DF-002 | Application layer to on-chain data flow | High | CB-FEATURES | Morning | None |
| DF-003 | Cache consistency test | High | CB-FEATURES | Afternoon | None |
| EH-002 | Network interruption handling | Medium | CB-FEATURES | Afternoon | None |
| EH-003 | Event listening interruption handling | Medium | CB-FEATURES | Afternoon | None |
| PT-001 | High-frequency event performance detection | Low | CB-FEATURES | To be determined | Other tests completed |

### 4.2 Issue Fix Tracking
### 4.2 问题修复跟踪

| Issue ID | Description | Responsible | Planned Completion Time | Status | Verification Method |
|---|---|---|---|---|---|
| UE-003-P1 | Contract Gas insufficient error handling | CB-FEATURES | Day 18 Morning | In progress | Simulate insufficient Gas scenario test |
| VM-002-P1 | NFT weight accumulation logic | CB-BACKEND, CB-FEATURES | Day 18 Morning | In progress | Multi-NFT holding test |

## 5. Collaboration Suggestions
## 5. 协作建议

### 5.1 CB-FEATURES and CB-BACKEND Collaboration
### 5.1 CB-FEATURES与CB-BACKEND协作

1. **Real-time Communication**: It is recommended that the CB-FEATURES and CB-BACKEND teams establish real-time communication channels to synchronize the progress of VM-002-P1 issue fixes in a timely manner.
2. **Joint Testing**: After the contract fix, the two teams should conduct joint testing to ensure the fix is effective.
3. **Document Sharing**: CB-BACKEND should provide detailed documentation of contract modifications, including changes in function signatures, parameters, and return values.
1. **实时沟通**：建议CB-FEATURES与CB-BACKEND团队建立实时沟通渠道，及时同步VM-002-P1问题的修复进展
2. **联合测试**：合约修复后，两个团队应进行联合测试，确保修复有效
3. **文档共享**：CB-BACKEND应提供合约修改的详细文档，包括函数签名、参数和返回值的变化

### 5.2 CB-FEATURES and CB-FRONTEND Collaboration
### 5.2 CB-FEATURES与CB-FRONTEND协作

1. **Error Handling Standard**: Establish a unified error handling standard to ensure that the frontend can correctly parse and display errors returned by the service layer.
2. **User Experience Coordination**: When resolving issue UE-003-P1, CB-FEATURES and CB-FRONTEND should coordinate the user experience of error prompts.
3. **Data Format Consistency**: Ensure consistency of NFT weight data format and units between the service layer and the frontend.
1. **错误处理标准**：建立统一的错误处理标准，确保前端能正确解析和展示服务层返回的错误
2. **用户体验协调**：在解决UE-003-P1问题时，CB-FEATURES和CB-FRONTEND应协调错误提示的用户体验
3. **数据格式一致**：确保NFT权重数据的格式和单位在服务层和前端之间保持一致

## 6. Conclusion
## 6. 结论

Through the solutions provided in this document, the CB-FEATURES team should be able to effectively resolve key issues found during integration testing. These solutions not only fix current problems but also enhance the system's error handling capabilities and user experience. The CB-DESIGN team will continue to track the progress of issue resolution and provide necessary support and guidance.
通过本文档提供的解决方案，CB-FEATURES团队应能够有效解决集成测试中发现的关键问题。这些解决方案不仅修复了当前的问题，还增强了系统的错误处理能力和用户体验。CB-DESIGN团队将继续跟进问题解决进展，并提供必要的支持和指导。


