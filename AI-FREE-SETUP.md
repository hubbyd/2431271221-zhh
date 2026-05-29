# 🤖 AI助手免费API配置指南

## 🌟 推荐免费AI API

### 1️⃣ Groq（强烈推荐）
- **特点**：完全免费、速度极快、支持LLaMA模型
- **网址**：https://console.groq.com/
- **注册**：使用Google/GitHub账号登录
- **获取Key**：创建API Key即可使用
- **免费额度**：无限使用！

### 2️⃣ 硅基流动（国内推荐）
- **特点**：国内可用、有免费额度、支持通义千问
- **网址**：https://www.siliconflow.cn/
- **注册**：手机号注册
- **获取Key**：在控制台创建API Key
- **免费额度**：每天有免费tokens

### 3️⃣ OpenRouter
- **特点**：聚合多个模型、有免费选项
- **网址**：https://openrouter.ai/
- **注册**：邮箱注册
- **获取Key**：创建API Key
- **免费额度**：部分模型免费

---

## 🚀 配置步骤

### 方法一：环境变量（推荐）

在启动服务器前设置环境变量：

**Groq（完全免费）：**
```bash
# Windows
set AI_PROVIDER=groq
set AI_API_KEY=gsk_xxxxxxxxxxxxx
npm start
```

**硅基流动（国内可用）：**
```bash
# Windows
set AI_PROVIDER=siliconflow
set AI_API_KEY=sk-xxxxxxxxxxxxx
npm start
```

### 方法二：管理员后台设置

1. 访问 http://localhost:8080/admin.html
2. 登录（密钥：admin2024）
3. 在设置中添加API密钥

### 方法三：修改启动脚本

创建 `START-AI.bat`：

```batch
@echo off
set AI_PROVIDER=groq
set AI_API_KEY=你的API密钥
npm start
```

---

## 📝 获取API密钥详细步骤

### Groq（最简单，完全免费）

1. 打开：https://console.groq.com/
2. 点击"Sign in with Google"或"Sign in with GitHub"
3. 登录后进入 Dashboard
4. 点击左侧"API Keys"
5. 点击"Create API Key"
6. 复制生成的密钥（以 `gsk_` 开头）
7. 在终端运行：
```bash
set AI_PROVIDER=groq
set AI_API_KEY=gsk_你复制的密钥
npm start
```

### 硅基流动（国内访问快）

1. 打开：https://www.siliconflow.cn/
2. 点击"立即体验"
3. 用手机号注册/登录
4. 进入控制台 → API密钥
5. 点击"新建密钥"
6. 复制密钥
7. 在终端运行：
```bash
set AI_PROVIDER=siliconflow
set AI_API_KEY=sk-你复制的密钥
npm start
```

---

## ✅ 验证配置

启动服务器后，看到以下信息表示成功：

```
🤖 AI状态: 已启用 (Groq - 免费)
```

如果看到：
```
🤖 AI状态: 未启用 (本地模式)
```

说明API密钥未设置或设置失败。

---

## 🔧 测试AI功能

1. 打开 http://localhost:8080
2. 登录账号
3. 点击底部"AI助手"
4. 输入："西安3天怎么玩？"
5. 查看AI回复

---

## 💡 常见问题

### Q: Groq注册不了？
**A:** 可能需要翻墙，使用硅基流动（国内可用）

### Q: API密钥在哪里？
**A:** 
- Groq: https://console.groq.com/keys
- 硅基流动: https://www.siliconflow.cn/

### Q: 显示"本地模式"？
**A:** API密钥未设置，检查环境变量是否正确设置

### Q: API调用失败？
**A:** 检查API密钥是否正确，是否过期

---

## 🎯 建议

**首选 Groq**：
- ✅ 完全免费
- ✅ 速度快
- ✅ 支持中文
- ❌ 需要翻墙

**备选 硅基流动**：
- ✅ 国内可用
- ✅ 免费额度
- ⚠️ 额度有限

---

**配置完成后，您的AI助手就可以智能对话了！** 🚀
