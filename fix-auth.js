const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const newRegisterFunc = `        function handleRegister() {
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value;
            const nickname = document.getElementById('regNickname').value.trim() || '旅行者' + Math.floor(Math.random() * 1000);
            
            if (!username || !password) { showToast('请填写完整信息'); return; }
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.username === username)) {
                showToast('用户名已存在');
                return;
            }
            
            const newUser = {
                id: Date.now(),
                username,
                password,
                nickname,
                avatar: '🧳',
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast('注册成功');
            init();
        }`;

const newLoginFunc = `        function handleLogin() {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            if (!username || !password) { showToast('请填写完整信息'); return; }
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showToast('登录成功');
                init();
            } else {
                showToast('用户名或密码错误');
            }
        }`;

// 替换 handleRegister
let newContent = content.replace(/async function handleRegister\(\) \{[\s\S]*?        \}/, newRegisterFunc);

// 替换 handleLogin
newContent = newContent.replace(/async function handleLogin\(\) \{[\s\S]*?        \}/, newLoginFunc);

fs.writeFileSync('index.html', newContent);
console.log('✅ 修复完成！');
