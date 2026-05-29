const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'travel.db');

if (fs.existsSync(dbPath)) {
    console.log('Database exists, deleting...');
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database error:', err.message);
        process.exit(1);
    }
    console.log('Database connected');
});

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, nickname TEXT DEFAULT '旅行者', avatar TEXT DEFAULT '🧳', bio TEXT DEFAULT '', level INTEGER DEFAULT 1, experience INTEGER DEFAULT 0, phone TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_login DATETIME, is_online INTEGER DEFAULT 0)");
    console.log('Users table created');

    db.run("CREATE TABLE IF NOT EXISTS user_stats (user_id TEXT PRIMARY KEY, posts_count INTEGER DEFAULT 0, followers_count INTEGER DEFAULT 0, following_count INTEGER DEFAULT 0, travel_days INTEGER DEFAULT 0)");
    console.log('User stats table created');

    db.run("CREATE TABLE IF NOT EXISTS verification_codes (phone TEXT PRIMARY KEY, code TEXT NOT NULL, expires INTEGER NOT NULL)");
    console.log('Verification codes table created');

    db.run("CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT, content TEXT NOT NULL, images TEXT, city_id INTEGER, likes_count INTEGER DEFAULT 0, comments_count INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    console.log('Posts table created');

    db.run("CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id TEXT NOT NULL, user_id TEXT NOT NULL, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    console.log('Comments table created');

    db.run("CREATE TABLE IF NOT EXISTS likes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id TEXT NOT NULL, user_id TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(post_id, user_id))");
    console.log('Likes table created');

    db.run("CREATE TABLE IF NOT EXISTS friends (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, friend_id TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, friend_id))");
    console.log('Friends table created');

    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id TEXT NOT NULL, receiver_id TEXT NOT NULL, content TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    console.log('Messages table created');

    db.run("CREATE TABLE IF NOT EXISTS provinces (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)");
    console.log('Provinces table created');

    db.run("CREATE TABLE IF NOT EXISTS cities (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, province_id INTEGER, description TEXT, highlights TEXT, attractions TEXT, food TEXT, hotels TEXT, best_season TEXT, avg_stay_days INTEGER DEFAULT 2, hotel_day_low INTEGER DEFAULT 100, hotel_day_medium INTEGER DEFAULT 200, hotel_day_high INTEGER DEFAULT 400, meal_day_low INTEGER DEFAULT 60, meal_day_medium INTEGER DEFAULT 100, meal_day_high INTEGER DEFAULT 150, view_count INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    console.log('Cities table created');

    db.run("CREATE TABLE IF NOT EXISTS ai_plans (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, city_id INTEGER, city_name TEXT, plan_type TEXT, days INTEGER, content TEXT NOT NULL, hotels TEXT, routes TEXT, budgets TEXT, tips TEXT, status TEXT DEFAULT 'generating', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    console.log('AI plans table created');

    var provinces = ['陕西', '甘肃', '宁夏', '内蒙古', '山西', '河南', '湖北', '四川'];
    provinces.forEach(function(name) {
        db.run("INSERT INTO provinces (name) VALUES (?)", [name]);
    });
    console.log('Provinces inserted');

    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('西安', 1, '十三朝古都,不夜城,美食之城', '兵马俑,大雁塔,城墙,大唐不夜城', '肉夹馍,凉皮,泡馍', '钟楼饭店,全季酒店,青年旅舍')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('宝鸡', 1, '青铜器之乡,太白山', '法门寺,太白山,青铜器博物院', '岐山臊子面', '皇冠假日,高新君悦,宝鸡饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('兰州', 2, '黄河之都,美食之城', '中山桥,白塔山,甘肃省博', '牛肉面,手抓羊肉', '亚欧国际,宜必思,兰州饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('敦煌', 2, '莫高窟,月牙泉', '莫高窟,月牙泉,鸣沙山', '驴肉黄面,杏皮水', '敦煌山庄,丝路花雨,敦煌饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('银川', 3, '塞上湖城,西夏文化', '西夏陵,西部影城,沙湖', '手抓羊肉,羊杂碎', '国贸中心,西府井,银川饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('洛阳', 6, '十三朝古都,龙门石窟', '龙门石窟,白马寺,老君山', '洛阳水席,牛肉汤', '克丽司汀,吾朵,洛阳饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('成都', 8, '天府之国,美食之都,熊猫', '熊猫基地,宽窄巷子,锦里', '火锅,串串,冒菜', '尼依格罗,明宇尚雅,成都饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('武汉', 7, '江城,樱花之都', '黄鹤楼,东湖,户部巷', '热干面,鸭脖,豆皮', '马哥孛罗,锦江国际,武汉饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('太原', 5, '龙城,晋商文化', '晋祠,山西博物院', '刀削面,过油肉', '并州饭店,潞安戴斯,太原饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('大同', 5, '云冈石窟,悬空寺', '云冈石窟,悬空寺,恒山', '刀削面,浑源凉粉', '云冈建国,魏都国际,大同饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('平遥', 5, '古城,晋商文化', '平遥古城,日升昌,县衙', '平遥牛肉,碗托', '平遥会馆,德盛楼,平遥饭店')");
    db.run("INSERT INTO cities (name, province_id, highlights, attractions, food, hotels) VALUES ('恩施', 7, '仙居恩施,大峡谷', '恩施大峡谷,屏山峡谷,腾龙洞', '土家油茶,小土豆', '瑞享国际,轩宇大酒店')");
    console.log('Cities inserted');

    var bcrypt = require('bcryptjs');
    var hashedPassword = bcrypt.hashSync('admin2024', 10);

    db.run("INSERT INTO users (id, username, password, nickname, avatar, level) VALUES ('admin', 'admin', ?, '管理员', '👑', 99)", [hashedPassword]);
    db.run("INSERT INTO user_stats (user_id, posts_count, followers_count, following_count, travel_days) VALUES ('admin', 0, 999, 999, 999)");

    console.log('Admin account created');
    console.log('Username: admin');
    console.log('Password: admin2024');
});

db.close(function(err) {
    if (err) {
        console.error('Close error:', err.message);
    } else {
        console.log('Database initialized successfully!');
        console.log('Run: npm start');
    }
});
