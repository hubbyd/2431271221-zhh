const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const adminAPIs = `

// 管理员API - 获取所有用户
app.get('/api/admin/users', authenticate, (req, res) => {
    if (req.userId !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }

    db.all(\`
        SELECT u.id, u.username, u.nickname, u.avatar, u.bio, u.level, u.experience,
               u.created_at, u.last_login, u.is_online,
               us.posts_count, us.followers_count, us.following_count, us.travel_days
        FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        ORDER BY u.created_at DESC
    \`, (err, users) => {
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
    db.run(\`INSERT OR REPLACE INTO verification_codes (phone, code, expires) VALUES (?, ?, ?)\`,
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

    db.get(\`SELECT * FROM verification_codes WHERE phone = ? AND expires > ?\`,
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

`;

const newContent = content + adminAPIs;

fs.writeFileSync('server.js', newContent);
console.log('✅ 管理员API添加成功');
