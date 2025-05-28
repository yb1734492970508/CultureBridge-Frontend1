# CultureBridge 文化通证系统技术设计方案

## 1. 概述

本文档详细阐述CultureBridge平台文化通证(ERC-20)系统的技术设计方案，包括智能合约设计、前端组件架构、上下文管理、与现有模块的集成策略以及安全考量，旨在为后续开发提供清晰的技术指引。

## 2. 系统架构

文化通证系统采用分层架构，确保模块化、可扩展性和可维护性：

1.  **智能合约层 (Blockchain Layer)**：
    *   负责通证的核心逻辑，包括发行、转账、余额管理、质押等。
    *   基于以太坊虚拟机(EVM)兼容链部署。
    *   采用OpenZeppelin安全合约库作为基础。

2.  **后端/索引层 (Backend/Indexing Layer)**：
    *   (可选，初期可依赖前端直接交互) 负责索引链上事件，提供高效的数据查询接口。
    *   可使用TheGraph或自建索引服务。
    *   处理链下逻辑和数据关联。

3.  **前端服务层 (Frontend Service Layer)**：
    *   封装与智能合约和后端服务的交互逻辑。
    *   提供统一的API接口供UI组件调用。
    *   管理通证相关的状态（使用React Context API）。

4.  **用户界面层 (UI Layer)**：
    *   提供用户交互界面，展示通证信息、执行操作。
    *   基于React组件库构建。
    *   与现有UI风格保持一致。

## 3. 智能合约设计 (Solidity)

### 3.1 核心通证合约 (`CultureToken.sol`)

*   **标准**：ERC-20
*   **基础库**：OpenZeppelin `ERC20.sol`, `ERC20Burnable.sol`, `Pausable.sol`, `AccessControl.sol`
*   **代币信息**：
    *   名称：Culture Token
    *   符号：CULT
    *   精度：18
    *   总供应量：1,000,000,000 CULT (暂定，可在构造函数中设置)
*   **核心功能**：
    *   标准ERC-20功能：`transfer`, `approve`, `transferFrom`, `balanceOf`, `totalSupply`等。
    *   `burn`: 允许用户销毁自己的通证。
    *   `burnFrom`: 允许授权地址销毁指定地址的通证。
    *   `pause`/`unpause`: 管理员可暂停/恢复合约的关键操作（如转账）。
    *   `mint`: 仅限MINTER_ROLE角色的地址增发通证（用于奖励分发等）。
*   **访问控制 (AccessControl)**：
    *   `DEFAULT_ADMIN_ROLE`: 合约管理员，可管理角色。
    *   `PAUSER_ROLE`: 可暂停/恢复合约。
    *   `MINTER_ROLE`: 可增发通证。
    *   `BURNER_ROLE`: (可选) 可销毁任意地址通证。
*   **可升级性**：考虑使用OpenZeppelin UUPS (Universal Upgradeable Proxy Standard) 模式，允许未来升级合约逻辑。

### 3.2 质押合约 (`StakingContract.sol`)

*   **功能**：
    *   `stake(uint256 amount)`: 用户质押CULT通证。
    *   `unstake(uint256 amount)`: 用户解除质押。
    *   `claimRewards()`: 用户领取质押奖励。
    *   `calculateRewards(address user)`: 计算用户当前可领取的奖励。
    *   `updateRewardRate(uint256 newRate)`: (管理员) 更新奖励发放速率。
*   **奖励机制**：基于质押时间和数量计算奖励，奖励以CULT通证形式发放。
*   **交互**：需要与`CultureToken.sol`合约交互，进行通证的转移和授权。
*   **安全性**：防止重入攻击，精确计算奖励，权限控制。

### 3.3 (可选) 流动性挖矿合约 (`LiquidityMining.sol`)

*   **功能**：
    *   `addLiquidityPool(address lpTokenAddress, uint256 allocationPoint)`: (管理员) 添加支持的流动性池。
    *   `deposit(uint256 poolId, uint256 amount)`: 用户存入LP Token。
    *   `withdraw(uint256 poolId, uint256 amount)`: 用户取出LP Token。
    *   `claimRewards(uint256 poolId)`: 用户领取挖矿奖励。
*   **集成**：需要与去中心化交易所(DEX)的LP Token集成。

## 4. 前端组件设计 (React)

### 4.1 通证上下文 (`TokenContext.js`)

*   **目的**：全局管理通证相关状态和逻辑。
*   **状态**：
    *   `tokenContract`: CULT通证合约实例。
    *   `stakingContract`: 质押合约实例。
    *   `userBalance`: 当前用户CULT余额。
    *   `allowance`: 用户对特定合约（如市场、质押）的授权额度。
    *   `stakingInfo`: 用户质押信息（质押数量、奖励等）。
    *   `transactionHistory`: 用户通证交易历史。
    *   `isLoading`: 加载状态。
    *   `error`: 错误信息。
*   **方法**：
    *   `connectWallet()`: 连接钱包。
    *   `fetchBalance()`: 获取用户余额。
    *   `transferTokens(address to, uint256 amount)`: 转账。
    *   `approveContract(address spender, uint256 amount)`: 授权。
    *   `stakeTokens(uint256 amount)`: 质押。
    *   `unstakeTokens(uint256 amount)`: 解除质押。
    *   `claimStakingRewards()`: 领取奖励。
    *   `fetchTransactionHistory()`: 获取交易历史。

### 4.2 UI组件

*   **`TokenBalanceDisplay.js`**
    *   显示当前用户的CULT余额。
    *   提供刷新按钮。
    *   集成到钱包概览或用户中心。
*   **`TokenTransferForm.js`**
    *   输入接收地址和转账金额。
    *   表单验证。
    *   调用`transferTokens`方法。
    *   显示交易状态和确认信息。
*   **`StakingInterface.js`**
    *   显示用户质押信息（数量、奖励、APY等）。
    *   提供质押、解除质押、领取奖励的操作按钮。
    *   包含`StakingForm.js`和`UnstakeForm.js`子组件。
*   **`TokenTransactionHistory.js`**
    *   以列表或表格形式展示用户通证交易历史。
    *   支持分页和筛选。
    *   链接到区块链浏览器查看交易详情。
*   **`TokenApprovalManager.js`**
    *   (可选) 管理用户对不同合约的授权额度。
    *   允许用户增加或撤销授权。

## 5. 与现有模块集成

### 5.1 NFT市场集成

*   **支付**：在`NFTPurchaseModal.js`和`NFTBidModal.js`中，添加使用CULT通证支付的选项。
    *   购买前检查用户CULT余额和对市场合约的授权。
    *   调用`approveContract`进行授权（如果需要）。
    *   调用市场合约的购买/出价函数，传递CULT作为支付方式。
*   **手续费**：修改市场合约，使其接受CULT作为手续费支付方式。
*   **版税**：修改市场合约，将版税以CULT形式支付给创作者。

### 5.2 身份与声誉系统集成

*   **声誉计算**：修改声誉计算逻辑，将CULT持有量和质押量作为影响因子之一。
*   **权限授予**：某些平台功能（如创建高级提案）可能需要用户持有或质押一定数量的CULT。

### 5.3 DAO治理系统集成

*   **投票权重**：DAO合约读取用户的CULT余额或质押量作为投票权重。
*   **提案门槛**：提交提案需要用户持有或质押指定数量的CULT。

### 5.4 激励系统集成

*   **奖励分发**：开发一个中心化的奖励分发服务或智能合约，根据用户行为（如完成任务、贡献内容）调用`CultureToken.sol`的`mint`或`transfer`方法分发奖励。

## 6. 数据管理与索引

*   **链上数据**：核心数据（余额、质押状态、交易记录）存储在区块链上。
*   **前端状态**：使用`TokenContext`管理实时状态。
*   **事件索引**：
    *   **方案一 (前端轮询)**：前端定期调用合约读取最新状态（简单，但效率低）。
    *   **方案二 (前端事件监听)**：前端使用`ethers.js`监听合约事件实时更新状态（推荐，实时性好）。
    *   **方案三 (TheGraph)**：部署Subgraph索引通证和质押合约事件，前端通过GraphQL查询（扩展性好，但增加复杂度）。
*   **本地存储**：可使用LocalStorage存储用户偏好，如交易历史筛选条件。

## 7. 安全考量

*   **智能合约安全**：
    *   严格遵循OpenZeppelin安全实践。
    *   进行全面的单元测试和集成测试。
    *   部署前进行专业安全审计。
    *   使用多签钱包管理管理员权限。
    *   考虑添加时间锁（Timelock）来延迟关键操作的执行。
*   **前端安全**：
    *   防止跨站脚本攻击(XSS)。
    *   安全处理用户输入。
    *   明确展示交易详情，防止用户误操作。
    *   与钱包安全交互。
*   **经济模型安全**：
    *   防止通证增发滥用。
    *   设计合理的质押奖励机制，避免过高通胀。
    *   监控通证流通和价格，防范市场操纵。

## 8. 部署与维护

*   **部署网络**：初期部署到Sepolia测试网进行充分测试，后续考虑部署到Polygon或其他低Gas费用的EVM兼容链。
*   **合约升级**：采用UUPS代理模式，制定详细的升级流程和回滚计划。
*   **监控**：监控合约事件、交易量、Gas费用、服务器状态等。
*   **文档**：编写完善的开发者文档和用户文档。

## 9. 总结

本技术设计方案为CultureBridge文化通证系统的实现提供了详细的蓝图。通过采用成熟的ERC-20标准、安全的智能合约实践和模块化的前端设计，可以构建一个功能完善、安全可靠且易于扩展的通证系统，为平台的经济激励和生态发展奠定坚实基础。
