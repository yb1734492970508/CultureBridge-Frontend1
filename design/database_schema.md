# CultureBridge 数据库架构设计

## 1. 数据库概述

CultureBridge应用将采用关系型数据库与NoSQL数据库相结合的架构，以满足不同类型数据的存储需求：

- **关系型数据库**：用于存储结构化数据，如用户信息、课程内容、学习进度等
- **NoSQL数据库**：用于存储聊天记录、翻译历史等需要高吞吐量和灵活模式的数据

### 1.1 数据库选型建议

- **关系型数据库**：PostgreSQL（强大的开源关系型数据库，支持复杂查询和JSON数据类型）
- **NoSQL数据库**：MongoDB（文档型数据库，适合存储聊天记录和翻译历史等半结构化数据）

## 2. 数据模型设计

### 2.1 用户相关模型

#### 用户表 (Users)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| user_id | UUID | 用户唯一标识符 | 主键 |
| username | VARCHAR(50) | 用户名 | 唯一, 非空 |
| email | VARCHAR(100) | 电子邮箱 | 唯一, 非空 |
| password_hash | VARCHAR(255) | 密码哈希值 | 非空 |
| first_name | VARCHAR(50) | 名字 | 可空 |
| last_name | VARCHAR(50) | 姓氏 | 可空 |
| profile_picture | VARCHAR(255) | 头像URL | 可空 |
| bio | TEXT | 个人简介 | 可空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |
| last_login | TIMESTAMP | 最后登录时间 | 可空 |
| is_active | BOOLEAN | 账号是否激活 | 非空, 默认true |

#### 用户语言能力表 (UserLanguages)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| user_language_id | UUID | 唯一标识符 | 主键 |
| user_id | UUID | 用户ID | 外键(Users), 非空 |
| language_code | VARCHAR(10) | 语言代码(ISO 639-1) | 非空 |
| proficiency_level | VARCHAR(20) | 熟练度级别(beginner, intermediate, advanced, native) | 非空 |
| is_learning | BOOLEAN | 是否为学习语言 | 非空, 默认false |
| is_teaching | BOOLEAN | 是否为教授语言 | 非空, 默认false |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |

#### 用户兴趣表 (UserInterests)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| user_interest_id | UUID | 唯一标识符 | 主键 |
| user_id | UUID | 用户ID | 外键(Users), 非空 |
| interest_id | UUID | 兴趣ID | 外键(Interests), 非空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |

#### 兴趣表 (Interests)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| interest_id | UUID | 唯一标识符 | 主键 |
| name | VARCHAR(50) | 兴趣名称 | 非空 |
| category | VARCHAR(50) | 兴趣类别 | 可空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |

### 2.2 学习内容相关模型

#### 语言表 (Languages)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| language_code | VARCHAR(10) | 语言代码(ISO 639-1) | 主键 |
| name | VARCHAR(50) | 语言名称 | 非空 |
| native_name | VARCHAR(50) | 语言的本地名称 | 非空 |
| flag_icon | VARCHAR(255) | 国旗图标URL | 可空 |
| is_active | BOOLEAN | 是否激活 | 非空, 默认true |

#### 课程表 (Courses)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| course_id | UUID | 唯一标识符 | 主键 |
| title | VARCHAR(100) | 课程标题 | 非空 |
| description | TEXT | 课程描述 | 非空 |
| language_code | VARCHAR(10) | 目标语言 | 外键(Languages), 非空 |
| level | VARCHAR(20) | 难度级别(beginner, intermediate, advanced) | 非空 |
| image_url | VARCHAR(255) | 课程封面图URL | 可空 |
| estimated_duration | INTEGER | 预计完成时间(分钟) | 可空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |
| is_active | BOOLEAN | 是否激活 | 非空, 默认true |

#### 学习单元表 (Units)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| unit_id | UUID | 唯一标识符 | 主键 |
| course_id | UUID | 所属课程ID | 外键(Courses), 非空 |
| title | VARCHAR(100) | 单元标题 | 非空 |
| description | TEXT | 单元描述 | 可空 |
| order_index | INTEGER | 排序索引 | 非空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |
| is_active | BOOLEAN | 是否激活 | 非空, 默认true |

#### 学习内容表 (LessonContents)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| content_id | UUID | 唯一标识符 | 主键 |
| unit_id | UUID | 所属单元ID | 外键(Units), 非空 |
| content_type | VARCHAR(20) | 内容类型(text, image, audio, video, exercise) | 非空 |
| title | VARCHAR(100) | 内容标题 | 可空 |
| content_data | TEXT | 内容数据(可能是文本、URL或JSON) | 非空 |
| order_index | INTEGER | 排序索引 | 非空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |
| is_active | BOOLEAN | 是否激活 | 非空, 默认true |

#### 练习题表 (Exercises)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| exercise_id | UUID | 唯一标识符 | 主键 |
| content_id | UUID | 所属内容ID | 外键(LessonContents), 非空 |
| exercise_type | VARCHAR(20) | 练习类型(multiple_choice, fill_blank, matching, ordering) | 非空 |
| question | TEXT | 问题内容 | 非空 |
| options | JSON | 选项(对于选择题) | 可空 |
| correct_answer | TEXT | 正确答案 | 非空 |
| explanation | TEXT | 解释说明 | 可空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |
| is_active | BOOLEAN | 是否激活 | 非空, 默认true |

#### 用户学习进度表 (UserProgress)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| progress_id | UUID | 唯一标识符 | 主键 |
| user_id | UUID | 用户ID | 外键(Users), 非空 |
| course_id | UUID | 课程ID | 外键(Courses), 非空 |
| unit_id | UUID | 当前单元ID | 外键(Units), 可空 |
| content_id | UUID | 当前内容ID | 外键(LessonContents), 可空 |
| completion_percentage | DECIMAL(5,2) | 完成百分比 | 非空, 默认0 |
| last_accessed | TIMESTAMP | 最后访问时间 | 非空, 默认当前时间 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |

#### 用户练习结果表 (UserExerciseResults)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| result_id | UUID | 唯一标识符 | 主键 |
| user_id | UUID | 用户ID | 外键(Users), 非空 |
| exercise_id | UUID | 练习ID | 外键(Exercises), 非空 |
| user_answer | TEXT | 用户答案 | 可空 |
| is_correct | BOOLEAN | 是否正确 | 非空 |
| attempt_count | INTEGER | 尝试次数 | 非空, 默认1 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |

### 2.3 社交与匹配相关模型

#### 用户关系表 (UserRelationships)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| relationship_id | UUID | 唯一标识符 | 主键 |
| user_id_1 | UUID | 用户1 ID | 外键(Users), 非空 |
| user_id_2 | UUID | 用户2 ID | 外键(Users), 非空 |
| status | VARCHAR(20) | 关系状态(pending, accepted, rejected, blocked) | 非空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |

#### 匹配偏好表 (MatchPreferences)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| preference_id | UUID | 唯一标识符 | 主键 |
| user_id | UUID | 用户ID | 外键(Users), 非空 |
| preferred_languages | JSON | 偏好语言列表 | 可空 |
| preferred_age_min | INTEGER | 偏好年龄下限 | 可空 |
| preferred_age_max | INTEGER | 偏好年龄上限 | 可空 |
| preferred_interests | JSON | 偏好兴趣列表 | 可空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |

#### 聊天会话表 (ChatSessions)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| session_id | UUID | 唯一标识符 | 主键 |
| created_by | UUID | 创建者ID | 外键(Users), 非空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |
| is_active | BOOLEAN | 是否激活 | 非空, 默认true |

#### 聊天会话参与者表 (ChatParticipants)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| participant_id | UUID | 唯一标识符 | 主键 |
| session_id | UUID | 会话ID | 外键(ChatSessions), 非空 |
| user_id | UUID | 用户ID | 外键(Users), 非空 |
| joined_at | TIMESTAMP | 加入时间 | 非空, 默认当前时间 |
| left_at | TIMESTAMP | 离开时间 | 可空 |
| is_active | BOOLEAN | 是否激活 | 非空, 默认true |

#### 聊天消息表 (ChatMessages) - NoSQL

```json
{
  "_id": "ObjectId",
  "session_id": "UUID",
  "sender_id": "UUID",
  "content": "String",
  "original_language": "String",
  "translated_content": {
    "language_code_1": "String",
    "language_code_2": "String",
    "..."
  },
  "sent_at": "Timestamp",
  "read_by": ["UUID", "UUID", "..."],
  "is_deleted": "Boolean"
}
```

### 2.4 翻译相关模型

#### 翻译历史表 (TranslationHistory) - NoSQL

```json
{
  "_id": "ObjectId",
  "user_id": "UUID",
  "source_language": "String",
  "target_language": "String",
  "original_text": "String",
  "translated_text": "String",
  "grammar_notes": ["String", "String", "..."],
  "cultural_notes": ["String", "String", "..."],
  "created_at": "Timestamp",
  "is_favorite": "Boolean"
}
```

#### 常用短语表 (SavedPhrases)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| phrase_id | UUID | 唯一标识符 | 主键 |
| user_id | UUID | 用户ID | 外键(Users), 非空 |
| source_language | VARCHAR(10) | 源语言 | 外键(Languages), 非空 |
| target_language | VARCHAR(10) | 目标语言 | 外键(Languages), 非空 |
| original_text | TEXT | 原文 | 非空 |
| translated_text | TEXT | 译文 | 非空 |
| context | TEXT | 使用上下文 | 可空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |

### 2.5 系统相关模型

#### 通知表 (Notifications)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| notification_id | UUID | 唯一标识符 | 主键 |
| user_id | UUID | 接收用户ID | 外键(Users), 非空 |
| type | VARCHAR(50) | 通知类型 | 非空 |
| content | TEXT | 通知内容 | 非空 |
| related_id | UUID | 相关实体ID | 可空 |
| is_read | BOOLEAN | 是否已读 | 非空, 默认false |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |

#### 用户设置表 (UserSettings)

| 字段名 | 数据类型 | 描述 | 约束 |
|--------|----------|------|------|
| setting_id | UUID | 唯一标识符 | 主键 |
| user_id | UUID | 用户ID | 外键(Users), 非空 |
| notification_preferences | JSON | 通知偏好设置 | 可空 |
| privacy_settings | JSON | 隐私设置 | 可空 |
| theme | VARCHAR(20) | 界面主题 | 可空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 非空, 默认当前时间 |

## 3. 数据库关系图

```
Users 1──┬──* UserLanguages
         ├──* UserInterests
         ├──* UserProgress
         ├──* UserExerciseResults
         ├──1 UserSettings
         ├──* Notifications
         ├──* UserRelationships (as user_id_1)
         ├──* UserRelationships (as user_id_2)
         ├──1 MatchPreferences
         ├──* ChatSessions (as created_by)
         ├──* ChatParticipants
         ├──* ChatMessages (as sender_id)
         ├──* TranslationHistory
         └──* SavedPhrases

Interests 1──* UserInterests

Languages 1──┬──* UserLanguages
             ├──* Courses
             ├──* SavedPhrases (as source_language)
             └──* SavedPhrases (as target_language)

Courses 1──┬──* Units
           └──* UserProgress

Units 1──┬──* LessonContents
         └──* UserProgress

LessonContents 1──┬──* Exercises
                  └──* UserProgress

Exercises 1──* UserExerciseResults

ChatSessions 1──* ChatParticipants
                └──* ChatMessages
```

## 4. 索引策略

### 4.1 关系型数据库索引

| 表名 | 索引字段 | 索引类型 | 目的 |
|------|----------|----------|------|
| Users | email | 唯一索引 | 加速登录查询 |
| Users | username | 唯一索引 | 加速用户名查询 |
| UserLanguages | (user_id, language_code) | 复合索引 | 加速用户语言查询 |
| UserInterests | (user_id, interest_id) | 复合索引 | 加速用户兴趣查询 |
| Courses | language_code | 索引 | 加速按语言筛选课程 |
| Courses | level | 索引 | 加速按难度筛选课程 |
| Units | (course_id, order_index) | 复合索引 | 加速课程单元查询 |
| LessonContents | (unit_id, order_index) | 复合索引 | 加速单元内容查询 |
| UserProgress | (user_id, course_id) | 复合索引 | 加速用户进度查询 |
| UserExerciseResults | (user_id, exercise_id) | 复合索引 | 加速用户练习结果查询 |
| UserRelationships | (user_id_1, user_id_2) | 复合索引 | 加速用户关系查询 |
| ChatParticipants | (session_id, user_id) | 复合索引 | 加速聊天参与者查询 |
| Notifications | (user_id, is_read) | 复合索引 | 加速未读通知查询 |

### 4.2 NoSQL数据库索引

| 集合名 | 索引字段 | 索引类型 | 目的 |
|--------|----------|----------|------|
| ChatMessages | session_id | 索引 | 加速会话消息查询 |
| ChatMessages | (session_id, sent_at) | 复合索引 | 加速按时间顺序查询消息 |
| TranslationHistory | user_id | 索引 | 加速用户翻译历史查询 |
| TranslationHistory | (user_id, created_at) | 复合索引 | 加速按时间顺序查询翻译历史 |
| TranslationHistory | (user_id, is_favorite) | 复合索引 | 加速收藏翻译查询 |

## 5. 数据迁移与版本控制策略

### 5.1 迁移策略

- 使用数据库迁移工具（如Flyway或Liquibase）管理数据库架构变更
- 每次架构变更创建新的迁移脚本
- 迁移脚本应包含向前和向后兼容的操作
- 在开发环境中测试迁移脚本后再应用到生产环境

### 5.2 版本控制

- 数据库架构版本与应用版本保持一致
- 迁移脚本命名格式：`V{版本号}_{描述}.sql`
- 在专门的迁移历史表中记录已应用的迁移
- 应用启动时自动检查并应用未执行的迁移

## 6. 数据安全策略

### 6.1 数据加密

- 敏感用户数据（如密码）使用强哈希算法存储
- 传输中的数据使用TLS/SSL加密
- 考虑对特别敏感的字段（如个人身份信息）进行列级加密

### 6.2 访问控制

- 实施基于角色的访问控制(RBAC)
- 数据库用户权限最小化原则
- 使用参数化查询防止SQL注入
- 实施行级安全性，确保用户只能访问自己的数据

### 6.3 审计日志

- 记录关键数据操作（创建、更新、删除）
- 审计日志包含操作类型、时间、用户和受影响的数据
- 定期备份审计日志并设置适当的保留策略

## 7. 性能优化策略

### 7.1 查询优化

- 使用EXPLAIN分析查询执行计划
- 优化复杂查询，避免全表扫描
- 适当使用视图简化复杂查询
- 考虑使用存储过程处理复杂业务逻辑

### 7.2 缓存策略

- 使用Redis缓存频繁访问的数据
- 实施多级缓存策略（应用级、数据库级）
- 设置适当的缓存失效策略
- 监控缓存命中率并调整缓存策略

### 7.3 分区与分片

- 考虑对大表进行分区（如按时间或用户ID）
- 随着用户增长，考虑实施数据分片策略
- 为分片数据实施适当的跨分片查询策略

## 8. 备份与恢复策略

### 8.1 备份策略

- 实施定期全量备份（每日）
- 配置连续增量备份（每小时）
- 备份存储在多个地理位置
- 定期测试备份恢复过程

### 8.2 恢复策略

- 定义明确的恢复点目标(RPO)和恢复时间目标(RTO)
- 实施自动化恢复流程
- 维护详细的恢复操作手册
- 定期进行恢复演练

## 9. 扩展性考虑

- 设计支持水平扩展的数据库架构
- 考虑未来可能的功能扩展
- 保留适当的元数据字段（如created_at, updated_at）
- 使用UUID作为主键，便于分布式系统中的唯一性

## 10. 数据库实现路线图

### 10.1 MVP阶段

- 实现核心表结构（Users, UserLanguages, Courses, Units, LessonContents, Exercises, UserProgress）
- 实现基本的社交功能表（UserRelationships, ChatSessions, ChatMessages）
- 实现翻译相关表（TranslationHistory, SavedPhrases）

### 10.2 后续阶段

- 实现高级用户匹配功能（MatchPreferences）
- 扩展学习内容模型（添加更多内容类型和互动元素）
- 实现社区功能相关表（Forums, Posts, Comments）
- 实现游戏化元素相关表（Achievements, Badges, Leaderboards）
