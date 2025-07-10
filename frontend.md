# 萌宠伙伴微信小程序前端开发设计规范指引

## 0. 文档控制

| 文档信息   | 详情                                     |
| ---------- | ---------------------------------------- |
| 文档标题   | 萌宠伙伴微信小程序前端开发设计规范指引       |
| 版本号     | V1.0                                     |
| 作者       | AI助手                                   |
| 创建日期   | 2025-06-18                               |
| 最后更新   | 2025-06-18                               |
| 文档状态   | 初稿                                     |
| 依赖文档   | 需求规格说明书 V1.1, 设计规范文档 V1.0, 系统架构设计文档 V1.0 |

### 版本历史

| 版本号 | 日期       | 描述                               |
| ------ | ---------- | ---------------------------------- |
| V1.0   | 2025-06-18 | 基于需求、设计及架构文档创建初始版本 |

## 1. 引言

### 1.1 目的
本文档旨在为「萌宠伙伴」微信小程序的前端开发团队提供一套统一的开发标准、技术选型、架构设计和功能实现逻辑。目标是确保前端代码的质量、可维护性、可扩展性，并高效地实现产品需求和设计规范。

### 1.2 适用范围
本文档适用于参与「萌宠伙伴」微信小程序前端开发的所有工程师、UI/UX设计师（作为参考）以及项目管理人员。

### 1.3 参考文档
- 《萌宠伙伴微信小程序需求规格说明书 V1.1》 (`require.md`)
- 《萌宠伙伴微信小程序设计规范 V1.0》 (`design_spec.md`)
- 《萌宠伙伴微信小程序系统架构设计文档 V1.0》 (`solution.md`)
- 微信官方小程序开发文档

## 2. 通用开发原则

- **组件化开发**：优先封装可复用的UI组件和业务组件，提高开发效率和代码一致性。
- **代码规范**：遵循统一的编码风格（如ESLint配置），编写清晰、易懂、可维护的代码。
- **性能优先**：关注小程序的启动速度、页面加载速度、渲染性能和操作响应速度。
- **用户体验至上**：严格按照设计规范实现UI/UX，确保交互流畅自然。
- **文档驱动**：重要组件和复杂逻辑需有必要的注释和文档说明。
- **版本控制**：使用Git进行版本控制，遵循规范的分支管理和提交信息。
- **测试保障**：编写必要的单元测试和集成测试，确保代码质量。

## 3. 技术选型

根据《系统架构设计文档 V1.0》4.1节，前端技术选型如下：

- **基础框架**：微信小程序原生框架。
- **状态管理**：`MobX` (推荐，用于复杂全局状态管理) 或小程序原生 `EventChannel` 及全局 `globalData`。
- **UI组件库**：优先使用微信官方 `WeUI`，并根据《设计规范文档 V1.0》自定义业务组件。可按需引入 `Vant Weapp` 等第三方库，注意包体积控制。
- **CSS预处理器**：`SCSS`。
- **HTTP请求库**：封装微信 `wx.request`，实现请求/响应拦截、Token管理、错误处理等。
- **工具库**：`lodash-wx` 或自行封装常用工具函数。
- **3D渲染**：根据需求复杂度和性能要求，可选择：
    - 轻量级：序列帧动画、`Lottie` 动画。
    - 效果更佳：`threejs-miniprogram` (微信官方) 或其他适配小程序的3D库。

## 4. 目录结构规范

遵循《系统架构设计文档 V1.0》4.2节推荐的目录结构，例如：

```
/miniprogram
  ├── app.js
  ├── app.json
  ├── app.wxss
  ├── assets/                     # 静态资源 (图片、字体、音频、Lottie JSON、3D模型)
  │   ├── images/
  │   ├── fonts/
  │   ├── audio/
  │   ├── lottie/
  │   └── models/
  ├── components/                 # 公共业务组件
  │   ├── PetDisplay/             # 宠物展示组件 (核心，含3D/2D渲染逻辑)
  │   │   ├── PetDisplay.js
  │   │   ├── PetDisplay.json
  │   │   ├── PetDisplay.wxml
  │   │   └── PetDisplay.wxss
  │   ├── InteractionButton/      # 互动按钮组件
  │   ├── StatusIndicator/        # 宠物状态指示器组件
  │   └── ...
  ├── pages/                      # 页面
  │   ├── auth/                   # 授权登录相关
  │   ├── main/                   # 主流程页面 (如宠物互动主页、个人中心)
  │   │   └── pet-interactive/    # 宠物互动主页
  │   │       ├── pet-interactive.js
  │   │       ├── pet-interactive.json
  │   │       ├── pet-interactive.wxml
  │   │       └── pet-interactive.scss
  │   ├── pet-generation/         # 宠物生成流程
  │   ├── mall/                   # 积分商城
  │   └── ...
  ├── services/                   # API服务封装
  │   ├── api.config.js           # API 基础配置 (baseURL等)
  │   ├── request.js              # 统一请求封装
  │   ├── auth.service.js         # 用户认证API
  │   ├── pet.service.js          # 宠物相关API
  │   └── interaction.service.js  # 互动相关API
  ├── store/                      # 全局状态管理 (MobX stores)
  │   ├── index.js                # MobX store 入口
  │   ├── user.store.js           # 用户信息store
  │   ├── pet.store.js            # 当前宠物信息及状态store
  │   └── ui.store.js             # UI状态store (如全局loading)
  ├── styles/                     # 全局样式、主题、mixin
  │   ├── _variables.scss         # SCSS变量 (颜色、字体、间距等，源于design_spec.md)
  │   ├── _mixins.scss            # SCSS mixin
  │   └── global.wxss             # 全局 WXSS
  ├── utils/                      # 工具函数
  │   ├── constants.js            # 全局常量
  │   ├── eventBus.js             # 简单的事件总线 (可选)
  │   ├── formatters.js           # 数据格式化函数
  │   └── validators.js           # 数据校验函数
  ├── subpackages/                # 分包 (按需)
  └── typings/                    # TypeScript类型定义 (如果使用TS)
```

## 5. 组件化开发指南

- **单一职责原则**：每个组件应只关注自身的功能和展现。
- **高内聚、低耦合**：组件内部逻辑紧密相关，组件间依赖尽可能少。
- **Props下行，Events上行**：父组件通过`props`向子组件传递数据，子组件通过触发自定义事件 (`triggerEvent`) 将信息传递给父组件。
- **插槽 (Slot)**：合理使用插槽提高组件的灵活性和可复用性。
- **样式隔离**：默认开启样式隔离 (`styleIsolation: 'isolated'`)，避免组件间样式冲突。如需共享样式，可使用外部样式类 (`externalClasses`) 或全局样式。
- **文档与示例**：重要公共组件需提供使用说明和示例代码。
- **命名规范**：组件文件名和组件名采用帕斯卡命名法 (PascalCase)，如 `PetDisplay`。

## 6. 状态管理 (MobX)

推荐使用 `MobX` 进行全局和复杂页面状态管理。

- **Store设计**：按业务领域划分Store，如 `UserStore`, `PetStore`。
  - `UserStore`: 管理用户登录状态、基本信息、Token等。
  - `PetStore`: 管理当前激活宠物的信息、各项状态值 (心情、饥饱度等)、互动历史等。
- **Observable State**：使用 `@observable` 标记需要追踪的状态。
- **Actions**：使用 `@action` 标记修改状态的方法，确保状态变更的可追踪性。
- **Computed Values**：使用 `@computed` 标记从现有状态派生的值。
- **Reactions**：使用 `autorun`, `reaction`, `when` 来响应状态变化并执行副作用 (如API请求、UI更新)。
- **Provider/Inject (或类似机制)**：在 `app.js` 中初始化全局Store，并通过页面或组件的 `this.store` 或特定注入方式访问。
  ```javascript
  // store/pet.store.js (示例)
  import { observable, action, computed } from 'mobx-miniprogram';

  export const petStore = observable({
    currentPet: null, // 当前宠物对象
    mood: 0,
    hunger: 0,
    cleanliness: 0,

    get isPetHappy() {
      return this.mood > 70;
    },

    setPetData: action(function (petData) {
      this.currentPet = petData.info;
      this.mood = petData.status.mood;
      this.hunger = petData.status.hunger;
      this.cleanliness = petData.status.cleanliness;
    }),

    updateMood: action(function (change) {
      this.mood = Math.max(0, Math.min(100, this.mood + change));
    }),
    // ...其他action
  });
  ```

## 7. API 集成与请求规范

- **统一请求函数**：在 `services/request.js` 中封装 `wx.request`。
  - **Base URL配置**：在 `services/api.config.js` 中配置不同环境的API基础路径。
  - **请求拦截器**：
    - 自动在请求头中添加 `Authorization` Token (从 `UserStore` 获取)。
    - 添加通用参数，如客户端版本、时间戳等。
    - 显示全局Loading提示 (可由 `UIStore` 控制)。
  - **响应拦截器**：
    - 统一处理后端返回的数据结构，剥离业务数据。
    - 根据后端定义的 `code` 进行错误处理：
      - Token失效 (如 `code: 40101`)：清除本地Token，跳转到登录页。
      - 业务错误 (如 `code: 50001`)：显示 `Toast` 提示错误信息。
      - 服务器错误 (HTTP 5xx)：显示通用错误提示。
    - 隐藏全局Loading提示。
- **Service层封装**：按模块在 `services/` 目录下创建对应的 `*.service.js` 文件，封装具体的API请求方法。
  ```javascript
  // services/pet.service.js (示例)
  import request from './request';
  import apiConfig from './api.config';

  export const fetchPetDetails = (petId) => {
    return request({ // request 函数返回 Promise
      url: `${apiConfig.baseURL}/v1/pets/${petId}`,
      method: 'GET',
    });
  };

  export const generatePet = (photoFormData) => {
    // 注意：wx.request 不直接支持 FormData，通常图片上传使用 wx.uploadFile
    // 此处假设后端有特定接口接收图片标识或其他形式数据
    return request({
      url: `${apiConfig.baseURL}/v1/pets/generate`,
      method: 'POST',
      data: photoFormData, // 或 photo_id
    });
  };
  ```
- **Loading状态**：对于页面级数据加载，使用骨架屏 (`Skeleton Screen`)。对于操作请求，使用 `Toast` 加载提示或按钮内置Loading状态。

## 8. 核心功能实现 - 前端逻辑

### 8.1 用户系统 (User System)

- **微信授权登录** (`pages/auth/login.js`)：
  1.  用户点击“微信授权登录”按钮。
  2.  调用 `wx.getUserProfile` 获取用户信息（昵称、头像等，需用户同意）。
  3.  调用 `wx.login()` 获取 `code`。
  4.  将 `code` 和用户信息（可选，根据后端接口设计）发送到后端 `/auth/wechat_login` 接口 (通过 `auth.service.js`)。
  5.  后端验证并返回自定义登录态 (JWT Token) 和用户信息。
  6.  前端将 Token 存入 `wx.setStorageSync` 和 `UserStore`，用户信息存入 `UserStore`。
  7.  跳转到主页或宠物生成页。
  8.  处理授权失败、登录失败的场景，给予用户提示。
- **个人信息管理** (`pages/main/profile.js`)：
  1.  从 `UserStore` 获取并展示用户信息。
  2.  编辑功能：跳转到编辑页，修改后调用后端接口保存，并更新 `UserStore`。

### 8.2 宠物生成 (Pet Generation)

- **照片上传** (`pages/pet-generation/upload.js`)：
  1.  引导用户使用 `wx.chooseMedia({ mediaType: ['image'], sourceType: ['album', 'camera'] })` 选择或拍摄照片。
  2.  前端进行图片预览，可集成简单的裁剪组件（如 `we-cropper`）让用户调整。
  3.  对图片大小、格式进行初步校验 (参考 `require.md` 3.2.1)。
  4.  调用 `wx.uploadFile` 将图片上传到后端 `/pet/upload_photo` 接口，或直接在生成步骤中传递base64/临时路径 (根据后端AI服务要求)。
  5.  显示上传进度。
- **宠物生成与确认** (`pages/pet-generation/confirm.js`)：
  1.  调用 `pet.service.js` 中的生成接口 (`/pet/generate`)，传递照片标识或处理后的图片数据。
  2.  接口返回生成的宠物模型数据 (可能是模型ID、关键特征参数、预览图URL等)。
  3.  **宠物展示**：
      - 使用 `PetDisplay` 组件展示宠物。该组件内部根据模型数据类型选择渲染方式：
          - **2D序列帧/Lottie**：加载对应的动画资源并播放。
          - **3D模型 (`threejs-miniprogram`)**：初始化3D场景，加载模型和纹理，允许用户拖拽旋转查看。
  4.  用户输入宠物名称，进行敏感词前端初筛。
  5.  点击“确认领养”，调用 `/pet/confirm_generation` 接口，成功后将新宠物信息更新到 `PetStore`，并跳转到宠物互动主页。
  6.  提供“重新生成”选项，重新调用生成接口（注意次数限制）。

### 8.3 宠物互动 (Pet Interaction - `pages/main/pet-interactive.js`)

这是小程序的核心交互页面，需要精心设计和实现。

**数据流与状态管理**：
- 当前宠物的所有状态 (心情、饥饱度、清洁度、等级、经验等) 由 `PetStore` 统一管理。
- 页面加载时，从 `PetStore` 获取宠物数据并初始化 `PetDisplay` 组件。
- `PetStore` 中的状态变化会自动触发 `PetDisplay` 组件的重绘或动画更新。

**核心组件**：
- **`PetDisplay` 组件** (`components/PetDisplay/`):
    - **Props**: `petModelData` (模型信息), `petStatus` (心情、饥饱度等), `currentAnimation` (当前应播放的动画名)。
    - **内部逻辑**:
        - 根据 `petModelData` 初始化渲染引擎 (2D/3D)。
        - 监听 `petStatus` 变化，触发不同的待机动画或表情变化 (如饥饿时播放乞食动画，开心时播放愉悦动画)。
        - 接收 `currentAnimation` prop，播放指定的互动动画 (如喂食动画、玩耍动画)。
        - **动画实现**:
            - **2D**: 控制 `Lottie` 实例播放不同片段，或切换 `Sprite` 表。
            - **3D (`threejs-miniprogram`)**: 管理动画混合器 (`AnimationMixer`)，播放模型内置的动画剪辑 (`AnimationClip`)。例如，模型可能包含 `idle_happy`, `idle_hungry`, `eat`, `play_fetch`, `being_petted` 等动画。
- **`InteractionButton` 组件** (`components/InteractionButton/`):
    - **Props**: `interactionType` (如 'feed', 'play'), `icon`, `label`, `disabled`.
    - **Events**: `onInteract` (当按钮被点击时触发)。
- **`StatusIndicator` 组件** (`components/StatusIndicator/`):
    - **Props**: `statusType` (如 'mood', 'hunger'), `value` (0-100), `label`.
    - **内部逻辑**: 根据 `value` 渲染进度条或特定图标状态。

**动作执行逻辑 (以“喂食”为例)**：

1.  **用户操作**：用户点击“喂食” `InteractionButton`。
2.  **前端初步处理** (`pet-interactive.js`):
    a.  触发 `onInteract` 事件，携带 `interactionType: 'feed'`。
    b.  (可选) 检查前置条件：如是否有食物库存 (从 `PetStore` 或背包数据获取)，宠物是否处于可喂食状态。
    c.  (可选) 弹出食物选择框/面板，让用户选择具体食物。
3.  **触发宠物动画 (即时反馈)**:
    a.  `pet-interactive.js` 更新 `PetStore` 或直接传递给 `PetDisplay` 组件一个表示“准备进食”或“进食中”的 `currentAnimation` 信号。
    b.  `PetDisplay` 组件接收到信号，播放对应的宠物进食动画。
    c.  播放喂食音效。
4.  **API请求**:
    a.  调用 `interaction.service.js` 中的喂食接口 (`/pet/{pet_id}/interact`)，参数包含 `interaction_type: 'feeding'`, `item_id: 'selected_food_id'`。
    b.  按钮进入Loading状态或暂时禁用，防止重复点击。
5.  **后端处理**：后端验证操作，计算状态变化 (饥饱度增加、心情值微增等)，更新数据库。
6.  **API响应与状态更新**:
    a.  后端返回成功响应，其中包含更新后的宠物状态值。
    b.  `pet-interactive.js` 收到响应后：
        i.  调用 `PetStore` 的 `action` (如 `petStore.updatePetStatus(newStatus)`) 更新全局宠物状态。
        ii. `PetStore` 的状态变化会通过 `MobX` 的响应式机制自动更新UI上所有依赖这些状态的组件 (如 `StatusIndicator`，以及 `PetDisplay` 可能因状态变化而改变的待机动画)。
    c.  按钮恢复正常状态。
    d.  (可选) 显示一个短暂的成功提示，如“豆豆吃得很开心！”。
7.  **错误处理**：如果API请求失败 (如网络错误、后端逻辑错误)，显示友好提示，宠物动画可能恢复到互动前状态或播放一个表示困惑/失败的动画。

**其他互动 (抚摸、玩耍、清洁、训练) 逻辑类似**：
- **抚摸 (Petting)**:
    - 用户在 `PetDisplay` 组件的可交互区域滑动或点击。
    - `PetDisplay` 组件内部捕获手势，判断是否为有效抚摸操作。
    - 触发 `being_petted` 动画和愉悦音效。
    - 调用后端抚摸接口，更新亲密度和心情值。
- **玩耍 (Playing)**:
    - 用户选择玩具，触发 `play_with_toy_X` 动画。
    - 调用后端玩耍接口，更新心情值、消耗体力（如有）。
- **清洁 (Cleaning)**:
    - 触发 `being_cleaned` 动画，宠物外观在动画结束时（或通过状态更新）变得“干净”。
    - 调用后端清洁接口，更新清洁度和心情值。
- **训练 (Training)**:
    - 可能涉及更复杂的交互，如引导宠物完成特定手势或小游戏。
    - 成功后触发 `training_success_X` 动画和奖励特效。
    - 调用后端训练接口，更新经验值、解锁技能。

**宠物自主行为与状态驱动表现**：
- `PetStore` 中可以有一个定时器或基于用户最后互动时间的逻辑，模拟宠物状态的自然衰减 (如饥饱度随时间下降)。
- `PetDisplay` 组件应能响应 `PetStore` 中状态值的变化，自动切换宠物的待机动画和表情：
    - `hunger < 30`: 播放饥饿相关的待机动画 (如舔嘴唇、发出乞食声音)。
    - `mood < 30`: 播放不开心的待机动画 (如垂头丧气)。
    - `cleanliness < 30`: 宠物模型外观可叠加“脏”的贴图或效果。

### 8.4 签到打卡系统 (`pages/checkin/index.js`)

- **UI展示**：使用 `CalendarCheckin` 组件展示日历和签到状态。
- **签到逻辑**：
  1.  页面加载时，调用后端接口获取当月签到记录和连续签到天数。
  2.  用户点击“签到”按钮，调用后端签到接口。
  3.  成功后更新本地日历状态和签到天数，显示奖励信息。
  4.  处理已签到、补签逻辑。

### 8.5 排行榜系统 (`pages/leaderboard/index.js`)

- **数据获取**：调用后端接口获取不同榜单数据。
- **列表渲染**：使用 `wx:for` 渲染排名列表，注意长列表性能优化 (如虚拟列表，如果排名非常多)。
- **UI**：遵循 `design_spec.md` 中的排行榜页面规范。

### 8.6 积分商城 (`pages/mall/index.js`, `pages/mall/productDetail.js`)

- **商品列表**：卡片式展示商品，包含图片、名称、积分价格。
- **商品详情**：展示商品大图、详细描述。
- **兑换逻辑**：
  1.  用户点击“兑换”按钮。
  2.  检查用户积分是否充足 (从 `UserStore` 获取)。
  3.  弹出确认弹窗。
  4.  确认后调用后端兑换接口。
  5.  成功后更新用户积分 (`UserStore`)，提示兑换成功。

## 9. UI/UX 实现指南

- **严格遵循《设计规范文档 V1.0》**：
    - **色彩系统**：在 `styles/_variables.scss` 中定义所有颜色变量，并在WXML/WXSS中统一使用。
    - **字体系统**：统一设置全局字体、字号、行高、字重。
    - **间距与布局**：使用 `8rpx` 栅格，确保页面元素的对齐和呼吸感。
    - **圆角规范**：统一各元素的圆角大小。
    - **组件样式**：自定义组件的样式需与设计稿一致。
- **交互动效**：
    - 页面切换动画：使用小程序提供的API或自定义实现平滑过渡。
    - 操作反馈：按钮点击、列表项选择等应有即时视觉反馈 (参考 `design_spec.md` 按钮状态)。
    - 加载动画、空状态、错误提示：按设计规范实现，提升用户体验。
- **图标使用**：使用 `assets/images/icons/` 下的SVG图标或字体图标，确保清晰度和一致性。

## 10. 性能优化

参考《系统架构设计文档 V1.0》4.5节，前端需重点关注：

- **分包加载**：将非核心功能（如积分商城、排行榜、个人设置的复杂子页面）放入分包。
- **图片优化**：
    - 使用CDN (如果架构支持)。
    - 选择合适的图片格式 (优先WebP，注意兼容性)。
    - 图片懒加载 (`lazy-load` 属性)。
    - 根据 `wx.getSystemInfoSync().pixelRatio` 为不同DPR的设备提供不同尺寸的图片资源 (如有必要)。
- **`setData` 优化**：
    - 减少调用频率。
    - 只传递变更的数据，避免传递过大的数据对象。
    - 对于列表的局部更新，使用 `setData({ ['list[0].name']: 'newName' })` 方式。
- **骨架屏 (Skeleton Screen)**：在页面数据加载时显示，改善感知体验。
- **虚拟列表**：对于非常长的列表 (如聊天记录、动态流、排行榜)，考虑使用虚拟列表技术减少渲染节点。
- **代码包体积**：
    - 清理无用代码和资源。
    - 组件按需引入。
    - 压缩代码 (小程序构建时会自动处理)。
- **首屏加载优化**：
    - 关键请求前置。
    - 避免在 `onLoad` 中执行过多同步耗时操作。
    - 利用 `wx.getStorageInfoSync` 提前加载缓存数据。

## 11. 前端测试

- **单元测试**：
    - 使用 `miniprogram-simulate` 或类似工具对自定义组件的逻辑和渲染输出进行测试。
    - 测试 `utils` 中的工具函数、`store` 中的 `action` 和 `computed` 属性。
- **集成测试**：测试多个组件协同工作、页面流程、API交互等。
- **E2E测试 (可选)**：使用 `Minium` (微信官方) 或其他自动化测试框架模拟用户操作，测试关键用户场景。
- **测试覆盖率**：争取核心模块和复杂逻辑有较高的测试覆盖率。

## 12. 构建与部署

- **微信开发者工具**：用于日常开发、调试、预览和上传代码。
- **CI/CD (持续集成/持续部署)**：
    - 结合Git仓库，配置自动化流程 (如使用 Jenkins, GitLab CI, GitHub Actions)。
    - 自动化构建、代码检查 (ESLint)、单元测试、上传代码到微信后台、发布体验版。
- **多环境配置**：通过 `project.config.json` 或自定义脚本管理不同环境 (开发、测试、生产) 的API域名、AppID等配置。

## 13. 版本控制 (Git)

- **分支模型**：推荐 `Git Flow` (master, develop, feature/xxx, release/xxx, hotfix/xxx) 或简化的 `GitHub Flow` (main, feature/xxx)。
- **提交规范**：遵循 `Conventional Commits` 规范，如 `feat: add pet feeding feature`，便于生成Changelog和版本管理。
- **Code Review**：所有代码合并到 `develop` 或 `master/main` 分支前必须经过至少一位其他团队成员的Review。

## 14. 附录

- **ESLint配置规则** (示例，具体根据团队约定调整)
- **SCSS编码规范**
- **常用第三方库列表及版本**

---
**文档结束**