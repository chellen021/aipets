# CMS 后台开发日志

本文档记录 CMS 后台的开发过程和关键决策。

## 开发计划

1.  **创建`cmsdevlog.md`文件**：在`cms`文件夹中创建`cmsdevlog.md`文件，用于记录后续的开发过程。
2.  **用户管理功能开发**：
    *   查看用户列表：实现查看用户基本信息的功能。
    *   查看用户详情：实现查看特定用户详细信息的功能。
    *   （可选）修改用户状态：实现修改用户状态的功能（如封禁/解封），需要严格的权限控制和审计日志。
    *   （可选）调整用户积分：实现调整用户积分的功能，需要严格的权限控制和审计日志。
3.  **宠物数据查阅功能开发**：
    *   查看宠物列表：实现查看宠物列表的功能。
    *   查看宠物详情：实现查看特定宠物详情的功能。
    *   （可选）管理宠物名称：实现管理宠物名称的功能（如敏感词审核与修改）。
4.  **积分商城管理功能开发**：
    *   商品管理 (CRUD)：实现商品信息的增删改查功能。
    *   商品分类管理（如果需要）：实现商品分类的管理功能。
    *   订单查阅：实现查看用户兑换订单记录的功能。
5.  **签到系统配置功能开发**：
    *   每日签到奖励配置：实现配置每日签到可获得的积分或道具的功能。
    *   连续签到奖励配置：实现配置连续签到特定天数的额外奖励内容和数量的功能。
    *   补签规则配置：实现配置补签消耗的积分或道具，以及补签限制的功能。
6.  **排行榜管理功能开发**：
    *   查阅当前各排行榜数据：实现查阅当前各排行榜数据的功能（主要用于运营监控）。
    *   （可选）配置排行榜奖励规则或周期性活动关联：实现配置排行榜奖励规则或周期性活动关联的功能。
7.  **通知模板管理功能开发**：
    *   管理微信订阅消息的模板内容：实现管理微信订阅消息的模板内容，允许运营人员修改通知文案中的变量部分的功能。
8.  **系统配置管理功能开发**：
    *   管理全局配置项：实现管理全局配置项，如 AI 模型参数（如果允许后台调整）、特定功能的开关、默认值等的功能。
    *   敏感词库管理：实现敏感词库管理的功能。
9.  **CMS自身用户与权限管理功能开发**：
    *   创建和管理CMS后台操作员账号：实现创建和管理CMS后台操作员账号的功能。
    *   分配不同的角色和权限给操作员：实现分配不同的角色和权限给操作员的功能。

## 开发记录

### 2025-06-17

-   创建 `cms/cmsdevlog.md` 文件，初始化开发日志和开发计划。