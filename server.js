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
const PORT = process.env.PORT || 8888;
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
        return res.status(400).json({ error: '请填写用户名和密码' });
    }
    
    try {
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
    } catch (err) {
        res.status(500).json({ error: '注册失败' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '请填写用户名和密码' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: '用户名或密码错误' });
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
        
        delete user.password;
        res.json(user);
    });
});

app.put('/api/user/profile', authenticate, (req, res) => {
    const { nickname, avatar, bio } = req.body;
    
    const updates = [];
    const values = [];
    
    if (nickname !== undefined) {
        updates.push('nickname = ?');
        values.push(nickname);
    }
    if (avatar !== undefined) {
        updates.push('avatar = ?');
        values.push(avatar);
    }
    if (bio !== undefined) {
        updates.push('bio = ?');
        values.push(bio);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ error: '没有要更新的字段' });
    }
    
    values.push(req.userId);
    
    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: '资料更新成功' });
    });
});

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

app.post('/api/auth/send-code', (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: '请输入手机号' });
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('验证码:', code, '发送到:', phone);
    
    const expires = Date.now() + 5 * 60 * 1000;
    db.run(`INSERT OR REPLACE INTO verification_codes (phone, code, expires) VALUES (?, ?, ?)`,
        [phone, code, expires], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: '验证码已发送', code: code });
    });
});

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

app.post('/api/posts', authenticate, (req, res) => {
    const { title, content, images, city_id } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: '请输入内容' });
    }
    
    const postId = uuidv4();
    
    db.run(`
        INSERT INTO posts (id, user_id, title, content, images, city_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [postId, req.userId, title, content, images, city_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run('UPDATE user_stats SET posts_count = posts_count + 1 WHERE user_id = ?', [req.userId]);
        
        res.json({
            success: true,
            post: { id: postId, user_id: req.userId, title, content, city_id }
        });
    });
});

app.get('/api/posts', (req, res) => {
    const { city_id, user_id, limit = 20, offset = 0 } = req.query;
    
    let query = `
        SELECT p.*, u.nickname, u.avatar, u.level,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (city_id) {
        query += ' AND p.city_id = ?';
        params.push(city_id);
    }
    
    if (user_id) {
        query += ' AND p.user_id = ?';
        params.push(user_id);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(posts);
    });
});

app.post('/api/posts/:id/comments', authenticate, (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: '请输入评论内容' });
    }
    
    db.run(`
        INSERT INTO comments (post_id, user_id, content)
        VALUES (?, ?, ?)
    `, [id, req.userId, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [id]);
        
        res.json({ success: true, comment_id: this.lastID });
    });
});

app.get('/api/posts/:id/comments', (req, res) => {
    const { id } = req.params;
    
    db.all(`
        SELECT c.*, u.nickname, u.avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    `, [id], (err, comments) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(comments);
    });
});

app.post('/api/likes', authenticate, (req, res) => {
    const { post_id } = req.body;
    
    db.get('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [post_id, req.userId], (err, like) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (like) {
            db.run('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [post_id, req.userId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                db.run('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [post_id]);
                res.json({ success: true, liked: false });
            });
        } else {
            db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [post_id, req.userId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                db.run('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [post_id]);
                res.json({ success: true, liked: true });
            });
        }
    });
});

app.post('/api/friends/request', authenticate, (req, res) => {
    const { friend_id } = req.body;
    
    if (friend_id === req.userId) {
        return res.status(400).json({ error: '不能添加自己为好友' });
    }
    
    db.get('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
        [req.userId, friend_id, friend_id, req.userId], (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (existing) {
            return res.status(400).json({ error: '已经是好友或请求已存在' });
        }
        
        db.run('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
            [req.userId, friend_id, 'pending'], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: '好友请求已发送' });
        });
    });
});

app.get('/api/friends', authenticate, (req, res) => {
    const { status = 'accepted' } = req.query;
    
    let query;
    if (status === 'pending') {
        query = `
            SELECT f.*, u.id as friend_id, u.nickname, u.avatar, u.is_online
            FROM friends f
            JOIN users u ON f.user_id = u.id
            WHERE f.friend_id = ? AND f.status = 'pending'
        `;
        db.all(query, [req.userId], (err, friends) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(friends);
        });
    } else {
        query = `
            SELECT f.*, u.id as friend_id, u.nickname, u.avatar, u.is_online
            FROM friends f
            JOIN users u ON 
                CASE WHEN f.user_id = ? THEN f.friend_id = u.id ELSE f.user_id = u.id END
            WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
        `;
        db.all(query, [req.userId, req.userId, req.userId], (err, friends) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(friends);
        });
    }
});

app.post('/api/friends/accept/:id', authenticate, (req, res) => {
    const { id } = req.params;
    
    db.run('UPDATE friends SET status = ? WHERE id = ? AND friend_id = ?',
        ['accepted', id, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: '已接受好友请求' });
    });
});

app.get('/api/messages', authenticate, (req, res) => {
    const { user_id } = req.query;
    
    if (!user_id) {
        return res.status(400).json({ error: '请指定用户ID' });
    }
    
    db.all(`
        SELECT * FROM messages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
    `, [req.userId, user_id, user_id, req.userId], (err, messages) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(messages);
    });
});

app.post('/api/messages/send', authenticate, (req, res) => {
    const { receiver_id, content } = req.body;
    
    if (!receiver_id || !content) {
        return res.status(400).json({ error: '请填写收件人和内容' });
    }
    
    db.run(`
        INSERT INTO messages (sender_id, receiver_id, content)
        VALUES (?, ?, ?)
    `, [req.userId, receiver_id, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message_id: this.lastID });
    });
});

app.get('/api/cities', (req, res) => {
    db.all(`
        SELECT c.*, p.name as province_name
        FROM cities c
        LEFT JOIN provinces p ON c.province_id = p.id
        ORDER BY c.view_count DESC
    `, (err, cities) => {
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

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║     🏔️ 山河旅图Pro 服务已启动           ║');
    console.log('╠═══════════════════════════════════════════╣');
    console.log('║  🚀 服务地址: http://localhost:' + PORT + '      ║');
    console.log('║  🔐 管理员后台: http://localhost:' + PORT + '/admin.html  ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
});