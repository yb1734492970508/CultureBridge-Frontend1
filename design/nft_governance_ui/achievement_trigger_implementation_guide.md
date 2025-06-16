# Achievement Trigger System Implementation Guide (CB-DESIGN for CB-FEATURES)
# 成就触发系统实现指南 (CB-DESIGN for CB-FEATURES)

## 1. Overview
## 1. 概述

This document provides the CB-FEATURES team with a specific implementation guide for the CultureBridge platform's achievement trigger system, supplementing the "NFT Achievement Trigger System Technical Specification". This document focuses on system architecture implementation, interaction with smart contracts, API design with the frontend, data storage, performance optimization, and error handling, ensuring that the system implementation complies with design specifications and integrates seamlessly with other modules.
本文档为CB-FEATURES团队提供CultureBridge平台成就触发系统的具体实现指南，是对《NFT成就触发系统技术规范》的补充。本文档重点关注系统架构实现、与智能合约的交互、与前端的API设计、数据存储、性能优化和错误处理，确保系统实现符合设计规范并能与其他模块无缝集成。

## 2. System Architecture Implementation
## 2. 系统架构实现

### 2.1 Core Component Implementation
### 2.1 核心组件实现

- **User Behavior Listeners (Event Listeners)**:
    - **Implementation Method**: Can be multiple independent microservices or modules, each listening for events from different sources (e.g., platform APIs, blockchain events, social platform Webhooks).
    - **实现方式**: 可以是多个独立的微服务或模块，分别监听不同来源的事件（如平台API、区块链事件、社交平台Webhook）。
    - **Blockchain Listening**: Use ethers.js or web3.js libraries to listen for key events from `CBNFTCore`, `CBGovernorCore` and other contracts via WebSocket or polling.
        - **区块链监听**: 使用ethers.js或web3.js库，通过WebSocket或轮询方式监听`CBNFTCore`, `CBGovernorCore`等合约的关键事件。
        - **Key Events**: `AchievementMinted`, `VoteCast`, `ProposalCreated`, `TokenStaked`, `ContentPublished`, `CourseCompleted` (if recorded on-chain).
        - **关键事件**: `AchievementMinted`, `VoteCast`, `ProposalCreated`, `TokenStaked`, `ContentPublished`, `CourseCompleted` (如果链上记录)。
        - **Event Handling**: Ensure event handling is idempotent to prevent duplicate processing (use transaction hash + log index as unique identifier). Retry mechanisms and error logging should be in place for failed processing.
        - **事件处理**: 确保事件处理具有幂等性，防止重复处理（使用交易哈希+日志索引作为唯一标识）。处理失败时应有重试机制和错误记录。
        - **Block Confirmation**: Wait for a sufficient number of block confirmations (e.g., 6-12) before processing events to handle blockchain reorgs.
        - **区块确认**: 等待足够的区块确认数（例如6-12个）再处理事件，以应对区块链重组。
    - **Platform API Listening**: Listen for behavior events sent by internal platforms (e.g., learning platforms, content platforms) via message queues (e.g., RabbitMQ, Kafka) or Webhooks.
    - **平台API监听**: 监听内部平台（如学习平台、内容平台）通过消息队列（如RabbitMQ, Kafka）或Webhook发送的行为事件。
    - **Data Standardization**: Standardize event data from different sources into a unified internal event format.
    - **数据标准化**: 将不同来源的事件数据标准化为统一的内部事件格式。

- **Achievement Condition Evaluator (Condition Evaluator)**:
    - **Implementation Method**: A core service that receives standardized event data and evaluates it based on achievement definitions.
    - **实现方式**: 一个核心服务，接收标准化的事件数据，并根据成就定义进行评估。
    - **Rule Engine**: Consider using a simple rule engine or custom logic to evaluate complex conditions (cumulative, composite, time-based).
    - **规则引擎**: 可以考虑使用简单的规则引擎或自定义逻辑来评估复杂条件（累计、组合、时间）。
    - **State Query**: Requires efficient querying of user progress storage (database) to evaluate cumulative and time-based conditions.
    - **状态查询**: 需要高效查询用户进度存储（数据库）以评估累计和时间条件。
    - **Concurrent Processing**: Should be able to concurrently process event evaluation requests from different users.
    - **并发处理**: 应能并发处理来自不同用户的事件评估请求。

- **Achievement Unlock Executor (Unlock Executor)**:
    - **Implementation Method**: An independent service or module responsible for executing unlock operations when conditions are met.
    - **实现方式**: 一个独立的服务或模块，负责在条件满足时执行解锁操作。
    - **Contract Interaction**: Call `CBAchievementManager` or `CBNFTCore`'s `unlockAchievement` or `mintAchievement` functions.
        - **合约交互**: 调用`CBAchievementManager`或`CBNFTCore`的`unlockAchievement`或`mintAchievement`函数。
        - **Security**: Ensure the account calling the contract has the necessary permissions (`MINTER_ROLE` or similar roles). Private key management must be secure.
        - **安全**: 确保调用合约的账户拥有必要的权限（`MINTER_ROLE`或类似角色）。私钥管理必须安全。
        - **Gas Management**: Monitor and manage Gas fees for transactions. Implement a dynamic Gas price adjustment strategy.
        - **Gas管理**: 监控并管理交易的Gas费用。实现Gas价格动态调整策略。
        - **Transaction Monitoring**: Monitor on-chain transaction status, handle transaction failures (e.g., insufficient Gas, contract rejection), and implement retry logic.
        - **交易监控**: 监控链上交易状态，处理交易失败（如Gas不足、合约拒绝）的情况，实现重试逻辑。
    - **Database Update**: Update user progress storage, marking achievements as unlocked.
    - **数据库更新**: 更新用户进度存储，标记成就已解锁。
    - **Notification**: Call notification service to notify users of achievement unlock.
    - **通知**: 调用通知服务，通知用户成就解锁。

### 2.2 Recommended Technology Stack
### 2.2 技术栈建议

- **Languages**: Node.js (TypeScript), Python, Go
- **语言**: Node.js (TypeScript), Python, Go
- **Databases**: PostgreSQL (for structured progress data), Redis (for caching and counters)
- **数据库**: PostgreSQL (用于结构化进度数据), Redis (用于缓存和计数器)
- **Message Queues**: RabbitMQ, Kafka (for internal event delivery)
- **消息队列**: RabbitMQ, Kafka (用于内部事件传递)
- **Web3 Libraries**: ethers.js, web3.py
- **Web3库**: ethers.js, web3.py
- **Frameworks**: NestJS, Django, Flask, Gin
- **框架**: NestJS, Django, Flask, Gin

## 3. Interaction with Smart Contracts (CB-BACKEND)
## 3. 与智能合约的交互 (CB-BACKEND)

### 3.1 Event Listening
### 3.1 事件监听

- **Configuration**: The system should be configurable for listening contract addresses, ABIs, and starting blocks.
- **配置**: 系统应可配置监听的合约地址、ABI和起始区块。
- **Filtering**: Effectively utilize the `indexed` parameter of contract events for server-side filtering to reduce unnecessary event processing.
- **过滤**: 有效利用合约事件的`indexed`参数进行服务器端过滤，减少不必要的事件处理。
- **Error Handling**: Robustly handle RPC node connection errors, timeouts, and blockchain reorgs.
- **错误处理**: 稳健处理RPC节点连接错误、超时和区块链重组。
- **State Synchronization**: Periodically reconcile with on-chain state to ensure no events are missed by the listener.
- **状态同步**: 定期与链上状态进行核对，确保监听器没有遗漏事件。

### 3.2 Contract Calls
### 3.2 合约调用

- **Interface Encapsulation**: Encapsulate contract interactions into independent modules or services for easy management and testing.
- **接口封装**: 将与合约的交互封装成独立的模块或服务，便于管理和测试。
- **Nonce Management**: Properly manage the Nonce of the calling account to avoid transaction failures or out-of-order transactions.
- **Nonce管理**: 正确管理调用账户的Nonce，避免交易失败或顺序错乱。
- **Gas Estimation and Setting**: Implement dynamic Gas price estimation and allow setting Gas limits.
- **Gas估算与设置**: 实现动态Gas价格估算，并允许设置Gas上限。
- **Return Value Handling**: Properly handle contract call return values and potential errors.
- **返回值处理**: 正确处理合约调用的返回值和可能抛出的错误。
- **Permission Management**: Ensure the account calling the contract has the correct roles and permissions.
- **权限管理**: 确保调用合约的账户拥有正确的角色和权限。

## 4. API Design with Frontend (CB-FRONTEND)
## 4. 与前端的API设计 (CB-FRONTEND)

### 4.1 Core API Endpoints
### 4.1 核心API端点

- **`GET /users/{userId}/achievements`**: Get a list of achievements unlocked by the user.
    - **`GET /users/{userId}/achievements`**: 获取用户已解锁的成就列表。
    - **Parameters**: `userId` (user platform ID or wallet address), `page`, `limit`, `sortBy`, `filterByType`
    - **参数**: `userId` (用户平台ID或钱包地址), `page`, `limit`, `sortBy`, `filterByType`
    - **Response**: List of achievements (including `achievementId`, `name`, `description`, `imageUrl`, `rarity`, `unlockTimestamp`, `tokenId`, etc.) and pagination information.
    - **响应**: 成就列表（包含`achievementId`, `name`, `description`, `imageUrl`, `rarity`, `unlockTimestamp`, `tokenId`等）和分页信息。
- **`GET /users/{userId}/progress`**: Get the current progress of all achievements for a user.
    - **`GET /users/{userId}/progress`**: 获取用户所有成就的当前进度。
    - **Parameters**: `userId`
    - **参数**: `userId`
    - **Response**: An object where keys are achievement criteria IDs (`criteriaId`) and values are current progress (`currentValue`, `targetValue`).
    - **响应**: 一个对象，键为成就条件ID (`criteriaId`)，值为当前进度 (`currentValue`, `targetValue`)。
- **`GET /achievements/{achievementId}`**: Get detailed definition of a specific achievement.
    - **`GET /achievements/{achievementId}`**: 获取特定成就的详细定义。
    - **Parameters**: `achievementId`
    - **参数**: `achievementId`
    - **Response**: Achievement details (name, description, type, rarity, unlock conditions, associated benefits, etc.).
    - **响应**: 成就详情（名称、描述、类型、稀有度、解锁条件、关联权益等）。
- **`POST /events` (Internal or Protected)**: Receive standard user behavior events from other parts of the platform.
    - **`POST /events` (内部或受保护)**: 接收来自平台其他部分的标准用户行为事件。
    - **Request Body**: Standardized event data structure.
    - **请求体**: 标准化的事件数据结构。
    - **Response**: Confirmation of reception or processing status.
    - **响应**: 确认接收或处理状态。

### 4.2 API Design Principles
### 4.2 API设计原则

- **RESTful**: Follow RESTful design principles.
- **RESTful**: 遵循RESTful设计原则。
- **Authentication and Authorization**: Protect API endpoints using JWT or other mechanisms.
- **认证与授权**: 使用JWT或其他机制保护API端点。
- **Data Format**: Use JSON.
- **数据格式**: 使用JSON。
- **Error Handling**: Return standardized error response codes and messages.
- **错误处理**: 返回标准化的错误响应码和信息。
- **Documentation**: Provide clear API documentation (e.g., Swagger/OpenAPI).
- **文档**: 提供清晰的API文档（如Swagger/OpenAPI）。
- **Performance**: Cache frequently queried data.
- **性能**: 对常用查询进行缓存。

## 5. Data Storage
## 5. 数据存储

### 5.1 User Progress Storage
### 5.1 用户进度存储

- **Database Selection**: Relational databases (e.g., PostgreSQL) are suitable for storing structured progress data.
- **数据库选择**: 关系型数据库（如PostgreSQL）适合存储结构化的进度数据。
- **Data Model**: Design a clear data model to store users, achievement definitions, achievement conditions, and user progress.
    - **数据模型**: 设计清晰的数据模型来存储用户、成就定义、成就条件和用户进度。
    - `Users` (userId, walletAddress, ...)
    - `Users` (userId, walletAddress, ...)
    - `Achievements` (achievementId, name, description, type, rarity, ...)
    - `Achievements` (achievementId, name, description, type, rarity, ...)
    - `AchievementCriteria` (criteriaId, achievementId, type, threshold, operator, timeframe, ...)
    - `AchievementCriteria` (criteriaId, achievementId, type, threshold, operator, timeframe, ...)
    - `UserProgress` (userId, criteriaId, currentValue, lastUpdated, ...)
    - `UserProgress` (userId, criteriaId, currentValue, lastUpdated, ...)
    - `UserAchievements` (userId, achievementId, tokenId, unlockTimestamp, ...)
    - `UserAchievements` (userId, achievementId, tokenId, unlockTimestamp, ...)
- **Indexing**: Create indexes for frequently queried fields (e.g., `userId`, `criteriaId`, `achievementId`).
- **索引**: 为常用查询字段（如`userId`, `criteriaId`, `achievementId`）创建索引。
- **Counter Optimization**: For high-frequency updated cumulative conditions, consider using in-memory databases like Redis for counting, and periodically synchronize back to the main database.
- **计数器优化**: 对于高频更新的累计条件，可以考虑使用Redis等内存数据库进行计数，定期同步回主数据库。

### 5.2 Caching
### 5.2 缓存

- **Caching Strategy**: Cache infrequently changing achievement definitions and lists of unlocked achievements (e.g., using Redis).
- **缓存策略**: 对不经常变化的成就定义和用户已解锁成就列表进行缓存（如使用Redis）。
- **Cache Invalidation**: Design reasonable cache invalidation strategies (time-based or event-driven).
- **缓存失效**: 设计合理的缓存失效策略（基于时间或事件驱动）。

## 6. Performance Optimization
## 6. 性能优化

- **Asynchronous Processing**: Process time-consuming operations (e.g., contract calls, complex evaluations) in background task queues.
- **异步处理**: 将耗时的操作（如合约调用、复杂评估）放入后台任务队列处理。
- **Database Optimization**: Optimize database queries, use connection pools.
- **数据库优化**: 优化数据库查询，使用连接池。
- **Batch Processing**: Perform batch operations for event processing and contract calls whenever possible.
- **批量处理**: 对事件处理和合约调用尽可能进行批量操作。
- **Horizontal Scaling**: Design system architecture with stateless services for easy horizontal scaling.
- **水平扩展**: 设计系统架构时考虑无状态服务，便于水平扩展。
- **Monitoring**: Implement comprehensive performance monitoring to identify bottlenecks.
- **监控**: 实施全面的性能监控，识别瓶颈。

## 7. Error Handling and Logging
## 7. 错误处理与日志

- **Unified Error Codes**: Define unified internal error codes for easy problem localization.
- **统一错误码**: 定义统一的内部错误码，便于问题定位。
- **Detailed Logging**: Record key operations, error messages, and system status.
    - **详细日志**: 记录关键操作、错误信息和系统状态。
    - **Log Levels**: Use different log levels (DEBUG, INFO, WARN, ERROR).
    - **日志级别**: 使用不同的日志级别（DEBUG, INFO, WARN, ERROR）。
    - **Structured Logging**: Use JSON or other structured formats for easy processing by log analysis systems.
    - **结构化日志**: 使用JSON或其他结构化格式，便于日志分析系统处理。
- **Alerting**: Set alerts for critical errors (e.g., contract call failures, database connection failures, event processing backlogs).
- **告警**: 对关键错误（如合约调用失败、数据库连接失败、事件处理积压）设置告警。
- **Retry Mechanism**: Implement a retry mechanism with exponential backoff for recoverable errors (e.g., network fluctuations, temporary RPC node failures).
- **重试机制**: 对可恢复的错误（如网络抖动、RPC节点临时故障）实现带有指数退避的重试机制。

## 8. Conclusion
## 8. 结论

The achievement trigger system is a key hub connecting user behavior, platform functions, and blockchain NFTs. The CB-FEATURES team should strictly follow this guide and relevant technical specifications during implementation, focusing on system reliability, scalability, and security. Close communication with the CB-BACKEND and CB-FRONTEND teams to ensure interface consistency and smooth integration is crucial for successful delivery of a high-quality achievement trigger system.
成就触发系统是连接用户行为、平台功能和区块链NFT的关键枢纽。CB-FEATURES团队在实现过程中，应严格遵循本指南和相关技术规范，注重系统的可靠性、可扩展性和安全性。与CB-BACKEND和CB-FRONTEND团队保持密切沟通，确保接口一致性和集成顺畅，是成功交付高质量成就触发系统的关键。

Continuously conduct testing (unit tests, integration tests) during development, and pay attention to performance monitoring and log analysis to promptly identify and resolve issues.
请在开发过程中持续进行测试（单元测试、集成测试），并关注性能监控和日志分析，及时发现并解决问题。


