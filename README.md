# 🏔️ 山河旅图Pro - 智能旅游社交平台

> 一款功能完整的智能旅游规划与社交平台，支持用户注册登录、AI旅行计划生成、管理员后台等功能。

---

## ✨ 功能特色

### 👤 用户系统
- ✅ 用户注册与登录
- ✅ JWT Token认证
- ✅ 密码加密存储
- ✅ 个人信息管理
- ✅ 头像和昵称更换

### 🔐 管理员后台
- ✅ 查看所有注册用户
- ✅ 搜索用户
- ✅ 删除用户
- ✅ 查看统计数据

### 🤖 AI旅行助手
- ✅ 输入城市、天数、预算
- ✅ 自动生成详细旅行攻略
- ✅ 每日行程安排
- ✅ 住宿、美食推荐
- ✅ 预算计算

### 👥 社交功能
- ✅ 发布旅行动态
- ✅ 评论和点赞
- ✅ 好友系统
- ✅ 在线状态显示

---

## 🚀 快速启动

### 环境要求
- Node.js 16+ 版本
- npm 或 yarn

### 安装步骤

#### 方法一：手动安装（推荐）

1. **打开命令提示符（管理员）**
   - 按 `Win + X`
   - 选择 "Windows PowerShell (管理员)"

2. **进入项目目录**
   ```bash
   cd D:\profiles-vscode\travel
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **初始化数据库**
   ```bash
   npm run init-db
   ```

5. **启动服务器**
   ```bash
   npm start
   ```

6. **访问应用**
   - 用户端：http://localhost:8080
   - 管理员后台：http://localhost:8080/admin.html

#### 方法二：使用启动脚本

1. **右键** `START.bat`
2. **选择"以管理员身份运行"**

---

## 👤 账户信息

### 管理员账户
- **用户名：** `admin`
- **密码：** `admin2024`
- **后台密钥：** `admin2024`

### 普通用户
在注册页面自行注册

---

## 📱 功能测试

### 1. 测试用户注册
1. 访问 http://localhost:8080
2. 点击"我的" → "登录"
3. 切换到"注册"标签
4. 填写用户名、密码、昵称
5. 点击注册

### 2. 测试管理员功能
1. 访问 http://localhost:8080/admin.html
2. 输入密钥：`admin2024`
3. 查看所有用户列表

### 3. 测试AI助手
1. 在首页选择城市
2. 选择天数和预算
3. 点击"生成旅行计划"

---

## 🔧 项目结构

```
travel/
├── server.js           # 后端服务器主文件
├── init-db.js          # 数据库初始化脚本
├── package.json         # 项目配置
├── travel.db           # SQLite数据库文件
├── public/
│   ├── index.html     # 用户端应用
│   └── admin.html     # 管理员后台
├── START.bat          # Windows一键启动
├── START.ps1         # PowerShell启动脚本
├── MANUAL-START-GUIDE.md  # 手动启动指南
└── README.md         # 本文档
```

---

## 🌐 API接口

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户

### 管理员接口
- `GET /api/admin/users` - 获取所有用户
- `DELETE /api/admin/users/:id` - 删除用户

### 验证码
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/verify-code` - 验证验证码

### 其他
- `GET /api/stats` - 统计数据
- `GET /api/cities` - 城市列表

---

## 🔐 数据库表结构

- **users** - 用户表
- **user_stats** - 用户统计
- **verification_codes** - 验证码
- **posts** - 帖子
- **comments** - 评论
- **likes** - 点赞
- **friends** - 好友
- **messages** - 私信
- **cities** - 城市数据
- **ai_plans** - AI旅行计划

---

## 🌐 部署到互联网

### 方法一：ngrok内网穿透
```bash
# 安装ngrok
npm install -g ngrok

# 启动本地服务
npm start

# 在另一个终端运行
ngrok http 8080

# 分享生成的URL
```

### 方法二：部署到云服务器
1. 购买阿里云/腾讯云服务器
2. 安装 Node.js
3. 上传项目文件
4. 运行 `npm install && npm run init-db && npm start`
5. 配置域名和SSL证书

### 方法三：使用免费平台
- Railway.app
- Render.com
- Fly.io

---

## ⚠️ 常见问题

### Q: npm install 失败？
**A:** 以管理员身份运行命令提示符，并执行：
```bash
npm cache clean --force
npm install
```

### Q: 端口被占用？
**A:** 修改 server.js 中的端口号，然后重启

### Q: 数据库错误？
**A:** 删除 travel.db，运行 `npm run init-db`

### Q: 管理员后台无法访问？
**A:** 确保服务器正在运行，访问 http://localhost:8080/admin.html

---

## 📞 技术支持

如有问题，请：
1. 查看控制台错误信息
2. 重新运行 `npm run init-db`
3. 检查 Node.js 版本（需要 16+）

---

## 🎯 后续开发建议

### 接入真实短信API
1. 注册腾讯云或阿里云短信服务
2. 修改 `/api/auth/send-code` 接口

### 添加更多城市
在 init-db.js 中添加更多城市数据

### 完善社交功能
- 添加私信实时通知
- 添加图片上传功能
- 添加话题标签

### 性能优化
- 添加 Redis 缓存
- 添加数据库索引
- 前端代码优化

---

**版本：2.0.0**
**更新时间：2024年**

**祝您使用愉快！** 🚀
