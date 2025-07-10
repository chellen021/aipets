# 萌宠伙伴微信小程序 CMS 后台开发设计规范

## 0. 文档控制

| 文档信息 | 详情 |
|---------|------|
| 文档标题 | 萌宠伙伴微信小程序 CMS 后台开发设计规范 |
| 版本号 | V1.0 |
| 作者 | AI助手 |
| 创建日期 | 2025-06-19 |
| 最后更新 | 2025-06-19 |
| 文档状态 | 初稿 |
| 依赖文档 | 需求规格说明书 V1.1, 系统架构设计文档 V1.0, 后端开发设计规范 V1.0 |

### 版本历史

| 版本号 | 日期 | 描述 | 作者 |
|-------|------|------|------|
| V1.0 | 2025-06-19 | 初始版本，基于项目需求和后端规范创建 | AI助手 |

## 1. 引言

### 1.1 目的
本文档旨在为「萌宠伙伴」微信小程序的后台管理系统（CMS）提供详细的开发设计规范和实施指引。目标是指导CMS的选型、搭建、功能定制和与主应用后端的集成，确保运营和管理人员能够高效地管理小程序的核心数据和配置。

### 1.2 适用范围
本文档适用于负责CMS选型、开发、部署和维护的工程师，以及需要了解CMS功能的项目管理和运营人员。

### 1.3 参考文档
- 《萌宠伙伴微信小程序需求规格说明书 V1.1》 (`require.md`)
- 《萌宠伙伴微信小程序系统架构设计文档 V1.0》 (`solution.md`)
- 《萌宠伙伴微信小程序后端开发设计规范 V1.0》 (`backend.md`)

## 2. CMS选型与概述

### 2.1 推荐开源CMS：Strapi

考虑到「萌宠伙伴」项目的技术栈（Node.js 后端）、对灵活内容建模的需求以及快速开发的需要，推荐使用 **Strapi** 作为基础的开源 Headless CMS 进行改造和扩展。

**选择 Strapi 的理由：**
- **Headless CMS**：前后端分离，API驱动，非常适合为小程序或任何前端应用提供内容服务。
- **JavaScript/Node.js 生态**：与项目后端技术栈一致，便于团队维护和扩展。
- **灵活的内容建模 (Content-Types Builder)**：可以通过图形化界面轻松创建和管理数据结构（Collections, Single Types, Components）。
- **RESTful 和 GraphQL API 自动生成**：为创建的每个内容类型自动生成强大的API接口。
- **可定制的管理后台**：Admin Panel 可以进行一定程度的定制，满足品牌和特定工作流需求。
- **插件系统**：拥有丰富的官方和社区插件，也可以自行开发插件扩展功能。
- **角色与权限管理**：内置强大的RBAC（Role-Based Access Control）系统，可以精细控制用户对内容和功能的访问权限。
- **开源且社区活跃**：有广泛的社区支持和丰富的文档资源。

### 2.2 CMS 在系统中的定位
CMS 主要承担以下职责：
- **数据管理**：管理小程序中动态变化的数据，如积分商城商品、签到奖励配置、活动信息等。
- **内容配置**：配置一些非核心业务逻辑但需要运营调整的内容，如通知模板、特定文案等。
- **用户查阅（有限）**：提供对用户基本信息和宠物信息的查阅功能，辅助运营。
- **系统参数配置**：管理一些全局性的系统参数和开关。

CMS 生成的 API 将主要被主应用的后端服务调用，以获取最新的配置和数据。部分场景下，CMS 也可能直接被前端调用（例如，获取一些公开的、不敏感的配置信息，但这需要谨慎评估安全性）。

## 3. CMS 功能需求

基于《需求规格说明书》和《后端开发设计规范》，CMS 需要支持以下核心功能的管理：

1.  **用户管理 (User Management)**
    *   查看用户列表（基本信息如 user_id, openid, nickname, avatar_url, points_balance, created_at）。
    *   查看特定用户详情。
    *   （可选）修改用户状态（如封禁/解封），调整用户积分（需严格权限控制和审计日志）。
2.  **宠物数据查阅 (Pet Data Viewing)**
    *   查看宠物列表（pet_id, user_id, name, species, level）。
    *   查看特定宠物详情（包括状态、外观特征等）。
    *   （可选）管理宠物名称（如敏感词审核与修改）。
3.  **积分商城管理 (Points Shop Management)**
    *   商品管理 (CRUD)：商品名称、描述、图片、类型（虚拟/实体）、所需积分、库存数量、上下架状态。
    *   商品分类管理（如果需要）。
    *   订单查阅：查看用户兑换订单记录。
4.  **签到系统配置 (Check-in System Configuration)**
    *   每日签到奖励配置：配置每日签到可获得的积分或道具。
    *   连续签到奖励配置：配置连续签到特定天数（如3, 7, 15, 30天）的额外奖励内容和数量。
    *   补签规则配置：配置补签消耗的积分或道具，以及补签限制。
5.  **排行榜管理 (Leaderboard Management - Limited)**
    *   查阅当前各排行榜数据（主要用于运营监控）。
    *   （可选）配置排行榜奖励规则或周期性活动关联。
6.  **通知模板管理 (Notification Template Management)**
    *   管理微信订阅消息的模板内容，允许运营人员修改通知文案中的变量部分。
7.  **系统配置管理 (System Configuration Management)**
    *   管理全局配置项，如 AI 模型参数（如果允许后台调整）、特定功能的开关、默认值等。
    *   敏感词库管理。
8.  **CMS自身用户与权限管理 (CMS User & Permission Management)**
    *   创建和管理CMS后台操作员账号。
    *   分配不同的角色和权限给操作员。

## 4. Strapi 实施与定制指南

以下步骤将指导CMS前端开发工程师（或负责CMS搭建的工程师）如何使用Strapi来实现上述功能。

### 4.1 Strapi 安装与基本设置

1.  **环境要求**：Node.js (推荐LTS版本), npm/yarn, 以及Strapi支持的数据库之一 (如 PostgreSQL, MySQL, SQLite)。为与主后端一致，推荐使用 PostgreSQL。
2.  **创建项目**：
    ```bash
    npx create-strapi-app@latest萌宠伙伴-cms --quickstart # 使用SQLite快速启动
    # 或指定数据库
    # npx create-strapi-app@latest 萌宠伙伴-cms
    # cd 萌宠伙伴-cms
    # yarn strapi develop (或 npm run develop)
    ```
3.  **创建管理员账号**：首次启动后，浏览器会自动打开 `http://localhost:1337/admin`，引导创建第一个管理员账号。
4.  **数据库配置**：如果未使用 `--quickstart`，需要在 `config/database.js` 中配置数据库连接信息。

### 4.2 定义内容类型 (Content-Types)

通过 Strapi Admin Panel 左侧导航栏的 "Content-Types Builder" 来创建和设计数据模型。

#### 4.2.1 用户 (Users - 扩展默认User)
Strapi 默认有一个 `User` collection (来自 `strapi-plugin-users-permissions`)。我们需要扩展它或创建一个新的 Collection 来匹配项目需求。
考虑到主应用已有用户系统，CMS中的用户管理更多是查阅和辅助管理。

- **Collection Name**: `AppUser` (或直接扩展 `User`)
- **Fields** (主要用于展示，部分可编辑，需严格权限控制):
    - `user_id_external`: Text (Unique) - 对应主数据库的 `user_id`，用于关联。
    - `openid`: Text (Unique, Private) - 对应主数据库的 `openid`。
    - `nickname`: Text
    - `avatar_url`: Text (URL)
    - `points_balance`: Integer
    - `gender`: Enumeration (未知, 男, 女)
    - `birthday`: Date
    - `status`: Enumeration (正常, 封禁) - 可由CMS管理员修改。
    - `created_at_external`: DateTime - 对应主数据库的 `created_at`。
    - `last_login_at_external`: DateTime - 对应主数据库的 `last_login_at`。
    - `notes`: Rich Text (供管理员添加备注)

**同步机制**：主应用后端的用户数据变动时（如新用户注册、积分变动），需要通过API或消息队列同步到CMS的 `AppUser` collection。CMS对 `AppUser` 的修改（如修改状态、积分）也需要通过机制同步回主数据库或通知主后端服务处理。

#### 4.2.2 宠物 (Pets)
- **Collection Name**: `Pet`
- **Fields** (主要用于查阅):
    - `pet_id_external`: Text (Unique) - 对应主数据库的 `pet_id`。
    - `owner`: Relation (One-to-One with `AppUser`) - 关联到 `AppUser`。
    - `name`: Text
    - `species`: Text
    - `breed`: Text
    - `level`: Integer
    - `experience`: Integer
    - `mood`: Integer
    - `hunger`: Integer
    - `cleanliness`: Integer
    - `affection`: Integer
    - `appearance_features`: JSON (存储AI分析的外观特征)
    - `model_data`: JSON (存储3D模型相关数据)
    - `personality`: Text
    - `created_at_external`: DateTime

**同步机制**：类似用户数据，宠物数据也需要从主应用后端同步到CMS。

#### 4.2.3 商城商品 (ShopProducts)
- **Collection Name**: `ShopProduct`
- **Fields**:
    - `name`: Text (Required)
    - `description`: Rich Text
    - `images`: Media (Multiple, e.g., product gallery)
    - `type`: Enumeration (virtual_pet_food, virtual_pet_toy, virtual_pet_accessory, physical_good) (Required)
    - `points_cost`: Integer (Required, Min: 0)
    - `stock_quantity`: Integer (Min: 0, -1 for unlimited virtual goods)
    - `status`: Enumeration (草稿, 上架, 下架) (Required, Default: 草稿)
    - `tags`: Text (Comma-separated or use a Relation to a `Tag` collection)
    - `display_order`: Integer (用于排序)

#### 4.2.4 签到奖励 (CheckinRewards)
- **Collection Name**: `CheckinRewardRule`
- **Fields**:
    - `day_type`: Enumeration (每日签到, 连续签到) (Required)
    - `consecutive_days`: Integer (Conditional, Required if `day_type` is '连续签到', e.g., 3, 7, 15, 30)
    - `reward_points`: Integer (Min: 0)
    - `reward_item`: Relation (One-to-One with `ShopProduct`) - 可选，奖励特定商品
    - `reward_item_quantity`: Integer (Min: 1, Default: 1) - 如果奖励物品
    - `is_active`: Boolean (Default: true)
    - `description`: Text (e.g., "每日签到奖励", "连续7天签到大礼包")

#### 4.2.5 通知模板 (NotificationTemplates)
- **Collection Name**: `NotificationTemplate`
- **Fields**:
    - `template_key`: Text (Unique, e.g., `CHECKIN_REMINDER`, `PET_HUNGRY_ALERT`) (Required)
    - `title`: Text (模板标题，用于微信订阅消息等)
    - `content`: Text Area (模板内容，支持占位符如 `{{nickname}}`, `{{petName}}`)
    - `platform`: Enumeration (WeChatSubscribeMessage, SMS, Email) (Required)
    - `notes`: Text (模板说明，如占位符含义)

#### 4.2.6 系统配置 (SystemConfigurations)
- **Type**: Single Type (因为通常只有一组全局配置)
- **Name**: `SystemConfiguration`
- **Fields**:
    - `maintenance_mode`: Boolean (全局维护模式开关)
    - `default_user_points`: Integer (新用户默认积分)
    - `ai_pet_generation_endpoint`: Text (URL, AI生成服务地址，如果可配)
    - `sensitive_words_list`: Text Area (敏感词列表，每行一个)
    - `shop_open_time`: Time
    - `shop_close_time`: Time

### 4.3 设置角色和权限 (Roles & Permissions)

路径: Admin Panel > Settings > Roles

1.  **创建角色**：
    *   `Super Admin`: 默认拥有所有权限。
    *   `Content Editor`: 负责管理商城商品、通知模板等内容。
    *   `User Support`: 负责查阅用户信息、宠物信息，可能处理用户反馈。
    *   `System Operator`: 负责配置签到奖励、系统参数等。

2.  **为每个角色分配权限**：
    *   针对每个 Collection (e.g., `ShopProduct`)，可以设置 `create`, `find`, `findOne`, `update`, `delete` 等操作的权限。
    *   例如，`Content Editor` 对 `ShopProduct` 有完全的CRUD权限，但对 `AppUser` 可能只有 `find` 和 `findOne` 权限。
    *   `User Support` 对 `AppUser` 和 `Pet` 有 `find`, `findOne` 权限，对 `AppUser.status` 和 `AppUser.notes` 字段可能有 `update` 权限。

### 4.4 API 端点与集成

- Strapi 会为每个创建的 Collection 自动生成 RESTful API 端点。例如，`ShopProduct` 会有：
    - `GET /api/shop-products`
    - `GET /api/shop-products/:id`
    - `POST /api/shop-products`
    - `PUT /api/shop-products/:id`
    - `DELETE /api/shop-products/:id`
- **API Token**: 在 Settings > API Tokens 中创建具有特定权限的 API Token，供主应用后端服务调用CMS API时使用。
- **主后端集成**：
    - **数据拉取**：主应用的后端服务（如 `MallService`, `CheckinService`）会定期或按需调用CMS的API来获取最新的商品信息、签到奖励规则等。
    - **数据推送/同步**：
        - 当主应用发生用户注册、宠物创建、积分变动等事件时，应通过调用CMS提供的特定API（可能需要自定义开发）或通过消息队列将数据同步到CMS的对应Collection中。
        - 当CMS管理员修改了某些关键数据（如用户状态、手动调整的积分），CMS也需要有机制（如Webhook、自定义Controller调用主后端API）通知主后端服务进行相应处理和数据同步。

### 4.5 具体功能改造流程示例

#### 4.5.1 管理商城商品
1.  **CMS管理员登录** Strapi Admin Panel。
2.  导航到 **Content Manager > ShopProduct**。
3.  **添加新商品**：
    *   点击 "Create new entry"。
    *   填写商品名称、描述、上传图片、选择类型、设置积分价格、库存、状态等字段。
    *   点击 "Save" 和 "Publish"。
4.  **编辑商品**：
    *   在列表中找到要编辑的商品，点击进入编辑页面。
    *   修改所需字段。
    *   点击 "Save"。
5.  **主应用后端**：`MallService` 在需要展示商品列表或商品详情时，调用 `GET /api/shop-products` (可带筛选和分页参数) 或 `GET /api/shop-products/:id` 从CMS获取数据。

#### 4.5.2 配置签到奖励
1.  **CMS管理员登录** Strapi Admin Panel。
2.  导航到 **Content Manager > CheckinRewardRule**。
3.  **添加/修改签到规则**：
    *   创建或编辑一条规则。
    *   选择 `day_type` (每日签到或连续签到)。
    *   如果选择“连续签到”，填写 `consecutive_days`。
    *   设置 `reward_points` 和/或关联 `reward_item` (从 `ShopProduct` 中选择)。
    *   确保 `is_active` 为 true。
    *   点击 "Save" 和 "Publish"。
4.  **主应用后端**：`CheckinService` 在用户签到时，调用 `GET /api/checkin-reward-rules` (可根据 `day_type` 和 `consecutive_days` 筛选) 从CMS获取当前生效的奖励规则，然后据此给用户发放奖励。

#### 4.5.3 用户信息查阅与管理
1.  **CMS管理员 (User Support 角色) 登录** Strapi Admin Panel。
2.  导航到 **Content Manager > AppUser**。
3.  **查看用户列表**：可以看到用户的 `user_id_external`, `nickname`, `points_balance` 等。
4.  **搜索用户**：使用过滤器按 `nickname` 或 `user_id_external` 搜索特定用户。
5.  **查看用户详情**：点击用户进入详情页，可以看到更完整的信息。
6.  **修改用户状态** (如果权限允许)：
    *   在用户详情页，修改 `status` 字段 (如改为“封禁”)。
    *   添加 `notes` 说明原因。
    *   点击 "Save"。
7.  **同步到主应用**：CMS中对 `AppUser` 的 `status` 字段的修改，需要通过自定义逻辑（如Strapi的生命周期钩子 `afterUpdate`）触发一个API调用到主应用的 `UserService`，告知其用户状态变更，以便主应用后端执行实际的封禁逻辑。

### 4.6 前端 (Admin Panel) 定制

- Strapi 允许对 Admin Panel 进行一定程度的定制，例如修改Logo、颜色主题、添加自定义字段的输入组件等。这通常涉及修改Admin Panel的源代码或通过插件机制注入自定义代码。
- 对于「萌宠伙伴」项目，初期的重点应放在功能实现上，Admin Panel的深度美化定制优先级较低。

## 5. 部署与运维

### 5.1 部署方案
- Strapi应用可以像标准的Node.js应用一样部署，例如使用Docker容器化后，通过Kubernetes进行编排，或部署在PaaS平台（如Heroku, Render）。
- 数据库（PostgreSQL, MongoDB, Redis）应独立部署并进行专业配置和备份。
- 静态资源（如Admin Panel构建文件、上传的媒体文件）可以配置为由Nginx等Web服务器提供服务，或存储在对象存储（如AWS S3, 阿里云OSS）并通过CDN分发。

### 5.2 数据备份与恢复
- 定期备份Strapi的数据库（PostgreSQL）。
- 备份用户上传的媒体文件（如果存储在本地文件系统而不是对象存储）。
- 制定灾难恢复计划。

### 5.3 安全注意事项
- 保护好Admin Panel的访问，使用强密码，限制IP访问（如果可能）。
- 定期更新Strapi版本及依赖，修复安全漏洞。
- 严格管理API Token的权限和生命周期。
- 对CMS服务器进行安全加固。

## 6. 总结

通过使用Strapi作为基础CMS，并按照本文档的指引进行内容建模、权限配置和必要的定制开发，「萌宠伙伴」项目可以快速搭建一个功能强大且易于管理的后台系统。这将极大地提升运营效率，并为小程序的持续迭代和内容更新提供有力支持。