# CultureBridge Database Architecture Design
# CultureBridge 数据库架构设计

## 1. Database Overview
## 1. 数据库概述

The CultureBridge application will adopt an architecture combining relational databases and NoSQL databases to meet the storage needs of different types of data:
CultureBridge应用将采用关系型数据库与NoSQL数据库相结合的架构，以满足不同类型数据的存储需求：

- **Relational Database**: Used to store structured data, such as user information, course content, learning progress, etc.
- **关系型数据库**：用于存储结构化数据，如用户信息、课程内容、学习进度等
- **NoSQL Database**: Used to store chat records, translation history, and other data requiring high throughput and flexible schemas.
- **NoSQL数据库**：用于存储聊天记录、翻译历史等需要高吞吐量和灵活模式的数据

### 1.1 Database Selection Recommendations
### 1.1 数据库选型建议

- **Relational Database**: PostgreSQL (powerful open-source relational database, supports complex queries and JSON data types)
- **关系型数据库**：PostgreSQL（强大的开源关系型数据库，支持复杂查询和JSON数据类型）
- **NoSQL Database**: MongoDB (document-oriented database, suitable for storing semi-structured data like chat records and translation history)
- **NoSQL数据库**：MongoDB（文档型数据库，适合存储聊天记录和翻译历史等半结构化数据）

## 2. Data Model Design
## 2. 数据模型设计

### 2.1 User-Related Models
### 2.1 用户相关模型

#### Users Table (Users)
#### 用户表 (Users)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| user_id | UUID | Unique user identifier | Primary Key |
| user_id | UUID | 用户唯一标识符 | 主键        |
| username | VARCHAR(50) | Username | Unique, Not Null |
| username | VARCHAR(50) | 用户名      | 唯一, 非空  |
| email | VARCHAR(100) | Email address | Unique, Not Null |
| email | VARCHAR(100) | 电子邮箱    | 唯一, 非空  |
| password_hash | VARCHAR(255) | Password hash value | Not Null |
| password_hash | VARCHAR(255) | 密码哈希值  | 非空        |
| first_name | VARCHAR(50) | First name | Nullable |
| first_name | VARCHAR(50) | 名字        | 可空        |
| last_name | VARCHAR(50) | Last name | Nullable |
| last_name | VARCHAR(50) | 姓氏        | 可空        |
| profile_picture | VARCHAR(255) | Profile picture URL | Nullable |
| profile_picture | VARCHAR(255) | 头像URL     | 可空        |
| bio | TEXT | Personal biography | Nullable |
| bio | TEXT | 个人简介    | 可空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |
| last_login | TIMESTAMP | Last login time | Nullable |
| last_login | TIMESTAMP | 最后登录时间 | 可空        |
| is_active | BOOLEAN | Is account active | Not Null, Default true |
| is_active | BOOLEAN | 账号是否激活 | 非空, 默认true |

#### User Languages Table (UserLanguages)
#### 用户语言能力表 (UserLanguages)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| user_language_id | UUID | Unique identifier | Primary Key |
| user_language_id | UUID | 唯一标识符  | 主键        |
| user_id | UUID | User ID | Foreign Key (Users), Not Null |
| user_id | UUID | 用户ID      | 外键(Users), 非空 |
| language_code | VARCHAR(10) | Language code (ISO 639-1) | Not Null |
| language_code | VARCHAR(10) | 语言代码(ISO 639-1) | 非空        |
| proficiency_level | VARCHAR(20) | Proficiency level (beginner, intermediate, advanced, native) | Not Null |
| proficiency_level | VARCHAR(20) | 熟练度级别(beginner, intermediate, advanced, native) | 非空        |
| is_learning | BOOLEAN | Is learning language | Not Null, Default false |
| is_learning | BOOLEAN | 是否为学习语言 | 非空, 默认false |
| is_teaching | BOOLEAN | Is teaching language | Not Null, Default false |
| is_teaching | BOOLEAN | 是否为教授语言 | 非空, 默认false |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |

#### User Interests Table (UserInterests)
#### 用户兴趣表 (UserInterests)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| user_interest_id | UUID | Unique identifier | Primary Key |
| user_interest_id | UUID | 唯一标识符  | 主键        |
| user_id | UUID | User ID | Foreign Key (Users), Not Null |
| user_id | UUID | 用户ID      | 外键(Users), 非空 |
| interest_id | UUID | Interest ID | Foreign Key (Interests), Not Null |
| interest_id | UUID | 兴趣ID      | 外键(Interests), 非空 |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |

#### Interests Table (Interests)
#### 兴趣表 (Interests)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| interest_id | UUID | Unique identifier | Primary Key |
| interest_id | UUID | 唯一标识符  | 主键        |
| name | VARCHAR(50) | Interest name | Not Null |
| name | VARCHAR(50) | 兴趣名称    | 非空        |
| category | VARCHAR(50) | Interest category | Nullable |
| category | VARCHAR(50) | 兴趣类别    | 可空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |

### 2.2 Learning Content Related Models
### 2.2 学习内容相关模型

#### Languages Table (Languages)
#### 语言表 (Languages)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| language_code | VARCHAR(10) | Language code (ISO 639-1) | Primary Key |
| language_code | VARCHAR(10) | 语言代码(ISO 639-1) | 主键        |
| name | VARCHAR(50) | Language name | Not Null |
| name | VARCHAR(50) | 语言名称    | 非空        |
| native_name | VARCHAR(50) | Native name of the language | Not Null |
| native_name | VARCHAR(50) | 语言的本地名称 | 非空        |
| flag_icon | VARCHAR(255) | Flag icon URL | Nullable |
| flag_icon | VARCHAR(255) | 国旗图标URL | 可空        |
| is_active | BOOLEAN | Is active | Not Null, Default true |
| is_active | BOOLEAN | 是否激活    | 非空, 默认true |

#### Courses Table (Courses)
#### 课程表 (Courses)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| course_id | UUID | Unique identifier | Primary Key |
| course_id | UUID | 唯一标识符  | 主键        |
| title | VARCHAR(100) | Course title | Not Null |
| title | VARCHAR(100) | 课程标题    | 非空        |
| description | TEXT | Course description | Not Null |
| description | TEXT | 课程描述    | 非空        |
| language_code | VARCHAR(10) | Target language | Foreign Key (Languages), Not Null |
| language_code | VARCHAR(10) | 目标语言    | 外键(Languages), 非空 |
| level | VARCHAR(20) | Difficulty level (beginner, intermediate, advanced) | Not Null |
| level | VARCHAR(20) | 难度级别(beginner, intermediate, advanced) | 非空        |
| image_url | VARCHAR(255) | Course cover image URL | Nullable |
| image_url | VARCHAR(255) | 课程封面图URL | 可空        |
| estimated_duration | INTEGER | Estimated completion time (minutes) | Nullable |
| estimated_duration | INTEGER | 预计完成时间(分钟) | 可空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |
| is_active | BOOLEAN | Is active | Not Null, Default true |
| is_active | BOOLEAN | 是否激活    | 非空, 默认true |

#### Learning Units Table (Units)
#### 学习单元表 (Units)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| unit_id | UUID | Unique identifier | Primary Key |
| unit_id | UUID | 唯一标识符  | 主键        |
| course_id | UUID | Course ID | Foreign Key (Courses), Not Null |
| course_id | UUID | 所属课程ID  | 外键(Courses), 非空 |
| title | VARCHAR(100) | Unit title | Not Null |
| title | VARCHAR(100) | 单元标题    | 非空        |
| description | TEXT | Unit description | Nullable |
| description | TEXT | 单元描述    | 可空        |
| order_index | INTEGER | Order index | Not Null |
| order_index | INTEGER | 排序索引    | 非空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |
| is_active | BOOLEAN | Is active | Not Null, Default true |
| is_active | BOOLEAN | 是否激活    | 非空, 默认true |

#### Lesson Contents Table (LessonContents)
#### 学习内容表 (LessonContents)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| content_id | UUID | Unique identifier | Primary Key |
| content_id | UUID | 唯一标识符  | 主键        |
| unit_id | UUID | Unit ID | Foreign Key (Units), Not Null |
| unit_id | UUID | 所属单元ID  | 外键(Units), 非空 |
| content_type | VARCHAR(20) | Content type (text, image, audio, video, exercise) | Not Null |
| content_type | VARCHAR(20) | 内容类型(text, image, audio, video, exercise) | 非空        |
| title | VARCHAR(100) | Content title | Nullable |
| title | VARCHAR(100) | 内容标题    | 可空        |
| content_data | TEXT | Content data (can be text, URL, or JSON) | Not Null |
| content_data | TEXT | 内容数据(可能是文本、URL或JSON) | 非空        |
| order_index | INTEGER | Order index | Not Null |
| order_index | INTEGER | 排序索引    | 非空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |
| is_active | BOOLEAN | Is active | Not Null, Default true |
| is_active | BOOLEAN | 是否激活    | 非空, 默认true |

#### Exercises Table (Exercises)
#### 练习题表 (Exercises)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| exercise_id | UUID | Unique identifier | Primary Key |
| exercise_id | UUID | 唯一标识符  | 主键        |
| content_id | UUID | Content ID | Foreign Key (LessonContents), Not Null |
| content_id | UUID | 所属内容ID  | 外键(LessonContents), 非空 |
| exercise_type | VARCHAR(20) | Exercise type (multiple_choice, fill_blank, matching, ordering) | Not Null |
| exercise_type | VARCHAR(20) | 练习类型(multiple_choice, fill_blank, matching, ordering) | 非空        |
| question | TEXT | Question content | Not Null |
| question | TEXT | 问题内容    | 非空        |
| options | JSON | Options (for multiple choice questions) | Nullable |
| options | JSON | 选项(对于选择题) | 可空        |
| correct_answer | TEXT | Correct answer | Not Null |
| correct_answer | TEXT | 正确答案    | 非空        |
| explanation | TEXT | Explanation | Nullable |
| explanation | TEXT | 解释说明    | 可空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |
| is_active | BOOLEAN | Is active | Not Null, Default true |
| is_active | BOOLEAN | 是否激活    | 非空, 默认true |

#### User Learning Progress Table (UserProgress)
#### 用户学习进度表 (UserProgress)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| progress_id | UUID | Unique identifier | Primary Key |
| progress_id | UUID | 唯一标识符  | 主键        |
| user_id | UUID | User ID | Foreign Key (Users), Not Null |
| user_id | UUID | 用户ID      | 外键(Users), 非空 |
| course_id | UUID | Course ID | Foreign Key (Courses), Not Null |
| course_id | UUID | 课程ID      | 外键(Courses), 非空 |
| unit_id | UUID | Current unit ID | Foreign Key (Units), Nullable |
| unit_id | UUID | 当前单元ID  | 外键(Units), 可空 |
| content_id | UUID | Current content ID | Foreign Key (LessonContents), Nullable |
| content_id | UUID | 当前内容ID  | 外键(LessonContents), 可空 |
| completion_percentage | DECIMAL(5,2) | Completion percentage | Not Null, Default 0 |
| completion_percentage | DECIMAL(5,2) | 完成百分比  | 非空, 默认0 |
| last_accessed | TIMESTAMP | Last accessed time | Not Null, Default Current Time |
| last_accessed | TIMESTAMP | 最后访问时间 | 非空, 默认当前时间 |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |

#### User Exercise Results Table (UserExerciseResults)
#### 用户练习结果表 (UserExerciseResults)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| result_id | UUID | Unique identifier | Primary Key |
| result_id | UUID | 唯一标识符  | 主键        |
| user_id | UUID | User ID | Foreign Key (Users), Not Null |
| user_id | UUID | 用户ID      | 外键(Users), 非空 |
| exercise_id | UUID | Exercise ID | Foreign Key (Exercises), Not Null |
| exercise_id | UUID | 练习ID      | 外键(Exercises), 非空 |
| user_answer | TEXT | User answer | Nullable |
| user_answer | TEXT | 用户答案    | 可空        |
| is_correct | BOOLEAN | Is correct | Not Null |
| is_correct | BOOLEAN | 是否正确    | 非空        |
| attempt_count | INTEGER | Attempt count | Not Null, Default 1 |
| attempt_count | INTEGER | 尝试次数    | 非空, 默认1 |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |

### 2.3 Social and Matching Related Models
### 2.3 社交与匹配相关模型

#### User Relationships Table (UserRelationships)
#### 用户关系表 (UserRelationships)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| relationship_id | UUID | Unique identifier | Primary Key |
| relationship_id | UUID | 唯一标识符  | 主键        |
| user_id_1 | UUID | User 1 ID | Foreign Key (Users), Not Null |
| user_id_1 | UUID | 用户1 ID    | 外键(Users), 非空 |
| user_id_2 | UUID | User 2 ID | Foreign Key (Users), Not Null |
| user_id_2 | UUID | 用户2 ID    | 外键(Users), 非空 |
| status | VARCHAR(20) | Relationship status (pending, accepted, rejected, blocked) | Not Null |
| status | VARCHAR(20) | 关系状态(pending, accepted, rejected, blocked) | 非空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |

#### Match Preferences Table (MatchPreferences)
#### 匹配偏好表 (MatchPreferences)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| preference_id | UUID | Unique identifier | Primary Key |
| preference_id | UUID | 唯一标识符  | 主键        |
| user_id | UUID | User ID | Foreign Key (Users), Not Null |
| user_id | UUID | 用户ID      | 外键(Users), 非空 |
| preferred_languages | JSON | List of preferred languages | Nullable |
| preferred_languages | JSON | 偏好语言列表 | 可空        |
| preferred_age_min | INTEGER | Minimum preferred age | Nullable |
| preferred_age_min | INTEGER | 偏好年龄下限 | 可空        |
| preferred_age_max | INTEGER | Maximum preferred age | Nullable |
| preferred_age_max | INTEGER | 偏好年龄上限 | 可空        |
| preferred_interests | JSON | List of preferred interests | Nullable |
| preferred_interests | JSON | 偏好兴趣列表 | 可空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |

#### Chat Sessions Table (ChatSessions)
#### 聊天会话表 (ChatSessions)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| session_id | UUID | Unique identifier | Primary Key |
| session_id | UUID | 唯一标识符  | 主键        |
| created_by | UUID | Creator ID | Foreign Key (Users), Not Null |
| created_by | UUID | 创建者ID    | 外键(Users), 非空 |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |
| is_active | BOOLEAN | Is active | Not Null, Default true |
| is_active | BOOLEAN | 是否激活    | 非空, 默认true |

#### Chat Participants Table (ChatParticipants)
#### 聊天会话参与者表 (ChatParticipants)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| participant_id | UUID | Unique identifier | Primary Key |
| participant_id | UUID | 唯一标识符  | 主键        |
| session_id | UUID | Session ID | Foreign Key (ChatSessions), Not Null |
| session_id | UUID | 会话ID      | 外键(ChatSessions), 非空 |
| user_id | UUID | User ID | Foreign Key (Users), Not Null |
| user_id | UUID | 用户ID      | 外键(Users), 非空 |
| joined_at | TIMESTAMP | Join time | Not Null, Default Current Time |
| joined_at | TIMESTAMP | 加入时间    | 非空, 默认当前时间 |
| left_at | TIMESTAMP | Leave time | Nullable |
| left_at | TIMESTAMP | 离开时间    | 可空        |
| is_active | BOOLEAN | Is active | Not Null, Default true |
| is_active | BOOLEAN | 是否激活    | 非空, 默认true |

#### Chat Messages Table (ChatMessages) - NoSQL
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

### 2.4 Translation Related Models
### 2.4 翻译相关模型

#### Translation History Table (TranslationHistory) - NoSQL
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

#### Saved Phrases Table (SavedPhrases)
#### 常用短语表 (SavedPhrases)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| phrase_id | UUID | Unique identifier | Primary Key |
| phrase_id | UUID | 唯一标识符  | 主键        |
| user_id | UUID | User ID | Foreign Key (Users), Not Null |
| user_id | UUID | 用户ID      | 外键(Users), 非空 |
| source_language | VARCHAR(10) | Source language | Foreign Key (Languages), Not Null |
| source_language | VARCHAR(10) | 源语言      | 外键(Languages), 非空 |
| target_language | VARCHAR(10) | Target language | Foreign Key (Languages), Not Null |
| target_language | VARCHAR(10) | 目标语言    | 外键(Languages), 非空 |
| original_text | TEXT | Original text | Not Null |
| original_text | TEXT | 原文        | 非空        |
| translated_text | TEXT | Translated text | Not Null |
| translated_text | TEXT | 译文        | 非空        |
| context | TEXT | Usage context | Nullable |
| context | TEXT | 使用上下文  | 可空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |

### 2.5 System Related Models
### 2.5 系统相关模型

#### Notifications Table (Notifications)
#### 通知表 (Notifications)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| notification_id | UUID | Unique identifier | Primary Key |
| notification_id | UUID | 唯一标识符  | 主键        |
| user_id | UUID | Recipient user ID | Foreign Key (Users), Not Null |
| user_id | UUID | 接收用户ID  | 外键(Users), 非空 |
| type | VARCHAR(50) | Notification type | Not Null |
| type | VARCHAR(50) | 通知类型    | 非空        |
| content | TEXT | Notification content | Not Null |
| content | TEXT | 通知内容    | 非空        |
| related_id | UUID | Related entity ID | Nullable |
| related_id | UUID | 相关实体ID  | 可空        |
| is_read | BOOLEAN | Is read | Not Null, Default false |
| is_read | BOOLEAN | 是否已读    | 非空, 默认false |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |

#### User Settings Table (UserSettings)
#### 用户设置表 (UserSettings)

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|-------------|
| 字段名     | 数据类型  | 描述        | 约束        |
| setting_id | UUID | Unique identifier | Primary Key |
| setting_id | UUID | 唯一标识符  | 主键        |
| user_id | UUID | User ID | Foreign Key (Users), Not Null |
| user_id | UUID | 用户ID      | 外键(Users), 非空 |
| notification_preferences | JSON | Notification preferences settings | Nullable |
| notification_preferences | JSON | 通知偏好设置 | 可空        |
| privacy_settings | JSON | Privacy settings | Nullable |
| privacy_settings | JSON | 隐私设置    | 可空        |
| theme | VARCHAR(20) | UI theme | Nullable |
| theme | VARCHAR(20) | 界面主题    | 可空        |
| created_at | TIMESTAMP | Creation time | Not Null, Default Current Time |
| created_at | TIMESTAMP | 创建时间    | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | Update time | Not Null, Default Current Time |
| updated_at | TIMESTAMP | 更新时间    | 非空, 默认当前时间 |

## 3. Database Relationship Diagram
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

## 4. Indexing Strategy
## 4. 索引策略

### 4.1 Relational Database Indexes
### 4.1 关系型数据库索引

| Table Name | Indexed Fields | Index Type | Purpose |
|------------|----------------|------------|---------|
| 表名       | 索引字段       | 索引类型   | 目的    |
| Users | email | Unique Index | Accelerate login queries |
| Users | email | 唯一索引   | 加速登录查询 |
| Users | username | Unique Index | Accelerate username queries |
| Users | username | 唯一索引   | 加速用户名查询 |
| UserLanguages | (user_id, language_code) | Composite Index | Accelerate user language queries |
| UserLanguages | (user_id, language_code) | 复合索引   | 加速用户语言查询 |
| UserInterests | (user_id, interest_id) | Composite Index | Accelerate user interest queries |
| UserInterests | (user_id, interest_id) | 复合索引   | 加速用户兴趣查询 |
| Courses | language_code | Index | Accelerate course filtering by language |
| Courses | language_code | 索引       | 加速按语言筛选课程 |
| Courses | level | Index | Accelerate course filtering by difficulty |
| Courses | level | 索引       | 加速按难度筛选课程 |
| Units | (course_id, order_index) | Composite Index | Accelerate course unit queries |
| Units | (course_id, order_index) | 复合索引   | 加速课程单元查询 |
| LessonContents | (unit_id, order_index) | Composite Index | Accelerate unit content queries |
| LessonContents | (unit_id, order_index) | 复合索引   | 加速单元内容查询 |
| UserProgress | (user_id, course_id) | Composite Index | Accelerate user progress queries |
| UserProgress | (user_id, course_id) | 复合索引   | 加速用户进度查询 |
| UserRelationships | (user_id_1, user_id_2) | Composite Index | Accelerate user relationship queries |
| UserRelationships | (user_id_1, user_id_2) | 复合索引   | 加速用户关系查询 |
| ChatParticipants | (session_id, user_id) | Composite Index | Accelerate chat participant queries |
| ChatParticipants | (session_id, user_id) | 复合索引   | 加速聊天参与者查询 |
| Notifications | (user_id, is_read) | Composite Index | Accelerate unread notification queries |
| Notifications | (user_id, is_read) | 复合索引   | 加速未读通知查询 |

### 4.2 NoSQL Database Indexes
### 4.2 NoSQL数据库索引

| Collection Name | Indexed Fields | Index Type | Purpose |
|-----------------|----------------|------------|---------|
| 集合名          | 索引字段       | 索引类型   | 目的    |
| ChatMessages | session_id | Index | Accelerate session message queries |
| ChatMessages | session_id | 索引       | 加速会话消息查询 |
| ChatMessages | (session_id, sent_at) | Composite Index | Accelerate message queries by time order |
| ChatMessages | (session_id, sent_at) | 复合索引   | 加速按时间顺序查询消息 |
| TranslationHistory | user_id | Index | Accelerate user translation history queries |
| TranslationHistory | user_id | 索引       | 加速用户翻译历史查询 |
| TranslationHistory | (user_id, created_at) | Composite Index | Accelerate translation history queries by time order |
| TranslationHistory | (user_id, created_at) | 复合索引   | 加速按时间顺序查询翻译历史 |
| TranslationHistory | (user_id, is_favorite) | Composite Index | Accelerate favorite translation queries |
| TranslationHistory | (user_id, is_favorite) | 复合索引   | 加速收藏翻译查询 |

## 5. Data Migration and Version Control Strategy
## 5. 数据迁移与版本控制策略

### 5.1 Migration Strategy
### 5.1 迁移策略

- Use database migration tools (e.g., Flyway or Liquibase) to manage database schema changes.
- 使用数据库迁移工具（如Flyway或Liquibase）管理数据库架构变更
- Create new migration scripts for each schema change.
- 每次架构变更创建新的迁移脚本
- Migration scripts should include forward and backward compatible operations.
- 迁移脚本应包含向前和向后兼容的操作
- Test migration scripts in development environment before applying to production.
- 在开发环境中测试迁移脚本后再应用到生产环境

### 5.2 Version Control
### 5.2 版本控制

- Keep database schema version consistent with application version.
- 数据库架构版本与应用版本保持一致
- Migration script naming format: `V{version_number}_{description}.sql`
- 迁移脚本命名格式：`V{版本号}_{描述}.sql`
- Record applied migrations in a dedicated migration history table.
- 在专门的迁移历史表中记录已应用的迁移
- Automatically check and apply unexecuted migrations when the application starts.
- 应用启动时自动检查并应用未执行的迁移

## 6. Data Security Strategy
## 6. 数据安全策略

### 6.1 Data Encryption
### 6.1 数据加密

- Sensitive user data (e.g., passwords) are stored using strong hashing algorithms.
- 敏感用户数据（如密码）使用强哈希算法存储
- Data in transit is encrypted using TLS/SSL.
- 传输中的数据使用TLS/SSL加密
- Consider column-level encryption for particularly sensitive fields (e.g., personally identifiable information).
- 考虑对特别敏感的字段（如个人身份信息）进行列级加密

### 6.2 Access Control
### 6.2 访问控制

- Implement Role-Based Access Control (RBAC).
- 实施基于角色的访问控制(RBAC)
- Minimize database user permissions.
- 数据库用户权限最小化原则
- Use parameterized queries to prevent SQL injection.
- 使用参数化查询防止SQL注入
- Implement row-level security to ensure users can only access their own data.
- 实施行级安全性，确保用户只能访问自己的数据

### 6.3 Audit Logs
### 6.3 审计日志

- Record critical data operations (create, update, delete).
- 记录关键数据操作（创建、更新、删除）
- Audit logs include operation type, time, user, and affected data.
- 审计日志包含操作类型、时间、用户和受影响的数据
- Regularly back up audit logs and set appropriate retention policies.
- 定期备份审计日志并设置适当的保留策略

## 7. Performance Optimization Strategy
## 7. 性能优化策略

### 7.1 Query Optimization
### 7.1 查询优化

- Use EXPLAIN to analyze query execution plans.
- 使用EXPLAIN分析查询执行计划
- Optimize complex queries, avoid full table scans.
- 优化复杂查询，避免全表扫描
- Appropriately use views to simplify complex queries.
- 适当使用视图简化复杂查询
- Consider using stored procedures to handle complex business logic.
- 考虑使用存储过程处理复杂业务逻辑

### 7.2 Caching Strategy
### 7.2 缓存策略

- Use Redis to cache frequently accessed data.
- 使用Redis缓存频繁访问的数据
- Implement multi-level caching strategy (application level, database level).
- 实施多级缓存策略（应用级、数据库级）
- Set appropriate cache invalidation policies.
- 设置适当的缓存失效策略
- Monitor cache hit rate and adjust caching strategy.
- 监控缓存命中率并调整缓存策略

### 7.3 Partitioning and Sharding
### 7.3 分区与分片

- Consider partitioning large tables (e.g., by time or user ID).
- 考虑对大表进行分区（如按时间或用户ID）
- Consider implementing data sharding strategy as user base grows.
- 随着用户增长，考虑实施数据分片策略
- Implement appropriate cross-shard query strategy for sharded data.
- 为分片数据实施适当的跨分片查询策略

## 8. Backup and Recovery Strategy
## 8. 备份与恢复策略

### 8.1 Backup Strategy
### 8.1 备份策略

- Implement regular full backups (daily).
- 实施定期全量备份（每日）
- Configure continuous incremental backups (hourly).
- 配置连续增量备份（每小时）
- Backups stored in multiple geographical locations.
- 备份存储在多个地理位置
- Regularly test backup and recovery process.
- 定期测试备份恢复过程

### 8.2 Recovery Strategy
### 8.2 恢复策略

- Define clear Recovery Point Objective (RPO) and Recovery Time Objective (RTO).
- 定义明确的恢复点目标(RPO)和恢复时间目标(RTO)
- Implement automated recovery process.
- 实施自动化恢复流程
- Maintain detailed recovery operation manual.
- 维护详细的恢复操作手册
- Regularly conduct recovery drills.
- 定期进行恢复演练

## 9. Scalability Considerations
## 9. 扩展性考虑

- Design database architecture to support horizontal scaling.
- 设计支持水平扩展的数据库架构
- Consider future functional extensions.
- 考虑未来可能的功能扩展
- Retain appropriate metadata fields (e.g., created_at, updated_at).
- 保留适当的元数据字段（如created_at, updated_at）
- Use UUID as primary key for uniqueness in distributed systems.
- 使用UUID作为主键，便于分布式系统中的唯一性

## 10. Database Implementation Roadmap
## 10. 数据库实现路线图

### 10.1 MVP Phase
### 10.1 MVP阶段

- Implement core table structures (Users, UserLanguages, Courses, Units, LessonContents, Exercises, UserProgress).
- 实现核心表结构（Users, UserLanguages, Courses, Units, LessonContents, Exercises, UserProgress）
- Implement basic social function tables (UserRelationships, ChatSessions, ChatMessages).
- 实现基本的社交功能表（UserRelationships, ChatSessions, ChatMessages）
- Implement translation related tables (TranslationHistory, SavedPhrases).
- 实现翻译相关表（TranslationHistory, SavedPhrases）

### 10.2 Subsequent Phases
### 10.2 后续阶段

- Implement advanced user matching features (MatchPreferences).
- 实现高级用户匹配功能（MatchPreferences）
- Extend learning content models (add more content types and interactive elements).
- 扩展学习内容模型（添加更多内容类型和互动元素）
- Implement community function related tables (Forums, Posts, Comments).
- 实现社区功能相关表（Forums, Posts, Comments）
- Implement gamification elements related tables (Achievements, Badges, Leaderboards).
- 实现游戏化元素相关表（Achievements, Badges, Leaderboards）


