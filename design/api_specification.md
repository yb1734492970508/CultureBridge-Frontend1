# CultureBridge API Specification
# CultureBridge API接口规范

## 1. API Overview
## 1. API概述

The CultureBridge application's API adopts a RESTful architectural style, providing data interaction interfaces between the frontend and backend. The API design adheres to the following principles:
CultureBridge应用的API采用RESTful架构风格，提供前端与后端之间的数据交互接口。API设计遵循以下原则：

- Use standard HTTP methods (GET, POST, PUT, DELETE)
- 使用标准HTTP方法（GET, POST, PUT, DELETE）
- Return standard HTTP status codes
- 返回标准HTTP状态码
- Use JSON as the data exchange format
- 使用JSON作为数据交换格式
- Implement version control
- 实施版本控制
- Provide detailed error messages
- 提供详细的错误信息
- Support pagination, sorting, and filtering
- 支持分页、排序和过滤

### 1.1 Base URL Structure
### 1.1 基础URL结构

```
https://api.culturebridge.com/v1/{resource}
```

- `v1`: API version
- `v1`: API版本
- `{resource}`: API resource (e.g., users, courses, translations, etc.)
- `{resource}`: API资源（如users, courses, translations等）

### 1.2 Authentication Method
### 1.2 认证方式

The API uses JWT (JSON Web Token) for authentication:
API使用JWT（JSON Web Token）进行认证：

1. The client obtains a JWT token through the login interface.
1. 客户端通过登录接口获取JWT令牌。
2. Subsequent requests carry the token in the Authorization header.
2. 后续请求在Authorization头中携带令牌。
3. The token contains user ID and permission information.
3. 令牌包含用户ID和权限信息。
4. The token is valid for 24 hours and can be extended by refreshing the token.
4. 令牌有效期为24小时，可通过刷新令牌延长。

```
Authorization: Bearer {token}
```

## 2. User-related APIs
## 2. 用户相关API

### 2.1 User Registration
### 2.1 用户注册

**Request**:
**请求**:
```
POST /v1/auth/register
```

**Request Body**:
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

**Response** (201 Created):
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

### 2.2 User Login
### 2.2 用户登录

**Request**:
**请求**:
```
POST /v1/auth/login
```

**Request Body**:
**请求体**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
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

### 2.3 Refresh Token
### 2.3 刷新令牌

**Request**:
**请求**:
```
POST /v1/auth/refresh
```

**Request Body**:
**请求体**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

### 2.4 Get User Profile
### 2.4 获取用户资料

**Request**:
**请求**:
```
GET /v1/users/{user_id}
```

**Response** (200 OK):
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

### 2.5 Update User Profile
### 2.5 更新用户资料

**Request**:
**请求**:
```
PUT /v1/users/{user_id}
```

**Request Body**:
**请求体**:
```json
{
  "first_name": "Johnny",
  "last_name": "Doe",
  "bio": "Language enthusiast, traveler and photographer",
  "profile_picture": "data:image/jpeg;base64,..."
}
```

**Response** (200 OK):
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

### 2.6 Get User Language Proficiency
### 2.6 获取用户语言能力

**Request**:
**请求**:
```
GET /v1/users/{user_id}/languages
```

**Response** (200 OK):
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

### 2.7 Update User Language Proficiency
### 2.7 更新用户语言能力

**Request**:
**请求**:
```
PUT /v1/users/{user_id}/languages
```

**Request Body**:
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

**Response** (200 OK):
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

### 2.8 Get User Interests
### 2.8 获取用户兴趣

**Request**:
**请求**:
```
GET /v1/users/{user_id}/interests
```

**Response** (200 OK):
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

### 2.9 Update User Interests
### 2.9 更新用户兴趣

**Request**:
**请求**:
```
PUT /v1/users/{user_id}/interests
```

**Request Body**:
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

**Response** (200 OK):
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

## 3. Learning Content Related APIs
## 3. 学习内容相关API

### 3.1 Get Available Languages List
### 3.1 获取可用语言列表

**Request**:
**请求**:
```
GET /v1/languages
```

**Response** (200 OK):
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

### 3.2 Get Course List
### 3.2 获取课程列表

**Request**:
**请求**:
```
GET /v1/courses?language=es&level=beginner
```

**Response** (200 OK):
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

### 3.3 Get Course Details
### 3.3 获取课程详情

**Request**:
**请求**:
```
GET /v1/courses/{course_id}
```

**Response** (200 OK):
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

### 3.4 Get Learning Unit Details
### 3.4 获取学习单元详情

**Request**:
**请求**:
```
GET /v1/units/{unit_id}
```

**Response** (200 OK):
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

### 3.5 Get Learning Content
### 3.5 获取学习内容

**Request**:
**请求**:
```
GET /v1/contents/{content_id}
```

**Response** (200 OK):
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

### 3.6 Submit Exercise Answer
### 3.6 提交练习答案

**Request**:
**请求**:
```
POST /v1/exercises/{exercise_id}/submit
```

**Request Body**:
**请求体**:
```json
{
  "user_answer": "Buenos días"
}
```

**Response** (200 OK):
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

### 3.7 Get User Learning Progress
### 3.7 获取用户学习进度

**Request**:
**请求**:
```
GET /v1/users/{user_id}/progress?course_id={course_id}
```

**Response** (200 OK):
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

### 3.8 Update User Learning Progress
### 3.8 更新用户学习进度

**Request**:
**请求**:
```
PUT /v1/users/{user_id}/progress
```

**Request Body**:
**请求体**:
```json
{
  "course_id": "550e8400-e29b-41d4-a716-446655440010",
  "unit_id": "550e8400-e29b-41d4-a716-446655440021",
  "content_id": "550e8400-e29b-41d4-a716-446655440036"
}
```

**Response** (200 OK):
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

## 4. Social and Matching Related APIs
## 4. 社交与匹配相关API

### 4.1 Get Matched User List
### 4.1 获取匹配用户列表

**Request**:
**请求**:
```
GET /v1/matches?page=1&per_page=10
```

**Response** (200 OK):
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

### 4.2 Update Matching Preferences
### 4.2 更新匹配偏好

**Request**:
**请求**:
```
PUT /v1/users/{user_id}/match-preferences
```

**Request Body**:
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

**Response** (200 OK):
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

### 4.3 Send Friend Request
### 4.3 发送交友请求

**Request**:
**请求**:
```
POST /v1/relationships
```

**Request Body**:
**请求体**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440100",
  "message": "Hi Maria! I'm learning Spanish and would love to practice with you."
}
```

**Response** (201 Created):
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

### 4.4 Get Friend Request List
### 4.4 获取交友请求列表

**Request**:
**请求**:
```
GET /v1/relationships?status=pending
```

**Response** (200 OK):
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
    "total": 24,
    "page": 1,
    "per_page": 10,
    "total_pages": 3
  }
}
```

### 4.5 Accept/Reject Friend Request
### 4.5 接受/拒绝交友请求

**Request**:
**请求**:
```
PUT /v1/relationships/{relationship_id}
```

**Request Body**:
**请求体**:
```json
{
  "status": "accepted" // or "rejected"
}
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "relationship_id": "550e8400-e29b-41d4-a716-446655440201",
  "user_id_1": "550e8400-e29b-41d4-a716-446655440101",
  "user_id_2": "550e8400-e29b-41d4-a716-446655440000",
  "status": "accepted",
  "updated_at": "2025-05-18T09:20:00Z"
}
```

### 4.6 Get Friend List
### 4.6 获取好友列表

**Request**:
**请求**:
```
GET /v1/users/{user_id}/friends
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "friends": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440100",
      "username": "maria_garcia",
      "first_name": "Maria",
      "last_name": "Garcia",
      "profile_picture": "https://assets.culturebridge.com/profiles/maria.jpg",
      "bio": "Spanish teacher and food lover"
    },
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440101",
      "username": "jean_dupont",
      "first_name": "Jean",
      "last_name": "Dupont",
      "profile_picture": "https://assets.culturebridge.com/profiles/jean.jpg",
      "bio": "French photographer and language enthusiast"
    }
  ]
}
```

## 5. Chat and Translation Related APIs
## 5. 聊天与翻译相关API

### 5.1 Start Chat Session
### 5.1 开始聊天会话

**Request**:
**请求**:
```
POST /v1/chat/sessions
```

**Request Body**:
**请求体**:
```json
{
  "participant_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440100"
  ]
}
```

**Response** (201 Created):
**响应** (201 Created):
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440300",
  "participant_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440100"
  ],
  "created_at": "2025-05-18T09:30:00Z"
}
```

### 5.2 Send Message
### 5.2 发送消息

**Request**:
**请求**:
```
POST /v1/chat/sessions/{session_id}/messages
```

**Request Body**:
**请求体**:
```json
{
  "sender_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_type": "text",
  "content": "Hello, how are you?"
}
```

**Response** (201 Created):
**响应** (201 Created):
```json
{
  "message_id": "550e8400-e29b-41d4-a716-446655440301",
  "session_id": "550e8400-e29b-41d4-a716-446655440300",
  "sender_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_type": "text",
  "content": "Hello, how are you?",
  "timestamp": "2025-05-18T09:31:00Z"
}
```

### 5.3 Get Chat History
### 5.3 获取聊天历史

**Request**:
**请求**:
```
GET /v1/chat/sessions/{session_id}/messages?page=1&per_page=20
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "messages": [
    {
      "message_id": "550e8400-e29b-41d4-a716-446655440301",
      "session_id": "550e8400-e29b-41d4-a716-446655440300",
      "sender_id": "550e8400-e29b-41d4-a716-446655440000",
      "message_type": "text",
      "content": "Hello, how are you?",
      "timestamp": "2025-05-18T09:31:00Z"
    },
    {
      "message_id": "550e8400-e29b-41d4-a716-446655440302",
      "session_id": "550e8400-e29b-41d4-a716-446655440300",
      "sender_id": "550e8400-e29b-41d4-a716-446655440100",
      "message_type": "text",
      "content": "I'm fine, thank you! And you?",
      "timestamp": "2025-05-18T09:31:30Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

### 5.4 Real-time Translation
### 5.4 实时翻译

**Request**:
**请求**:
```
POST /v1/translate
```

**Request Body**:
**请求体**:
```json
{
  "text": "Hello, how are you?",
  "source_language": "en",
  "target_language": "zh"
}
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "original_text": "Hello, how are you?",
  "translated_text": "你好，你怎么样？",
  "source_language": "en",
  "target_language": "zh"
}
```

### 5.5 Voice-to-Text and Translation
### 5.5 语音转文本与翻译

**Request**:
**请求**:
```
POST /v1/voice/transcribe-and-translate
```

**Request Body**:
**请求体**:
```json
{
  "audio_data": "base64_encoded_audio_data",
  "source_language": "en",
  "target_language": "zh"
}
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "transcribed_text": "Hello, how are you?",
  "translated_text": "你好，你怎么样？",
  "source_language": "en",
  "target_language": "zh"
}
```

## 6. Cultural Asset and Marketplace Related APIs
## 6. 文化资产与市场相关API

### 6.1 Create Cultural Asset (NFT)
### 6.1 创建文化资产（NFT）

**Request**:
**请求**:
```
POST /v1/assets
```

**Request Body**:
**请求体**:
```json
{
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Ancient Chinese Painting",
  "description": "A beautiful painting from the Tang Dynasty.",
  "media_url": "https://assets.culturebridge.com/nfts/painting1.jpg",
  "metadata": {
    "artist": "Wu Daozi",
    "year": "700 AD",
    "category": "Painting"
  }
}
```

**Response** (201 Created):
**响应** (201 Created):
```json
{
  "asset_id": "550e8400-e29b-41d4-a716-446655440400",
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Ancient Chinese Painting",
  "description": "A beautiful painting from the Tang Dynasty.",
  "media_url": "https://assets.culturebridge.com/nfts/painting1.jpg",
  "metadata": {
    "artist": "Wu Daozi",
    "year": "700 AD",
    "category": "Painting"
  },
  "created_at": "2025-05-18T09:45:00Z"
}
```

### 6.2 Get Cultural Asset List
### 6.2 获取文化资产列表

**Request**:
**请求**:
```
GET /v1/assets?category=Painting&owner_id={user_id}
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "assets": [
    {
      "asset_id": "550e8400-e29b-41d4-a716-446655440400",
      "owner_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Ancient Chinese Painting",
      "description": "A beautiful painting from the Tang Dynasty.",
      "media_url": "https://assets.culturebridge.com/nfts/painting1.jpg",
      "metadata": {
        "artist": "Wu Daozi",
        "year": "700 AD",
        "category": "Painting"
      }
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

### 6.3 Get Cultural Asset Details
### 6.3 获取文化资产详情

**Request**:
**请求**:
```
GET /v1/assets/{asset_id}
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "asset_id": "550e8400-e29b-41d4-a716-446655440400",
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Ancient Chinese Painting",
  "description": "A beautiful painting from the Tang Dynasty.",
  "media_url": "https://assets.culturebridge.com/nfts/painting1.jpg",
  "metadata": {
    "artist": "Wu Daozi",
    "year": "700 AD",
    "category": "Painting"
  },
  "created_at": "2025-05-18T09:45:00Z",
  "on_sale": true,
  "price": {
    "amount": 10,
    "currency": "CBT"
  }
}
```

### 6.4 List Cultural Asset for Sale
### 6.4 挂单出售文化资产

**Request**:
**请求**:
```
POST /v1/marketplace/listings
```

**Request Body**:
**请求体**:
```json
{
  "asset_id": "550e8400-e29b-41d4-a716-446655440400",
  "price": {
    "amount": 10,
    "currency": "CBT"
  }
}
```

**Response** (201 Created):
**响应** (201 Created):
```json
{
  "listing_id": "550e8400-e29b-41d4-a716-446655440500",
  "asset_id": "550e8400-e29b-41d4-a716-446655440400",
  "seller_id": "550e8400-e29b-41d4-a716-446655440000",
  "price": {
    "amount": 10,
    "currency": "CBT"
  },
  "status": "active",
  "created_at": "2025-05-18T09:50:00Z"
}
```

### 6.5 Purchase Cultural Asset
### 6.5 购买文化资产

**Request**:
**请求**:
```
POST /v1/marketplace/purchases
```

**Request Body**:
**请求体**:
```json
{
  "listing_id": "550e8400-e29b-41d4-a716-446655440500",
  "buyer_id": "550e8400-e29b-41d4-a716-446655440100"
}
```

**Response** (201 Created):
**响应** (201 Created):
```json
{
  "purchase_id": "550e8400-e29b-41d4-a716-446655440600",
  "listing_id": "550e8400-e29b-41d4-a716-446655440500",
  "asset_id": "550e8400-e29b-41d4-a716-446655440400",
  "seller_id": "550e8400-e29b-41d4-a716-446655440000",
  "buyer_id": "550e8400-e29b-41d4-a716-446655440100",
  "price": {
    "amount": 10,
    "currency": "CBT"
  },
  "status": "completed",
  "created_at": "2025-05-18T09:55:00Z"
}
```

## 7. Token and Wallet Related APIs
## 7. 代币与钱包相关API

### 7.1 Get User Token Balance
### 7.1 获取用户代币余额

**Request**:
**请求**:
```
GET /v1/users/{user_id}/token-balance
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "balance": {
    "amount": 1000,
    "currency": "CBT"
  }
}
```

### 7.2 Send Token
### 7.2 发送代币

**Request**:
**请求**:
```
POST /v1/transactions/send-token
```

**Request Body**:
**请求体**:
```json
{
  "sender_id": "550e8400-e29b-41d4-a716-446655440000",
  "receiver_id": "550e8400-e29b-41d4-a716-446655440100",
  "amount": 50,
  "currency": "CBT"
}
```

**Response** (201 Created):
**响应** (201 Created):
```json
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440700",
  "sender_id": "550e8400-e29b-41d4-a716-446655440000",
  "receiver_id": "550e8400-e29b-41d4-a716-446655440100",
  "amount": 50,
  "currency": "CBT",
  "status": "completed",
  "timestamp": "2025-05-18T10:00:00Z"
}
```

### 7.3 Get Transaction History
### 7.3 获取交易历史

**Request**:
**请求**:
```
GET /v1/users/{user_id}/transactions?type=send&currency=CBT
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "transactions": [
    {
      "transaction_id": "550e8400-e29b-41d4-a716-446655440700",
      "sender_id": "550e8400-e29b-41d4-a716-446655440000",
      "receiver_id": "550e8400-e29b-41d4-a716-446655440100",
      "amount": 50,
      "currency": "CBT",
      "status": "completed",
      "timestamp": "2025-05-18T10:00:00Z"
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

## 8. Governance Related APIs
## 8. 治理相关API

### 8.1 Get Proposal List
### 8.1 获取提案列表

**Request**:
**请求**:
```
GET /v1/governance/proposals?status=active
```

**Response** (200 OK):
**响应** (200 OK):
```json
{
  "proposals": [
    {
      "proposal_id": "550e8400-e29b-41d4-a716-446655440800",
      "title": "Increase Staking Rewards",
      "description": "Proposing to increase CBT staking rewards by 10% to incentivize participation.",
      "proposer_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "active",
      "start_time": "2025-05-15T00:00:00Z",
      "end_time": "2025-05-22T23:59:59Z",
      "votes_for": 150000,
      "votes_against": 50000,
      "total_votes": 200000
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

### 8.2 Submit Vote
### 8.2 提交投票

**Request**:
**请求**:
```
POST /v1/governance/proposals/{proposal_id}/vote
```

**Request Body**:
**请求体**:
```json
{
  "voter_id": "550e8400-e29b-41d4-a716-446655440100",
  "vote": "for", // or "against"
  "amount": 100 // amount of tokens to vote with
}
```

**Response** (201 Created):
**响应** (201 Created):
```json
{
  "vote_id": "550e8400-e29b-41d4-a716-446655440900",
  "proposal_id": "550e8400-e29b-41d4-a716-446655440800",
  "voter_id": "550e8400-e29b-41d4-a716-446655440100",
  "vote": "for",
  "amount": 100,
  "timestamp": "2025-05-18T10:10:00Z"
}
```


