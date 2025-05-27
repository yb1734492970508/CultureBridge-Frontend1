# CultureBridge 文化通证系统技术方案设计

## 1. 概述

本文档详细阐述了CultureBridge平台文化通证(CULT)系统的技术方案设计，涵盖智能合约设计、前端架构、交互流程、状态管理、安全策略等方面，旨在为后续开发提供清晰的技术指导。

## 2. 智能合约设计 (CultureToken.sol)

### 2.1 合约标准与基础功能

- **标准**：基于OpenZeppelin ERC20标准实现，确保兼容性和安全性。
- **基础功能**：
    - `name()`: 返回通证名称 ("Culture Token")
    - `symbol()`: 返回通证符号 ("CULT")
    - `decimals()`: 返回通证精度 (18)
    - `totalSupply()`: 返回总供应量
    - `balanceOf(address account)`: 查询账户余额
    - `transfer(address recipient, uint256 amount)`: 转账
    - `allowance(address owner, address spender)`: 查询授权额度
    - `approve(address spender, uint256 amount)`: 授权
    - `transferFrom(address sender, address recipient, uint256 amount)`: 代扣转账
- **扩展功能**：
    - `ERC20Burnable`: 允许用户销毁自己的通证
    - `Pausable`: 允许管理员暂停/恢复合约的关键功能 (如转账)
    - `AccessControl`: 基于角色的访问控制，管理管理员、铸币者、暂停者等角色

### 2.2 访问控制角色

- `DEFAULT_ADMIN_ROLE`: 合约最高管理员，可以管理其他角色
- `MINTER_ROLE`: 铸币者角色，可以增发通证 (用于奖励发放等)
- `PAUSER_ROLE`: 暂停者角色，可以暂停/恢复合约
- `UPGRADER_ROLE`: (如果使用可升级合约) 升级者角色，可以升级合约实现

### 2.3 关键函数设计

- `constructor()`: 初始化通证名称、符号、总供应量，并授予调用者管理员、铸币者、暂停者角色。
- `mint(address to, uint256 amount)`: (仅MINTER_ROLE) 增发通证到指定地址。
- `pause()`: (仅PAUSER_ROLE) 暂停合约。
- `unpause()`: (仅PAUSER_ROLE) 恢复合约。
- `burn(uint256 amount)`: 用户销毁自己的通证。
- `burnFrom(address account, uint256 amount)`: 销毁授权账户的通证。

### 2.4 可升级性 (可选，推荐)

- **模式**：采用OpenZeppelin UUPS (Universal Upgradeable Proxy Standard) 模式。
- **实现**：合约继承`UUPSUpgradeable`，实现`_authorizeUpgrade`函数进行权限控制。
- **优点**：允许在不丢失状态的情况下升级合约逻辑。
- **风险**：增加了一定的复杂性和潜在安全风险，需要严格的权限管理。

### 2.5 质押合约设计 (CultureStaking.sol)

- **功能**：
    - `stake(uint256 amount)`: 用户质押CULT通证。
    - `unstake(uint256 amount)`: 用户解除质押。
    - `claimReward()`: 用户领取质押奖励。
    - `getRewardRate()`: 获取当前奖励率。
    - `getUserStake(address account)`: 查询用户质押信息。
    - `getTotalStaked()`: 查询总质押量。
- **奖励计算**：基于质押时间和数量计算奖励，奖励率可由管理员调整。
- **交互**：需要与CultureToken合约交互进行通证的转移和授权。
- **访问控制**：管理员角色可以设置奖励率、管理合约状态等。

### 2.6 合约接口 (JavaScript - src/contracts/token/)

创建`CultureToken.js`和`CultureStaking.js`文件，封装与智能合约交互的函数：

- 获取合约实例 (只读和签名者)
- 调用合约的`view`和`pure`函数 (如`balanceOf`, `totalSupply`)
- 发送交易调用合约的写函数 (如`transfer`, `approve`, `stake`, `unstake`)
- 处理交易状态 (等待、成功、失败)
- 格式化输入输出数据

```javascript
// src/contracts/token/CultureToken.js (示例)
import { ethers } from 'ethers';
import CultureTokenABI from './CultureToken.json'; // 合约ABI

const getContractAddress = (chainId) => { /* ...返回对应链的合约地址... */ };

export const getCultureTokenContract = (library, chainId) => {
  const address = getContractAddress(chainId);
  if (!address || !library) return null;
  return new ethers.Contract(address, CultureTokenABI.abi, library);
};

export const getSignerCultureTokenContract = (library, chainId, account) => {
  const contract = getCultureTokenContract(library, chainId);
  if (!contract || !account) return null;
  return contract.connect(library.getSigner(account));
};

export const fetchBalance = async (library, chainId, account) => {
  const contract = getCultureTokenContract(library, chainId);
  if (!contract || !account) return 0;
  const balance = await contract.balanceOf(account);
  return ethers.utils.formatUnits(balance, 18); // 假设精度为18
};

export const transferTokens = async (library, chainId, account, recipient, amount) => {
  const contract = getSignerCultureTokenContract(library, chainId, account);
  if (!contract) throw new Error('无法获取签名合约实例');
  const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
  const tx = await contract.transfer(recipient, amountInWei);
  const receipt = await tx.wait();
  return { success: receipt.status === 1, transactionHash: tx.hash };
};

// ... 其他合约交互函数 ...
```

## 3. 前端架构设计

### 3.1 组件设计

- **`TokenBalance.js`**: 显示用户当前的CULT通证余额，并提供刷新功能。
- **`TokenTransfer.js`**: 提供通证转账表单，包括接收地址、金额输入和交易确认。
- **`TokenStaking.js`**: 提供质押/解除质押界面，显示质押信息和奖励，处理质押相关交易。
- **`TokenHistory.js`**: 显示用户的通证交易历史记录 (转账、质押、奖励领取等)，支持分页。
- **`TokenInfo.js`**: (可选) 显示通证的基本信息，如总供应量、合约地址等。
- **`TokenRewardDistributor.js`**: (管理员功能) 用于分配平台奖励的界面。

### 3.2 页面设计

- **钱包页面/区域**: 集成`TokenBalance`、`TokenTransfer`、`TokenStaking`和`TokenHistory`组件，提供统一的通证管理入口。
- **NFT市场页面**: 集成通证支付逻辑，显示以CULT计价的价格，处理购买/竞价时的通证支付。
- **个人中心/身份页面**: 显示与通证相关的声誉或等级信息。
- **治理页面**: 集成通证投票逻辑。

### 3.3 状态管理

- **`TokenContext.js`**: 创建专门的React Context来管理通证相关的全局状态：
    - 用户余额 (`balance`)
    - 质押信息 (`stakeInfo`)
    - 交易历史 (`history`)
    - 加载状态 (`loading`)
    - 错误信息 (`error`)
    - 相关合约实例
- **状态更新**: 通过Context提供的函数更新状态，如`fetchBalance()`, `transfer()`, `stake()`。
- **数据同步**: 
    - 定时轮询：定期查询余额和质押信息。
    - 事件监听：监听区块链上的`Transfer`, `Approval`, `Staked`, `Unstaked`, `RewardClaimed`等事件，实时更新状态 (需要配合TheGraph或类似服务)。
    - 手动刷新：提供手动刷新按钮。

### 3.4 交互流程设计

- **转账流程**: 输入接收地址 -> 输入金额 -> 确认交易 -> MetaMask签名 -> 等待交易确认 -> 更新余额和历史记录 -> 显示成功/失败消息。
- **质押流程**: 输入质押金额 -> 确认交易 -> (如果需要) `approve`质押合约 -> `stake` -> MetaMask签名 -> 等待交易确认 -> 更新质押信息和余额 -> 显示成功/失败消息。
- **NFT购买流程**: 点击购买 -> 确认交易 -> (如果需要) `approve`市场合约 -> 市场合约调用`transferFrom` -> MetaMask签名 -> 等待交易确认 -> 更新余额和NFT所有权 -> 显示成功/失败消息。

## 4. 数据流设计

```mermaid
graph LR
    A[用户操作 (如转账/质押)] --> B(React组件);
    B --> C{TokenContext};
    C --> D[合约接口 (JS)];
    D --> E(ethers.js);
    E --> F[区块链网络 (MetaMask)];
    F --> G(智能合约);
    G -- 链上事件 --> H{事件监听服务 (TheGraph/自建)};
    H --> C;
    C --> B;
    B --> I[UI更新];

    J[定时器/手动刷新] --> C;
    K[其他模块 (NFT市场)] --> C;
```

- **用户操作触发**: 用户在前端组件进行操作。
- **Context处理**: 组件调用`TokenContext`提供的函数。
- **合约交互**: `TokenContext`通过封装的合约接口与智能合约交互。
- **区块链确认**: 交易通过MetaMask发送到区块链并等待确认。
- **状态更新 (主动)**: 交易成功后，`TokenContext`主动更新相关状态 (如余额)。
- **状态更新 (被动)**: 事件监听服务捕获链上事件，通知`TokenContext`更新状态。
- **UI反馈**: `TokenContext`的状态变化驱动UI更新。

## 5. 安全策略设计

### 5.1 前端安全

- **输入验证**: 对所有用户输入进行严格验证 (地址格式、金额范围等)。
- **依赖库安全**: 定期更新依赖库 (ethers.js, React等)，关注安全公告。
- **防止XSS/CSRF**: 遵循标准的Web安全实践。
- **交易确认**: 在发送交易前向用户清晰展示交易详情，要求用户确认。
- **错误处理**: 对合约调用和网络错误进行健壮处理，向用户提供清晰的错误信息。

### 5.2 智能合约安全

- **代码审计**: 聘请专业的安全公司进行智能合约审计。
- **形式化验证**: (可选) 对关键逻辑进行形式化验证。
- **测试覆盖**: 编写全面的单元测试和集成测试，覆盖各种边界情况。
- **访问控制**: 严格限制管理员、铸币者、暂停者等角色的权限。
- **紧急暂停机制**: `Pausable`机制用于应对紧急情况。
- **时间锁**: (可选) 对关键的管理员操作 (如修改参数) 添加时间锁。
- **事件日志**: 记录所有关键操作的事件，便于追踪和审计。

### 5.3 交互安全

- **授权管理**: 明确告知用户`approve`操作的含义和风险，提供撤销授权的功能。
- **Gas费预估**: 向用户展示预估的Gas费用。
- **交易监控**: 监控交易状态，及时反馈给用户。

## 6. 集成方案

### 6.1 与NFT市场集成

- **支付**: 在`NFTMarketplace.js`和`NFTMarketDetail.js`中，当用户点击购买或出价时：
    1. 检查用户CULT余额是否足够。
    2. 调用`CultureToken.js`中的`approve`函数，授权市场合约使用所需金额的CULT。
    3. 调用市场合约的购买/出价函数 (市场合约内部会调用`transferFrom`扣除用户通证)。
- **价格显示**: 修改NFT卡片和详情页，显示以CULT计价的价格。
- **手续费**: 市场合约收取的手续费直接以CULT形式转移到指定地址。

### 6.2 与未来模块集成 (身份/治理)

- **Context共享**: `TokenContext`可以被身份和治理模块共享，用于获取用户余额、质押信息等。
- **API扩展**: `CultureToken.js`和`CultureStaking.js`可以根据需要扩展新的接口函数。

## 7. 部署与维护

- **部署网络**: 先部署到Sepolia测试网进行充分测试，再部署到Polygon主网。
- **合约验证**: 在Etherscan/Polygonscan上验证合约源代码。
- **监控**: 设置监控系统，监控合约运行状态、关键事件和异常情况。
- **升级流程**: (如果使用可升级合约) 制定严格的升级流程和权限管理。
- **文档**: 保持技术文档和用户文档的更新。

## 8. 总结

本技术方案详细设计了CultureBridge文化通证系统的实现细节，涵盖了智能合约、前端架构、交互流程、安全策略等关键方面。该方案基于成熟的技术栈和安全实践，具备较高的可行性和可扩展性，能够为平台的经济激励和价值流通提供坚实的基础。
