# CultureBridge Token Usage Scenarios Final Plan
# CultureBridge 代币使用场景最终规划

## 1. Overview
## 1. 概述

This document outlines the final plan for various usage scenarios of the CultureBridge Token (CBT) within the platform's ecosystem, providing clear guidance on the token's practical value for users and serving as a reference for the development team's feature implementation. As the core value carrier of the platform, the CBT token will play a role in multiple dimensions such as learning incentives, content creation, feature unlocking, and governance rights, forming a complete token economic closed loop.
本文档是CultureBridge代币(CBT)在平台生态系统中各种使用场景的最终规划，为用户提供明确的代币实用价值指南，同时为开发团队提供功能实现的参考。CBT代币作为平台核心价值载体，将在学习激励、内容创作、功能解锁、治理权益等多个维度发挥作用，形成完整的代币经济闭环。

## 2. Learning-Related Usage Scenarios
## 2. 学习相关使用场景

### 2.1 Learning Incentive Mechanism
### 2.1 学习激励机制

CBT tokens will serve as the core reward method for learning incentives. Users can earn token rewards through the following ways:
CBT代币将作为学习激励的核心奖励方式，用户可通过以下方式获得代币奖励：

#### 2.1.1 Course Completion Rewards
#### 2.1.1 课程完成奖励

| Course Type | Reward Range | Description |
|-------------|--------------|-------------|
| 课程类型    | 奖励范围     | 说明        |
| Beginner Course | 0.5 CBT/lesson | Basic language introductory courses |
| 初级课程    | 0.5 CBT/课时 | 基础语言入门课程 |
| Intermediate Course | 1.5 CBT/lesson | Advanced language application courses |
| 中级课程    | 1.5 CBT/课时 | 进阶语言应用课程 |
| Advanced Course | 3 CBT/lesson | Advanced language proficiency courses |
| 高级课程    | 3 CBT/课时   | 高级语言精通课程 |
| Expert Course | 5 CBT/lesson | Professional domain language courses |
| 专家课程    | 5 CBT/课时   | 专业领域语言课程 |

**Implementation Method**:
**实现方式**：
- Smart contract automatically tracks course completion status
- 智能合约自动跟踪课程完成状态
- Rewards are issued immediately after course completion
- 完成课程后立即发放奖励
- Set daily and monthly reward caps (10 CBT/day, 200 CBT/month)
- 设置每日和每月奖励上限（10 CBT/日，200 CBT/月）
- Holding learning achievement NFTs can grant a 5-20% reward bonus
- 持有学习成就NFT可获得5-20%的奖励加成

#### 2.1.2 Continuous Learning Rewards
#### 2.1.2 连续学习奖励

| Consecutive Days | Reward Multiplier | Description |
|------------------|-------------------|-------------|
| 连续天数         | 奖励乘数          | 说明        |
| 3 days | 1.1x | Basic continuous learning reward |
| 3天              | 1.1x              | 基础连续学习奖励 |
| 7 days | 1.3x | One-week continuous learning reward |
| 7天              | 1.3x              | 一周连续学习奖励 |
| 14 days | 1.5x | Two-week continuous learning reward |
| 14天             | 1.5x              | 两周连续学习奖励 |
| 30 days | 2.0x | One-month continuous learning reward |
| 30天             | 2.0x              | 一个月连续学习奖励 |

**Implementation Method**:
**实现方式**：
- Smart contract records user's consecutive learning days
- 智能合约记录用户连续学习天数
- Automatically applies corresponding multiplier to basic rewards
- 自动应用相应乘数到基础奖励
- Resets consecutive days count after interruption
- 中断后重置连续天数计数
- Holding learning habit NFTs can grant an additional 2-15% multiplier bonus
- 持有学习习惯NFT可获得额外2-15%的乘数加成

#### 2.1.3 Quiz and Assessment Rewards
#### 2.1.3 测验与评估奖励

| Quiz Score | Reward Range | Description |
|------------|--------------|-------------|
| 测验成绩   | 奖励范围     | 说明        |
| 60-80% | 1 CBT | Passing score reward |
| 60-80%     | 1 CBT        | 及格成绩奖励 |
| 80-95% | 2 CBT | Good score reward |
| 80-95%     | 2 CBT        | 良好成绩奖励 |
| 95-100% | 3 CBT | Excellent score reward |
| 95-100%    | 3 CBT        | 优秀成绩奖励 |

**Implementation Method**:
**实现方式**：
- Smart contract verifies quiz results
- 智能合约验证测验结果
- Rewards are issued based on score range
- 根据分数区间发放奖励
- Each quiz can only earn rewards once
- 每个测验仅可获得一次奖励
- Holding quiz achievement NFTs can grant a 3-20% reward bonus
- 持有测验成就NFT可获得3-20%的奖励加成

#### 2.1.4 Learning Achievement NFTs
#### 2.1.4 学习成就NFT

| Achievement Type | Unlock Condition | Reward Bonus | Description |
|------------------|------------------|--------------|-------------|
| 成就类型         | 解锁条件         | 奖励加成     | 说明        |
| Language Entry Achievement | Complete 10 beginner courses | 5% | Basic language learning achievement |
| 语言入门成就     | 完成10个初级课程 | 5%           | 基础语言学习成就 |
| Language Intermediate Achievement | Complete 20 intermediate courses | 10% | Intermediate language learning achievement |
| 语言进阶成就     | 完成20个中级课程 | 10%          | 中级语言学习成就 |
| Language Proficiency Achievement | Complete 15 advanced courses | 15% | Advanced language learning achievement |
| 语言精通成就     | 完成15个高级课程 | 15%          | 高级语言学习成就 |
| Language Master Achievement | Complete 10 expert courses | 20% | Expert-level language learning achievement |
| 语言大师成就     | 完成10个专家课程 | 20%          | 专家级语言学习成就 |
| Learning Expert Achievement | Continuous learning for 30 days | 10% | Learning consistency achievement |
| 学习达人成就     | 连续学习30天     | 10%          | 学习持续性成就 |
| Quiz King Achievement | Achieve 95%+ score 10 times | 15% | Quiz excellence achievement |
| 测验王者成就     | 获得10次95%以上成绩 | 15%          | 测验优秀成就 |

**Implementation Method**:
**实现方式**：
- Achievements are minted and issued to users as NFTs
- 成就以NFT形式铸造并发放给用户
- Holding NFTs automatically grants corresponding learning reward bonuses
- 持有NFT自动获得相应学习奖励加成
- Achievement NFTs can be displayed and traded within the platform
- 成就NFT可在平台内展示和交易
- NFT holders can gain access to exclusive learning resources
- NFT持有者可获得专属学习资源访问权限

### 2.2 Learning Resource Unlocking
### 2.2 学习资源解锁

Users can use CBT tokens to unlock various advanced learning resources:
用户可使用CBT代币解锁各种高级学习资源：

#### 2.2.1 Course Unlocking
#### 2.2.1 课程解锁

| Course Type | Unlock Fee | Description |
|-------------|------------|-------------|
| 课程类型    | 解锁费用   | 说明        |
| Beginner Course | Free | Basic introductory courses are free to access |
| 初级课程    | 免费       | 基础入门课程免费访问 |
| Intermediate Course | 50 CBT | Intermediate application course unlock fee |
| 中级课程    | 50 CBT     | 进阶应用课程解锁费用 |
| Advanced Course | 125 CBT | Advanced proficiency course unlock fee |
| 高级课程    | 125 CBT    | 高级精通课程解锁费用 |
| Expert Course | 250 CBT | Professional domain course unlock fee |
| 专家课程    | 250 CBT    | 专业领域课程解锁费用 |
| Thematic Course Package | 400-750 CBT | Thematic course package unlock fee |
| 专题课程包  | 400-750 CBT | 特定主题课程包解锁费用 |

**Implementation Method**:
**实现方式**：
- One-time payment unlocks permanent access
- 一次性支付解锁永久访问权
- Supports discounted purchase of course packages
- 支持课程包折扣购买
- 80% of unlock fees are distributed to content creators
- 解锁费用80%分配给内容创作者
- 10% goes into the staking reward pool, 10% for token buyback and burn
- 10%进入质押奖励池，10%用于代币回购销毁

#### 2.2.2 Translation Services
#### 2.2.2 翻译服务

| Service Type | Fee | Description |
|--------------|-----|-------------|
| 服务类型     | 费用 | 说明        |
| Basic Translation | Free | Basic text translation service |
| 基础翻译     | 免费 | 基础文本翻译服务 |
| Advanced Translation (Basic) | 5 CBT/month | Advanced translation basic package |
| 高级翻译(基础) | 5 CBT/月 | 高级翻译基础套餐 |
| Advanced Translation (Standard) | 12.5 CBT/month | Advanced translation standard package |
| 高级翻译(标准) | 12.5 CBT/月 | 高级翻译标准套餐 |
| Advanced Translation (Professional) | 25 CBT/month | Advanced translation professional package |
| 高级翻译(专业) | 25 CBT/月 | 高级翻译专业套餐 |
| Custom Translation | Per word | Professional domain custom translation service |
| 定制翻译     | 按字计费 | 专业领域定制翻译服务 |

**Implementation Method**:
**实现方式**：
- Subscription model, paid monthly
- 订阅制模式，按月支付
- Automatic renewal function, can be canceled anytime
- 自动续订功能，可随时取消
- Advanced features include cultural background analysis, professional terminology support, etc.
- 高级功能包括文化背景解析、专业术语支持等
- Fee distribution: 70% to translation providers, 20% to staking reward pool, 10% for token buyback and burn
- 费用分配：70%给翻译提供者，20%进入质押奖励池，10%用于代币回购销毁

#### 2.2.3 Teacher Matching Service
#### 2.2.3 教师匹配服务

| Service Type | Fee | Description |
|--------------|-----|-------------|
| 服务类型     | 费用 | 说明        |
| Beginner Teacher Matching | 100 CBT/month | One-on-one tutoring with beginner language teachers |
| 初级教师匹配 | 100 CBT/月 | 初级语言教师一对一辅导 |
| Intermediate Teacher Matching | 250 CBT/month | One-on-one tutoring with intermediate language teachers |
| 中级教师匹配 | 250 CBT/月 | 中级语言教师一对一辅导 |
| Advanced Teacher Matching | 500 CBT/month | One-on-one tutoring with advanced language teachers |
| 高级教师匹配 | 500 CBT/月 | 高级语言教师一对一辅导 |
| Single Tutoring Session | 25-100 CBT/hour | On-demand single tutoring sessions |
| 单次辅导课   | 25-100 CBT/小时 | 按需预约的单次辅导课 |

**Implementation Method**:
**实现方式**：
- Smart matching algorithm connects learners and teachers
- 智能匹配算法连接学习者和教师
- Token payment automatically distributed (80% to teacher, 10% to platform, 10% to staking reward pool)
- 代币支付自动分配（教师80%，平台10%，质押奖励池10%）
- Rating system affects teacher's future matching priority
- 评分系统影响教师未来匹配优先级
- Holding specific NFTs can grant 5-15% service discount
- 持有特定NFT可获得5-15%的服务折扣

## 3. Content Creation Related Usage Scenarios
## 3. 内容创作相关使用场景

### 3.1 Content Creation Rewards
### 3.1 内容创作奖励

Creators can earn CBT token rewards through the following ways:
创作者可通过以下方式获得CBT代币奖励：

#### 3.1.1 Translated Content Rewards
#### 3.1.1 翻译内容奖励

| Content Type | Reward Range | Description |
|--------------|--------------|-------------|
| 内容类型     | 奖励范围     | 说明        |
| Short text translation | 1 CBT | Short text translation within 100 words |
| 短文本翻译   | 1 CBT        | 100字以内短文本翻译 |
| Medium text translation | 2.5 CBT | Medium text translation within 100-500 words |
| 中等文本翻译 | 2.5 CBT      | 100-500字中等文本翻译 |
| Long text translation | 5 CBT | Long text translation over 500 words |
| 长文本翻译   | 5 CBT        | 500字以上长文本翻译 |
| Professional content translation | 10 CBT | Professional domain content translation |
| 专业内容翻译 | 10 CBT       | 专业领域内容翻译 |

**Implementation Method**:
**实现方式**：
- Community rating affects final rewards (1-5 star rating system)
- 社区评分影响最终奖励（1-5星评分系统）
- Quality rating multiplier: 1-2 stars (0.5x), 3 stars (1.0x), 4 stars (1.5x), 5 stars (2.0x)
- 质量评分乘数：1-2星(0.5x)，3星(1.0x)，4星(1.5x)，5星(2.0x)
- Set daily and monthly reward caps (100 CBT/day, 2000 CBT/month)
- 设置每日和每月奖励上限（100 CBT/日，2000 CBT/月）
- Holding translation achievement NFTs can grant a 3-20% reward bonus
- 持有翻译成就NFT可获得3-20%的奖励加成

#### 3.1.2 Cultural Content Creation Rewards
#### 3.1.2 文化内容创作奖励

| Content Type | Reward Range | Description |
|--------------|--------------|-------------|
| 内容类型     | 奖励范围     | 说明        |
| Basic cultural content | 5 CBT | Basic cultural introduction content |
| 基础文化内容 | 5 CBT        | 基础文化介绍内容 |
| Medium cultural content | 15 CBT | Medium depth cultural analysis content |
| 中等文化内容 | 15 CBT       | 中等深度文化分析内容 |
| Advanced cultural content | 30 CBT | Advanced depth cultural research content |
| 高级文化内容 | 30 CBT       | 高级深度文化研究内容 |
| Professional cultural content | 50 CBT | Professional-level cultural academic content |
| 专业文化内容 | 50 CBT       | 专业级文化学术内容 |

**Implementation Method**:
**实现方式**：
- Same community rating mechanism as translated content
- 与翻译内容相同的社区评分机制
- Originality detection affects reward issuance
- 原创性检测影响奖励发放
- Expert review mechanism ensures high-quality content
- 专家审核机制确保高质量内容
- Holding creation achievement NFTs can grant a 5-25% reward bonus
- 持有创作成就NFT可获得5-25%的奖励加成

#### 3.1.3 Course Creation Rewards
#### 3.1.3 课程创作奖励

| Course Type | Reward Range | Description |
|-------------|--------------|-------------|
| 课程类型    | 奖励范围     | 说明        |
| Beginner Course | 25 CBT/lesson | Create beginner language courses |
| 初级课程    | 25 CBT/课时  | 创建初级语言课程 |
| Intermediate Course | 50 CBT/lesson | Create intermediate language courses |
| 中级课程    | 50 CBT/课时  | 创建中级语言课程 |
| Advanced Course | 100 CBT/lesson | Create advanced language courses |
| 高级课程    | 100 CBT/课时 | 创建高级语言课程 |
| Expert Course | 150 CBT/lesson | Create expert-level language courses |
| 专家课程    | 150 CBT/课时 | 创建专家级语言课程 |

**Implementation Method**:
**实现方式**：
- Basic rewards are issued after course review and approval
- 课程审核通过后发放基础奖励
- Course usage and ratings affect long-term revenue
- 课程使用率和评分影响长期收益
- Creators can earn 80% of course sales revenue
- 创作者可获得课程销售80%的收入
- Holding education achievement NFTs can grant a 5-25% reward bonus
- 持有教育成就NFT可获得5-25%的奖励加成

### 3.2 Creator Economic Model
### 3.2 创作者经济模式

#### 3.2.1 Royalty Mechanism
#### 3.2.1 版税机制

| Creator Level | Royalty Rate | Description |
|---------------|--------------|-------------|
| 创作者级别    | 版税比例     | 说明        |
| General Creator | 5% | Royalty for content usage by general-level creators |
| 普通创作者    | 5%           | 普通级别创作者内容使用版税 |
| Certified Creator | 10% | Royalty for content usage by certified-level creators |
| 认证创作者    | 10%          | 认证级别创作者内容使用版税 |
| Expert Creator | 15% | Royalty for content usage by expert-level creators |
| 专家创作者    | 15%          | 专家级别创作者内容使用版税 |

**Implementation Method**:
**实现方式**：
- Smart contract automatically records content usage
- 智能合约自动记录内容使用情况
- Royalties are distributed periodically based on usage
- 按使用量定期分发版税
- Creator level is determined by historical contributions and content quality
- 创作者级别基于历史贡献和内容质量评定
- Royalty distribution: 85% to creator, 10% to staking reward pool, 5% to platform
- 版税分配：创作者85%，质押奖励池10%，平台5%

#### 3.2.2 Content NFT Creation and Trading
#### 3.2.2 内容NFT创建与交易

| NFT Type | Creation Fee | Description |
|----------|--------------|-------------|
| NFT类型  | 创建费用     | 说明        |
| Basic Cultural NFT | 25 CBT | Basic cultural artwork NFT |
| 基础文化NFT | 25 CBT       | 基础文化艺术品NFT |
| Advanced Cultural NFT | 50 CBT | Advanced cultural artwork NFT |
| 高级文化NFT | 50 CBT       | 高级文化艺术品NFT |
| Professional Cultural NFT | 100 CBT | Professional-level cultural artwork NFT |
| 专业文化NFT | 100 CBT      | 专业级文化艺术品NFT |
| Limited Edition Cultural NFT | 250 CBT | Limited edition rare cultural NFT |
| 限量版文化NFT | 250 CBT      | 限量发行的珍稀文化NFT |

**Implementation Method**:
**实现方式**：
- Creators pay minting fees to create NFTs
- 创作者支付铸造费用创建NFT
- NFT initial sales revenue distribution: 85% to creator, 10% to platform, 5% to staking reward pool
- NFT初次销售收入分配：创作者85%，平台10%，质押奖励池5%
- NFT secondary transaction royalty: 70% to creator, 20% to platform, 10% to staking reward pool
- NFT二次交易版税：创作者70%，平台20%，质押奖励池10%
- 50% of creation fees are used for token buyback and burn
- 创建费用的50%用于代币回购销毁

#### 3.2.3 Creator Reputation System
#### 3.2.3 创作者声誉系统

| Reputation Level | Achievement Condition | Privileges |
|------------------|-----------------------|------------|
| 声誉等级         | 达成条件              | 特权       |
| Beginner Creator | Newly registered creator | Basic creation permissions |
| 初级创作者       | 新注册创作者          | 基础创作权限 |
| Active Creator | Create 10+ content, average 3+ stars | Royalty +2%, priority display |
| 活跃创作者       | 创作10+内容，平均3星以上 | 版税+2%，优先展示 |
| Certified Creator | Create 30+ content, average 4+ stars | Royalty +5%, creator badge |
| 认证创作者       | 创作30+内容，平均4星以上 | 版税+5%，创作者徽章 |
| Expert Creator | Create 50+ content, average 4.5+ stars | Royalty +10%, expert badge, priority recommendation |
| 专家创作者       | 创作50+内容，平均4.5星以上 | 版税+10%，专家徽章，优先推荐 |
| Master Creator | Create 100+ content, average 4.8+ stars | Royalty +15%, master badge, custom page |
| 大师创作者       | 创作100+内容，平均4.8星以上 | 版税+15%，大师徽章，定制页面 |

**Implementation Method**:
**实现方式**：
- Smart contract automatically calculates and updates reputation level
- 智能合约自动计算和更新声誉等级
- Reputation level is issued as an NFT badge
- 声誉等级以NFT徽章形式发放
- Reputation level affects creator's exposure and revenue on the platform
- 声誉等级影响创作者在平台的曝光度和收益
- Reputation NFTs can be displayed on the platform but cannot be traded
- 声誉NFT可在平台内展示但不可交易

## 4. Community Participation Related Usage Scenarios
## 4. 社区参与相关使用场景

### 4.1 Community Participation Rewards
### 4.1 社区参与奖励

Users can earn CBT token rewards through the following community participation methods:
用户可通过以下社区参与方式获得CBT代币奖励：

#### 4.1.1 Referral Program
#### 4.1.1 推荐计划

| Activity Type | Reward | Description |
|---------------|--------|-------------|
| 活动类型      | 奖励   | 说明        |
| Referral Registration | 5 CBT | Successfully refer new user registration |
| 推荐注册      | 5 CBT  | 成功推荐新用户注册 |
| Referral Activity | 5 CBT | Referred user reaches activity standard |
| 推荐活跃      | 5 CBT  | 推荐用户达到活跃标准 |
| Refer Creator | 10 CBT | Refer new creator to join and publish content |
| 推荐创作者    | 10 CBT | 推荐新创作者加入并发布内容 |
| Refer Teacher | 15 CBT | Refer teacher to join platform and start teaching |
| 推荐教师      | 15 CBT | 推荐教师加入平台并开始教学 |

**Implementation Method**:
**实现方式**：
- Use referral codes or links to track referral relationships
- 使用推荐码或链接追踪推荐关系
- Rewards are issued when referred users reach specific milestones
- 被推荐用户达到特定里程碑时发放奖励
- Set monthly referral reward cap (150 CBT/month)
- 设置每月推荐奖励上限（150 CBT/月）
- Holding referral achievement NFTs can grant a 10-30% reward bonus
- 持有推荐成就NFT可获得10-30%的奖励加成

#### 4.1.2 Community Activity Participation
#### 4.1.2 社区活动参与

| Activity Type | Reward Range | Description |
|---------------|--------------|-------------|
| 活动类型      | 奖励范围     | 说明        |
| Online Cultural Exchange | 1-2.5 CBT | Participate in online cultural exchange activities |
| 线上文化交流会 | 1-2.5 CBT    | 参与线上文化交流活动 |
| Translation Challenge | 2.5-10 CBT | Participate in translation competition activities |
| 翻译挑战赛    | 2.5-10 CBT   | 参与翻译竞赛活动 |
| Cultural Knowledge Contest | 2.5-7.5 CBT | Participate in cultural knowledge quiz competition |
| 文化知识竞赛  | 2.5-7.5 CBT  | 参与文化知识问答竞赛 |
| Creator Workshop | 5-10 CBT | Participate in content creation training workshops |
| 创作者工作坊  | 5-10 CBT     | 参与内容创作培训工作坊 |
| Offline Cultural Activities | 5-15 CBT | Participate in offline cultural exchange activities |
| 线下文化活动  | 5-15 CBT     | 参与线下文化交流活动 |

**Implementation Method**:
**实现方式**：
- Activity participation confirmed by check-in or completion of specific tasks
- 活动参与通过签到或完成特定任务确认
- Competition-based activities issue additional rewards based on ranking
- 竞赛类活动根据排名发放额外奖励
- Activity organizers can earn organizational rewards
- 活动组织者可获得组织奖励
- Set monthly activity participation reward cap (100 CBT/month)
- 设置每月活动参与奖励上限（100 CBT/月）

#### 4.1.3 Bug Reporting and Improvement Suggestions
#### 4.1.3 Bug报告与改进建议

| Contribution Type | Reward Range | Description |
|-------------------|--------------|-------------|
| 贡献类型          | 奖励范围     | 说明        |
| Low-level Bug Report | 5 CBT | Report and confirm low-priority bug |
| 低级Bug报告       | 5 CBT        | 报告并确认低优先级Bug |
| Medium-level Bug Report | 20 CBT | Report and confirm medium-priority bug |
| 中级Bug报告       | 20 CBT       | 报告并确认中优先级Bug |
| High-level Bug Report | 100 CBT | Report and confirm high-priority bug |
| 高级Bug报告       | 100 CBT      | 报告并确认高优先级Bug |
| Critical Bug Report | 500 CBT | Report and confirm critical security bug |
| 关键Bug报告       | 500 CBT      | 报告并确认关键安全Bug |
| Accepted Improvement Suggestion | 10-50 CBT | Proposed and accepted platform improvement suggestion |
| 改进建议被采纳    | 10-50 CBT    | 提出并被采纳的平台改进建议 |

**Implementation Method**:
**实现方式**：
- Rewards are manually issued after bug verification
- Bug验证后手动发放奖励
- Rewards are manually issued after suggestion acceptance
- 建议采纳后手动发放奖励
- Significant contributions can earn special contribution NFTs
- 重大贡献可获得特殊贡献NFT
- Holding contributor NFTs can grant a 5-15% reward bonus
- 持有贡献者NFT可获得5-15%的奖励加成

### 4.2 VIP Community Access
### 4.2 VIP社区访问

| Membership Level | Fee | Privileges |
|------------------|-----|------------|
| 会员级别         | 费用 | 特权       |
| Basic VIP | 50 CBT/month | Exclusive community access, priority customer service |
| 基础VIP          | 50 CBT/月 | 专属社区访问，优先客服 |
| Advanced VIP | 150 CBT/month | Basic privileges + expert exchange, advanced resources |
| 高级VIP          | 150 CBT/月 | 基础特权+专家交流，高级资源 |
| Annual VIP | 500 CBT/year | Advanced privileges + 20% discount, exclusive events |
| 年度VIP          | 500 CBT/年 | 高级特权+20%折扣，专属活动 |
| Lifetime VIP | 5000 CBT | Permanent advanced privileges + exclusive NFT |
| 终身VIP          | 5000 CBT | 永久高级特权+专属NFT |

**Implementation Method**:
**实现方式**：
- Subscription model, supports automatic renewal
- 订阅制模式，支持自动续费
- VIP status issued as NFT, supports transfer
- VIP身份以NFT形式发放，支持转让
- VIP privileges include exclusive content, priority access to events, etc.
- VIP特权包括专属内容、活动优先参与权等
- Fee distribution: 70% to ecosystem development fund, 20% for buyback and burn, 10% to staking reward pool
- 费用分配：70%进入生态发展基金，20%用于回购销毁，10%进入质押奖励池

### 4.3 Community Governance Participation
### 4.3 社区治理参与

| Governance Activity | Reward/Fee | Description |
|---------------------|------------|-------------|
| 治理活动            | 奖励/费用  | 说明        |
| General Proposal Voting | 0.5 CBT Reward | Participate in general proposal voting |
| 一般提案投票        | 0.5 CBT奖励 | 参与普通提案投票 |
| Important Proposal Voting | 2 CBT Reward | Participate in important proposal voting |
| 重要提案投票        | 2 CBT奖励  | 参与重要提案投票 |
| Create Proposal | 5000 CBT Deposit | Deposit required to create governance proposal |
| 创建提案            | 5000 CBT押金 | 创建治理提案所需押金 |
| Proposal Passed | 100% Deposit Returned | Deposit returned after proposal passes |
| 提案通过            | 返还100%押金 | 提案通过后返还押金 |
| Proposal Failed | 50% Deposit Returned | Partial deposit returned if proposal fails |
| 提案失败            | 返还50%押金 | 提案未通过返还部分押金 |

**Implementation Method**:
**实现方式**：
- Governance voting executed via smart contract
- 治理投票通过智能合约执行
- Voting weight related to holding amount and holding time
- 投票权重与持有量和持有时间相关
- Automated proposal execution, key parameter adjustments require multi-sig confirmation
- 提案执行自动化，关键参数调整需多签确认
- Holding governance NFTs can increase voting weight by 5-20%
- 持有治理NFT可增加投票权重5-20%

## 5. Token Economic Related Usage Scenarios
## 5. 代币经济相关使用场景

### 5.1 Staking and Yield
### 5.1 质押与收益

| Staking Type | Yield Rate | Description |
|--------------|------------|-------------|
| 质押类型     | 收益率     | 说明        |
| Basic Staking (30 days) | 12% APY | Basic token staking yield |
| 基础质押(30天) | 12%年化    | 基础代币质押收益 |
| Mid-term Staking (90 days) | 15% APY | Mid-term token staking yield |
| 中期质押(90天) | 15%年化    | 中期代币质押收益 |
| Long-term Staking (180 days) | 18% APY | Long-term token staking yield |
| 长期质押(180天) | 18%年化    | 长期代币质押收益 |
| Ultra-long Staking (365 days) | 20% APY | Ultra-long token staking yield |
| 超长期质押(365天) | 20%年化    | 超长期代币质押收益 |
| LP Token Staking | 25% APY | Liquidity provider staking yield |
| LP代币质押   | 25%年化    | 流动性提供者质押收益 |

**Implementation Method**:
**实现方式**：
- Smart contract manages staking and reward distribution
- 智能合约管理质押和奖励发放
- 5% penalty fee for early unstaking
- 提前解除质押收取5%惩罚费
- Supports automatic compounding for an additional 2% yield
- 支持自动复投获得2%额外收益
- Holding staking NFTs can grant an additional 2-10% yield
- 持有质押NFT可获得2-10%的额外收益

### 5.2 Transaction and Burn
### 5.2 交易与销毁

| Mechanism Type | Parameter | Description |
|----------------|-----------|-------------|
| 机制类型       | 参数      | 说明        |
| Automatic Transaction Burn | 1% | 1% of each transaction is automatically burned |
| 交易自动销毁   | 1%        | 每笔交易自动销毁1%代币 |
| Extra Fee Rate for Large Transactions | 0.1-0.4% | Extra fee charged for large transactions |
| 大额交易额外费率 | 0.1-0.4%  | 大额交易收取的额外费率 |
| Quarterly Buyback and Burn | 20% of platform revenue | Percentage of platform revenue used for buyback and burn |
| 季度回购销毁   | 平台收入20% | 用于回购销毁的平台收入比例 |
| Feature Fee Distribution | 60% Ecosystem/20% Buyback/20% Staking | Distribution method for platform feature fees |
| 功能费用分配   | 60%生态/20%回购/20%质押 | 平台功能费用的分配方式 |

**Implementation Method**:
**实现方式**：
- Transaction burn executed automatically via smart contract
- 交易销毁通过智能合约自动执行
- Buyback and burn executed periodically via multi-sig wallet
- 回购销毁通过多签钱包定期执行
- Burn records are public and transparent, verifiable on-chain
- 销毁记录公开透明，可在链上验证
- Large transaction limit: Single transaction not exceeding 0.1% of total supply
- 大额交易限制：单笔交易不超过总供应量的0.1%

### 5.3 NFT Ecosystem
### 5.3 NFT生态系统

| NFT Type | Usage | Description |
|----------|-------|-------------|
| NFT类型  | 用途  | 说明        |
| Learning Achievement NFT | Display achievements, gain reward bonus | NFT recording learning achievements |
| 学习成就NFT | 展示成就，获得奖励加成 | 记录学习成就的NFT |
| Cultural Art NFT | Collect, trade, earn royalties | Cultural artwork NFT |
| 文化艺术NFT | 收藏，交易，获得版税 | 文化艺术品NFT |
| Membership NFT | Gain privileges, transferable | NFT representing membership status |
| 会员资格NFT | 获得特权，可转让 | 代表会员资格的NFT |
| Creator Badge NFT | Display reputation, gain privileges | NFT representing creator's reputation |
| 创作者徽章NFT | 展示声誉，获得特权 | 代表创作者声誉的NFT |
| Limited Event NFT | Commemorative collection, special rights | Special event commemorative NFT |
| 限量活动NFT | 纪念收藏，特殊权益 | 特殊活动纪念NFT |

**Implementation Method**:
**实现方式**：
- NFT functionality implemented based on BEP-721 standard
- 基于BEP-721标准实现NFT功能
- Supports NFT staking for additional yield
- 支持NFT质押获得额外收益
- NFT marketplace charges 2.5% transaction fee
- NFT交易市场收取2.5%交易费
- Transaction fee distribution: 50% for buyback and burn, 30% to staking reward pool, 20% for platform operations
- 交易费分配：50%回购销毁，30%质押奖励池，20%平台运营

## 6. Partner Ecosystem Usage Scenarios
## 6. 合作伙伴生态使用场景

### 6.1 API Integration and Services
### 6.1 API集成与服务

| Service Type | Fee Model | Description |
|--------------|-----------|-------------|
| 服务类型     | 费用模式  | 说明        |
| Basic API Access | 250 CBT/month | Basic API call service |
| 基础API访问  | 250 CBT/月 | 基础API调用服务 |
| Standard API Access | 750 CBT/month | Standard API call service |
| 标准API访问  | 750 CBT/月 | 标准API调用服务 |
| Advanced API Access | 2500 CBT/month | Advanced API call service, includes more features |
| 高级API访问  | 2500 CBT/月 | 高级API调用服务，包含更多功能 |
| Custom API Development | Project pricing | Custom API service based on requirements |
| 定制API开发  | 项目定价  | 根据需求定制API服务 |

**Implementation Method**:
**实现方式**：
- Subscription-based API access
- 订阅制API访问权限
- Billed by call count or data volume
- 按调用次数或数据量计费
- Supports enterprise-level SLA services
- 支持企业级SLA服务
- Fee distribution: 60% to ecosystem development fund, 20% for buyback and burn, 20% to staking reward pool
- 费用分配：60%生态发展基金，20%回购销毁，20%质押奖励池

### 6.2 Educational Institution Partnerships
### 6.2 教育机构合作

| Partnership Type | Model | Description |
|------------------|-------|-------------|
| 合作类型         | 模式  | 说明        |
| Course Content Licensing | Revenue sharing | License platform course content to educational institutions |
| 课程内容授权     | 收入分成 | 向教育机构授权平台课程内容 |
| Learning Incentive Integration | Custom solution | Provide token incentive solutions for educational institutions |
| 学习激励集成     | 定制方案 | 为教育机构提供代币激励解决方案 |
| Joint Certification | Paid service | Jointly provide certification services with educational institutions |
| 联合认证         | 收费服务 | 与教育机构联合提供认证服务 |
| Enterprise Training Solution | Project pricing | Provide overall cultural training solutions for enterprises |
| 企业培训方案     | 项目定价 | 为企业提供文化培训整体方案 |

**Implementation Method**:
**实现方式**：
- Manage licensing and revenue sharing via smart contract
- 通过智能合约管理授权和收入分成
- Provide customized management backend for partners
- 为合作伙伴提供定制化管理后台
- Supports batch account and permission management
- 支持批量账户和权限管理
- Revenue distribution: 60% to content creators, 20% to platform, 20% to ecosystem development fund
- 收入分配：内容创作者60%，平台20%，生态发展基金20%

### 6.3 Cultural Organization Partnerships
### 6.3 文化组织合作

| Partnership Type | Model | Description |
|------------------|-------|-------------|
| 合作类型         | 模式  | 说明        |
| Cultural Content Display | Free/Paid | Display content and resources from cultural organizations |
| 文化内容展示     | 免费/收费 | 展示文化组织的内容和资源 |
| Joint Activities | Revenue sharing | Jointly organize activities with cultural organizations |
| 联合活动         | 收入分成 | 与文化组织联合举办活动 |
| Cultural NFT Collaboration | Revenue sharing | Jointly issue cultural NFT collectibles |
| 文化NFT合作      | 收入分成 | 联合发行文化NFT收藏品 |
| Cultural Promotion Plan | Custom solution | Provide promotion solutions for cultural organizations |
| 文化推广计划     | 定制方案 | 为文化组织提供推广解决方案 |

**Implementation Method**:
**实现方式**：
- Provide exclusive display pages for cultural organizations
- 为文化组织提供专属展示页面
- Manage revenue sharing via smart contract
- 通过智能合约管理收入分成
- Supports multi-party joint NFT issuance
- 支持多方联合NFT发行
- Revenue distribution: 60% to cultural organizations, 20% to platform, 20% to ecosystem development fund
- 收入分配：文化组织60%，平台20%，生态发展基金20%

## 7. Token Usage Scenario Implementation Roadmap
## 7. 代币使用场景实施路线图

### 7.1 Phase One (1-3 months)
### 7.1 第一阶段（1-3个月）

- Implement basic learning incentive mechanism
- 实现基础学习激励机制
- Develop basic staking function
- 开发基础质押功能
- Implement transaction automatic burn mechanism
- 实现交易自动销毁机制
- Launch basic course unlocking function
- 上线初级课程解锁功能
- Implement basic content creation rewards
- 实现基础内容创作奖励

**Specific Milestones**:
**具体里程碑**：
- Month 1: Complete basic token contract deployment
- 月1：完成基础代币合约部署
- Month 2: Implement basic learning incentive features
- 月2：实现学习激励基础功能
- Month 3: Launch staking system and basic course unlocking
- 月3：上线质押系统和初级课程解锁

### 7.2 Phase Two (4-6 months)
### 7.2 第二阶段（4-6个月）

- Implement complete learning incentive system
- 实现完整学习激励体系
- Launch NFT achievement system
- 上线NFT成就系统
- Develop full creator economic functions
- 开发创作者经济完整功能
- Implement basic community governance functions
- 实现社区治理基础功能
- Launch VIP membership system
- 上线VIP会员系统

**Specific Milestones**:
**具体里程碑**：
- Month 4: Launch basic NFT achievement system
- 月4：上线NFT成就系统基础功能
- Month 5: Complete creator economic system development
- 月5：完成创作者经济系统开发
- Month 6: Implement basic community governance functions and VIP membership system
- 月6：实现社区治理基础功能和VIP会员系统

### 7.3 Phase Three (7-12 months)
### 7.3 第三阶段（7-12个月）

- Implement advanced teacher matching system
- 实现高级教师匹配系统
- Develop complete NFT ecosystem
- 开发完整NFT生态系统
- Launch partner API services
- 上线合作伙伴API服务
- Implement full governance system
- 实现完整治理系统
- Develop cross-chain asset bridging function
- 开发跨链资产桥接功能

**Specific Milestones**:
**具体里程碑**：
- Month 7-8: Complete advanced teacher matching system and NFT ecosystem
- 月7-8：完成高级教师匹配系统和NFT生态系统
- Month 9-10: Launch API services and full governance system
- 月9-10：上线API服务和完整治理系统
- Month 11-12: Implement cross-chain asset bridging function
- 月11-12：实现跨链资产桥接功能

## 8. Usage Scenario Monitoring and Optimization
## 8. 使用场景监控与优化

| Monitoring Indicator | Target Range | Optimization Strategy |
|----------------------|--------------|-----------------------|
| 监控指标             | 目标范围     | 优化策略              |
| Feature Usage Rate | >50% of active users | Adjust feature fees, increase utility |
| 功能使用率           | >活跃用户的50% | 调整功能费用，增加实用性 |
| Learning Incentive Participation Rate | >80% of active users | Adjust reward parameters, optimize user experience |
| 学习激励参与率       | >活跃用户的80% | 调整奖励参数，优化用户体验 |
| Creation Participation Rate | >10% of active users | Adjust creation rewards, simplify creation process |
| 创作参与率           | >活跃用户的10% | 调整创作奖励，简化创作流程 |
| Staking Participation Rate | >30% of holders | Adjust staking yield, optimize staking experience |
| 质押参与率           | >持有者的30% | 调整质押收益，优化质押体验 |
| NFT Creation Rate | >20% of creators | Adjust NFT creation fees, increase NFT value |
| NFT创建率            | >创作者的20% | 调整NFT创建费用，增加NFT价值 |
| Governance Participation Rate | >15% of holders | Adjust governance rewards, simplify voting process |
| 治理参与率           | >持有者的15% | 调整治理奖励，简化投票流程 |

**Monitoring Mechanism**:
**监控机制**：
- Real-time data analysis dashboard
- 实时数据分析仪表板
- Weekly data reports and trend analysis
- 每周数据报告和趋势分析
- Monthly comprehensive economic model evaluation
- 每月全面经济模型评估
- Quarterly parameter adjustment proposals
- 季度参数调整提案

## 9. Multi-Account Collaboration Implementation Plan
## 9. 多账号协作实施计划

| Account | Responsible Scenario | Deliverables |
|---------|----------------------|--------------|
| 账号    | 负责场景             | 交付物       |
| CB-DESIGN | Overall planning and coordination | Final usage scenario document, parameter configuration table |
| CB-DESIGN | 整体规划与协调       | 最终使用场景文档，参数配置表 |
| CB-BACKEND | Smart contract implementation | Token contract, staking contract, NFT contract |
| CB-BACKEND | 智能合约实现         | 代币合约，质押合约，NFT合约 |
| CB-FEATURES | Feature development | Incentive mechanism, NFT system, governance system |
| CB-FEATURES | 功能开发             | 激励机制，NFT系统，治理系统 |
| CB-FRONTEND | User interface | Wallet interface, transaction interface, NFT display |
| CB-FRONTEND | 用户界面             | 钱包界面，交易界面，NFT展示 |
| CB-MOBILE | Mobile implementation | Mobile wallet, push notification system |
| CB-MOBILE | 移动端实现           | 移动端钱包，推送通知系统 |
| CB-AI-TEST | Testing and verification | Economic model simulation, security audit |
| CB-AI-TEST | 测试与验证           | 经济模型模拟，安全审计 |

## 10. Conclusion
## 10. 结论

This document details the various usage scenarios of the CultureBridge Token (CBT) within the platform's ecosystem, providing clear guidance on the token's practical value for users and serving as a reference for the development team's feature implementation. Through diversified token usage scenarios, CBT will become the core value carrier connecting learners, creators, and the community, promoting the sustainable development of the CultureBridge ecosystem.
本文档详细规划了CultureBridge代币(CBT)在平台生态系统中的各种使用场景，为用户提供明确的代币实用价值指南，同时为开发团队提供功能实现的参考。通过多元化的代币使用场景，CBT将成为连接学习者、创作者和社区的核心价值载体，推动CultureBridge生态系统的可持续发展。

All usage scenarios will be continuously optimized based on user feedback and market conditions, with the community governance mechanism ensuring transparency and fairness in the adjustment process. The development team will implement corresponding functions based on these scenario plans and deploy them to the mainnet after thorough verification on the testnet.
所有使用场景将根据用户反馈和市场情况进行持续优化，通过社区治理机制确保调整过程的透明和公正。开发团队将基于这些场景规划实现相应的功能，并在测试网进行充分验证后部署到主网。

**Key Value Propositions**:
**关键价值主张**：
- Learn to Earn: Gain real value returns through learning
- 学习即挖矿：通过学习获得实际价值回报
- Create to Earn: Provide sustainable income sources for creators
- 创作即价值：为创作者提供可持续的收入来源
- Participate to Earn: Community participation translates into actual governance and economic rights
- 参与即权益：社区参与转化为实际治理权和经济权益
- Hold to Earn: Gain passive income through staking and NFT holding
- 持有即收益：通过质押和NFT持有获得被动收入

Through the implementation of these usage scenarios, CultureBridge will establish a self-reinforcing token economic ecosystem, creating value for all participants while promoting the long-term sustainable development of the platform.
通过这些使用场景的实施，CultureBridge将建立一个自我强化的代币经济生态系统，为所有参与者创造价值，同时推动平台的长期可持续发展。


