# 萌宠伙伴 - AI宠物微信小程序

## 项目简介

萌宠伙伴是一款基于人工智能技术的虚拟宠物养成微信小程序。用户可以通过上传照片生成专属的虚拟宠物，与宠物进行多样化互动，体验养宠的乐趣。项目融合了AI图像识别、3D建模、游戏化设计等前沿技术，为用户提供沉浸式的虚拟宠物体验。

## 核心功能

### 🎯 AI宠物生成
- **智能识别**：基于AI图像识别技术，分析用户上传的照片特征
- **个性化生成**：根据照片特征生成独特的虚拟宠物形象
- **多样化外观**：支持不同品种、颜色、特征的宠物生成
- **3D模型展示**：提供立体、生动的宠物展示效果

### 🎮 互动养成系统
- **基础互动**：喂食、抚摸、玩耍、清洁、训练等多种互动方式
- **状态管理**：心情值、饥饱度、清洁度、亲密度、经验值等状态系统
- **动态反馈**：宠物根据状态变化展现不同的动画和表情
- **成长系统**：通过互动获得经验值，宠物等级提升解锁新功能

### 📅 签到打卡
- **每日签到**：每日登录获得积分奖励
- **连续奖励**：连续签到获得额外奖励
- **补签功能**：支持消耗积分进行补签
- **日历展示**：直观展示签到记录和奖励预览

### 🏆 排行榜系统
- **多维度排名**：等级榜、亲密度榜、互动榜等
- **好友排行**：与微信好友进行排名比较
- **实时更新**：排行榜数据定期更新
- **激励机制**：增加用户竞争性和参与度

### 🛒 积分商城
- **虚拟商品**：宠物装饰、互动道具、功能性道具
- **积分系统**：通过签到、互动、任务获得积分
- **兑换机制**：使用积分兑换各类商品
- **订单管理**：完整的兑换记录和状态跟踪

## 技术架构

### 前端技术栈
- **框架**：微信小程序原生框架
- **开发语言**：JavaScript + WXML + WXSS
- **状态管理**：MobX
- **3D渲染**：threejs-miniprogram
- **动画**：Lottie动画 + 原生动画
- **UI组件**：自定义组件库

### 后端技术栈
- **编程语言**：Node.js + TypeScript
- **Web框架**：Express.js / NestJS
- **数据库**：MySQL (用户数据) + MongoDB (宠物数据)
- **缓存**：Redis
- **消息队列**：RabbitMQ
- **容器化**：Docker + Kubernetes

### AI技术
- **图像识别**：人脸特征提取和分析
- **模型生成**：基于特征的参数化3D建模
- **风格化处理**：图像到宠物形象的转换

### 基础设施
- **云平台**：腾讯云/阿里云
- **CDN**：静态资源加速
- **对象存储**：图片和模型文件存储
- **监控**：Prometheus + Grafana
- **CI/CD**：自动化构建和部署

## 项目结构

```
aipet/
├── frontend/                 # 微信小程序前端
│   ├── pages/               # 页面文件
│   ├── components/          # 自定义组件
│   ├── services/            # API服务
│   ├── stores/              # 状态管理
│   ├── utils/               # 工具函数
│   └── assets/              # 静态资源
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── models/          # 数据模型
│   │   ├── middleware/      # 中间件
│   │   └── utils/           # 工具函数
│   ├── config/              # 配置文件
│   └── tests/               # 测试文件
├── cms/                     # 内容管理系统
│   ├── src/
│   │   ├── pages/           # 管理页面
│   │   ├── components/      # 组件
│   │   └── services/        # API服务
│   └── public/              # 静态文件
└── docs/                    # 项目文档
```

## 核心特性

### 🔒 安全性
- **数据加密**：用户数据加密存储和传输
- **身份认证**：微信OAuth + JWT Token
- **权限控制**：基于角色的访问控制
- **API安全**：接口限流、输入校验、防刷机制

### ⚡ 性能优化
- **分包加载**：减少主包体积，提升加载速度
- **图片优化**：CDN加速、格式优化、懒加载
- **缓存策略**：多层缓存提升响应速度
- **数据库优化**：索引优化、查询优化

### 📱 用户体验
- **响应式设计**：适配不同机型和屏幕尺寸
- **流畅动画**：60fps的流畅交互体验
- **即时反馈**：操作即时响应和状态更新
- **友好提示**：完善的错误处理和用户引导

### 🔧 可维护性
- **模块化设计**：清晰的代码结构和模块划分
- **代码规范**：统一的编码标准和最佳实践
- **自动化测试**：单元测试、集成测试覆盖
- **监控告警**：完善的系统监控和告警机制

## 开发环境搭建

### 前端开发
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 使用微信开发者工具打开项目
```

### 后端开发
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
npm run dev
```

### CMS开发
```bash
# 进入CMS目录
cd cms

# 安装依赖
npm install

# 启动开发服务器
npm run serve
```

## 部署说明

### 环境要求
- Node.js 14.0+
- MySQL 8.0+
- MongoDB 4.4+
- Redis 6.0+
- Docker & Kubernetes

### 部署步骤
1. **构建镜像**：使用Docker构建各服务镜像
2. **配置环境**：设置生产环境配置文件
3. **数据库初始化**：执行数据库迁移脚本
4. **服务部署**：使用Kubernetes部署服务
5. **域名配置**：配置域名和SSL证书
6. **监控配置**：设置监控和告警

## 业务规则

### 积分系统
- 每日签到：10积分
- 连续签到奖励：5×N积分（N为连续天数）
- 宠物互动：2积分/次（每日上限20积分）
- 好友互动：5积分/次（每日上限25积分）
- 完成任务：10-100积分不等

### 等级系统
- 宠物等级：通过互动获得经验值提升
- 用户等级：基于活跃度和贡献度
- 等级特权：解锁新功能、装饰品和特殊权益

## 未来规划

### 短期目标
- [ ] 完善AI宠物生成算法
- [ ] 优化3D渲染性能
- [ ] 增加更多互动方式
- [ ] 完善社交功能

### 长期愿景
- [ ] 引入NLP实现宠物对话
- [ ] 开发AR宠物互动功能
- [ ] 扩展到多平台支持
- [ ] 构建宠物社区生态

## 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

- 项目维护者：[项目团队]
- 邮箱：[联系邮箱]
- 问题反馈：[GitHub Issues](https://github.com/chellen021/aipets/issues)

---

**萌宠伙伴** - 让AI技术为虚拟宠物注入生命力，创造温暖有趣的数字陪伴体验。
aipets
