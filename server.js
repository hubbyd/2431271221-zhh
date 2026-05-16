const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = 'travel-app-secret-key-2024';

const dbPath = path.join(__dirname, 'travel.db');

if (!fs.existsSync(dbPath)) {
    console.log('⚠️ 数据库不存在，请先运行: node init-db.js');
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('✅ 成功连接到SQLite数据库');
    }
});

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: '未授权，请先登录' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'token无效或已过期' });
    }
};

app.post('/api/auth/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    db.run(`
        INSERT INTO users (id, username, password, nickname, avatar)
        VALUES (?, ?, ?, ?, ?)
    `, [userId, username, hashedPassword, nickname || '旅行者' + Math.floor(Math.random() * 1000), '🧳'], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: '用户名已存在' });
            }
            return res.status(500).json({ error: err.message });
        }
        
        db.run('INSERT INTO user_stats (user_id) VALUES (?)', [userId]);
        
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
        
        res.json({
            success: true,
            token,
            user: {
                id: userId,
                username,
                nickname: nickname || '旅行者' + Math.floor(Math.random() * 1000),
                avatar: '🧳'
            }
        });
    });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!user) {
            return res.status(401).json({ error: '用户不存在' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: '密码错误' });
        }
        
        db.run('UPDATE users SET last_login = datetime("now"), is_online = 1 WHERE id = ?', [user.id]);
        
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                bio: user.bio,
                level: user.level,
                experience: user.experience
            }
        });
    });
});

app.get('/api/auth/me', authenticate, (req, res) => {
    db.get(`
        SELECT u.*, us.posts_count, us.followers_count, us.following_count, us.travel_days
        FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE u.id = ?
    `, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: '用户不存在' });
        
        res.json({
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
            bio: user.bio,
            level: user.level,
            experience: user.experience,
            postsCount: user.posts_count || 0,
            followersCount: user.followers_count || 0,
            followingCount: user.following_count || 0,
            travelDays: user.travel_days || 0,
            createdAt: user.created_at
        });
    });
});

app.put('/api/user/profile', authenticate, (req, res) => {
    const { nickname, avatar, bio } = req.body;
    
    db.run(`
        UPDATE users SET
            nickname = COALESCE(?, nickname),
            avatar = COALESCE(?, avatar),
            bio = COALESCE(?, bio)
        WHERE id = ?
    `, [nickname, avatar, bio, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, user) => {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                    avatar: user.avatar,
                    bio: user.bio
                }
            });
        });
    });
});

app.post('/api/posts', authenticate, (req, res) => {
    const { title, content, images, cityId } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: '内容不能为空' });
    }
    
    const postId = uuidv4();
    
    db.run(`
        INSERT INTO posts (id, user_id, title, content, images, city_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [postId, req.userId, title || '', content, images || '', cityId || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run('UPDATE user_stats SET posts_count = posts_count + 1 WHERE user_id = ?', [req.userId]);
        db.run('UPDATE users SET experience = experience + 10 WHERE id = ?', [req.userId]);
        
        res.json({ success: true, postId });
    });
});

app.get('/api/posts', (req, res) => {
    const { page = 1, limit = 20, cityId } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
        SELECT p.*, u.nickname, u.avatar, u.level,
               c.name as city_name,
               (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as likes
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN cities c ON p.city_id = c.id
    `;
    const params = [];
    
    if (cityId) {
        query += ' WHERE p.city_id = ?';
        params.push(cityId);
    }
    
    query += ' ORDER BY p.is_top DESC, p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const countQuery = cityId 
            ? 'SELECT COUNT(*) as total FROM posts WHERE city_id = ?'
            : 'SELECT COUNT(*) as total FROM posts';
        const countParams = cityId ? [cityId] : [];
        
        db.get(countQuery, countParams, (err, row) => {
            res.json({
                posts,
                total: row.total,
                page: parseInt(page),
                pages: Math.ceil(row.total / limit)
            });
        });
    });
});

app.get('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(`
        SELECT p.*, u.nickname, u.avatar, u.level,
               c.name as city_name
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN cities c ON p.city_id = c.id
        WHERE p.id = ?
    `, [id], (err, post) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!post) return res.status(404).json({ error: '帖子不存在' });
        
        db.all(`
            SELECT c.*, u.nickname, u.avatar
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `, [id], (err, comments) => {
            res.json({ ...post, comments });
        });
    });
});

app.post('/api/posts/:id/comments', authenticate, (req, res) => {
    const { id } = req.params;
    const { content, parentId } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: '评论内容不能为空' });
    }
    
    const commentId = uuidv4();
    
    db.run(`
        INSERT INTO comments (id, post_id, user_id, content, parent_id)
        VALUES (?, ?, ?, ?, ?)
    `, [commentId, id, req.userId, content, parentId || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [id]);
        db.run('UPDATE users SET experience = experience + 2 WHERE id = ?', [req.userId]);
        
        db.get(`
            SELECT c.*, u.nickname, u.avatar
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [commentId], (err, comment) => {
            res.json({ success: true, comment });
        });
    });
});

app.post('/api/likes', authenticate, (req, res) => {
    const { targetType, targetId } = req.body;
    
    db.get('SELECT * FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', 
        [req.userId, targetType, targetId], (err, existing) => {
        if (existing) {
            db.run('DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?', 
                [req.userId, targetType, targetId], () => {
                if (targetType === 'post') {
                    db.run('UPDATE posts SET likes = likes - 1 WHERE id = ?', [targetId]);
                } else if (targetType === 'comment') {
                    db.run('UPDATE comments SET likes = likes - 1 WHERE id = ?', [targetId]);
                }
                res.json({ success: true, action: 'removed' });
            });
        } else {
            db.run('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)', 
                [req.userId, targetType, targetId], () => {
                if (targetType === 'post') {
                    db.run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [targetId]);
                } else if (targetType === 'comment') {
                    db.run('UPDATE comments SET likes = likes + 1 WHERE id = ?', [targetId]);
                }
                db.run('UPDATE users SET experience = experience + 1 WHERE id = ?', [req.userId]);
                res.json({ success: true, action: 'added' });
            });
        }
    });
});

app.post('/api/friends/request', authenticate, (req, res) => {
    const { friendId } = req.body;
    
    if (friendId === req.userId) {
        return res.status(400).json({ error: '不能添加自己为好友' });
    }
    
    db.get('SELECT * FROM users WHERE id = ?', [friendId], (err, user) => {
        if (!user) return res.status(404).json({ error: '用户不存在' });
        
        db.run('INSERT OR IGNORE INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)', 
            [req.userId, friendId, 'pending'], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            if (this.changes === 0) {
                return res.status(400).json({ error: '已经发送过好友请求' });
            }
            
            res.json({ success: true, message: '好友请求已发送' });
        });
    });
});

app.get('/api/friends', authenticate, (req, res) => {
    const { status = 'accepted' } = req.query;
    
    let query = `
        SELECT f.*, u.nickname, u.avatar, u.level, u.is_online
        FROM friends f
        LEFT JOIN users u ON 
            (f.friend_id = u.id AND f.user_id = ?)
            OR (f.user_id = u.id AND f.friend_id = ?)
        WHERE f.status = ? AND u.id != ?
    `;
    
    db.all(query, [req.userId, req.userId, status, req.userId], (err, friends) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(friends);
    });
});

app.post('/api/friends/:id/accept', authenticate, (req, res) => {
    const { id } = req.params;
    
    db.run('UPDATE friends SET status = ? WHERE id = ? AND friend_id = ?', 
        ['accepted', id, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: '已同意好友请求' });
    });
});

app.post('/api/friends/:id/reject', authenticate, (req, res) => {
    const { id } = req.params;
    
    db.run('UPDATE friends SET status = ? WHERE id = ? AND friend_id = ?', 
        ['rejected', id, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: '已拒绝好友请求' });
    });
});

app.post('/api/messages/send', authenticate, (req, res) => {
    const { toUser, content, type = 'text' } = req.body;
    
    if (!toUser || !content) {
        return res.status(400).json({ error: '收件人和内容不能为空' });
    }
    
    const msgId = uuidv4();
    
    db.run(`
        INSERT INTO messages (id, from_user, to_user, content, type)
        VALUES (?, ?, ?, ?, ?)
    `, [msgId, req.userId, toUser, content, type], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, messageId: msgId });
    });
});

app.get('/api/messages', authenticate, (req, res) => {
    const { withUser } = req.query;
    
    let query = `
        SELECT m.*, 
               fu.nickname as from_nickname, fu.avatar as from_avatar,
               tu.nickname as to_nickname, tu.avatar as to_avatar
        FROM messages m
        LEFT JOIN users fu ON m.from_user = fu.id
        LEFT JOIN users tu ON m.to_user = tu.id
        WHERE (m.from_user = ? OR m.to_user = ?)
    `;
    const params = [req.userId, req.userId];
    
    if (withUser) {
        query += ' AND (m.from_user = ? OR m.to_user = ?)';
        params.push(withUser, withUser);
    }
    
    query += ' ORDER BY m.created_at DESC LIMIT 100';
    
    db.all(query, params, (err, messages) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(messages);
    });
});

async function generateAIPlan(cityName, days, userId) {
    return new Promise((resolve) => {
        db.get('SELECT * FROM cities WHERE name LIKE ?', [`%${cityName}%`], (err, city) => {
            if (!city) {
                resolve({
                    success: false,
                    error: '未找到该城市'
                });
                return;
            }
            
            const numDays = days || city.avg_stay_days || 2;
            const attractions = city.attractions?.split(',') || [];
            const food = city.food?.split('、') || [];
            const hotels = city.hotels?.split('/') || [];
            const highlights = city.highlights?.split(',') || [];
            
            const dailyItinerary = [];
            for (let i = 1; i <= numDays; i++) {
                const dayAttractions = attractions.slice((i-1) * 2, i * 2);
                dailyItinerary.push({
                    day: i,
                    morning: dayAttractions[0] || `游览${city.name}著名景点`,
                    afternoon: dayAttractions[1] || `探索当地文化`,
                    evening: '自由活动 / 品尝当地美食',
                    breakfast: food[0] || '当地特色早餐',
                    lunch: food[1] || '地道午餐',
                    dinner: food[2] || '推荐餐厅'
                });
            }
            
            const hotelRecommendations = hotels.slice(0, 3).map((hotel, idx) => ({
                name: hotel,
                level: ['经济型', '舒适型', '豪华型'][idx] || '特色民宿',
                price: [150 + idx * 100, 200 + idx * 150, 400 + idx * 200][idx],
                features: ['免费WiFi', '含早餐', '位置便利'][idx] || '特色装饰',
                rating: (4.5 + idx * 0.2).toFixed(1)
            }));
            
            const routePlan = [];
            if (numDays >= 1) {
                routePlan.push({ day: 1, theme: '初识城市', places: [attractions[0] || '市中心'], duration: '3-4小时' });
            }
            if (numDays >= 2) {
                routePlan.push({ day: 2, theme: '深度体验', places: [attractions[1] || '博物馆', attractions[2] || '古迹'], duration: '5-6小时' });
            }
            if (numDays >= 3) {
                routePlan.push({ day: 3, theme: '休闲放松', places: [highlights[0] || '自然风光'], duration: '4-5小时' });
            }
            
            const budget = {
                hotel: {
                    amount: (city.hotel_day || 200) * numDays,
                    note: `每晚均价约${city.hotel_day || 200}元`
                },
                meal: {
                    amount: (city.meal_day || 100) * numDays * 3,
                    note: '含早中晚三餐'
                },
                transport: {
                    local: (city.local_trans || 30) * numDays,
                    fromXian: city.travel_from_xian || 500,
                    note: '包括市内交通和往返费用'
                },
                tickets: {
                    amount: (city.tickets_total || 100) * numDays,
                    note: '景点门票'
                },
                total: ((city.hotel_day || 200) + (city.meal_day || 100) * 3 + (city.local_trans || 30)) * numDays + (city.tickets_total || 100) * numDays + (city.travel_from_xian || 500)
            };
            
            const plan = {
                city: city.name,
                province: city.province_id,
                days: numDays,
                highlights: highlights.slice(0, 5),
                attractions: attractions.slice(0, 6),
                food: food.slice(0, 5),
                hotels: hotels.slice(0, 3),
                dailyItinerary,
                routePlan,
                hotelRecommendations,
                budget,
                tips: [
                    `最佳旅游季节：${city.best_season || '全年适合'}`,
                    `建议游玩天数：${city.avg_stay_days || 2}天`,
                    `${highlights[0] || city.name}是必去之地`,
                    '建议提前预订酒店，特别是在旺季',
                    '关注当地天气，合理安排行程',
                    '尝试当地特色美食是旅行的重要体验',
                    '建议购买旅游保险，以防万一'
                ],
                bestTime: city.best_season || '春秋两季',
                avgTemperature: '15-25°C',
                localSpecialties: food.slice(0, 3),
                mustVisit: highlights.slice(0, 3)
            };
            
            resolve({
                success: true,
                plan
            });
        });
    });
}

app.post('/api/ai/plan', authenticate, async (req, res) => {
    const { city, days } = req.body;
    
    if (!city) {
        return res.status(400).json({ error: '请指定城市名称' });
    }
    
    const planId = uuidv4();
    
    db.run(`
        INSERT INTO ai_plans (id, user_id, city_name, days, status)
        VALUES (?, ?, ?, ?, ?)
    `, [planId, req.userId, city, days || 2, 'generating']);
    
    const result = await generateAIPlan(city, days, req.userId);
    
    if (!result.success) {
        db.run('UPDATE ai_plans SET status = ? WHERE id = ?', ['failed', planId]);
        return res.status(404).json({ error: result.error });
    }
    
    db.run(`
        UPDATE ai_plans SET 
            status = 'completed',
            content = ?,
            routes = ?,
            hotels = ?,
            budgets = ?,
            tips = ?
        WHERE id = ?
    `, [JSON.stringify(result.plan), JSON.stringify(result.plan.routePlan), JSON.stringify(result.plan.hotelRecommendations), JSON.stringify(result.plan.budget), JSON.stringify(result.plan.tips), planId]);
    
    res.json({
        success: true,
        planId,
        plan: result.plan
    });
});

app.get('/api/ai/plans', authenticate, (req, res) => {
    db.all(`
        SELECT * FROM ai_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
    `, [req.userId], (err, plans) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(plans);
    });
});

app.get('/api/ai/plans/:id', authenticate, (req, res) => {
    const { id } = req.params;
    
    db.get(`
        SELECT * FROM ai_plans WHERE id = ? AND user_id = ?
    `, [id, req.userId], async (err, plan) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!plan) return res.status(404).json({ error: '计划不存在' });
        
        const planDetails = await generateAIPlan(plan.city_name, plan.days, req.userId);
        res.json({
            ...plan,
            ...planDetails.plan
        });
    });
});

app.get('/api/notifications', authenticate, (req, res) => {
    db.all(`
        SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `, [req.userId], (err, notifications) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(notifications);
    });
});

app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(`
        SELECT u.id, u.nickname, u.avatar, u.bio, u.level, u.experience, u.created_at,
               us.posts_count, us.followers_count, us.following_count, us.travel_days
        FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE u.id = ?
    `, [id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: '用户不存在' });
        
        db.all(`
            SELECT p.id, p.content, p.created_at
            FROM posts p
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
            LIMIT 10
        `, [id], (err, posts) => {
            res.json({ ...user, recentPosts: posts });
        });
    });
});

app.get('/api/search/users', authenticate, (req, res) => {
    const { q } = req.query;
    
    if (!q) return res.json([]);
    
    db.all(`
        SELECT id, nickname, avatar, level
        FROM users
        WHERE nickname LIKE ? AND id != ?
        LIMIT 20
    `, [`%${q}%`, req.userId], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(users);
    });
});

app.get('/api/cities', (req, res) => {
    const { search, province } = req.query;
    
    let query = 'SELECT c.*, p.name as province_name FROM cities c LEFT JOIN provinces p ON c.province_id = p.id WHERE 1=1';
    const params = [];
    
    if (search) {
        query += ' AND (c.name LIKE ? OR c.attractions LIKE ? OR c.food LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
    }
    
    if (province && province !== 'all') {
        query += ' AND p.name = ?';
        params.push(province);
    }
    
    query += ' ORDER BY c.view_count DESC';
    
    db.all(query, params, (err, cities) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(cities);
    });
});

app.get('/api/cities/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(`
        SELECT c.*, p.name as province_name
        FROM cities c
        LEFT JOIN provinces p ON c.province_id = p.id
        WHERE c.id = ?
    `, [id], (err, city) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!city) return res.status(404).json({ error: '城市不存在' });
        
        db.run('UPDATE cities SET view_count = view_count + 1 WHERE id = ?', [id]);
        
        res.json(city);
    });
});

app.get('/api/provinces', (req, res) => {
    db.all('SELECT * FROM provinces ORDER BY name', (err, provinces) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(provinces);
    });
});

app.get('/api/stats', (req, res) => {
    db.get('SELECT COUNT(*) as users FROM users', (err, users) => {
        db.get('SELECT COUNT(*) as cities FROM cities', (err, cities) => {
            db.get('SELECT COUNT(*) as posts FROM posts', (err, posts) => {
                db.get('SELECT COUNT(*) as views FROM cities', (err, viewsRes) => {
                    db.get('SELECT SUM(view_count) as total_views FROM cities', (err, totalViews) => {
                        res.json({
                            users: users?.users || 0,
                            cities: cities?.cities || 0,
                            posts: posts?.posts || 0,
                            views: totalViews?.total_views || 0
                        });
                    });
                });
            });
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 山河旅图Pro 服务器启动成功`);
    console.log(`📍 运行在: http://localhost:${PORT}`);
});

// 管理员API - 获取所有用户
app.get('/api/admin/users', authenticate, (req, res) => {
    if (req.userId !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }

    db.all(`
        SELECT u.id, u.username, u.nickname, u.avatar, u.bio, u.level, u.experience,
               u.created_at, u.last_login, u.is_online,
               us.posts_count, us.followers_count, us.following_count, us.travel_days
        FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        ORDER BY u.created_at DESC
    `, (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(users);
    });
});

// 管理员API - 删除用户
app.delete('/api/admin/users/:id', authenticate, (req, res) => {
    if (req.userId !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }

    const { id } = req.params;
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: '用户已删除' });
    });
});

// 发送验证码API
app.post('/api/auth/send-code', (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: '请输入手机号' });
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 模拟发送验证码
    console.log('验证码:', code, '发送到:', phone);

    // 存储验证码（带过期时间）
    const expires = Date.now() + 5 * 60 * 1000;
    db.run(`INSERT OR REPLACE INTO verification_codes (phone, code, expires) VALUES (?, ?, ?)`,
        [phone, code, expires], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: '验证码已发送', code: code }); // 调试时返回验证码
    });
});

// 验证验证码API
app.post('/api/auth/verify-code', (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) {
        return res.status(400).json({ error: '请输入手机号和验证码' });
    }

    db.get(`SELECT * FROM verification_codes WHERE phone = ? AND expires > ?`,
        [phone, Date.now()], (err, record) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!record) {
            return res.status(400).json({ error: '验证码已过期' });
        }
        if (record.code !== code) {
            return res.status(400).json({ error: '验证码错误' });
        }

        res.json({ success: true, message: '验证成功' });
    });
});

// 管理员页面
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

