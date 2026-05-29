const bcrypt = require('bcryptjs');

const hashedPassword = bcrypt.hashSync('rement06125', 10);
console.log('密码 rement06125 的哈希值:');
console.log(hashedPassword);

const data = {
  "users": [],
  "posts": [],
  "comments": [],
  "likes": [],
  "messages": [],
  "travel_plans": [],
  "user_stats": [],
  "verification_codes": [],
  "admins": [
    {
      "id": "rement",
      "username": "rement",
      "password": hashedPassword,
      "nickname": "管理员",
      "avatar": "🛡️",
      "level": 99,
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_login": null
    }
  ],
  "provinces": [
    {"id": 1, "name": "北京", "region": "华北"},
    {"id": 2, "name": "天津", "region": "华北"},
    {"id": 3, "name": "河北", "region": "华北"},
    {"id": 4, "name": "山西", "region": "华北"},
    {"id": 5, "name": "内蒙古", "region": "华北"},
    {"id": 6, "name": "辽宁", "region": "东北"},
    {"id": 7, "name": "吉林", "region": "东北"},
    {"id": 8, "name": "黑龙江", "region": "东北"},
    {"id": 9, "name": "上海", "region": "华东"},
    {"id": 10, "name": "江苏", "region": "华东"},
    {"id": 11, "name": "浙江", "region": "华东"},
    {"id": 12, "name": "安徽", "region": "华东"},
    {"id": 13, "name": "福建", "region": "华东"},
    {"id": 14, "name": "江西", "region": "华东"},
    {"id": 15, "name": "山东", "region": "华东"},
    {"id": 16, "name": "河南", "region": "华中"},
    {"id": 17, "name": "湖北", "region": "华中"},
    {"id": 18, "name": "湖南", "region": "华中"},
    {"id": 19, "name": "广东", "region": "华南"},
    {"id": 20, "name": "广西", "region": "华南"},
    {"id": 21, "name": "海南", "region": "华南"},
    {"id": 22, "name": "重庆", "region": "西南"},
    {"id": 23, "name": "四川", "region": "西南"},
    {"id": 24, "name": "贵州", "region": "西南"},
    {"id": 25, "name": "云南", "region": "西南"},
    {"id": 26, "name": "西藏", "region": "西南"},
    {"id": 27, "name": "陕西", "region": "西北"},
    {"id": 28, "name": "甘肃", "region": "西北"},
    {"id": 29, "name": "青海", "region": "西北"},
    {"id": 30, "name": "宁夏", "region": "西北"},
    {"id": 31, "name": "新疆", "region": "西北"},
    {"id": 32, "name": "台湾", "region": "港澳台"},
    {"id": 33, "name": "香港", "region": "港澳台"},
    {"id": 34, "name": "澳门", "region": "港澳台"}
  ],
  "cities": [
    {"id": "1", "name": "北京", "province_id": 1, "province_name": "北京", "highlights": "故宫,长城,胡同", "description": "千年古都，承载着中华文明的厚重历史", "image": "https://source.unsplash.com/400x300/?beijing", "best_season": "春秋两季", "view_count": 0},
    {"id": "2", "name": "西安", "province_id": 27, "province_name": "陕西", "highlights": "兵马俑,古城墙,大雁塔", "description": "十三朝古都，丝绸之路的起点", "image": "https://source.unsplash.com/400x300/?xian", "best_season": "春秋两季", "view_count": 0},
    {"id": "3", "name": "成都", "province_id": 23, "province_name": "四川", "highlights": "大熊猫,火锅,宽窄巷子", "description": "天府之国，美食与休闲的代名词", "image": "https://source.unsplash.com/400x300/?chengdu", "best_season": "春秋两季", "view_count": 0},
    {"id": "4", "name": "杭州", "province_id": 11, "province_name": "浙江", "highlights": "西湖,灵隐寺,龙井茶", "description": "人间天堂，诗意江南的典范", "image": "https://source.unsplash.com/400x300/?hangzhou", "best_season": "春季", "view_count": 0},
    {"id": "5", "name": "苏州", "province_id": 10, "province_name": "江苏", "highlights": "园林,古镇,运河", "description": "园林之城，东方水城的魅力", "image": "https://source.unsplash.com/400x300/?suzhou", "best_season": "春季", "view_count": 0},
    {"id": "6", "name": "南京", "province_id": 10, "province_name": "江苏", "highlights": "中山陵,夫子庙,明孝陵", "description": "六朝古都，历史与自然的交融", "image": "https://source.unsplash.com/400x300/?nanjing", "best_season": "春秋两季", "view_count": 0},
    {"id": "7", "name": "桂林", "province_id": 20, "province_name": "广西", "highlights": "漓江,象鼻山,阳朔", "description": "山水甲天下，风光绝美的画卷", "image": "https://source.unsplash.com/400x300/?guilin", "best_season": "4-10月", "view_count": 0},
    {"id": "8", "name": "丽江", "province_id": 25, "province_name": "云南", "highlights": "古城,玉龙雪山,泸沽湖", "description": "艳遇之都，纳西文化的传承地", "image": "https://source.unsplash.com/400x300/?lijiang", "best_season": "春秋两季", "view_count": 0},
    {"id": "9", "name": "厦门", "province_id": 13, "province_name": "福建", "highlights": "鼓浪屿,环岛路,南普陀寺", "description": "海上花园，文艺与自然的完美结合", "image": "https://source.unsplash.com/400x300/?xiamen", "best_season": "3-5月,9-11月", "view_count": 0},
    {"id": "10", "name": "青岛", "province_id": 15, "province_name": "山东", "highlights": "栈桥,崂山,啤酒街", "description": "红瓦绿树，碧海蓝天的海滨城市", "image": "https://source.unsplash.com/400x300/?qingdao", "best_season": "夏季", "view_count": 0},
    {"id": "11", "name": "大理", "province_id": 25, "province_name": "云南", "highlights": "洱海,三塔,古城", "description": "风花雪月，白族文化的聚集地", "image": "https://source.unsplash.com/400x300/?dali", "best_season": "春秋两季", "view_count": 0},
    {"id": "12", "name": "敦煌", "province_id": 28, "province_name": "甘肃", "highlights": "莫高窟,鸣沙山,月牙泉", "description": "丝路咽喉，东西方文明的交汇点", "image": "https://source.unsplash.com/400x300/?dunhuang", "best_season": "5-10月", "view_count": 0},
    {"id": "13", "name": "九寨沟", "province_id": 23, "province_name": "四川", "highlights": "五彩池,诺日朗瀑布,珍珠滩", "description": "童话世界，水景之王", "image": "https://source.unsplash.com/400x300/?jiuzhaigou", "best_season": "秋季", "view_count": 0},
    {"id": "14", "name": "黄山", "province_id": 12, "province_name": "安徽", "highlights": "迎客松,光明顶,云海", "description": "五岳归来不看山，黄山归来不看岳", "image": "https://source.unsplash.com/400x300/?huangshan", "best_season": "4-6月,9-11月", "view_count": 0},
    {"id": "15", "name": "张家界", "province_id": 18, "province_name": "湖南", "highlights": "天门山,玻璃栈道,武陵源", "description": "三千奇峰，拔地而起", "image": "https://source.unsplash.com/400x300/?zhangjiajie", "best_season": "4-6月,9-11月", "view_count": 0},
    {"id": "16", "name": "西藏", "province_id": 26, "province_name": "西藏", "highlights": "布达拉宫,纳木错,珠峰", "description": "世界屋脊，雪域高原的信仰之地", "image": "https://source.unsplash.com/400x300/?tibet", "best_season": "5-10月", "view_count": 0},
    {"id": "17", "name": "洛阳", "province_id": 16, "province_name": "河南", "highlights": "龙门石窟,白马寺,牡丹园", "description": "千年帝都，牡丹花城的辉煌", "image": "https://source.unsplash.com/400x300/?luoyang", "best_season": "4-5月", "view_count": 0},
    {"id": "18", "name": "开封", "province_id": 16, "province_name": "河南", "highlights": "清明上河园,龙亭,包公祠", "description": "八朝古都，宋都风韵的再现", "image": "https://source.unsplash.com/400x300/?kaifeng", "best_season": "春秋两季", "view_count": 0},
    {"id": "19", "name": "凤凰古城", "province_id": 18, "province_name": "湖南", "highlights": "吊脚楼,沱江,沈从文故居", "description": "中国最美小城，湘西风情的代表", "image": "https://source.unsplash.com/400x300/?fenghuang", "best_season": "春秋两季", "view_count": 0},
    {"id": "20", "name": "乌镇", "province_id": 11, "province_name": "浙江", "highlights": "古镇,木雕馆,茅盾故居", "description": "江南水乡最后的枕水人家", "image": "https://source.unsplash.com/400x300/?wuzhen", "best_season": "春季", "view_count": 0}
  ]
};

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data.json');
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('数据已初始化到 data.json');
console.log('管理员账户: rement / rement06125');
