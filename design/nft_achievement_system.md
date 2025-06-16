# CultureBridge NFT Achievement System Detailed Design
# CultureBridge NFT成就系统详细设计

## 1. Overview
## 1. 概述

This document details the design of the CultureBridge platform's NFT achievement system, which records and incentivizes learning achievements, creative contributions, and community participation through NFT forms. The NFT achievement system not only provides users with a way to showcase personal growth and contributions but also, through deep integration with the token economic model, offers holders substantial platform rights and incentive bonuses, thereby promoting user participation and the sustainable development of the platform ecosystem.
本文档详细设计了CultureBridge平台的NFT成就系统，该系统将学习成就、创作贡献和社区参与通过NFT形式进行记录和激励。NFT成就系统不仅为用户提供了展示个人成长和贡献的方式，还通过与代币经济模型的深度结合，为持有者提供实质性的平台权益和激励加成，从而促进用户参与和平台生态的可持续发展。

## 2. System Architecture
## 2. 系统架构

### 2.1 Core Components
### 2.1 核心组件

The NFT achievement system consists of the following core components:
NFT成就系统由以下核心组件构成：

1. **NFT Smart Contract**: BEP-721 standard-based smart contract responsible for NFT minting, transfer, and management.
1. **NFT智能合约**：基于BEP-721标准开发的智能合约，负责NFT的铸造、转移和管理
2. **Achievement Trigger System**: Monitors user behavior and milestones, automatically triggering achievement unlocking.
2. **成就触发系统**：监控用户行为和里程碑，自动触发成就解锁
3. **Metadata Storage System**: Stores NFT-related metadata and visual resources.
3. **元数据存储系统**：存储NFT相关的元数据和视觉资源
4. **Benefit Execution System**: Implements NFT holders' rights and reward bonuses.
4. **权益执行系统**：实现NFT持有者的权益和奖励加成
5. **Display and Trading Interface**: User interface for viewing, displaying, and trading NFTs.
5. **展示与交易界面**：用户查看、展示和交易NFT的界面

### 2.2 Technical Architecture Diagram
### 2.2 技术架构图

```
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  User Behavior Tracking System |---->|  Achievement Trigger System  |---->|  NFT Minting System    |
|  用户行为跟踪系统       |---->|  成就触发系统          |---->|  NFT铸造系统           |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
                                                                        |
                                                                        v
+------------------------+     +------------------------+     +------------------------+
|                        |     |                        |     |                        |
|  NFT Display & Trading Interface |<----|  Benefit Execution System  |<----|  Metadata Storage System |
|  NFT展示与交易界面      |<----|  权益执行系统          |<----|  元数据存储系统        |
|                        |     |                        |     |                        |
+------------------------+     +------------------------+     +------------------------+
```

### 2.3 Integration with Other Systems
### 2.3 与其他系统的集成

The NFT achievement system is tightly integrated with the following CultureBridge platform systems:
NFT成就系统与以下CultureBridge平台系统紧密集成：

1. **Learning System**: Tracks course completion, quiz scores, and learning streaks.
1. **学习系统**：跟踪课程完成、测验成绩和学习连续性
2. **Creation System**: Monitors content creation, quality ratings, and community feedback.
2. **创作系统**：监控内容创建、质量评分和社区反馈
3. **Community Participation System**: Records activity participation, contributions, and governance participation.
3. **社区参与系统**：记录活动参与、贡献和治理参与
4. **Tokenomics System**: Implements NFT holders' reward bonuses and special rights.
4. **代币经济系统**：实现NFT持有者的奖励加成和特殊权益
5. **User Profile System**: Displays achievements and badges earned by users.
5. **用户档案系统**：展示用户获得的成就和徽章

## 3. NFT Achievement Types and Design
## 3. NFT成就类型与设计

### 3.1 Learning Achievement NFTs
### 3.1 学习成就NFT

#### 3.1.1 Language Learning Achievements
#### 3.1.1 语言学习成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Language Explorer | Complete 5 beginner courses | Common | Learning reward +3% | Basic map and compass |
| 语言探索者 | 完成5个初级课程 | 普通 | 学习奖励+3% | 基础地图与指南针 |
| Language Beginner | Complete 10 beginner courses | Common | Learning reward +5% | Open language textbook |
| 语言入门者 | 完成10个初级课程 | 普通 | 学习奖励+5% | 打开的语言入门书 |
| Language Enthusiast | Complete 10 intermediate courses | Rare | Learning reward +8% | Multilingual communication icon |
| 语言爱好者 | 完成10个中级课程 | 稀有 | 学习奖励+8% | 多语言交流图标 |
| Language Advanced | Complete 20 intermediate courses | Rare | Learning reward +10% | Advanced language symbols |
| 语言进阶者 | 完成20个中级课程 | 稀有 | 学习奖励+10% | 进阶语言符号 |
| Language Master | Complete 15 advanced courses | Epic | Learning reward +15% | Tree of language mastery |
| 语言精通者 | 完成15个高级课程 | 史诗 | 学习奖励+15% | 精通语言之树 |
| Grand Language Master | Complete 10 expert courses | Legendary | Learning reward +20% | Crown of language master |
| 语言大师 | 完成10个专家课程 | 传奇 | 学习奖励+20% | 语言大师王冠 |
| Multilingual | Reach intermediate level in 3+ languages | Epic | Learning reward +12% | Multilingual planet |
| 多语言通 | 在3种以上语言达到中级 | 史诗 | 学习奖励+12% | 多语言星球 |
| Language Scholar | Reach expert level in 1 language | Legendary | Learning reward +18% | Academic language scroll |
| 语言学者 | 在1种语言达到专家级 | 传奇 | 学习奖励+18% | 学术语言卷轴 |

#### 3.1.2 Learning Habit Achievements
#### 3.1.2 学习习惯成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Learning Spark | Study continuously for 3 days | Common | Continuous learning reward +2% | Small spark icon |
| 学习火花 | 连续学习3天 | 普通 | 连续学习奖励+2% | 小火花图标 |
| Learning Fire | Study continuously for 7 days | Common | Continuous learning reward +5% | Stable flame icon |
| 学习之火 | 连续学习7天 | 普通 | 连续学习奖励+5% | 稳定火焰图标 |
| Learning Blaze | Study continuously for 14 days | Rare | Continuous learning reward +8% | Bright flame icon |
| 学习烈焰 | 连续学习14天 | 稀有 | 连续学习奖励+8% | 明亮火焰图标 |
| Learning Pro | Study continuously for 30 days | Epic | Continuous learning reward +10% | Burning torch icon |
| 学习达人 | 连续学习30天 | 史诗 | 连续学习奖励+10% | 燃烧火炬图标 |
| Learning Guru | Study continuously for 60 days | Legendary | Continuous learning reward +15% | Eternal flame icon |
| 学习大师 | 连续学习60天 | 传奇 | 连续学习奖励+15% | 永恒火焰图标 |
| Morning Scholar | Study in the morning for 30 days | Rare | Morning learning reward +10% | Sunrise and book |
| 晨间学者 | 30天在早晨学习 | 稀有 | 早晨学习奖励+10% | 日出与书本 |
| Night Thinker | Study at night for 30 days | Rare | Night learning reward +10% | Moon and book |
| 夜间思考者 | 30天在晚上学习 | 稀有 | 晚间学习奖励+10% | 月亮与书本 |
| Weekend Warrior | Complete learning on 8 weekends | Rare | Weekend learning reward +10% | Weekend calendar icon |
| 周末战士 | 8个周末完成学习 | 稀有 | 周末学习奖励+10% | 周末日历图标 |

#### 3.1.3 Quiz Achievements
#### 3.1.3 测验成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Quiz Novice | Complete 5 quizzes | Common | Quiz reward +3% | Basic quiz icon |
| 测验新手 | 完成5次测验 | 普通 | 测验奖励+3% | 基础测验图标 |
| Quiz Master | Complete 20 quizzes | Rare | Quiz reward +8% | Advanced quiz icon |
| 测验达人 | 完成20次测验 | 稀有 | 测验奖励+8% | 高级测验图标 |
| Excellent Student | Achieve 80%+ score 5 times | Rare | Quiz reward +10% | Excellent medal icon |
| 优秀学员 | 获得5次80%以上成绩 | 稀有 | 测验奖励+10% | 优秀奖章图标 |
| Quiz King | Achieve 95%+ score 10 times | Epic | Quiz reward +15% | King's trophy icon |
| 测验王者 | 获得10次95%以上成绩 | 史诗 | 测验奖励+15% | 王者奖杯图标 |
| Perfectionist | Achieve 100% score 5 times | Legendary | Quiz reward +20% | Perfect star icon |
| 完美主义者 | 获得5次100%成绩 | 传奇 | 测验奖励+20% | 完美星星图标 |
| Speed Expert | Complete quiz within half of the time limit 10 times | Epic | Quiz time reward +15% | Lightning quiz icon |
| 速答专家 | 10次在规定时间一半内完成测验 | 史诗 | 测验时间奖励+15% | 闪电测验图标 |
| Challenge Master | Complete 5 high-difficulty quizzes | Legendary | High-difficulty quiz reward +20% | Challenge trophy icon |
| 挑战大师 | 完成5次高难度测验 | 传奇 | 高难测验奖励+20% | 挑战奖杯图标 |

### 3.2 Creation Achievement NFTs
### 3.2 创作成就NFT

#### 3.2.1 Translation Achievements
#### 3.2.1 翻译成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Translation Novice | Complete 10 translations | Common | Translation reward +3% | Basic translation icon |
| 翻译新手 | 完成10次翻译 | 普通 | 翻译奖励+3% | 基础翻译图标 |
| Translation Pro | Complete 50 translations | Rare | Translation reward +8% | Professional translation icon |
| 翻译能手 | 完成50次翻译 | 稀有 | 翻译奖励+8% | 专业翻译图标 |
| Translation Expert | Complete 100 translations with average 4+ stars | Epic | Translation reward +15% | Expert translation badge |
| 翻译专家 | 完成100次翻译且平均4星以上 | 史诗 | 翻译奖励+15% | 专家翻译徽章 |
| Translation Master | Complete 200 translations with average 4.5+ stars | Legendary | Translation reward +20% | Master translation crown |
| 翻译大师 | 完成200次翻译且平均4.5星以上 | 传奇 | 翻译奖励+20% | 大师翻译王冠 |
| Domain Translator | Complete 50 translations in a specific domain | Epic | Domain translation reward +18% | Specific domain icon |
| 专业领域翻译家 | 在特定领域完成50次翻译 | 史诗 | 该领域翻译奖励+18% | 专业领域图标 |
| Multilingual Translator | Translate between 3+ language pairs | Legendary | Translation reward +15% | Multilingual translation bridge |
| 多语种翻译家 | 在3种以上语言对之间进行翻译 | 传奇 | 翻译奖励+15% | 多语言翻译桥 |

#### 3.2.2 Content Creation Achievements
#### 3.2.2 内容创作成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Content Creator | Create 10 pieces of content | Common | Creation reward +3% | Basic creation icon |
| 内容创作者 | 创建10篇内容 | 普通 | 创作奖励+3% | 基础创作图标 |
| Active Creator | Create 30 pieces of content with average 3+ stars | Rare | Creation reward +8%, Royalty +2% | Active creation badge |
| 活跃创作者 | 创建30篇内容且平均3星以上 | 稀有 | 创作奖励+8%，版税+2% | 活跃创作徽章 |
| Certified Creator | Create 50 pieces of content with average 4+ stars | Epic | Creation reward +15%, Royalty +5% | Certified creation badge |
| 认证创作者 | 创建50篇内容且平均4星以上 | 史诗 | 创作奖励+15%，版税+5% | 认证创作徽章 |
| Expert Creator | Create 100 pieces of content with average 4.5+ stars | Legendary | Creation reward +20%, Royalty +10% | Expert creation crown |
| 专家创作者 | 创建100篇内容且平均4.5星以上 | 传奇 | 创作奖励+20%，版税+10% | 专家创作王冠 |
| Cultural Ambassador | Create 30 pieces of specific cultural content | Epic | Cultural content reward +18% | Cultural ambassador badge |
| 文化大使 | 创建30篇特定文化内容 | 史诗 | 文化内容奖励+18% | 文化大使徽章 |
| Bestselling Author | Content purchased/used 1000+ times | Legendary | Royalty +15% | Bestselling author trophy |
| 畅销作者 | 内容被购买/使用1000次以上 | 传奇 | 版税+15% | 畅销作者奖杯 |

#### 3.2.3 Course Creation Achievements
#### 3.2.3 课程创作成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Course Designer | Create 1 complete course | Rare | Course creation reward +5% | Course design icon |
| 课程设计师 | 创建1个完整课程 | 稀有 | 课程创作奖励+5% | 课程设计图标 |
| Senior Educator | Create 3 complete courses with average 4+ stars | Epic | Course creation reward +15% | Educator badge |
| 资深教育者 | 创建3个完整课程且平均4星以上 | 史诗 | 课程创作奖励+15% | 教育者徽章 |
| Education Master | Create 5 complete courses with average 4.5+ stars | Legendary | Course creation reward +25% | Education master crown |
| 教育大师 | 创建5个完整课程且平均4.5星以上 | 传奇 | 课程创作奖励+25% | 教育大师王冠 |
| Bestselling Instructor | Course purchased 500+ times | Legendary | Course sales share +5% | Bestselling instructor trophy |
| 畅销讲师 | 课程被购买500次以上 | 传奇 | 课程销售分成+5% | 畅销讲师奖杯 |
| Student Favorite | Receive 1000+ 5-star ratings | Legendary | Course exposure +30% | Student favorite badge |
| 学生最爱 | 获得1000个以上5星评价 | 传奇 | 课程曝光率+30% | 学生喜爱徽章 |

### 3.3 Community Participation Achievement NFTs
### 3.3 社区参与成就NFT

#### 3.3.1 Community Contribution Achievements
#### 3.3.1 社区贡献成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Community Newbie | Participate in 5 community activities | Common | Community participation reward +3% | Community newbie badge |
| 社区新人 | 参与5次社区活动 | 普通 | 社区参与奖励+3% | 社区新人徽章 |
| Active Participant | Participate in 20 community activities | Rare | Community participation reward +8% | Active participant badge |
| 活跃参与者 | 参与20次社区活动 | 稀有 | 社区参与奖励+8% | 活跃参与徽章 |
| Community Contributor | Organize 3 community activities | Epic | Community organization reward +15% | Contributor badge |
| 社区贡献者 | 组织3次社区活动 | 史诗 | 社区组织奖励+15% | 贡献者徽章 |
| Community Leader | Organize 10 community activities with average 4.5+ stars | Legendary | Community organization reward +25% | Leader's crown |
| 社区领袖 | 组织10次社区活动且平均评分4.5星以上 | 传奇 | 社区组织奖励+25% | 领袖王冠 |
| Cultural Ambassador | Participate in 10 offline cultural exchange activities | Epic | Offline activity reward +20% | Cultural ambassador badge |
| 文化大使 | 参与10次线下文化交流活动 | 史诗 | 线下活动奖励+20% | 文化大使徽章 |
| Global Liaison | Communicate with users from 10+ different countries | Legendary | Cross-cultural communication reward +15% | Global liaison icon |
| 全球联络人 | 与10个不同国家的用户进行交流 | 传奇 | 跨文化交流奖励+15% | 全球联络图标 |

#### 3.3.2 Referral Achievements
#### 3.3.2 推荐成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Referral Novice | Successfully refer 5 new users | Common | Referral reward +5% | Referral novice icon |
| 推荐新手 | 成功推荐5位新用户 | 普通 | 推荐奖励+5% | 推荐新手图标 |
| Referral Pro | Successfully refer 20 new users | Rare | Referral reward +10% | Referral pro badge |
| 推荐达人 | 成功推荐20位新用户 | 稀有 | 推荐奖励+10% | 推荐达人徽章 |
| Referral Master | Successfully refer 50 new users | Epic | Referral reward +20% | Referral master badge |
| 推荐大师 | 成功推荐50位新用户 | 史诗 | 推荐奖励+20% | 推荐大师徽章 |
| Creator Talent Scout | Refer 10 users who become active creators | Legendary | Creator referral reward +25% | Talent scout trophy |
| 创作者伯乐 | 推荐10位成为活跃创作者的用户 | 传奇 | 创作者推荐奖励+25% | 伯乐奖杯 |
| Teacher Guide | Refer 5 users who become platform teachers | Legendary | Teacher referral reward +30% | Guide badge |
| 教师引路人 | 推荐5位成为平台教师的用户 | 传奇 | 教师推荐奖励+30% | 引路人徽章 |

#### 3.3.3 Governance Participation Achievements
#### 3.3.3 治理参与成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Governance Participant | Participate in 10 proposal votes | Common | Governance reward +5% | Voting icon |
| 治理参与者 | 参与10次提案投票 | 普通 | 治理奖励+5% | 投票图标 |
| Active Voter | Participate in 30 proposal votes | Rare | Governance reward +10% | Active voter badge |
| 活跃投票者 | 参与30次提案投票 | 稀有 | 治理奖励+10% | 活跃投票徽章 |
| Proposal Creator | Successfully submit 3 approved proposals | Epic | Proposal deposit -10% | Proposal creation badge |
| 提案创建者 | 成功提交3个被通过的提案 | 史诗 | 提案押金-10% | 提案创建徽章 |
| Community Decision Maker | Successfully submit 5 approved proposals | Legendary | Proposal deposit -20%, Voting weight +5% | Decision maker's crown |
| 社区决策者 | 成功提交5个被通过的提案 | 传奇 | 提案押金-20%，投票权重+5% | 决策者王冠 |
| Governance Expert | Participate in 50 proposal votes and submit 2 successful proposals | Legendary | Governance reward +20%, Proposal deposit -15% | Governance expert badge |
| 治理专家 | 参与50次提案投票且提交2个成功提案 | 传奇 | 治理奖励+20%，提案押金-15% | 治理专家徽章 |

### 3.4 Special Achievement NFTs
### 3.4 特殊成就NFT

#### 3.4.1 Milestone Achievements
#### 3.4.1 里程碑成就

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Early Supporter | Register within 30 days of platform launch | Legendary | All rewards +5% | Early supporter badge |
| 早期支持者 | 平台启动后30天内注册 | 传奇 | 所有奖励+5% | 早期支持者徽章 |
| One-Year Anniversary | Account active for 1 year | Epic | All rewards +3% | One-year anniversary badge |
| 一周年纪念 | 账户活跃满1年 | 史诗 | 所有奖励+3% | 一周年纪念徽章 |
| Platform Pioneer | Participate during platform test phase | Legendary | All rewards +8% | Pioneer badge |
| 平台先驱 | 在平台测试阶段参与 | 传奇 | 所有奖励+8% | 先驱者徽章 |
| All-Round Scholar | Obtain at least 5 achievement NFTs from different categories | Legendary | All rewards +10% | All-round scholar's crown |
| 全能学者 | 获得至少5个不同类别的成就NFT | 传奇 | 所有奖励+10% | 全能学者王冠 |
| Culture Bridge | Reach advanced level in both learning and creation | Legendary | Learning and creation rewards +15% | Culture bridge badge |
| 文化桥梁 | 在学习和创作两方面都达到高级水平 | 传奇 | 学习和创作奖励+15% | 文化桥梁徽章 |

#### 3.4.2 Event-Limited NFTs
#### 3.4.2 活动限定NFT

| NFT Name | Unlock Condition | Rarity | Reward Bonus | Visual Feature |
|----------|------------------|--------|--------------|----------------|
| Spring Festival Celebration | Participate in Spring Festival special event | Limited | Rewards +20% during event | Spring Festival celebration pattern |
| 春节庆典 | 参与春节特别活动 | 限量 | 活动期间奖励+20% | 春节庆典图案 |
| Summer Learning Challenge | Complete summer learning challenge | Limited | Summer learning reward +15% | Summer challenge pattern |
| 夏日学习挑战 | 完成夏季学习挑战赛 | 限量 | 夏季学习奖励+15% | 夏日挑战图案 |
| Cultural Festival Participant | Participate in annual cultural festival event | Limited | Cultural content reward +10% | Cultural festival pattern |
| 文化节参与者 | 参与年度文化节活动 | 限量 | 文化内容奖励+10% | 文化节图案 |
| Global Language Day | Participate in Global Language Day event | Limited | Translation reward +15% | Language Day pattern |
| 全球语言日 | 参与全球语言日活动 | 限量 | 翻译奖励+15% | 语言日图案 |
| Founder's Collector's Edition | Limited edition issued by platform founding team | Extremely Rare | 10% discount on all platform features | Founder's signature pattern |
| 创始人收藏版 | 平台创始团队限量发行 | 极稀有 | 平台所有功能折扣10% | 创始人签名图案 |

## 4. NFT Technical Implementation
## 4. NFT技术实现

### 4.1 Smart Contract Design
### 4.1 智能合约设计

#### 4.1.1 Contract Architecture
#### 4.1.1 合约架构

The CultureBridge NFT achievement system will be based on the following smart contract architecture:
CultureBridge NFT成就系统将基于以下智能合约架构：

1. **Main NFT Contract (CBAchievementNFT)**: BEP-721 standard-based, implements basic NFT functions.
1. **主NFT合约（CBAchievementNFT）**：基于BEP-721标准，实现基础NFT功能
2. **Achievement Management Contract (CBAchievementManager)**: Manages achievement unlock conditions and minting logic.
2. **成就管理合约（CBAchievementManager）**：管理成就解锁条件和铸造逻辑
3. **Benefit Execution Contract (CBBenefitExecutor)**: Implements NFT holders' rights and reward bonuses.
3. **权益执行合约（CBBenefitExecutor）**：实现NFT持有者的权益和奖励加成
4. **Metadata Management Contract (CBMetadataManager)**: Manages NFT metadata and visual resources.
4. **元数据管理合约（CBMetadataManager）**：管理NFT元数据和视觉资源

#### 4.1.2 Main Contract Interfaces
#### 4.1.2 主要合约接口

**CBAchievementNFT Contract**:
**CBAchievementNFT合约**：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CBAchievementNFT is ERC721Enumerable, Ownable {
    // NFT Type Enum
    // NFT类型枚举
    enum AchievementType { LEARNING, CREATION, COMMUNITY, SPECIAL }
    
    // NFT Rarity Enum
    // NFT稀有度枚举
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY, LIMITED }
    
    // NFT Structure
    // NFT结构
    struct Achievement {
        string name;
        string description;
        AchievementType achievementType;
        Rarity rarity;
        uint256 creationTime;
        string metadataURI;
    }
    
    // Stores all NFT information
    // 存储所有NFT信息
    mapping(uint256 => Achievement) public achievements;
    
    // Authorized management contract
    // 授权的管理合约
    address public achievementManager;
    
    // Events
    // 事件
    event AchievementMinted(address indexed to, uint256 indexed tokenId, AchievementType achievementType, Rarity rarity);
    
    constructor() ERC721("CultureBridge Achievement", "CBA") {}
    
    // Set achievement manager contract
    // 设置成就管理合约
    function setAchievementManager(address _manager) external onlyOwner {
        achievementManager = _manager;
    }
    
    // Mint NFT (only callable by authorized management contract)
    // 铸造NFT（仅限授权管理合约调用）
    function mintAchievement(
        address to,
        string memory name,
        string memory description,
        AchievementType achievementType,
        Rarity rarity,
        string memory metadataURI
    ) external returns (uint256) {
        require(msg.sender == achievementManager, "Only achievement manager can mint");
        
        uint256 tokenId = totalSupply() + 1;
        _mint(to, tokenId);
        
        achievements[tokenId] = Achievement(
            name,
            description,
            achievementType,
            rarity,
            block.timestamp,
            metadataURI
        );
        
        emit AchievementMinted(to, tokenId, achievementType, rarity);
        return tokenId;
    }
    
    // Get all achievements of a user
    // 获取用户所有成就
    function getAchievementsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory result = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            result[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return result;
    }
    
    // Get NFT metadata URI
    // 获取NFT元数据URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return achievements[tokenId].metadataURI;
    }
}
```

**CBAchievementManager Contract**:
**CBAchievementManager合约**：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CBAchievementNFT.sol";

contract CBAchievementManager is Ownable {
    // Main NFT contract
    // 主NFT合约
    CBAchievementNFT public achievementNFT;
    
    // Authorized trigger addresses
    // 授权的触发器地址
    mapping(address => bool) public authorizedTriggers;
    
    // Achievement unlock conditions
    // 成就解锁条件
    struct AchievementCriteria {
        string name;
        string description;
        CBAchievementNFT.AchievementType achievementType;
        CBAchievementNFT.Rarity rarity;
        string metadataURI;
        bool active;
    }
    
    // Mapping from achievement ID to unlock conditions
    // 成就ID到解锁条件的映射
    mapping(bytes32 => AchievementCriteria) public achievementCriteria;
    
    // User's acquired achievement records
    // 用户已获得的成就记录
    mapping(address => mapping(bytes32 => bool)) public userAchievements;
    
    // Events
    // 事件
    event AchievementUnlocked(address indexed user, bytes32 indexed criteriaId, uint256 tokenId);
    event AchievementCriteriaAdded(bytes32 indexed criteriaId, string name);
    
    constructor(address _achievementNFT) {
        achievementNFT = CBAchievementNFT(_achievementNFT);
    }
    
    // Add authorized trigger
    // 添加授权触发器
    function addAuthorizedTrigger(address trigger) external onlyOwner {
        authorizedTriggers[trigger] = true;
    }
    
    // Remove authorized trigger
    // 移除授权触发器
    function removeAuthorizedTrigger(address trigger) external onlyOwner {
        authorizedTriggers[trigger] = false;
    }
    
    // Add achievement unlock conditions
    // 添加成就解锁条件
    function addAchievementCriteria(
        bytes32 criteriaId,
        string memory name,
        string memory description,
        CBAchievementNFT.AchievementType achievementType,
        CBAchievementNFT.Rarity rarity,
        string memory metadataURI
    ) external onlyOwner {
        achievementCriteria[criteriaId] = AchievementCriteria(
            name,
            description,
            achievementType,
            rarity,
            metadataURI,
            true
        );
        
        emit AchievementCriteriaAdded(criteriaId, name);
    }
    
    // Trigger achievement unlock (only callable by authorized trigger)
    // 触发成就解锁（仅限授权触发器调用）
    function unlockAchievement(address user, bytes32 criteriaId) external returns (uint256) {
        require(authorizedTriggers[msg.sender], "Caller is not authorized");
        require(achievementCriteria[criteriaId].active, "Achievement criteria not active");
        require(!userAchievements[user][criteriaId], "User already has this achievement");
        
        AchievementCriteria memory criteria = achievementCriteria[criteriaId];
        
        uint256 tokenId = achievementNFT.mintAchievement(
            user,
            criteria.name,
            criteria.description,
            criteria.achievementType,
            criteria.rarity,
            criteria.metadataURI
        );
        
        userAchievements[user][criteriaId] = true;
        
        emit AchievementUnlocked(user, criteriaId, tokenId);
        return tokenId;
    }
    
    // Check if user has unlocked a specific achievement
    // 检查用户是否已解锁特定成就
    function hasAchievement(address user, bytes32 criteriaId) external view returns (bool) {
        return userAchievements[user][criteriaId];
    }
}
```

**CBBenefitExecutor Contract**:
**CBBenefitExecutor合约**：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CBAchievementNFT.sol";

contract CBBenefitExecutor is Ownable {
    // Main NFT contract
    // 主NFT合约
    CBAchievementNFT public achievementNFT;
    
    // Mapping from achievement ID to reward bonus
    // 成就ID到奖励加成的映射
    mapping(bytes32 => uint256) public achievementBonuses;
    
    // Mapping from achievement type to bonus type
    // 成就类型到奖励类型的映射
    mapping(CBAchievementNFT.AchievementType => mapping(uint256 => uint256)) public typeBonuses;
    
    // Events
    // 事件
    event BonusApplied(address indexed user, uint256 bonusType, uint256 bonusAmount);
    
    constructor(address _achievementNFT) {
        achievementNFT = CBAchievementNFT(_achievementNFT);
    }
    
    // Set achievement reward bonus
    // 设置成就奖励加成
    function setAchievementBonus(bytes32 criteriaId, uint256 bonusAmount) external onlyOwner {
        achievementBonuses[criteriaId] = bonusAmount;
    }
    
    // Set achievement type bonus
    // 设置成就类型奖励加成
    function setTypeBonus(CBAchievementNFT.AchievementType achievementType, uint256 bonusType, uint256 bonusAmount) external onlyOwner {
        typeBonuses[achievementType][bonusType] = bonusAmount;
    }
    
    // Calculate total bonus for a specific bonus type for a user
    // 计算用户特定奖励类型的总加成
    function calculateUserBonus(address user, uint256 bonusType) external view returns (uint256) {
        uint256 totalBonus = 0;
        uint256[] memory userTokens = achievementNFT.getAchievementsByOwner(user);
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            uint256 tokenId = userTokens[i];
            CBAchievementNFT.Achievement memory achievement = achievementNFT.achievements(tokenId);
            
            // Add achievement type related bonus
            // 添加成就类型相关的加成
            totalBonus += typeBonuses[achievement.achievementType][bonusType];
            
            // Add specific achievement bonus
            // 添加特定成就的加成
            bytes32 criteriaId = keccak256(abi.encodePacked(achievement.name));
            totalBonus += achievementBonuses[criteriaId];
        }
        
        return totalBonus;
    }
    
    // Apply reward bonus (called by other contracts)
    // 应用奖励加成（由其他合约调用）
    function applyBonus(address user, uint256 bonusType, uint256 baseAmount) external view returns (uint256) {
        uint256 bonus = calculateUserBonus(user, bonusType);
        uint256 bonusAmount = (baseAmount * bonus) / 10000; // Calculate based on percentage (100% = 10000)
        // 基于百分比计算（100% = 10000）
        
        return baseAmount + bonusAmount;
    }
}
```

**CBMetadataManager Contract**:
**CBMetadataManager合约**：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CBMetadataManager is Ownable {
    // Base metadata URI
    // 基础元数据URI
    string public baseURI;
    
    // Metadata mapping
    // 元数据映射
    mapping(bytes32 => string) public metadataURIs;
    
    // Events
    // 事件
    event BaseURIUpdated(string newBaseURI);
    event MetadataURIUpdated(bytes32 indexed criteriaId, string uri);
    
    constructor(string memory _baseURI) {
        baseURI = _baseURI;
    }
    
    // Update base URI
    // 更新基础URI
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
        emit BaseURIUpdated(_baseURI);
    }
    
    // Set metadata URI for specific achievement
    // 设置特定成就的元数据URI
    function setMetadataURI(bytes32 criteriaId, string memory uri) external onlyOwner {
        metadataURIs[criteriaId] = uri;
        emit MetadataURIUpdated(criteriaId, uri);
    }
    
    // Get full metadata URI
    // 获取完整的元数据URI
    function getFullMetadataURI(bytes32 criteriaId) external view returns (string memory) {
        string memory specificURI = metadataURIs[criteriaId];
        
        if (bytes(specificURI).length > 0) {
            return string(abi.encodePacked(baseURI, specificURI));
        }
        
        return string(abi.encodePacked(baseURI, toHexString(criteriaId)));
    }
    
    // Helper function: convert bytes32 to hex string
    // 辅助函数：将bytes32转换为十六进制字符串
    function toHexString(bytes32 value) internal pure returns (string memory) {
        bytes memory result = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            uint8 b = uint8(value[i]);
            uint8 hi = b / 16;
            uint8 lo = b - 16 * hi;
            result[2*i] = char(hi);
            result[2*i+1] = char(lo);
        }
        
        return string(result);
    }
    
    function char(uint8 b) internal pure returns (bytes1) {
        if (b < 10) return bytes1(uint8(48) + b);
        else return bytes1(uint8(87) + b); // 10 = a, 11 = b, etc.
    }
}
```


