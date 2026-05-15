# 🏔️ 山河旅图Pro - 智能旅游社交平台

一款精美的移动端旅游社交应用，支持AI智能旅行规划、城市探索、旅行动态分享等功能。

## ✨ 功能特点

### 🎯 核心功能
- **AI智能规划**: 输入城市名，一键生成专属旅行计划（行程、酒店、美食、预算）
- **城市探索**: 支持按省份筛选，浏览12个热门旅游城市
- **旅行动态**: 发布旅行分享、点赞、评论、分享
- **个人中心**: 管理旅行计划、查看个人数据

### 🎨 设计亮点
- 现代化移动端UI设计
- 流畅的页面切换动画
- 响应式布局，适配各种屏幕
- 精美的卡片式设计

### 🚀 技术优势
- **纯前端架构**: 可直接部署到GitHub Pages，无需后端服务器
- **本地存储**: 使用LocalStorage保存数据，保护用户隐私
- **离线可用**: 城市数据内置，应用加载快速
- **零依赖**: 不依赖任何外部API，即开即用

## 📱 快速体验

### 方式一：本地运行
1. 直接在浏览器中打开 `public/index.html` 文件
2. 即可体验所有功能

### 方式二：GitHub Pages部署
1. 将整个项目推送到GitHub仓库
2. 进入仓库 Settings → Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 `main` (或 `master`)，文件夹选择 `/ (root)`
5. 点击 Save，等待部署完成
6. 访问 `https://你的用户名.github.io/仓库名`

## 🛠️ 项目结构

```
travel-app/
├── public/
│   └── index.html      # 主应用文件（包含所有代码）
├── server.js          # Node.js后端（可选，需要后端时使用）
├── init-db.js         # 数据库初始化（可选）
├── package.json       # 项目配置
└── README.md          # 项目说明
```

## 🎯 使用指南

### 首页
- 查看热门城市推荐
- 使用快捷功能入口
- AI助手快速生成计划

### 探索
- 浏览所有城市
- 按省份筛选
- 点击城市查看详情

### AI助手
- 输入格式：`去XX玩X天`
- 例如：`去成都玩3天`
- 自动生成详细旅行计划

### 旅行动态
- 发布旅行分享
- 点赞、评论、分享

## 🔧 自定义城市数据

在 `public/index.html` 中找到 `cities` 数组，可以添加更多城市：

```javascript
const cities = [
    {
        id: 13,
        name: '城市名',
        province_name: '省份',
        highlights: '亮点1,亮点2',
        attractions: '景点1,景点2',
        food: '美食1、美食2',
        hotels: '酒店1/酒店2',
        bestSeason: '最佳季节',
        avgStayDays: 3,
        hotelDay: 200,
        mealDay: 100,
        route: 'Day1:行程\nDay2:行程'
    },
    // 更多城市...
];
```

## 🎨 自定义样式

在 `public/index.html` 的 `<style>` 部分可以自定义：

- 主题色：`--primary`
- 背景色：`--bg`
- 圆角大小：`--radius-*`
- 阴影效果：`--shadow`

## 📄 开源协议

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请通过GitHub Issues联系我们。

---

**让每一次旅行，都成为难忘的故事** 🌍✨
