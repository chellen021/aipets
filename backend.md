# 萌宠伙伴微信小程序后端开发设计规范

## 0. 文档控制

| 文档信息 | 详情 |
|---------|------|
| 文档标题 | 萌宠伙伴微信小程序后端开发设计规范 |
| 版本号 | V1.0 |
| 作者 | AI助手 |
| 创建日期 | 2025-06-18 |
| 最后更新 | 2025-06-18 |
| 文档状态 | 初稿 |
| 依赖文档 | 需求规格说明书 V1.1, 设计规范文档 V1.0, 系统架构设计文档 V1.0, 测试用例 V1.0 |

### 版本历史

| 版本号 | 日期 | 描述 | 作者 |
|-------|------|------|------|
| V1.0 | 2025-06-18 | 基于需求、架构、设计和测试文档创建初始后端开发规范 | AI助手 |

## 1. 引言

### 1.1 目的
本文档旨在为「萌宠伙伴」微信小程序的后端开发团队提供一套全面的设计和实现规范。它详细描述了后端系统的技术选型、架构设计、模块划分、API接口定义、数据存储方案、安全策略以及开发流程和规范，以确保后端系统的高效开发、稳定运行和易于维护。

### 1.2 适用范围
本文档适用于「萌宠伙伴」项目的所有后端开发工程师、架构师、测试工程师以及相关的项目管理人员。

### 1.3 参考文档
- 《萌宠伙伴微信小程序需求规格说明书 V1.1》 (`require.md`)
- 《萌宠伙伴微信小程序设计规范 V1.0》 (`design_spec.md`)
- 《萌宠伙伴微信小程序系统架构设计文档 V1.0》 (`solution.md`)
- 《萌宠伙伴微信小程序测试用例 V1.0》 (`testcase.md`)

## 2. 后端技术选型与架构

### 2.1 技术选型
根据《系统架构设计文档 V1.0》5.1节，后端技术选型如下：
- **编程语言**: Node.js (配合 TypeScript)
- **Web框架**: NestJS
- **数据库**: 
    - 用户及关系型数据: PostgreSQL
    - 宠物及非结构化数据: MongoDB
    - 缓存: Redis
- **消息队列**: RabbitMQ (用于异步任务处理)
- **API网关**: Apisix (或云厂商API网关)
- **容器化**: Docker
- **容器编排**: Kubernetes (K8s)

### 2.2 系统架构概述
后端采用微服务架构，通过API网关统一对外提供服务。各微服务独立部署、可独立扩展。服务间通信采用同步HTTP/gRPC调用和异步消息队列（RabbitMQ）相结合的方式。
核心服务划分（参考《系统架构设计文档 V1.0》5.2节）：
- Auth Service (用户认证服务)
- User Service (用户服务)
- Pet Service (宠物服务)
- Interaction Service (互动服务)
- Checkin Service (签到服务)
- Leaderboard Service (排行榜服务)
- Mall Service (积分商城服务)
- Notification Service (通知服务)
- AI Proxy Service (AI代理服务，可选)

## 3. 数据库设计
详细的数据库表/集合设计参见《系统架构设计文档 V1.0》6.2节。核心实体包括：
- **PostgreSQL (用户库、活动与商城库)**:
    - `users`: 存储用户信息，如 `user_id`, `openid`, `nickname`, `avatar_url`, `points_balance`等。
    - `user_login_logs`: 用户登录日志。
    - `user_settings`: 用户偏好设置。
    - `checkin_logs`: 用户签到记录。
    - `products`: 商城商品信息。
    - `orders`: 用户兑换订单。
    - `user_inventory`: 用户虚拟物品库存。
- **MongoDB (宠物库)**:
    - `pets`: 存储宠物详细信息，包括 `userId`, `name`, `species`, `appearance_features`, `model_data`, `personality`, `level`, `experience`, `status` (mood, hunger, cleanliness, affection)等。
    - `pet_interactions`: 宠物互动记录。
- **Redis (缓存)**:
    - 用户会话、用户信息缓存、宠物信息缓存、排行榜数据、签到状态、接口限流计数器、分布式锁等。

## 4. API设计规范与通用约定

### 4.1 RESTful API设计原则
- 使用名词表示资源，HTTP动词表示操作。
- URL路径统一使用小写字母，单词间用下划线 `_` 或中划线 `-` 分隔（推荐中划线）。
- API版本控制通过URL前缀实现，如 `/v1/`。

### 4.2 请求与响应格式
- **请求格式**: 主要使用JSON格式 (`Content-Type: application/json`)。文件上传使用 `multipart/form-data`。
- **响应格式**: 统一使用JSON格式。标准成功响应结构：
  ```json
  {
    "code": 0, // 0 表示成功
    "message": "Success",
    "data": { ... } // 业务数据对象或数组
  }
  ```
- **分页**: 对于列表数据，采用统一的分页参数和响应结构：
    - 请求参数: `page` (页码, 默认1), `limit` (每页数量, 默认10)
    - 响应结构:
      ```json
      {
        "code": 0,
        "message": "Success",
        "data": {
          "items": [ ... ], // 当前页数据列表
          "total": 100,     // 总记录数
          "page": 1,
          "limit": 10,
          "totalPages": 10
        }
      }
      ```

### 4.3 HTTP状态码
- `200 OK`: 请求成功。
- `201 Created`: 资源创建成功。
- `204 No Content`: 请求成功，但响应体为空（如DELETE操作）。
- `400 Bad Request`: 请求参数错误或无效。
- `401 Unauthorized`: 未认证或认证失败。
- `403 Forbidden`: 已认证，但无权限访问资源。
- `404 Not Found`: 请求的资源不存在。
- `409 Conflict`: 资源冲突（如尝试创建已存在的唯一资源）。
- `422 Unprocessable Entity`: 请求格式正确，但由于含有语义错误，无法响应。
- `500 Internal Server Error`: 服务器内部错误。

### 4.4 错误处理
统一的错误响应结构：
```json
{
  "code": 40001, // 自定义错误码，0为成功，非0为失败
  "message": "Invalid input parameters.",
  "errors": [ // 可选，详细错误信息
    { "field": "username", "message": "Username cannot be empty." }
  ]
}
```

### 4.5 身份认证与授权
- 所有需要保护的API接口均需通过JWT (JSON Web Token)进行身份认证。
- JWT在用户登录成功后由Auth Service颁发，客户端在后续请求的 `Authorization` Header中携带 (e.g., `Authorization: Bearer <token>`)。
- API网关或各服务内部进行Token校验和权限验证。

## 5. 核心模块与API接口详解

以下将详细描述各核心模块的功能及其API接口。

### 5.1 用户认证服务 (Auth Service)
负责用户注册、登录、会话管理。

#### 5.1.1 微信登录/注册
- **Endpoint**: `POST /v1/auth/wechat_login`
- **描述**: 用户通过微信 `code` 进行登录或注册。
- **请求体** (`application/json`):
  ```json
  {
    "code": "string", // wx.login() 获取的code
    "encryptedData": "string", // 可选, 用于获取unionID或敏感信息
    "iv": "string" // 可选, 与encryptedData配合使用
  }
  ```
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Login successful",
    "data": {
      "token": "string", // JWT
      "user_info": {
        "user_id": "string",
        "openid": "string",
        "nickname": "string",
        "avatar_url": "string",
        "is_new_user": true // 是否为新注册用户
      }
    }
  }
  ```
- **错误响应**:
    - `400 Bad Request`: `code` 无效或缺失。
    - `500 Internal Server Error`: 微信接口调用失败或服务器内部错误。
- **核心逻辑**:
    1.  接收前端传递的 `code`。
    2.  调用微信 `code2Session` 接口，使用 `appid` 和 `appsecret` 换取 `openid` 和 `session_key`。
    3.  根据 `openid` 查询 `users` 表：
        -   若用户存在：更新 `last_login_at`。
        -   若用户不存在（新用户）：
            -   如果提供了 `encryptedData` 和 `iv`，尝试解密获取微信用户基本信息（昵称、头像等）。
            -   在 `users` 表中创建新用户记录，初始积分为0，记录 `agreed_privacy_policy_at` (需前端传递是否同意)。
    4.  生成JWT，包含 `user_id` 和 `openid` 等信息，设置合适的过期时间。
    5.  返回JWT和用户信息给前端。
- **数据库交互**:
    - `users` 表: `SELECT` (按 `openid`), `UPDATE` (更新 `last_login_at`), `INSERT` (新用户)。

#### 5.1.2 检查会话有效性 (可选)
- **Endpoint**: `GET /v1/auth/check_session`
- **描述**: 检查当前Token是否有效。
- **请求头**: `Authorization: Bearer <token>`
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Session is valid",
    "data": {
      "user_id": "string",
      "expires_in": 3600 // 剩余有效时间（秒）
    }
  }
  ```
- **错误响应**:
    - `401 Unauthorized`: Token无效或过期。
- **核心逻辑**:
    1.  验证JWT的有效性（签名、过期时间）。
    2.  若有效，返回成功及用户信息。
- **数据库交互**: 无直接交互，依赖JWT内容。

### 5.2 用户服务 (User Service)
管理用户个人信息、设置等。

#### 5.2.1 获取用户个人信息
- **Endpoint**: `GET /v1/users/profile`
- **描述**: 获取当前登录用户的详细个人信息。
- **请求头**: `Authorization: Bearer <token>`
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": {
      "user_id": "string",
      "nickname": "string",
      "avatar_url": "string",
      "gender": "integer", // 0-未知, 1-男, 2-女
      "birthday": "YYYY-MM-DD",
      "points_balance": "integer",
      "notification_prefs": { /* 通知设置 */ },
      "privacy_prefs": { /* 隐私设置 */ }
    }
  }
  ```
- **错误响应**:
    - `401 Unauthorized`
    - `404 Not Found`: 用户信息不存在。
- **核心逻辑**:
    1.  从JWT中获取 `user_id`。
    2.  查询 `users` 表和 `user_settings` 表获取用户信息。
    3.  组合信息并返回。
- **数据库交互**:
    - `users` 表: `SELECT` (按 `user_id`).
    - `user_settings` 表: `SELECT` (按 `user_id`).

#### 5.2.2 更新用户个人信息
- **Endpoint**: `PUT /v1/users/profile`
- **描述**: 更新当前登录用户的个人信息。
- **请求头**: `Authorization: Bearer <token>`
- **请求体** (`application/json`):
  ```json
  {
    "nickname": "string", // 可选
    "avatar_url": "string", // 可选, 通常头像通过专门接口上传后获取URL
    "gender": "integer", // 可选
    "birthday": "YYYY-MM-DD" // 可选
  }
  ```
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Profile updated successfully",
    "data": { /* 更新后的用户信息 */ }
  }
  ```
- **错误响应**:
    - `400 Bad Request`: 参数校验失败（如昵称含敏感词）。
    - `401 Unauthorized`
    - `422 Unprocessable Entity`: 昵称包含敏感词。
- **核心逻辑**:
    1.  从JWT中获取 `user_id`。
    2.  校验输入参数（如昵称长度、敏感词过滤）。
    3.  更新 `users` 表中对应记录。
    4.  返回更新后的用户信息。
- **数据库交互**:
    - `users` 表: `UPDATE` (按 `user_id`).

#### 5.2.3 更新用户头像 (通常为获取上传后的URL)
- **Endpoint**: `POST /v1/users/avatar`
- **描述**: 用户上传新头像后，将头像URL保存到用户信息。实际图片上传到对象存储，此接口仅保存URL。
- **请求头**: `Authorization: Bearer <token>`
- **请求体** (`application/json`):
  ```json
  {
    "avatar_url": "string" // 上传到OSS后获取的图片URL
  }
  ```
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Avatar URL updated successfully",
    "data": {
      "avatar_url": "string"
    }
  }
  ```
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  更新 `users` 表中的 `avatar_url` 字段。
- **数据库交互**:
    - `users` 表: `UPDATE` (设置 `avatar_url` 按 `user_id`).

#### 5.2.4 获取/更新用户设置
- **Endpoint**: `GET /v1/users/settings`, `PUT /v1/users/settings`
- **描述**: 获取或更新用户的通知设置、隐私设置等。
- **请求头**: `Authorization: Bearer <token>`
- **PUT 请求体** (`application/json`):
  ```json
  {
    "notification_prefs": { "checkin_reminder": true, "activity_push": false }, // 示例
    "privacy_prefs": { "profile_public": true }
  }
  ```
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Settings retrieved/updated successfully",
    "data": { /* 当前的或更新后的设置对象 */ }
  }
  ```
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  GET: 查询 `user_settings` 表。
    3.  PUT: 更新或插入 `user_settings` 表记录。
- **数据库交互**:
    - `user_settings` 表: `SELECT`, `UPDATE` 或 `INSERT` (按 `user_id`).

### 5.3 宠物服务 (Pet Service)
负责宠物生成、信息管理、状态更新。

#### 5.3.1 上传用于生成宠物的照片 (代理到OSS)
- **Endpoint**: `POST /v1/pets/upload_photo`
- **描述**: 前端上传照片，后端接收后中转到对象存储（如OSS/S3），返回图片URL或唯一标识。
- **请求头**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **请求体**: `file` (图片文件)
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Photo uploaded successfully",
    "data": {
      "photo_url": "string", // 图片在OSS上的访问URL
      "photo_id": "string" // 可选，图片的唯一标识，用于后续生成
    }
  }
  ```
- **核心逻辑**:
    1.  接收图片文件。
    2.  对图片进行基础校验（大小、格式）。
    3.  将图片上传到配置的对象存储服务。
    4.  返回图片的URL和/或唯一ID。
- **数据库交互**: 无直接交互，或记录上传日志。

#### 5.3.2 生成宠物
- **Endpoint**: `POST /v1/pets/generate`
- **描述**: 根据用户上传的照片（通过 `photo_id` 或 `photo_url` 关联）调用AI服务生成宠物。
- **请求头**: `Authorization: Bearer <token>`
- **请求体** (`application/json`):
  ```json
  {
    "photo_id": "string", // 或 photo_url
    "user_selected_attributes": { /* 用户选择的初始属性，如性格 */ }
  }
  ```
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Pet generation initiated/completed",
    "data": {
      "generation_task_id": "string", // 如果是异步生成
      "pet_preview_data": { // 如果同步生成或初步结果
        "model_data": { /* 3D模型信息 */ },
        "appearance_features": { /* AI分析的外观特征 */ }
      }
    }
  }
  ```
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  调用AI代理服务或直接调用AI接口，传递照片信息。
    3.  AI服务返回宠物特征数据或模型数据。
    4.  （可选）将初步生成结果缓存或临时存储，待用户确认。
    5.  返回生成结果预览或任务ID。
- **数据库交互**: 临时存储生成结果（Redis或特定表）。

#### 5.3.3 确认并领养宠物
- **Endpoint**: `POST /v1/pets`
- **描述**: 用户确认生成的宠物形象并为其命名，正式创建宠物记录。
- **请求头**: `Authorization: Bearer <token>`
- **请求体** (`application/json`):
  ```json
  {
    "generation_result_id": "string", // AI生成结果的唯一标识
    "pet_name": "string",
    "initial_attributes": { /* 用户确认或调整的宠物属性 */ }
  }
  ```
- **成功响应 (201 Created)**:
  ```json
  {
    "code": 0,
    "message": "Pet adopted successfully",
    "data": { /* 新创建的宠物完整信息，包括 pet_id */ }
  }
  ```
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  校验 `pet_name` (敏感词、长度)。
    3.  从缓存或临时存储中获取 `generation_result_id` 对应的AI生成数据。
    4.  在 `pets` 集合 (MongoDB) 中创建新的宠物文档，包含 `userId`, `name`, AI生成的特征，用户选择的属性，初始状态值 (等级1, 经验0, 心情/饥饱度/清洁度初始值)。
    5.  返回新创建的宠物信息。
- **数据库交互**:
    - `pets` (MongoDB): `INSERT` 新宠物文档。

#### 5.3.4 获取用户宠物列表
- **Endpoint**: `GET /v1/users/pets`
- **描述**: 获取当前用户拥有的所有宠物简要信息列表。
- **请求头**: `Authorization: Bearer <token>`
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": {
      "items": [
        {
          "pet_id": "string",
          "name": "string",
          "species": "string",
          "level": "integer",
          "thumbnail_url": "string" // 宠物缩略图
        }
      ],
      "total": 1
    }
  }
  ```
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  查询 `pets` 集合，筛选 `userId` 匹配的宠物，返回指定字段。
- **数据库交互**:
    - `pets` (MongoDB): `FIND` (按 `userId`).

#### 5.3.5 获取特定宠物详情
- **Endpoint**: `GET /v1/pets/{pet_id}`
- **描述**: 获取指定ID的宠物详细信息，包括当前状态。
- **请求头**: `Authorization: Bearer <token>`
- **路径参数**: `pet_id` (string)
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": { /* 宠物完整信息，同5.3.3创建成功后的data结构 */ }
  }
  ```
- **错误响应**:
    - `403 Forbidden`: 用户无权访问此宠物。
    - `404 Not Found`: 宠物不存在。
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  查询 `pets` 集合中指定 `pet_id` 的宠物。
    3.  校验宠物是否属于当前用户。
    4.  （重要）计算状态衰减：根据 `last_interaction_time` 或上次状态更新时间，计算饥饱度、清洁度等的自然衰减，并更新到数据库和返回结果中。
- **数据库交互**:
    - `pets` (MongoDB): `FIND_ONE` (按 `_id`), `UPDATE` (更新状态和 `updated_at`).

### 5.4 互动服务 (Interaction Service)
处理用户与宠物的互动行为。

#### 5.4.1 与宠物互动
- **Endpoint**: `POST /v1/pets/{pet_id}/interact`
- **描述**: 用户对指定宠物执行某种互动操作（喂食、抚摸、玩耍、清洁、训练）。
- **请求头**: `Authorization: Bearer <token>`
- **路径参数**: `pet_id` (string)
- **请求体** (`application/json`):
  ```json
  {
    "interaction_type": "string", // e.g., "feeding", "petting", "playing", "cleaning", "training"
    "item_id": "string" // 可选, 互动时使用的道具ID (如食物ID, 玩具ID)
  }
  ```
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Interaction successful",
    "data": {
      "updated_status": { /* 互动后宠物更新的状态 */ },
      "reward": { /* 本次互动获得的奖励，如经验值 */ }
    }
  }
  ```
- **错误响应**:
    - `400 Bad Request`: 无效的 `interaction_type` 或 `item_id`，或不满足互动条件（如宠物饱了不能再喂）。
    - `403 Forbidden` / `404 Not Found`: 宠物权限或存在性问题。
    - `422 Unprocessable Entity`: 道具不足（如果需要消耗道具）。
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  查询 `pets` 集合获取宠物信息，校验归属。
    3.  根据 `interaction_type` 和 `item_id` (如果提供):
        -   **喂食**: 检查 `item_id` 是否为有效食物，用户是否有此食物（查 `user_inventory`）。扣除食物，增加宠物饥饱度、少量亲密度、少量经验值。更新 `pets` 状态。
        -   **抚摸**: 增加宠物心情值、亲密度。更新 `pets` 状态。
        -   **玩耍**: 检查 `item_id` 是否为有效玩具。增加宠物心情值，消耗少量体力（如果设计有），少量亲密度、少量经验值。更新 `pets` 状态。
        -   **清洁**: 增加宠物清洁度、少量心情值。更新 `pets` 状态。
        -   **训练**: 增加宠物经验值，可能解锁技能，少量亲密度。更新 `pets` 状态。
    4.  记录互动到 `pet_interactions` 集合。
    5.  更新宠物的 `last_interaction_time` 和 `updated_at`。
    6.  返回更新后的状态和奖励。
- **数据库交互**:
    - `pets` (MongoDB): `FIND_ONE`, `UPDATE` (更新状态、经验、等级、`last_interaction_time`, `updated_at`).
    - `user_inventory` (PostgreSQL): `SELECT` (检查道具), `UPDATE` (扣除道具数量).
    - `pet_interactions` (MongoDB): `INSERT` 互动记录。
    - `products` (PostgreSQL): 可能需要查询道具效果配置。

### 5.5 签到服务 (Checkin Service)

#### 5.5.1 获取用户签到状态
- **Endpoint**: `GET /v1/checkin/status`
- **描述**: 获取用户当月签到日历、今日是否已签到、连续签到天数。
- **请求头**: `Authorization: Bearer <token>`
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": {
      "today_checked_in": true,
      "consecutive_days": 5,
      "current_month_checkins": ["2025-06-01", "2025-06-02", ...],
      "rewards_preview": { /* 连续签到奖励预览 */ }
    }
  }
  ```
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  查询 `checkin_logs` 表获取指定用户当月的签到记录。
    3.  计算连续签到天数（可能需要查 `user_stats` 表或实时计算）。
    4.  检查今日是否已签到。
- **数据库交互**:
    - `checkin_logs` (PostgreSQL): `SELECT` (按 `user_id` 和月份)。
    - `user_stats` (PostgreSQL): `SELECT` (获取 `consecutive_checkin_days`) - 可选，或实时计算。

#### 5.5.2 执行签到
- **Endpoint**: `POST /v1/checkin`
- **描述**: 用户执行每日签到操作。
- **请求头**: `Authorization: Bearer <token>`
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Checked in successfully",
    "data": {
      "reward_points": 10, // 本次签到获得的积分
      "consecutive_days": 6,
      "bonus_reward": { /* 额外连续签到奖励 */ }
    }
  }
  ```
- **错误响应**:
    - `409 Conflict`: 今日已签到。
- **核心逻辑**:
    1.  从JWT获取 `user_id`。
    2.  检查用户今日是否已签到（查 `checkin_logs` for `user_id` and `current_date`）。若已签到，返回错误。
    3.  记录签到日志到 `checkin_logs` 表。
    4.  更新用户连续签到天数（`user_stats` 表或在 `users` 表中）。
    5.  发放签到奖励（如增加用户积分到 `users` 表的 `points_balance`）。
    6.  检查是否触发连续签到奖励，若触发则发放额外奖励。
    7.  （可选）通过Notification Service发送签到成功通知。
- **数据库交互**:
    - `checkin_logs` (PostgreSQL): `SELECT` (检查是否已签到), `INSERT` (新签到记录)。
    - `users` (PostgreSQL): `UPDATE` (增加 `points_balance`)。
    - `user_stats` (PostgreSQL): `UPDATE` (更新 `consecutive_checkin_days`) - 可选。

#### 5.5.3 补签 (可选)
- **Endpoint**: `POST /v1/checkin/retroactive`
- **描述**: 用户消耗积分或道具进行补签。
- **请求头**: `Authorization: Bearer <token>`
- **请求体** (`application/json`):
  ```json
  {
    "date_to_补签": "YYYY-MM-DD"
  }
  ```
- **核心逻辑**: 类似签到，但需校验补签规则（如7天内），扣除补签所需资源，标记为补签。

### 5.6 排行榜服务 (Leaderboard Service)

#### 5.6.1 获取排行榜
- **Endpoint**: `GET /v1/leaderboards/{type}`
- **描述**: 获取指定类型的排行榜数据（如宠物等级榜、用户积分榜、好友榜）。
- **请求头**: `Authorization: Bearer <token>` (好友榜可能需要)
- **路径参数**: `type` (string, e.g., `pet_level`, `user_points`, `friend_interaction`)
- **查询参数**: `page`, `limit`
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": {
      "items": [
        {
          "rank": 1,
          "user_id": "string",
          "nickname": "string",
          "avatar_url": "string",
          "score": 1000, // 对应榜单的分数 (等级/积分等)
          "pet_info": { /* 可选，如宠物等级榜时提供宠物信息 */ }
        }
      ],
      "total": 100,
      "page": 1,
      "limit": 10,
      "my_rank": { /* 当前用户在此榜单的排名信息，可选 */ }
    }
  }
  ```
- **核心逻辑**:
    1.  根据 `type` 从Redis的Sorted Set中获取排名数据。
    2.  对于每个排名条目（通常存 `user_id` 或 `pet_id`），查询 `users` 表或 `pets` 集合获取昵称、头像等展示信息。
    3.  （好友榜）需要先获取用户好友列表（可能涉及微信API或内部好友系统），再筛选排名。
    4.  组装分页数据返回。
- **数据库交互**:
    - `Redis`: `ZRANGE` / `ZREVRANGE` (获取排名), `ZSCORE` (获取分数), `ZRANK` (获取我的排名)。
    - `users` (PostgreSQL): `SELECT` (批量获取用户信息)。
    - `pets` (MongoDB): `SELECT` (批量获取宠物信息，如果榜单相关)。

### 5.7 积分商城服务 (Mall Service)

#### 5.7.1 获取商品列表
- **Endpoint**: `GET /v1/mall/products`
- **描述**: 获取积分商城中的商品列表。
- **查询参数**: `category` (可选), `page`, `limit`
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": {
      "items": [
        {
          "product_id": "string",
          "name": "string",
          "description": "string",
          "image_url": "string",
          "type": "string", // virtual_pet_food, virtual_pet_toy, etc.
          "points_cost": "integer",
          "stock_quantity": "integer" // -1表示无限库存
        }
      ],
      "total": 50,
      "page": 1,
      "limit": 10
    }
  }
  ```
- **核心逻辑**:
    1.  查询 `products` 表，根据分类、分页参数筛选。
    2.  优先从缓存读取商品列表。
- **数据库交互**:
    - `products` (PostgreSQL): `SELECT` (可带 `WHERE` 和 `LIMIT/OFFSET`)。
    - `Redis`: 缓存商品列表。

#### 5.7.2 获取商品详情
- **Endpoint**: `GET /v1/mall/products/{product_id}`
- **描述**: 获取特定商品的详细信息。
- **路径参数**: `product_id` (string)
- **成功响应 (200 OK)**:
  ```json
  {
    "code": 0,
    "message": "Success",
    "data": { /* 单个商品详细信息，同列表项结构但更完整 */ }
  }
  ```
- **核心逻辑**: 查询 `products` 表或缓存。

#### 5.7.3 兑换商品
- **Endpoint**: `POST /v1/mall/orders`
- **描述**: 用户使用积分兑换商品。
- **请求头**: `Authorization: Bearer <token>`
- **请求体** (`application/json`):
  ```json
  {
    "product_id": "string",
    "quantity": "integer" // 通常为1
  }
  ```
- **成功响应 (201 Created)**:
  ```json
  {
    "code": 0,
    "message": "Order created successfully",
    "data": {
      "order_id": "string",
      "product_name": "string",
      "points_deducted": "integer",
      "remaining_points": "integer"
    }
  }
  ```
- **错误响应**:
    - `400 Bad Request`: 商品不存在或已下架。
    - `422 Unprocessable Entity`: 积分不足或库存不足。
- **核心逻辑** (事务性操作):
    1.  从JWT获取 `user_id`。
    2.  查询 `products` 表获取商品信息（价格、库存）。
    3.  查询 `users` 表获取用户当前积分。
    4.  校验：商品是否存在、库存是否充足、用户积分是否足够。
    5.  **开始事务**:
        a.  扣减用户积分 (`users` 表 `points_balance`)。
        b.  扣减商品库存 (`products` 表 `stock_quantity`，若非无限库存)。
        c.  创建订单记录到 `orders` 表。
        d.  如果兑换的是虚拟物品，将其添加到 `user_inventory` 表。
    6.  **提交事务**。
    7.  返回成功信息。
- **数据库交互** (在一个事务内):
    - `users` (PostgreSQL): `SELECT` (获取积分), `UPDATE` (扣减积分)。
    - `products` (PostgreSQL): `SELECT` (获取商品信息), `UPDATE` (扣减库存)。
    - `orders` (PostgreSQL): `INSERT` (创建订单)。
    - `user_inventory` (PostgreSQL): `INSERT` 或 `UPDATE` (添加虚拟物品)。

#### 5.7.4 获取用户订单列表
- **Endpoint**: `GET /v1/mall/orders`
- **描述**: 获取当前用户的兑换订单列表。
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**: `status` (可选), `page`, `limit`
- **核心逻辑**: 查询 `orders` 表。

### 5.8 通知服务 (Notification Service)
主要用于发送微信订阅消息，通常由其他服务通过消息队列触发。

#### 5.8.1 (内部接口) 发送订阅消息
- **触发方式**: 异步消息 (RabbitMQ)
- **消息体**: `{ "user_id": "string", "template_id": "string", "data": { ... }, "page": "string" }`
- **核心逻辑**:
    1.  消费消息队列中的通知请求。
    2.  根据 `user_id` 获取用户的 `openid`。
    3.  获取 `access_token` (微信全局接口调用凭证，需缓存和定时刷新)。
    4.  调用微信订阅消息发送接口 `subscribeMessage.send`。
    5.  记录发送日志。
- **数据库交互**:
    - `users` (PostgreSQL): `SELECT openid`.
    - `access_token_cache` (Redis): 获取 `access_token`.

## 6. 安全设计

- **身份认证**: JWT，如4.5节所述。
- **授权**: 基于角色的访问控制 (RBAC) 或基于属性的访问控制 (ABAC) 可按需实现。API网关或服务内部进行权限校验。
- **输入校验**: 对所有外部输入（API参数、请求体）进行严格校验（类型、格式、长度、范围、敏感词过滤）。使用如 `class-validator` (NestJS)。
- **SQL注入防护**: 使用ORM (如TypeORM, Sequelize for Node.js/PostgreSQL; Mongoose for Node.js/MongoDB) 或参数化查询。
- **XSS防护**: 后端API主要返回JSON，前端负责渲染时的XSS防护。若后端输出HTML内容，则需进行转义。
- **CSRF防护**: 小程序环境通常不易受传统CSRF攻击，但API设计仍需谨慎，不依赖Cookie进行会话管理。
- **敏感数据处理**: `session_key` 等敏感信息不返回给前端，密码（如果未来有）需加盐哈希存储。
- **HTTPS**: 所有API通信强制使用HTTPS。
- **API限流**: 在API网关或服务内部实现基于用户ID或IP的请求频率限制，防止滥用。
- **日志记录**: 记录关键操作日志、错误日志，便于审计和排查问题。

## 7. 部署与运维

- **容器化部署**: 所有微服务使用Docker打包。
- **编排**: 使用Kubernetes进行服务部署、伸缩、管理。
- **CI/CD**: 建立自动化构建、测试、部署流水线 (e.g., Jenkins, GitLab CI, GitHub Actions)。
- **配置管理**: 使用配置中心 (e.g., Consul, Apollo) 或环境变量管理不同环境的配置。
- **日志收集与监控**: 
    - 日志: ELK Stack (Elasticsearch, Logstash, Kibana) 或云厂商日志服务。
    - 监控: Prometheus + Grafana, 或云厂商监控服务，监控系统指标、应用性能、业务指标。
- **告警**: 配置关键指标告警，及时发现和处理问题。

## 8. 后端开发规范

- **代码风格**: 遵循特定语言和框架的推荐代码风格 (如ESLint + Prettier for TypeScript/Node.js)。
- **版本控制**: 使用Git，遵循Git Flow或类似的分支管理策略。
- **代码审查**: 所有代码变更必须经过Code Review。
- **单元测试**: 核心业务逻辑必须编写单元测试，保证代码质量和可维护性。推荐测试覆盖率目标。
- **集成测试**: 对服务间的交互进行集成测试。
- **文档**: API接口文档使用Swagger/OpenAPI规范自动生成或手动维护。关键业务逻辑和复杂算法需有注释。
- **错误处理**: 统一错误处理机制，避免直接暴露原始错误信息给客户端。
- **异步处理**: 合理使用异步编程（Promises, async/await in Node.js）避免阻塞主线程。

---
**文档结束**