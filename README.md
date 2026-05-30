# 🏔️ 山水相逢·旅途有你

一款中国风的旅游攻略分享平台，支持用户注册登录、城市查询、攻略发布、评论互动、管理员后台等功能。

---

## ✨ 功能特色

### 👤 用户系统
- 用户注册与登录
- JWT Token认证
- 密码加密存储
- 个人信息管理

### 🏙️ 城市探索
- 浏览热门城市
- 按省份筛选
- 查看城市详情
- 浏览计数

### 📝 攻略分享
- 发布旅游攻略
- 查看攻略列表
- 评论与点赞

### 🔐 管理员后台
- 管理员登录
- 用户管理
- 攻略管理
- 评论管理
- 数据统计

---

## 🚀 快速启动

### 环境要求
- Node.js 16+

### 安装运行
```bash
# 安装依赖
npm install

# 初始化数据
node init-db.js

# 启动服务器
npm start
```

### 访问地址
- 用户端：http://localhost:8888
- 管理后台：http://localhost:8888/admin.html

---

## 👤 账户信息

### 管理员账户
- **用户名：** `rement`
- **密码：** `rement06125`

### 普通用户
在注册页面自行注册

---

## 🌐 在线访问

项目已部署到 Render：
- **访问地址：** https://travel-app-r9zc.onrender.com
- **GitHub仓库：** https://github.com/hubbyd/2431271221-zhh

---

## 🔧 技术栈

- **后端：** Node.js + Express
- **前端：** HTML5 + CSS3 + JavaScript
- **数据存储：** JSON文件（可扩展为MySQL）
- **部署：** Render

---

## 📁 项目结构

```
travel/
├── server.js              # 后端服务器
├── init-db.js            # 数据初始化
├── package.json          # 项目配置
├── data.json            # 数据存储
├── public/
│   ├── index.html       # 用户端
│   └── admin.html       # 管理后台
├── 数据库原理课程设计报告.md   # 课程设计报告
├── 数据库原理课程设计报告.doc   # Word文档
└── README.md
```

---

**祝您使用愉快！** 🎋
