# CultureBridge API接口规范

## 1. API概述

CultureBridge应用的API采用RESTful架构风格，提供前端与后端之间的数据交互接口。API设计遵循以下原则：

- 使用标准HTTP方法（GET, POST, PUT, DELETE）
- 返回标准HTTP状态码
- 使用JSON作为数据交换格式
- 实施版本控制
- 提供详细的错误信息
- 支持分页、排序和过滤

### 1.1 基础URL结构

```
https://api.culturebridge.com/v1/{resource}
```

- `v1`: API版本
- `{resource}`: API资源（如users, courses, translations等）

### 1.2 认证方式

API使用JWT（JSON Web Token）进行认证：

1. 客户端通过登录接口获取JWT令牌
2. 后续请求在Authorization头中携带令牌
3. 令牌包含用户ID和权限信息
4. 令牌有效期为24小时，可通过刷新令牌延长

```
Authorization: Bearer {token}
```

## 2. 用户相关API

### 2.1 用户注册

**请求**:
```
POST /v1/auth/register
```

**请求体**:
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**响应** (201 Created):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2025-05-18T07:38:10Z"
}
```

### 2.2 用户登录

**请求**:
```
POST /v1/auth/login
```

**请求体**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**响应** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### 2.3 刷新令牌

**请求**:
```
POST /v1/auth/refresh
```

**请求体**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

### 2.4 获取用户资料

**请求**:
```
GET /v1/users/{user_id}
```

**响应** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile_picture": "https://assets.culturebridge.com/profiles/johndoe.jpg",
  "bio": "Language enthusiast and traveler",
  "created_at": "2025-05-18T07:38:10Z",
  "last_login": "2025-05-18T07:38:10Z"
}
```

### 2.5 更新用户资料

**请求**:
```
PUT /v1/users/{user_id}
```

**请求体**:
```json
{
  "first_name": "Johnny",
  "last_name": "Doe",
  "bio": "Language enthusiast, traveler and photographer",
  "profile_picture": "data:image/jpeg;base64,..."
}
```

**响应** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "first_name": "Johnny",
  "last_name": "Doe",
  "profile_picture": "https://assets.culturebridge.com/profiles/johndoe_updated.jpg",
  "bio": "Language enthusiast, traveler and photographer",
  "updated_at": "2025-05-18T08:15:30Z"
}
```

### 2.6 获取用户语言能力

**请求**:
```
GET /v1/users/{user_id}/languages
```

**响应** (200 OK):
```json
{
  "languages": [
    {
      "language_code": "en",
      "name": "English",
      "proficiency_level": "native",
      "is_learning": false,
      "is_teaching": true
    },
    {
      "language_code": "es",
      "name": "Spanish",
      "proficiency_level": "intermediate",
      "is_learning": true,
      "is_teaching": false
    }
  ]
}
```

### 2.7 更新用户语言能力

**请求**:
```
PUT /v1/users/{user_id}/languages
```

**请求体**:
```json
{
  "languages": [
    {
      "language_code": "en",
      "proficiency_level": "native",
      "is_learning": false,
      "is_teaching": true
    },
    {
      "language_code": "es",
      "proficiency_level": "intermediate",
      "is_learning": true,
      "is_teaching": false
    },
    {
      "language_code": "fr",
      "proficiency_level": "beginner",
      "is_learning": true,
      "is_teaching": false
    }
  ]
}
```

**响应** (200 OK):
```json
{
  "languages": [
    {
      "language_code": "en",
      "name": "English",
      "proficiency_level": "native",
      "is_learning": false,
      "is_teaching": true
    },
    {
      "language_code": "es",
      "name": "Spanish",
      "proficiency_level": "intermediate",
      "is_learning": true,
      "is_teaching": false
    },
    {
      "language_code": "fr",
      "name": "French",
      "proficiency_level": "beginner",
      "is_learning": true,
      "is_teaching": false
    }
  ]
}
```

### 2.8 获取用户兴趣

**请求**:
```
GET /v1/users/{user_id}/interests
```

**响应** (200 OK):
```json
{
  "interests": [
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Travel",
      "category": "Lifestyle"
    },
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Photography",
      "category": "Arts"
    },
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Cooking",
      "category": "Food"
    }
  ]
}
```

### 2.9 更新用户兴趣

**请求**:
```
PUT /v1/users/{user_id}/interests
```

**请求体**:
```json
{
  "interests": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440004"
  ]
}
```

**响应** (200 OK):
```json
{
  "interests": [
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Travel",
      "category": "Lifestyle"
    },
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Photography",
      "category": "Arts"
    },
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Music",
      "category": "Arts"
    }
  ]
}
```

## 3. 学习内容相关API

### 3.1 获取可用语言列表

**请求**:
```
GET /v1/languages
```

**响应** (200 OK):
```json
{
  "languages": [
    {
      "language_code": "en",
      "name": "English",
      "native_name": "English",
      "flag_icon": "https://assets.culturebridge.com/flags/en.png"
    },
    {
      "language_code": "es",
      "name": "Spanish",
      "native_name": "Español",
      "flag_icon": "https://assets.culturebridge.com/flags/es.png"
    },
    {
      "language_code": "fr",
      "name": "French",
      "native_name": "Français",
      "flag_icon": "https://assets.culturebridge.com/flags/fr.png"
    }
  ]
}
```

### 3.2 获取课程列表

**请求**:
```
GET /v1/courses?language=es&level=beginner
```

**响应** (200 OK):
```json
{
  "courses": [
    {
      "course_id": "550e8400-e29b-41d4-a716-446655440010",
      "title": "Spanish for Beginners",
      "description": "Learn basic Spanish phrases and grammar",
      "language_code": "es",
      "level": "beginner",
      "image_url": "https://assets.culturebridge.com/courses/spanish_beginners.jpg",
      "estimated_duration": 600,
      "created_at": "2025-01-15T10:00:00Z"
    },
    {
      "course_id": "550e8400-e29b-41d4-a716-446655440011",
      "title": "Spanish Conversation Basics",
      "description": "Practice everyday conversations in Spanish",
      "language_code": "es",
      "level": "beginner",
      "image_url": "https://assets.culturebridge.com/courses/spanish_conversation.jpg",
      "estimated_duration": 480,
      "created_at": "2025-02-10T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

### 3.3 获取课程详情

**请求**:
```
GET /v1/courses/{course_id}
```

**响应** (200 OK):
```json
{
  "course_id": "550e8400-e29b-41d4-a716-446655440010",
  "title": "Spanish for Beginners",
  "description": "Learn basic Spanish phrases and grammar",
  "language_code": "es",
  "level": "beginner",
  "image_url": "https://assets.culturebridge.com/courses/spanish_beginners.jpg",
  "estimated_duration": 600,
  "created_at": "2025-01-15T10:00:00Z",
  "units": [
    {
      "unit_id": "550e8400-e29b-41d4-a716-446655440020",
      "title": "Greetings and Introductions",
      "description": "Learn how to greet people and introduce yourself",
      "order_index": 1
    },
    {
      "unit_id": "550e8400-e29b-41d4-a716-446655440021",
      "title": "Numbers and Time",
      "description": "Learn numbers and how to tell time",
      "order_index": 2
    }
  ]
}
```

### 3.4 获取学习单元详情

**请求**:
```
GET /v1/units/{unit_id}
```

**响应** (200 OK):
```json
{
  "unit_id": "550e8400-e29b-41d4-a716-446655440020",
  "course_id": "550e8400-e29b-41d4-a716-446655440010",
  "title": "Greetings and Introductions",
  "description": "Learn how to greet people and introduce yourself",
  "order_index": 1,
  "contents": [
    {
      "content_id": "550e8400-e29b-41d4-a716-446655440030",
      "content_type": "text",
      "title": "Common Greetings",
      "content_data": "# Common Spanish Greetings\n\n- Hola - Hello\n- Buenos días - Good morning\n- Buenas tardes - Good afternoon\n- Buenas noches - Good evening/night",
      "order_index": 1
    },
    {
      "content_id": "550e8400-e29b-41d4-a716-446655440031",
      "content_type": "audio",
      "title": "Pronunciation Guide",
      "content_data": "https://assets.culturebridge.com/audio/spanish_greetings.mp3",
      "order_index": 2
    },
    {
      "content_id": "550e8400-e29b-41d4-a716-446655440032",
      "content_type": "exercise",
      "title": "Practice Greetings",
      "content_data": "Exercise on Spanish greetings",
      "order_index": 3
    }
  ]
}
```

### 3.5 获取学习内容

**请求**:
```
GET /v1/contents/{content_id}
```

**响应** (200 OK):
```json
{
  "content_id": "550e8400-e29b-41d4-a716-446655440032",
  "unit_id": "550e8400-e29b-41d4-a716-446655440020",
  "content_type": "exercise",
  "title": "Practice Greetings",
  "content_data": "Exercise on Spanish greetings",
  "order_index": 3,
  "exercises": [
    {
      "exercise_id": "550e8400-e29b-41d4-a716-446655440040",
      "exercise_type": "multiple_choice",
      "question": "How do you say 'Good morning' in Spanish?",
      "options": [
        "Buenos días",
        "Buenas tardes",
        "Buenas noches",
        "Hola"
      ],
      "correct_answer": "Buenos días",
      "explanation": "Buenos días is used in the morning until noon."
    },
    {
      "exercise_id": "550e8400-e29b-41d4-a716-446655440041",
      "exercise_type": "fill_blank",
      "question": "Complete: '_____ tardes' (Good afternoon)",
      "correct_answer": "Buenas",
      "explanation": "Buenas tardes is used from noon until sunset."
    }
  ]
}
```

### 3.6 提交练习答案

**请求**:
```
POST /v1/exercises/{exercise_id}/submit
```

**请求体**:
```json
{
  "user_answer": "Buenos días"
}
```

**响应** (200 OK):
```json
{
  "exercise_id": "550e8400-e29b-41d4-a716-446655440040",
  "is_correct": true,
  "correct_answer": "Buenos días",
  "explanation": "Buenos días is used in the morning until noon.",
  "attempt_count": 1
}
```

### 3.7 获取用户学习进度

**请求**:
```
GET /v1/users/{user_id}/progress?course_id={course_id}
```

**响应** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "course_id": "550e8400-e29b-41d4-a716-446655440010",
  "completion_percentage": 35.5,
  "current_unit": {
    "unit_id": "550e8400-e29b-41d4-a716-446655440021",
    "title": "Numbers and Time",
    "order_index": 2
  },
  "current_content": {
    "content_id": "550e8400-e29b-41d4-a716-446655440035",
    "title": "Counting from 1 to 10",
    "order_index": 1
  },
  "last_accessed": "2025-05-17T15:30:00Z"
}
```

### 3.8 更新用户学习进度

**请求**:
```
PUT /v1/users/{user_id}/progress
```

**请求体**:
```json
{
  "course_id": "550e8400-e29b-41d4-a716-446655440010",
  "unit_id": "550e8400-e29b-41d4-a716-446655440021",
  "content_id": "550e8400-e29b-41d4-a716-446655440036"
}
```

**响应** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "course_id": "550e8400-e29b-41d4-a716-446655440010",
  "completion_percentage": 40.0,
  "current_unit": {
    "unit_id": "550e8400-e29b-41d4-a716-446655440021",
    "title": "Numbers and Time",
    "order_index": 2
  },
  "current_content": {
    "content_id": "550e8400-e29b-41d4-a716-446655440036",
    "title": "Telling Time",
    "order_index": 2
  },
  "last_accessed": "2025-05-18T08:45:00Z"
}
```

## 4. 社交与匹配相关API

### 4.1 获取匹配用户列表

**请求**:
```
GET /v1/matches?page=1&per_page=10
```

**响应** (200 OK):
```json
{
  "matches": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440100",
      "username": "maria_garcia",
      "first_name": "Maria",
      "last_name": "Garcia",
      "profile_picture": "https://assets.culturebridge.com/profiles/maria.jpg",
      "bio": "Spanish teacher and food lover",
      "match_score": 95,
      "languages": [
        {
          "language_code": "es",
          "name": "Spanish",
          "proficiency_level": "native",
          "is_teaching": true
        },
        {
          "language_code": "en",
          "name": "English",
          "proficiency_level": "intermediate",
          "is_learning": true
        }
      ],
      "common_interests": [
        {
          "interest_id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Travel"
        },
        {
          "interest_id": "550e8400-e29b-41d4-a716-446655440003",
          "name": "Cooking"
        }
      ]
    },
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440101",
      "username": "jean_dupont",
      "first_name": "Jean",
      "last_name": "Dupont",
      "profile_picture": "https://assets.culturebridge.com/profiles/jean.jpg",
      "bio": "French photographer and language enthusiast",
      "match_score": 85,
      "languages": [
        {
          "language_code": "fr",
          "name": "French",
          "proficiency_level": "native",
          "is_teaching": true
        },
        {
          "language_code": "en",
          "name": "English",
          "proficiency_level": "advanced",
          "is_learning": true
        }
      ],
      "common_interests": [
        {
          "interest_id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "Photography"
        }
      ]
    }
  ],
  "pagination": {
    "total": 24,
    "page": 1,
    "per_page": 10,
    "total_pages": 3
  }
}
```

### 4.2 更新匹配偏好

**请求**:
```
PUT /v1/users/{user_id}/match-preferences
```

**请求体**:
```json
{
  "preferred_languages": ["es", "fr", "it"],
  "preferred_age_min": 18,
  "preferred_age_max": 45,
  "preferred_interests": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**响应** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "preferred_languages": ["es", "fr", "it"],
  "preferred_age_min": 18,
  "preferred_age_max": 45,
  "preferred_interests": [
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Travel"
    },
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Photography"
    },
    {
      "interest_id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Cooking"
    }
  ],
  "updated_at": "2025-05-18T09:10:00Z"
}
```

### 4.3 发送交友请求

**请求**:
```
POST /v1/relationships
```

**请求体**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440100",
  "message": "Hi Maria! I'm learning Spanish and would love to practice with you."
}
```

**响应** (201 Created):
```json
{
  "relationship_id": "550e8400-e29b-41d4-a716-446655440200",
  "user_id_1": "550e8400-e29b-41d4-a716-446655440000",
  "user_id_2": "550e8400-e29b-41d4-a716-446655440100",
  "status": "pending",
  "created_at": "2025-05-18T09:15:00Z"
}
```

### 4.4 获取交友请求列表

**请求**:
```
GET /v1/relationships?status=pending
```

**响应** (200 OK):
```json
{
  "relationships": [
    {
      "relationship_id": "550e8400-e29b-41d4-a716-446655440201",
      "user": {
        "user_id": "550e8400-e29b-41d4-a716-446655440101",
        "username": "jean_dupont",
        "first_name": "Jean",
        "last_name": "Dupont",
        "profile_picture": "https://assets.culturebridge.com/profiles/jean.jpg"
      },
      "status": "pending",
      "created_at": "2025-05-17T14:30:00Z",
      "message": "Hello! I noticed we both love photography. Would you like to practice languages together?"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

### 4.5 响应交友请求

**请求**:
```
PUT /v1/relationships/{relationship_id}
```

**请求体**:
```json
{
  "status": "accepted"
}
```

**响应** (200 OK):
```json
{
  "relationship_id": "550e8400-e29b-41d4-a716-446655440201",
  "user_id_1": "550e8400-e29b-41d4-a716-446655440101",
  "user_id_2": "550e8400-e29b-41d4-a716-446655440000",
  "status": "accepted",
  "created_at": "2025-05-17T14:30:00Z",
  "updated_at": "2025-05-18T09:20:00Z"
}
```

### 4.6 获取好友列表

**请求**:
```
GET /v1/relationships?status=accepted
```

**响应** (200 OK):
```json
{
  "relationships": [
    {
      "relationship_id": "550e8400-e29b-41d4-a716-446655440201",
      "user": {
        "user_id": "550e8400-e29b-41d4-a716-446655440101",
        "username": "jean_dupont",
        "first_name": "Jean",
        "last_name": "Dupont",
        "profile_picture": "https://assets.culturebridge.com/profiles/jean.jpg",
        "languages": [
          {
            "language_code": "fr",
            "name": "French",
            "proficiency_level": "native"
          },
          {
            "language_code": "en",
            "name": "English",
            "proficiency_level": "advanced"
          }
        ]
      },
      "status": "accepted",
      "created_at": "2025-05-17T14:30:00Z",
      "updated_at": "2025-05-18T09:20:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

### 4.7 创建聊天会话

**请求**:
```
POST /v1/chat/sessions
```

**请求体**:
```json
{
  "participants": ["550e8400-e29b-41d4-a716-446655440101"]
}
```

**响应** (201 Created):
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440300",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2025-05-18T09:25:00Z",
  "participants": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture": "https://assets.culturebridge.com/profiles/johndoe.jpg"
    },
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440101",
      "username": "jean_dupont",
      "first_name": "Jean",
      "last_name": "Dupont",
      "profile_picture": "https://assets.culturebridge.com/profiles/jean.jpg"
    }
  ]
}
```

### 4.8 获取聊天会话列表

**请求**:
```
GET /v1/chat/sessions
```

**响应** (200 OK):
```json
{
  "sessions": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440300",
      "created_at": "2025-05-18T09:25:00Z",
      "updated_at": "2025-05-18T09:30:00Z",
      "last_message": {
        "sender": {
          "user_id": "550e8400-e29b-41d4-a716-446655440101",
          "first_name": "Jean",
          "profile_picture": "https://assets.culturebridge.com/profiles/jean.jpg"
        },
        "content": "Bonjour! Comment ça va?",
        "sent_at": "2025-05-18T09:30:00Z"
      },
      "participants": [
        {
          "user_id": "550e8400-e29b-41d4-a716-446655440101",
          "username": "jean_dupont",
          "first_name": "Jean",
          "last_name": "Dupont",
          "profile_picture": "https://assets.culturebridge.com/profiles/jean.jpg"
        }
      ],
      "unread_count": 1
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

### 4.9 获取聊天消息

**请求**:
```
GET /v1/chat/sessions/{session_id}/messages?page=1&per_page=20
```

**响应** (200 OK):
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440300",
  "messages": [
    {
      "message_id": "550e8400-e29b-41d4-a716-446655440400",
      "sender": {
        "user_id": "550e8400-e29b-41d4-a716-446655440101",
        "first_name": "Jean",
        "profile_picture": "https://assets.culturebridge.com/profiles/jean.jpg"
      },
      "content": "Bonjour! Comment ça va?",
      "original_language": "fr",
      "translated_content": {
        "en": "Hello! How are you?"
      },
      "sent_at": "2025-05-18T09:30:00Z",
      "read_by": []
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

### 4.10 发送聊天消息

**请求**:
```
POST /v1/chat/sessions/{session_id}/messages
```

**请求体**:
```json
{
  "content": "I'm doing well, thank you! How about you?",
  "original_language": "en",
  "translate_to": ["fr"]
}
```

**响应** (201 Created):
```json
{
  "message_id": "550e8400-e29b-41d4-a716-446655440401",
  "sender": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "profile_picture": "https://assets.culturebridge.com/profiles/johndoe.jpg"
  },
  "content": "I'm doing well, thank you! How about you?",
  "original_language": "en",
  "translated_content": {
    "fr": "Je vais bien, merci ! Et toi ?"
  },
  "sent_at": "2025-05-18T09:35:00Z",
  "read_by": []
}
```

### 4.11 标记消息为已读

**请求**:
```
PUT /v1/chat/sessions/{session_id}/read
```

**响应** (200 OK):
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440300",
  "last_read_at": "2025-05-18T09:40:00Z",
  "unread_count": 0
}
```

## 5. 翻译相关API

### 5.1 翻译文本

**请求**:
```
POST /v1/translations
```

**请求体**:
```json
{
  "text": "Hello, how are you today?",
  "source_language": "en",
  "target_language": "es",
  "include_grammar_notes": true,
  "include_cultural_notes": true
}
```

**响应** (200 OK):
```json
{
  "translation_id": "550e8400-e29b-41d4-a716-446655440500",
  "original_text": "Hello, how are you today?",
  "translated_text": "Hola, ¿cómo estás hoy?",
  "source_language": "en",
  "target_language": "es",
  "grammar_notes": [
    "In Spanish, questions are marked with both opening (¿) and closing (?) question marks."
  ],
  "cultural_notes": [
    "In Spanish-speaking countries, it's common to greet people with a kiss on the cheek or a hug, even in professional settings."
  ],
  "created_at": "2025-05-18T09:45:00Z"
}
```

### 5.2 获取翻译历史

**请求**:
```
GET /v1/translations/history?page=1&per_page=10
```

**响应** (200 OK):
```json
{
  "translations": [
    {
      "translation_id": "550e8400-e29b-41d4-a716-446655440500",
      "original_text": "Hello, how are you today?",
      "translated_text": "Hola, ¿cómo estás hoy?",
      "source_language": "en",
      "target_language": "es",
      "created_at": "2025-05-18T09:45:00Z",
      "is_favorite": false
    },
    {
      "translation_id": "550e8400-e29b-41d4-a716-446655440501",
      "original_text": "I would like to order a coffee, please.",
      "translated_text": "Me gustaría pedir un café, por favor.",
      "source_language": "en",
      "target_language": "es",
      "created_at": "2025-05-17T16:20:00Z",
      "is_favorite": true
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "per_page": 10,
    "total_pages": 2
  }
}
```

### 5.3 将翻译标记为收藏

**请求**:
```
PUT /v1/translations/{translation_id}/favorite
```

**请求体**:
```json
{
  "is_favorite": true
}
```

**响应** (200 OK):
```json
{
  "translation_id": "550e8400-e29b-41d4-a716-446655440500",
  "is_favorite": true,
  "updated_at": "2025-05-18T09:50:00Z"
}
```

### 5.4 保存常用短语

**请求**:
```
POST /v1/phrases
```

**请求体**:
```json
{
  "original_text": "Could you please repeat that?",
  "translated_text": "¿Podría repetir eso, por favor?",
  "source_language": "en",
  "target_language": "es",
  "context": "Asking for clarification"
}
```

**响应** (201 Created):
```json
{
  "phrase_id": "550e8400-e29b-41d4-a716-446655440600",
  "original_text": "Could you please repeat that?",
  "translated_text": "¿Podría repetir eso, por favor?",
  "source_language": "en",
  "target_language": "es",
  "context": "Asking for clarification",
  "created_at": "2025-05-18T09:55:00Z"
}
```

### 5.5 获取常用短语列表

**请求**:
```
GET /v1/phrases?source_language=en&target_language=es
```

**响应** (200 OK):
```json
{
  "phrases": [
    {
      "phrase_id": "550e8400-e29b-41d4-a716-446655440600",
      "original_text": "Could you please repeat that?",
      "translated_text": "¿Podría repetir eso, por favor?",
      "source_language": "en",
      "target_language": "es",
      "context": "Asking for clarification",
      "created_at": "2025-05-18T09:55:00Z"
    },
    {
      "phrase_id": "550e8400-e29b-41d4-a716-446655440601",
      "original_text": "Nice to meet you.",
      "translated_text": "Encantado de conocerte.",
      "source_language": "en",
      "target_language": "es",
      "context": "Introductions",
      "created_at": "2025-05-16T11:30:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

## 6. 通知相关API

### 6.1 获取通知列表

**请求**:
```
GET /v1/notifications?is_read=false
```

**响应** (200 OK):
```json
{
  "notifications": [
    {
      "notification_id": "550e8400-e29b-41d4-a716-446655440700",
      "type": "friend_request",
      "content": "Jean Dupont sent you a friend request",
      "related_id": "550e8400-e29b-41d4-a716-446655440201",
      "is_read": false,
      "created_at": "2025-05-17T14:30:00Z"
    },
    {
      "notification_id": "550e8400-e29b-41d4-a716-446655440701",
      "type": "message",
      "content": "New message from Jean Dupont",
      "related_id": "550e8400-e29b-41d4-a716-446655440400",
      "is_read": false,
      "created_at": "2025-05-18T09:30:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

### 6.2 标记通知为已读

**请求**:
```
PUT /v1/notifications/{notification_id}/read
```

**响应** (200 OK):
```json
{
  "notification_id": "550e8400-e29b-41d4-a716-446655440700",
  "is_read": true,
  "updated_at": "2025-05-18T10:00:00Z"
}
```

### 6.3 标记所有通知为已读

**请求**:
```
PUT /v1/notifications/read-all
```

**响应** (200 OK):
```json
{
  "updated_count": 2,
  "updated_at": "2025-05-18T10:05:00Z"
}
```

## 7. 用户设置相关API

### 7.1 获取用户设置

**请求**:
```
GET /v1/users/{user_id}/settings
```

**响应** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "notification_preferences": {
    "friend_requests": true,
    "messages": true,
    "learning_reminders": true,
    "system_updates": false
  },
  "privacy_settings": {
    "profile_visibility": "public",
    "online_status": "friends_only",
    "language_progress": "public"
  },
  "theme": "light",
  "created_at": "2025-05-15T10:00:00Z",
  "updated_at": "2025-05-15T10:00:00Z"
}
```

### 7.2 更新用户设置

**请求**:
```
PUT /v1/users/{user_id}/settings
```

**请求体**:
```json
{
  "notification_preferences": {
    "friend_requests": true,
    "messages": true,
    "learning_reminders": false,
    "system_updates": false
  },
  "privacy_settings": {
    "profile_visibility": "friends_only",
    "online_status": "friends_only",
    "language_progress": "public"
  },
  "theme": "dark"
}
```

**响应** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "notification_preferences": {
    "friend_requests": true,
    "messages": true,
    "learning_reminders": false,
    "system_updates": false
  },
  "privacy_settings": {
    "profile_visibility": "friends_only",
    "online_status": "friends_only",
    "language_progress": "public"
  },
  "theme": "dark",
  "created_at": "2025-05-15T10:00:00Z",
  "updated_at": "2025-05-18T10:10:00Z"
}
```

## 8. 错误处理

### 8.1 错误响应格式

所有API错误都将返回一个一致的JSON格式：

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid",
    "details": [
      "Email is required",
      "Password must be at least 8 characters"
    ]
  }
}
```

### 8.2 常见错误代码

| HTTP状态码 | 错误代码 | 描述 |
|------------|----------|------|
| 400 | invalid_request | 请求格式或参数无效 |
| 401 | unauthorized | 未提供认证或认证无效 |
| 403 | forbidden | 无权访问请求的资源 |
| 404 | not_found | 请求的资源不存在 |
| 409 | conflict | 请求冲突（如用户名已存在） |
| 422 | validation_failed | 请求数据验证失败 |
| 429 | too_many_requests | 请求频率超过限制 |
| 500 | server_error | 服务器内部错误 |

## 9. API版本控制

### 9.1 版本策略

- API版本在URL路径中指定（如`/v1/users`）
- 主要版本（如v1到v2）可能包含不兼容的更改
- 次要更新在同一主要版本内保持向后兼容

### 9.2 版本生命周期

- 新版本发布后，旧版本将继续支持至少12个月
- 版本弃用计划将提前3个月通知
- 弃用版本将返回警告头部，建议迁移到新版本

## 10. API限流策略

- 基本认证用户：每分钟60个请求
- JWT认证用户：每分钟120个请求
- 超出限制将返回429状态码
- 响应头部包含限流信息：
  - `X-RateLimit-Limit`: 时间窗口内的最大请求数
  - `X-RateLimit-Remaining`: 当前时间窗口内剩余的请求数
  - `X-RateLimit-Reset`: 当前时间窗口重置的时间（Unix时间戳）

## 11. API安全最佳实践

### 11.1 客户端实现建议

- 所有API请求使用HTTPS
- 安全存储JWT令牌，优先使用HTTP-only cookies
- 实现令牌刷新机制
- 处理401响应时自动尝试刷新令牌
- 敏感操作添加额外验证（如重新输入密码）

### 11.2 安全头部

所有API响应将包含以下安全头部：

- `Strict-Transport-Security`: 强制HTTPS连接
- `X-Content-Type-Options`: 防止MIME类型嗅探
- `X-Frame-Options`: 防止点击劫持
- `Content-Security-Policy`: 限制资源加载
- `X-XSS-Protection`: 启用XSS过滤

## 12. API实现路线图

### 12.1 MVP阶段

- 用户认证API（注册、登录、刷新令牌）
- 用户资料API（获取、更新资料和语言能力）
- 基础学习内容API（获取课程、单元和内容）
- 核心翻译API（文本翻译）
- 基础社交API（匹配用户、发送请求）
- 基础聊天API（创建会话、发送消息）

### 12.2 后续阶段

- 高级用户匹配API（基于更复杂的算法）
- 学习进度跟踪和分析API
- 高级翻译功能（语法和文化提示）
- 社区功能API（论坛、讨论组）
- 游戏化元素API（成就、徽章、排行榜）
- 内容创建和分享API
