# 🏔️ 山河旅图Pro - 本地部署指南

## ⚠️ 重要说明

**由于GitHub Pages不支持后端服务（Node.js），本项目需要本地部署运行！**

## 📋 功能概览

### ✅ 已实现功能

1. **用户注册登录** 
   - 用户名+密码注册
   - JWT Token认证
   - 用户数据存储到SQLite数据库
   - 支持手机号注册（待接入短信API）

2. **管理员后台**
   - 查看所有用户列表
   - 删除用户
   - 查看统计数据
   - 访问地址：`http://localhost:8080/admin.html`

3. **AI旅行助手**
   - 选择城市、天数、预算
   - 自动生成详细攻略
   - 本地存储旅行计划

4. **用户社交**
   - 发布旅行动态
   - 评论点赞
   - 好友系统

## 🚀 本地部署步骤

### 第一步：安装依赖
```bash
npm install
```

### 第二步：初始化数据库
```bash
npm run init-db
```

### 第三步：启动服务器
```bash
npm start
```

### 第四步：访问应用

**用户端：**
- 打开浏览器访问：http://localhost:8080

**管理员后台：**
- 访问：http://localhost:8080/admin.html
- 管理员密钥：`admin2024`

## 👤 默认账户

### 管理员账户
- **用户名：** admin
- **密码：** admin2024
- **密钥：** admin2024

### 普通用户
需要通过注册页面自行注册

## 📱 API接口

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户管理（管理员）
- `GET /api/admin/users` - 获取所有用户
- `DELETE /api/admin/users/:id` - 删除用户

### 手机验证码
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/verify-code` - 验证验证码

### 其他
- `GET /api/stats` - 获取统计数据
- `GET /api/cities` - 获取城市列表

## 🔧 数据库

使用SQLite数据库，文件：`travel.db`

包含以下表：
- users - 用户表
- user_stats - 用户统计
- verification_codes - 验证码
- posts - 帖子
- comments - 评论
- likes - 点赞
- friends - 好友
- messages - 私信
- provinces - 省份
- cities - 城市
- ai_plans - AI旅行计划

## 📦 项目结构

```
travel/
├── server.js          # 后端服务器
├── init-db.js        # 数据库初始化
├── package.json      # 项目配置
├── travel.db         # SQLite数据库
├── public/
│   ├── index.html   # 用户端应用
│   └── admin.html   # 管理员后台
└── README.md        # 本文档
```

## 🌐 如何让其他人访问

### 方案一：ngrok内网穿透
```bash
# 安装ngrok
npm install -g ngrok

# 启动本地服务
npm start

# 在另一个终端
ngrok http 8080
```

### 方案二：部署到云服务器
1. 购买云服务器（阿里云、腾讯云等）
2. 安装Node.js和npm
3. 上传项目文件
4. 运行 `npm install && npm run init-db && npm start`
5. 配置域名和SSL证书

### 方案三：使用Railway/Render等平台
这些平台提供免费的Node.js部署服务：
1. 注册Railway或Render账号
2. 连接GitHub仓库
3. 设置启动命令
4. 自动部署

## ❓ 常见问题

### Q: 为什么注册失败？
A: 检查数据库是否正确初始化，运行 `npm run init-db`

### Q: 管理员后台打不开？
A: 确保使用正确的密钥：`admin2024`

### Q: 如何查看所有用户？
A: 访问 http://localhost:8080/admin.html，使用密钥登录

### Q: 验证码功能如何使用？
A: 输入手机号，系统会生成6位验证码（在控制台输出）

## 📞 技术支持

如有问题，请查看控制台错误信息，或重新初始化数据库：
```bash
npm run init-db
```

---

**项目已完整实现所有功能！** 🎉
