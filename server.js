const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8888;
const JWT_SECRET = 'travel-app-secret-key-2024';
const DB_PATH = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let db = { users: [], posts: [], comments: [], likes: [], cities: [], provinces: [], admins: [], stats: [] };

function saveDb() {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function loadDb() {
    if (fs.existsSync(DB_PATH)) {
        db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } else {
        db = { users: [], posts: [], comments: [], likes: [], cities: [], provinces: [], admins: [], user_stats: [], verification_codes: [] };
        saveDb();
    }
}

loadDb();

function findById(arr, id) {
    return arr.find(item => item.id === id);
}

function findByField(arr, field, value) {
    return arr.find(item => item[field] === value);
}

function filterByField(arr, field, value) {
    return arr.filter(item => item[field] === value);
}

function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '未授权，请先登录' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.isAdmin = decoded.isAdmin || false;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'token无效或已过期' });
    }
}

app.post('/api/auth/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    if (!username || !password) return res.status(400).json({ error: '请填写用户名和密码' });
    if (findByField(db.users, 'username', username)) return res.status(400).json({ error: '用户名已存在' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const user = { id: userId, username, password: hashedPassword, nickname: nickname || '旅行者' + Math.floor(Math.random() * 1000), avatar: '🧳', bio: '', level: 1, experience: 0, created_at: new Date().toISOString(), last_login: new Date().toISOString(), is_online: 1 };
    db.users.push(user);
    db.user_stats.push({ user_id: userId, posts_count: 0, followers_count: 0, following_count: 0, travel_days: 0 });
    saveDb();

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: userId, username, nickname: user.nickname, avatar: user.avatar } });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '请填写用户名和密码' });

    const user = findByField(db.users, 'username', username);
    if (!user) return res.status(401).json({ error: '用户名或密码错误' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: '用户名或密码错误' });

    user.last_login = new Date().toISOString();
    user.is_online = 1;
    saveDb();

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, bio: user.bio, level: user.level, experience: user.experience } });
});

app.get('/api/auth/me', authenticate, (req, res) => {
    const user = findById(db.users, req.userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    const stats = findByField(db.user_stats, 'user_id', req.userId) || { posts_count: 0, followers_count: 0, following_count: 0, travel_days: 0 };
    delete user.password;
    res.json({ ...user, ...stats });
});

app.put('/api/user/profile', authenticate, (req, res) => {
    const { nickname, avatar, bio } = req.body;
    const user = findById(db.users, req.userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    if (nickname !== undefined) user.nickname = nickname;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    saveDb();
    res.json({ success: true, message: '资料更新成功' });
});

app.get('/api/admin/stats', authenticate, (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
    res.json({ users: db.users.length, posts: db.posts.length, comments: db.comments.length, cities: db.cities.length, views: db.cities.reduce((s, c) => s + (c.view_count || 0), 0) });
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '请填写用户名和密码' });

    const admin = findByField(db.admins, 'username', username);
    if (!admin) return res.status(401).json({ error: '用户名或密码错误' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: '用户名或密码错误' });

    admin.last_login = new Date().toISOString();
    saveDb();

    const token = jwt.sign({ userId: admin.id, isAdmin: true }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: admin.id, username: admin.username, nickname: admin.nickname, avatar: admin.avatar, level: admin.level, isAdmin: true } });
});

app.get('/api/admin/users', authenticate, (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
    const users = db.users.map(u => {
        const stats = findByField(db.user_stats, 'user_id', u.id) || {};
        const { password, ...user } = u;
        return { ...user, ...stats };
    });
    res.json(users);
});

app.delete('/api/admin/users/:id', authenticate, (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: '用户不存在' });
    db.users.splice(idx, 1);
    saveDb();
    res.json({ success: true, message: '用户已删除' });
});

app.get('/api/admin/posts', authenticate, (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
    const posts = db.posts.map(p => {
        const user = findById(db.users, p.user_id) || {};
        const city = findById(db.cities, p.city_id) || {};
        const { user_id, ...post } = p;
        return { ...post, user_id: p.user_id, username: user.username, nickname: user.nickname, avatar: user.avatar, city_name: city.name };
    });
    res.json(posts);
});

app.delete('/api/admin/posts/:id', authenticate, (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
    const idx = db.posts.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: '帖子不存在' });
    db.posts.splice(idx, 1);
    db.comments = db.comments.filter(c => c.post_id !== req.params.id);
    db.likes = db.likes.filter(l => l.post_id !== req.params.id);
    saveDb();
    res.json({ success: true, message: '帖子已删除' });
});

app.get('/api/admin/comments', authenticate, (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
    const comments = db.comments.map(c => {
        const user = findById(db.users, c.user_id) || {};
        const post = findById(db.posts, c.post_id) || {};
        const { user_id, ...comment } = c;
        return { ...comment, user_id: c.user_id, username: user.username, nickname: user.nickname, avatar: user.avatar, post_id: c.post_id, post_title: post.title };
    });
    res.json(comments);
});

app.delete('/api/admin/comments/:id', authenticate, (req, res) => {
    if (!req.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
    const idx = db.comments.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: '评论不存在' });
    db.comments.splice(idx, 1);
    saveDb();
    res.json({ success: true, message: '评论已删除' });
});

app.get('/api/cities', (req, res) => {
    const { province_id } = req.query;
    let cities = db.cities;
    if (province_id) cities = filterByField(cities, 'province_id', parseInt(province_id));
    res.json(cities);
});

app.get('/api/cities/:id', (req, res) => {
    const city = findById(db.cities, req.params.id);
    if (!city) return res.status(404).json({ error: '城市不存在' });
    city.view_count = (city.view_count || 0) + 1;
    saveDb();
    res.json(city);
});

app.get('/api/provinces', (req, res) => {
    res.json(db.provinces);
});

app.get('/api/posts', (req, res) => {
    const { city_id, user_id, limit = 20, offset = 0 } = req.query;
    let posts = [...db.posts];
    if (city_id) posts = filterByField(posts, 'city_id', city_id);
    if (user_id) posts = filterByField(posts, 'user_id', user_id);
    posts = posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    const result = posts.map(p => {
        const user = findById(db.users, p.user_id) || {};
        const likes_count = filterByField(db.likes, 'post_id', p.id).length;
        const comments_count = filterByField(db.comments, 'post_id', p.id).length;
        return { ...p, nickname: user.nickname, avatar: user.avatar, level: user.level, likes_count, comments_count };
    });
    res.json(result);
});

app.post('/api/posts', authenticate, (req, res) => {
    const { title, content, images, city_id } = req.body;
    if (!content) return res.status(400).json({ error: '请输入内容' });

    const postId = uuidv4();
    const post = { id: postId, user_id: req.userId, title, content, images, city_id, likes_count: 0, comments_count: 0, created_at: new Date().toISOString() };
    db.posts.push(post);

    const stats = findByField(db.user_stats, 'user_id', req.userId);
    if (stats) stats.posts_count++;
    saveDb();

    res.json({ success: true, post });
});

app.get('/api/posts/:id/comments', (req, res) => {
    const comments = db.comments.filter(c => c.post_id === req.params.id).map(c => {
        const user = findById(db.users, c.user_id) || {};
        return { ...c, nickname: user.nickname, avatar: user.avatar };
    });
    res.json(comments);
});

app.post('/api/posts/:id/comments', authenticate, (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '请输入评论内容' });

    const commentId = uuidv4();
    const comment = { id: commentId, post_id: req.params.id, user_id: req.userId, content, created_at: new Date().toISOString() };
    db.comments.push(comment);

    const post = findById(db.posts, req.params.id);
    if (post) post.comments_count++;
    saveDb();

    res.json({ success: true, comment_id: commentId });
});

app.post('/api/likes', authenticate, (req, res) => {
    const { post_id } = req.body;
    const existingIdx = db.likes.findIndex(l => l.post_id === post_id && l.user_id === req.userId);

    if (existingIdx !== -1) {
        db.likes.splice(existingIdx, 1);
        const post = findById(db.posts, post_id);
        if (post && post.likes_count > 0) post.likes_count--;
        saveDb();
        res.json({ success: true, liked: false });
    } else {
        db.likes.push({ id: uuidv4(), post_id, user_id: req.userId, created_at: new Date().toISOString() });
        const post = findById(db.posts, post_id);
        if (post) post.likes_count++;
        saveDb();
        res.json({ success: true, liked: true });
    }
});

app.post('/api/travel-plans', authenticate, (req, res) => {
    const { city_id, days, title, description } = req.body;
    const planId = uuidv4();
    const plan = { id: planId, user_id: req.userId, city_id, days, title, description, created_at: new Date().toISOString() };
    db.travel_plans = db.travel_plans || [];
    db.travel_plans.push(plan);
    saveDb();
    res.json({ success: true, plan });
});

app.get('/api/travel-plans', authenticate, (req, res) => {
    const plans = (db.travel_plans || []).filter(p => p.user_id === req.userId).map(p => {
        const city = findById(db.cities, p.city_id) || {};
        return { ...p, city_name: city.name };
    });
    res.json(plans);
});

app.delete('/api/travel-plans/:id', authenticate, (req, res) => {
    const idx = (db.travel_plans || []).findIndex(p => p.id === req.params.id && p.user_id === req.userId);
    if (idx === -1) return res.status(404).json({ error: '计划不存在' });
    db.travel_plans.splice(idx, 1);
    saveDb();
    res.json({ success: true });
});

app.post('/api/messages', authenticate, (req, res) => {
    const { to_user_id, content } = req.body;
    const msgId = uuidv4();
    const msg = { id: msgId, from_user_id: req.userId, to_user_id, content, created_at: new Date().toISOString(), read: false };
    db.messages.push(msg);
    saveDb();
    res.json({ success: true, message_id: msgId });
});

app.get('/api/messages', authenticate, (req, res) => {
    const messages = db.messages.filter(m => m.to_user_id === req.userId || m.from_user_id === req.userId).map(m => {
        const fromUser = findById(db.users, m.from_user_id) || {};
        const toUser = findById(db.users, m.to_user_id) || {};
        return { ...m, from_nickname: fromUser.nickname, from_avatar: fromUser.avatar, to_nickname: toUser.nickname };
    });
    res.json(messages);
});

app.get('/api/users/:id', (req, res) => {
    const user = findById(db.users, req.params.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    const stats = findByField(db.user_stats, 'user_id', req.params.id) || {};
    delete user.password;
    res.json({ ...user, ...stats });
});

app.get('/api/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    const keyword = q.toLowerCase();
    const users = db.users.filter(u => u.nickname.toLowerCase().includes(keyword)).slice(0, 5).map(u => ({ type: 'user', id: u.id, nickname: u.nickname, avatar: u.avatar }));
    const cities = db.cities.filter(c => c.name.toLowerCase().includes(keyword) || c.province_name.toLowerCase().includes(keyword)).slice(0, 5).map(c => ({ type: 'city', id: c.id, name: c.name, province_name: c.province_name }));
    res.json([...users, ...cities]);
});

app.get('/api/feed', (req, res) => {
    const posts = db.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20).map(p => {
        const user = findById(db.users, p.user_id) || {};
        const city = findById(db.cities, p.city_id) || {};
        return { ...p, nickname: user.nickname, avatar: user.avatar, city_name: city.name };
    });
    res.json(posts);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║     🏔️  山水相逢 · 旅途有你 Pro              ║');
    console.log('║     服务已启动                                ║');
    console.log('╠═══════════════════════════════════════════════╣');
    console.log(`║  🌐  服务地址: http://localhost:${PORT}          ║`);
    console.log(`║  🔐  管理后台: http://localhost:${PORT}/admin.html  ║`);
    console.log('╚═══════════════════════════════════════════════╝');
});
