# 🚀 山河旅图Pro - 手动启动指南

## ⚠️ 重要提示

由于某些依赖包需要编译，在当前环境遇到了权限问题。
请按以下步骤**手动**完成部署。

---

## 📝 手动部署步骤

### 第一步：以管理员身份打开命令提示符

1. 按 `Win + X`
2. 选择 **"Windows PowerShell (管理员)"** 或 **"命令提示符 (管理员)"**
3. 如果弹出"用户账户控制"，点击 **"是"**

### 第二步：进入项目目录

```bash
cd D:\profiles-vscode\travel
```

### 第三步：安装依赖

```bash
npm install
```

> **如果报错"权限不足"或"EPERM"：**
> ```bash
> # 先清理缓存
> npm cache clean --force
>
> # 然后重试
> npm install
> ```

### 第四步：初始化数据库

```bash
npm run init-db
```

### 第五步：启动服务器

```bash
npm start
```

---

## ✅ 启动成功后

### 访问应用

**用户端：**
👉 http://localhost:8080

**管理员后台：**
👉 http://localhost:8080/admin.html

### 管理员账户

- **用户名：** `admin`
- **密码：** `admin2024`
- **后台密钥：** `admin2024`

---

## 🎯 功能测试

### 1. 用户注册
1. 打开 http://localhost:8080
2. 点击"我的" → "登录"
3. 切换到"注册"标签
4. 填写信息并注册
5. 注册后自动登录

### 2. 查看所有用户
1. 打开 http://localhost:8080/admin.html
2. 输入密钥：`admin2024`
3. 点击登录
4. 查看所有注册用户列表

### 3. 使用AI助手
1. 在首页选择城市（如：西安）
2. 选择天数和预算
3. 点击"生成旅行计划"
4. 查看详细攻略

---

## 🔧 常见问题

### Q: npm install 失败？
**A:** 尝试以下命令：
```bash
# 以管理员身份运行
npm cache clean --force
npm install --legacy-peer-deps
```

### Q: 端口被占用？
**A:** 修改 `server.js` 中的端口号（例如改成 3000），然后重启

### Q: 数据库错误？
**A:** 删除 `travel.db` 文件，重新运行：
```bash
npm run init-db
```

---

## 📱 让其他人访问

### 方法一：ngrok（推荐）
1. 下载 ngrok：https://ngrok.com/download
2. 运行：`ngrok http 8080`
3. 复制生成的URL分享给朋友

### 方法二：部署到云服务器
- 阿里云 ECS
- 腾讯云 CVM
- 华为云 ECS

---

## 📁 项目文件

| 文件 | 说明 |
|-----|------|
| `server.js` | 后端服务器 |
| `init-db.js` | 数据库初始化 |
| `public/index.html` | 用户端 |
| `public/admin.html` | 管理员后台 |
| `package.json` | 项目配置 |
| `START.bat` | 一键启动（可能有权限问题） |
| `START.ps1` | PowerShell启动脚本 |

---

## 💪 代码已就绪！

所有功能代码已完整准备，只需运行上述命令即可启动完整的后端系统！

**包括：**
- ✅ 用户注册登录
- ✅ JWT认证
- ✅ 管理员后台（查看/删除用户）
- ✅ AI旅行计划生成
- ✅ SQLite数据库存储
- ✅ 验证码API

---

**祝您使用愉快！** 🎉
