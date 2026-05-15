const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'travel.db');

if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('已删除旧数据库，正在创建新数据库...');
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
        process.exit(1);
    }
    console.log('成功连接到SQLite数据库');
    initDatabase();
});

function initDatabase() {
    db.serialize(() => {
        console.log('📊 正在创建数据库表...');
        
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                nickname TEXT DEFAULT '旅行者',
                avatar TEXT DEFAULT '🧳',
                bio TEXT DEFAULT '',
                phone TEXT,
                email TEXT,
                level INTEGER DEFAULT 1,
                experience INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                is_online INTEGER DEFAULT 0
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS provinces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                city_count INTEGER DEFAULT 0,
                total_budget INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS cities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                province_id INTEGER NOT NULL,
                highlights TEXT,
                attractions TEXT,
                food TEXT,
                hotel_day INTEGER DEFAULT 0,
                meal_day INTEGER DEFAULT 0,
                local_trans INTEGER DEFAULT 0,
                tickets_total INTEGER DEFAULT 0,
                travel_from_xian INTEGER DEFAULT 0,
                route TEXT,
                hotels TEXT,
                best_season TEXT,
                avg_stay_days INTEGER DEFAULT 2,
                view_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (province_id) REFERENCES provinces(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS friends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                friend_id TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, friend_id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT,
                content TEXT NOT NULL,
                images TEXT,
                city_id INTEGER,
                likes INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                is_top INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (city_id) REFERENCES cities(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                likes INTEGER DEFAULT 0,
                parent_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                target_type TEXT NOT NULL,
                target_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, target_type, target_id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS ai_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                city_id INTEGER,
                city_name TEXT,
                plan_type TEXT,
                days INTEGER,
                content TEXT NOT NULL,
                hotels TEXT,
                routes TEXT,
                budgets TEXT,
                tips TEXT,
                status TEXT DEFAULT 'generating',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_user TEXT NOT NULL,
                to_user TEXT NOT NULL,
                content TEXT NOT NULL,
                type TEXT DEFAULT 'text',
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (from_user) REFERENCES users(id),
                FOREIGN KEY (to_user) REFERENCES users(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                title TEXT,
                content TEXT,
                reference_id INTEGER,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS user_stats (
                user_id TEXT PRIMARY KEY,
                posts_count INTEGER DEFAULT 0,
                followers_count INTEGER DEFAULT 0,
                following_count INTEGER DEFAULT 0,
                travel_days INTEGER DEFAULT 0,
                cities_visited TEXT DEFAULT '[]',
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS travel_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                city_id INTEGER NOT NULL,
                visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                rating INTEGER,
                review TEXT,
                photos TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (city_id) REFERENCES cities(id)
            )
        `);

        console.log('✅ 数据库表创建完成');
        
        const provinces = [
            { name: '陕西', cities: 10 },
            { name: '甘肃', cities: 12 },
            { name: '宁夏', cities: 5 },
            { name: '内蒙古', cities: 4 },
            { name: '山西', cities: 11 },
            { name: '河南', cities: 10 },
            { name: '湖北', cities: 8 },
            { name: '四川', cities: 12 }
        ];

        provinces.forEach(p => {
            db.run('INSERT INTO provinces (name, city_count) VALUES (?, ?)', [p.name, p.cities]);
        });

        const citiesData = [
            { name: "西安", province: "陕西", highlights: "十三朝古都,不夜城,美食之城", attractions: "兵马俑,大雁塔,城墙,陕历博,大唐不夜城", food: "肉夹馍、凉皮、泡馍", hotelDay: 180, mealDay: 100, localTrans: 30, ticketsTotal: 220, travelFromXiAn: 0, route: "Day1:钟楼→鼓楼→回民街→城墙\nDay2:兵马俑→华清宫\nDay3:陕博→大雁塔→大唐不夜城", hotels: "钟楼饭店/美居酒店/背包十年", bestSeason: "春秋", avgStayDays: 3 },
            { name: "宝鸡", province: "陕西", highlights: "青铜器之乡,太白山", attractions: "法门寺,太白山,青铜器博物院", food: "岐山臊子面", hotelDay: 140, mealDay: 75, localTrans: 25, ticketsTotal: 150, travelFromXiAn: 50, route: "Day1:青铜器博物院→陈仓老街\nDay2:法门寺→太白山", hotels: "皇冠假日/高新君悦/如家", bestSeason: "夏秋", avgStayDays: 2 },
            { name: "兰州", province: "甘肃", highlights: "黄河之都,美食之城", attractions: "中山桥,白塔山,甘肃省博,黄河母亲", food: "牛肉面,手抓羊肉,甜胚子", hotelDay: 170, mealDay: 85, localTrans: 30, ticketsTotal: 80, travelFromXiAn: 180, route: "Day1:黄河风情线\nDay2:甘肃省博物馆→白塔山", hotels: "亚欧国际/宜必思/全季", bestSeason: "夏秋", avgStayDays: 2 },
            { name: "敦煌", province: "甘肃", highlights: "莫高窟,月牙泉,鸣沙山", attractions: "莫高窟,月牙泉,鸣沙山,雅丹地貌", food: "驴肉黄面,杏皮水", hotelDay: 250, mealDay: 100, localTrans: 50, ticketsTotal: 300, travelFromXiAn: 450, route: "Day1:鸣沙山月牙泉\nDay2:莫高窟\nDay3:雅丹地貌", hotels: "敦煌山庄/丝路花雨/敦煌国际酒店", bestSeason: "夏秋", avgStayDays: 3 },
            { name: "银川", province: "宁夏", highlights: "塞上湖城,西夏文化", attractions: "西夏陵,西部影城,沙湖", food: "手抓羊肉,羊杂碎", hotelDay: 170, mealDay: 85, localTrans: 30, ticketsTotal: 170, travelFromXiAn: 240, route: "Day1:西夏陵→西部影城\nDay2:沙湖", hotels: "国贸中心/西府井/新华联", bestSeason: "夏秋", avgStayDays: 2 },
            { name: "洛阳", province: "河南", highlights: "十三朝古都,龙门石窟", attractions: "龙门石窟,白马寺,老君山,洛邑古城", food: "洛阳水席,牛肉汤", hotelDay: 180, mealDay: 85, localTrans: 30, ticketsTotal: 220, travelFromXiAn: 130, route: "Day1:龙门石窟→白马寺\nDay2:老君山", hotels: "克丽司汀/吾朵/牡丹大酒店", bestSeason: "春秋", avgStayDays: 2 },
            { name: "成都", province: "四川", highlights: "天府之国,美食之都,熊猫基地", attractions: "熊猫基地,宽窄巷子,锦里,武侯祠", food: "火锅,串串,冒菜", hotelDay: 250, mealDay: 120, localTrans: 40, ticketsTotal: 180, travelFromXiAn: 260, route: "Day1:熊猫基地→宽窄巷子\nDay2:锦里→武侯祠", hotels: "尼依格罗/明宇尚雅/成都香格里拉", bestSeason: "春秋", avgStayDays: 3 },
            { name: "武汉", province: "湖北", highlights: "江城,樱花之都", attractions: "黄鹤楼,东湖,户部巷,武汉大学", food: "热干面,鸭脖,豆皮", hotelDay: 220, mealDay: 100, localTrans: 40, ticketsTotal: 150, travelFromXiAn: 450, route: "Day1:黄鹤楼→户部巷\nDay2:东湖→武汉大学", hotels: "马哥孛罗/锦江国际/武汉香格里拉", bestSeason: "春", avgStayDays: 2 },
            { name: "太原", province: "山西", highlights: "龙城,晋商文化", attractions: "晋祠,山西博物院,柳巷", food: "刀削面,过油肉", hotelDay: 170, mealDay: 85, localTrans: 30, ticketsTotal: 100, travelFromXiAn: 230, route: "Day1:晋祠→山西博物院", hotels: "并州饭店/潞安戴斯/山西国贸", bestSeason: "春秋", avgStayDays: 2 },
            { name: "大同", province: "山西", highlights: "云冈石窟,悬空寺", attractions: "云冈石窟,悬空寺,恒山", food: "刀削面,浑源凉粉", hotelDay: 160, mealDay: 80, localTrans: 30, ticketsTotal: 200, travelFromXiAn: 280, route: "Day1:云冈石窟\nDay2:悬空寺→恒山", hotels: "云冈建国/魏都国际/大同贵宾楼", bestSeason: "夏秋", avgStayDays: 2 },
            { name: "平遥", province: "山西", highlights: "古城,晋商文化", attractions: "平遥古城,日升昌,县衙", food: "平遥牛肉,碗托", hotelDay: 160, mealDay: 80, localTrans: 25, ticketsTotal: 150, travelFromXiAn: 250, route: "Day1:平遥古城一日游\nDay2:双林寺→镇国寺", hotels: "平遥会馆/德盛楼/云锦成", bestSeason: "春秋", avgStayDays: 2 },
            { name: "恩施", province: "湖北", highlights: "仙居恩施,大峡谷", attractions: "恩施大峡谷,屏山峡谷,腾龙洞", food: "土家油茶,小土豆", hotelDay: 180, mealDay: 85, localTrans: 35, ticketsTotal: 280, travelFromXiAn: 500, route: "Day1:恩施大峡谷\nDay2:腾龙洞", hotels: "瑞享国际/轩宇大酒店/恩施国际", bestSeason: "春秋", avgStayDays: 3 }
        ];

        const provinceMap = {
            '陕西': 1, '甘肃': 2, '宁夏': 3, '内蒙古': 4,
            '山西': 5, '河南': 6, '湖北': 7, '四川': 8
        };

        const stmt = db.prepare(`INSERT INTO cities 
            (name, province_id, highlights, attractions, food, hotel_day, meal_day, local_trans, tickets_total, travel_from_xian, route, hotels, best_season, avg_stay_days)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        citiesData.forEach(city => {
            stmt.run([
                city.name,
                provinceMap[city.province],
                city.highlights,
                city.attractions,
                city.food,
                city.hotelDay,
                city.mealDay,
                city.localTrans,
                city.ticketsTotal,
                city.travelFromXiAn,
                city.route,
                city.hotels,
                city.bestSeason,
                city.avgStayDays
            ]);
        });

        stmt.finalize();

        db.run(`
            INSERT INTO users (id, username, password, nickname, avatar, bio, level, experience)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['admin', 'admin', '$2a$10$X5wFuQoGKz9YHJX7YZq1/.YQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ', '官方助手', '🤖', '山河旅图官方AI助手，为您提供智能旅游规划服务', 10, 99999]);

        db.run(`
            INSERT INTO user_stats (user_id, posts_count, followers_count, following_count)
            VALUES (?, ?, ?, ?)
        `, ['admin', 5, 1000, 0]);

        console.log('✅ 数据库初始化完成！');
        console.log('📊 已创建表: users, provinces, cities, posts, comments, likes, friends, ai_plans, messages, notifications, user_stats, travel_records');
        console.log(`📍 已插入 ${citiesData.length} 个城市数据`);
        console.log(`👤 已创建管理员账户`);
    });

    setTimeout(() => {
        db.close();
        console.log('数据库连接已关闭');
        process.exit(0);
    }, 3000);
}
