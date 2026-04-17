-- ============================================================
-- 大众化辅食食谱扩展（seed_popular_recipes.sql）
-- 小红书风格：粥、面条、饼、饭等家常辅食
-- 从 recipe-036 开始，覆盖 6-24 个月各年龄段
-- ============================================================

-- ============================================================
-- PART 1: 粥类辅食（6-18个月）
-- ============================================================

INSERT INTO recipes (id, title, summary, cover_image, age_label, duration_label, difficulty_label, source, creator, favorites, review_focus, content_status, review_status) VALUES

-- 6-8月龄粥类
('recipe-036', '小米南瓜粥',
 '经典入门粥，小米养胃易消化，南瓜天然甜味宝宝爱吃，适合刚添加辅食的宝宝。',
 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
 '6个月+', '25分钟', '初级', '小红书精选', '辅食妈妈-小雨', 1856, '小米需提前浸泡，粥要煮至软烂', 'published', 'approved'),

('recipe-037', '胡萝卜大米粥',
 '胡萝卜富含β-胡萝卜素护眼，搭配大米熬煮成细腻米糊，颜色金黄诱人。',
 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
 '6个月+', '30分钟', '初级', '小红书精选', '辅食妈妈-晴天', 1432, '胡萝卜切小块更易煮烂', 'published', 'approved'),

('recipe-038', '青菜瘦肉粥',
 '补铁补钙一碗搞定，瘦肉剁成细末，青菜切碎，粥底绵软，营养全面。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '7个月+', '35分钟', '初级', '小红书精选', '辅食妈妈-小雨', 2103, '肉末要剁细，青菜焯水去草酸', 'published', 'approved'),

-- 8-10月龄粥类
('recipe-039', '香菇鸡肉粥',
 '香菇提鲜增免疫力，鸡肉蛋白质丰富，粥煮得稠稠的，宝宝一口气能吃一大碗。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '8个月+', '40分钟', '初级', '小红书精选', '辅食妈妈-晴天', 2567, '香菇切碎，鸡肉煮熟撕丝', 'published', 'approved'),

('recipe-040', '番茄牛肉粥',
 '番茄酸甜开胃，牛肉补铁补锌，粥底浓稠，适合胃口不好的宝宝。',
 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
 '8个月+', '45分钟', '中级', '小红书精选', '辅食妈妈-小雨', 1987, '番茄去皮去籽，牛肉剁成泥', 'published', 'approved'),

('recipe-041', '山药红枣粥',
 '健脾养胃，山药软糯，红枣天然甜，适合消化不良或积食后调理。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '8个月+', '35分钟', '初级', '小红书精选', '辅食妈妈-晴天', 1654, '红枣去核切碎，山药蒸熟压泥', 'published', 'approved'),

-- 10-12月龄粥类
('recipe-042', '鲜虾蔬菜粥',
 '虾仁高蛋白低脂肪，搭配时令蔬菜，粥底鲜美，宝宝超爱吃。',
 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
 '10个月+', '30分钟', '中级', '小红书精选', '辅食妈妈-小雨', 3102, '虾要去虾线，切小块防噎', 'published', 'approved'),

('recipe-043', '排骨青菜粥',
 '排骨熬出的粥底特别香，钙质丰富，青菜补充维生素，营养均衡。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '10个月+', '60分钟', '中级', '小红书精选', '辅食妈妈-晴天', 2234, '排骨提前焯水去血沫', 'published', 'approved'),

-- 12-18月龄粥类
('recipe-044', '皮蛋瘦肉粥',
 '经典广式粥品，皮蛋切碎提鲜，瘦肉嫩滑，粥底绵密，适合大宝宝。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '12个月+', '50分钟', '中级', '小红书精选', '辅食妈妈-小雨', 2876, '皮蛋要切碎，注意盐量控制', 'published', 'approved'),

('recipe-045', '鱼片蔬菜粥',
 '鱼肉DHA丰富，无刺鱼片切薄片，搭配多种蔬菜，营养全面促进大脑发育。',
 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
 '12个月+', '35分钟', '中级', '小红书精选', '辅食妈妈-晴天', 2543, '选择无刺鱼类，仔细检查鱼刺', 'published', 'approved');


-- ============================================================
-- PART 2: 面条类辅食（8-24个月）
-- ============================================================

INSERT INTO recipes (id, title, summary, cover_image, age_label, duration_label, difficulty_label, source, creator, favorites, review_focus, content_status, review_status) VALUES

-- 8-10月龄面条
('recipe-046', '番茄鸡蛋面',
 '番茄酸甜开胃，鸡蛋营养丰富，面条煮软烂，宝宝最爱的快手面。',
 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
 '8个月+', '15分钟', '初级', '小红书精选', '辅食妈妈-小雨', 3456, '面条要煮至软烂，番茄去皮', 'published', 'approved'),

('recipe-047', '青菜肉末面',
 '肉末补铁，青菜补维生素，面条吸收汤汁特别香，营养均衡。',
 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
 '8个月+', '20分钟', '初级', '小红书精选', '辅食妈妈-晴天', 2987, '肉末要剁细，青菜焯水', 'published', 'approved'),

-- 10-12月龄面条
('recipe-048', '虾仁蔬菜面',
 '虾仁鲜美，搭配胡萝卜、西兰花等蔬菜，色彩丰富营养全面。',
 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
 '10个月+', '20分钟', '中级', '小红书精选', '辅食妈妈-小雨', 3234, '虾要去虾线，切小块', 'published', 'approved'),

('recipe-049', '香菇鸡肉面',
 '香菇提鲜，鸡肉嫩滑，汤底浓郁，宝宝能吃一大碗。',
 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
 '10个月+', '25分钟', '中级', '小红书精选', '辅食妈妈-晴天', 2765, '香菇切碎，鸡肉煮熟撕丝', 'published', 'approved'),

-- 12-18月龄面条
('recipe-050', '牛肉番茄面',
 '牛肉补铁补锌，番茄酸甜开胃，面条劲道，适合咀嚼能力强的宝宝。',
 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
 '12个月+', '30分钟', '中级', '小红书精选', '辅食妈妈-小雨', 3567, '牛肉切小块，番茄炒出汁', 'published', 'approved'),

('recipe-051', '三鲜汤面',
 '虾仁、鱼丸、青菜三鲜组合，汤底鲜美，营养丰富。',
 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
 '12个月+', '25分钟', '中级', '小红书精选', '辅食妈妈-晴天', 2987, '食材切小块，汤底要鲜', 'published', 'approved'),

-- 18-24月龄面条
('recipe-052', '炸酱面（宝宝版）',
 '猪肉酱香浓郁，黄瓜丝清爽，面条拌匀，大宝宝的最爱。',
 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
 '18个月+', '30分钟', '中级', '小红书精选', '辅食妈妈-小雨', 3123, '酱料少盐少油，黄瓜切丝', 'published', 'approved'),

('recipe-053', '海鲜乌冬面',
 '乌冬面Q弹，虾仁、鱿鱼、蔬菜丰富，营养全面。',
 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
 '18个月+', '25分钟', '中级', '小红书精选', '辅食妈妈-晴天', 2654, '海鲜要新鲜，切小块', 'published', 'approved');


-- ============================================================
-- PART 3: 饼类辅食（8-24个月）
-- ============================================================

INSERT INTO recipes (id, title, summary, cover_image, age_label, duration_label, difficulty_label, source, creator, favorites, review_focus, content_status, review_status) VALUES

-- 8-10月龄饼类
('recipe-054', '香蕉鸡蛋饼',
 '只需香蕉和鸡蛋两种食材，无需加糖，天然甜味，软嫩好消化。',
 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
 '8个月+', '10分钟', '初级', '小红书精选', '辅食妈妈-小雨', 4567, '香蕉要熟透，小火慢煎', 'published', 'approved'),

('recipe-055', '土豆鸡蛋饼',
 '土豆蒸熟压泥，加鸡蛋和少许面粉，煎至金黄，外酥里嫩。',
 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
 '8个月+', '20分钟', '初级', '小红书精选', '辅食妈妈-晴天', 3876, '土豆要压细，面粉少量', 'published', 'approved'),

-- 10-12月龄饼类
('recipe-056', '胡萝卜鸡蛋饼',
 '胡萝卜擦丝，加鸡蛋和面粉，煎成小饼，色彩鲜艳营养丰富。',
 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
 '10个月+', '15分钟', '初级', '小红书精选', '辅食妈妈-小雨', 4123, '胡萝卜擦细丝，小火煎', 'published', 'approved'),

('recipe-057', '西葫芦虾仁饼',
 '西葫芦水分多，虾仁鲜美，饼软嫩多汁，宝宝超爱。',
 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
 '10个月+', '20分钟', '中级', '小红书精选', '辅食妈妈-晴天', 3654, '西葫芦挤水，虾剁碎', 'published', 'approved'),

-- 12-18月龄饼类
('recipe-058', '蔬菜鸡肉饼',
 '鸡肉剁成泥，加多种蔬菜碎，煎成小饼，营养全面。',
 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
 '12个月+', '25分钟', '中级', '小红书精选', '辅食妈妈-小雨', 3987, '肉泥要细腻，蔬菜切碎', 'published', 'approved'),

('recipe-059', '南瓜鸡蛋饼',
 '南瓜蒸熟压泥，加鸡蛋和面粉，煎至金黄，香甜软糯。',
 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
 '12个月+', '20分钟', '初级', '小红书精选', '辅食妈妈-晴天', 4234, '南瓜泥要细腻，面粉适量', 'published', 'approved'),

-- 18-24月龄饼类
('recipe-060', '玉米鸡蛋饼',
 '玉米粒香甜，鸡蛋营养，加少许面粉，煎成金黄小饼。',
 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
 '18个月+', '15分钟', '初级', '小红书精选', '辅食妈妈-小雨', 3765, '玉米粒要煮熟，可压碎', 'published', 'approved'),

('recipe-061', '韭菜鸡蛋饼',
 '韭菜提香，鸡蛋营养，饼香软可口，适合大宝宝。',
 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
 '18个月+', '15分钟', '初级', '小红书精选', '辅食妈妈-晴天', 3234, '韭菜切碎，注意消化', 'published', 'approved');


-- ============================================================
-- PART 4: 饭类辅食（10-24个月）
-- ============================================================

INSERT INTO recipes (id, title, summary, cover_image, age_label, duration_label, difficulty_label, source, creator, favorites, review_focus, content_status, review_status) VALUES

-- 10-12月龄饭类
('recipe-062', '番茄牛肉焖饭',
 '番茄酸甜，牛肉补铁，米饭软烂，一锅出，营养全面。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '10个月+', '35分钟', '中级', '小红书精选', '辅食妈妈-小雨', 3456, '米饭要软烂，牛肉切小块', 'published', 'approved'),

('recipe-063', '蔬菜鸡肉焖饭',
 '鸡肉嫩滑，蔬菜丰富，米饭吸收汤汁特别香。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '10个月+', '30分钟', '中级', '小红书精选', '辅食妈妈-晴天', 3123, '鸡肉切丁，蔬菜切碎', 'published', 'approved'),

-- 12-18月龄饭类
('recipe-064', '虾仁蛋炒饭',
 '虾仁鲜美，鸡蛋营养，米饭粒粒分明，宝宝版炒饭。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '12个月+', '15分钟', '初级', '小红书精选', '辅食妈妈-小雨', 4234, '米饭要隔夜饭，虾切小块', 'published', 'approved'),

('recipe-065', '香菇青菜饭',
 '香菇提鲜，青菜补维生素，米饭软糯，营养均衡。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '12个月+', '25分钟', '初级', '小红书精选', '辅食妈妈-晴天', 2987, '香菇切碎，青菜焯水', 'published', 'approved'),

('recipe-066', '胡萝卜肉末饭',
 '胡萝卜护眼，肉末补铁，米饭香软，宝宝爱吃。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '12个月+', '30分钟', '初级', '小红书精选', '辅食妈妈-小雨', 3345, '肉末剁细，胡萝卜切丁', 'published', 'approved'),

-- 18-24月龄饭类
('recipe-067', '咖喱鸡肉饭（宝宝版）',
 '咖喱微辣开胃，鸡肉嫩滑，土豆胡萝卜丰富，营养全面。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '18个月+', '35分钟', '中级', '小红书精选', '辅食妈妈-小雨', 3876, '咖喱要宝宝专用，不辣', 'published', 'approved'),

('recipe-068', '什锦蔬菜炒饭',
 '多种蔬菜丰富，鸡蛋火腿提香，米饭粒粒分明，色彩缤纷。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '18个月+', '20分钟', '初级', '小红书精选', '辅食妈妈-晴天', 4123, '蔬菜切小丁，米饭要隔夜', 'published', 'approved'),

('recipe-069', '番茄虾仁烩饭',
 '番茄酸甜，虾仁鲜美，米饭软烂，汤汁浓郁。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '18个月+', '25分钟', '中级', '小红书精选', '辅食妈妈-小雨', 3654, '番茄炒出汁，虾切小块', 'published', 'approved'),

('recipe-070', '肉酱意面饭',
 '肉酱浓郁，意面Q弹，营养丰富，大宝宝的最爱。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '18个月+', '30分钟', '中级', '小红书精选', '辅食妈妈-晴天', 3987, '肉酱要炒香，意面煮软', 'published', 'approved');
-- ============================================================
-- 食材表（recipe_ingredients）- 大众化辅食食谱
-- ============================================================

INSERT INTO recipe_ingredients (id, recipe_id, name, amount, unit) VALUES

-- recipe-036: 小米南瓜粥
('ingredient-101', 'recipe-036', '小米', '30', 'g'),
('ingredient-102', 'recipe-036', '南瓜', '50', 'g'),
('ingredient-103', 'recipe-036', '水', '300', 'ml'),

-- recipe-037: 胡萝卜大米粥
('ingredient-104', 'recipe-037', '大米', '30', 'g'),
('ingredient-105', 'recipe-037', '胡萝卜', '40', 'g'),
('ingredient-106', 'recipe-037', '水', '300', 'ml'),

-- recipe-038: 青菜瘦肉粥
('ingredient-107', 'recipe-038', '大米', '30', 'g'),
('ingredient-108', 'recipe-038', '猪瘦肉', '30', 'g'),
('ingredient-109', 'recipe-038', '青菜', '20', 'g'),
('ingredient-110', 'recipe-038', '水', '350', 'ml'),

-- recipe-039: 香菇鸡肉粥
('ingredient-111', 'recipe-039', '大米', '40', 'g'),
('ingredient-112', 'recipe-039', '鸡胸肉', '30', 'g'),
('ingredient-113', 'recipe-039', '香菇', '2', '朵'),
('ingredient-114', 'recipe-039', '水', '400', 'ml'),

-- recipe-040: 番茄牛肉粥
('ingredient-115', 'recipe-040', '大米', '40', 'g'),
('ingredient-116', 'recipe-040', '牛肉', '30', 'g'),
('ingredient-117', 'recipe-040', '番茄', '1', '个'),
('ingredient-118', 'recipe-040', '水', '400', 'ml'),

-- recipe-041: 山药红枣粥
('ingredient-119', 'recipe-041', '大米', '30', 'g'),
('ingredient-120', 'recipe-041', '山药', '50', 'g'),
('ingredient-121', 'recipe-041', '红枣', '3', '颗'),
('ingredient-122', 'recipe-041', '水', '350', 'ml'),

-- recipe-042: 鲜虾蔬菜粥
('ingredient-123', 'recipe-042', '大米', '40', 'g'),
('ingredient-124', 'recipe-042', '鲜虾', '5', '只'),
('ingredient-125', 'recipe-042', '西兰花', '30', 'g'),
('ingredient-126', 'recipe-042', '胡萝卜', '20', 'g'),
('ingredient-127', 'recipe-042', '水', '400', 'ml'),

-- recipe-043: 排骨青菜粥
('ingredient-128', 'recipe-043', '大米', '40', 'g'),
('ingredient-129', 'recipe-043', '排骨', '100', 'g'),
('ingredient-130', 'recipe-043', '青菜', '30', 'g'),
('ingredient-131', 'recipe-043', '水', '500', 'ml'),

-- recipe-044: 皮蛋瘦肉粥
('ingredient-132', 'recipe-044', '大米', '50', 'g'),
('ingredient-133', 'recipe-044', '皮蛋', '1', '个'),
('ingredient-134', 'recipe-044', '猪瘦肉', '40', 'g'),
('ingredient-135', 'recipe-044', '姜丝', '少许', ''),
('ingredient-136', 'recipe-044', '水', '450', 'ml'),

-- recipe-045: 鱼片蔬菜粥
('ingredient-137', 'recipe-045', '大米', '50', 'g'),
('ingredient-138', 'recipe-045', '龙利鱼', '50', 'g'),
('ingredient-139', 'recipe-045', '西兰花', '30', 'g'),
('ingredient-140', 'recipe-045', '胡萝卜', '20', 'g'),
('ingredient-141', 'recipe-045', '水', '450', 'ml'),

-- recipe-046: 番茄鸡蛋面
('ingredient-142', 'recipe-046', '宝宝面条', '50', 'g'),
('ingredient-143', 'recipe-046', '番茄', '1', '个'),
('ingredient-144', 'recipe-046', '鸡蛋', '1', '个'),
('ingredient-145', 'recipe-046', '水', '300', 'ml'),

-- recipe-047: 青菜肉末面
('ingredient-146', 'recipe-047', '宝宝面条', '50', 'g'),
('ingredient-147', 'recipe-047', '猪肉末', '30', 'g'),
('ingredient-148', 'recipe-047', '青菜', '30', 'g'),
('ingredient-149', 'recipe-047', '水', '300', 'ml'),

-- recipe-048: 虾仁蔬菜面
('ingredient-150', 'recipe-048', '宝宝面条', '50', 'g'),
('ingredient-151', 'recipe-048', '虾仁', '5', '只'),
('ingredient-152', 'recipe-048', '西兰花', '30', 'g'),
('ingredient-153', 'recipe-048', '胡萝卜', '20', 'g'),
('ingredient-154', 'recipe-048', '水', '300', 'ml'),

-- recipe-049: 香菇鸡肉面
('ingredient-155', 'recipe-049', '宝宝面条', '50', 'g'),
('ingredient-156', 'recipe-049', '鸡胸肉', '40', 'g'),
('ingredient-157', 'recipe-049', '香菇', '2', '朵'),
('ingredient-158', 'recipe-049', '青菜', '20', 'g'),
('ingredient-159', 'recipe-049', '水', '350', 'ml'),

-- recipe-050: 牛肉番茄面
('ingredient-160', 'recipe-050', '宝宝面条', '60', 'g'),
('ingredient-161', 'recipe-050', '牛肉', '40', 'g'),
('ingredient-162', 'recipe-050', '番茄', '1', '个'),
('ingredient-163', 'recipe-050', '洋葱', '20', 'g'),
('ingredient-164', 'recipe-050', '水', '350', 'ml'),

-- recipe-051: 三鲜汤面
('ingredient-165', 'recipe-051', '宝宝面条', '60', 'g'),
('ingredient-166', 'recipe-051', '虾仁', '5', '只'),
('ingredient-167', 'recipe-051', '鱼丸', '3', '个'),
('ingredient-168', 'recipe-051', '青菜', '30', 'g'),
('ingredient-169', 'recipe-051', '水', '350', 'ml'),

-- recipe-052: 炸酱面（宝宝版）
('ingredient-170', 'recipe-052', '宝宝面条', '60', 'g'),
('ingredient-171', 'recipe-052', '猪肉末', '50', 'g'),
('ingredient-172', 'recipe-052', '黄瓜', '30', 'g'),
('ingredient-173', 'recipe-052', '胡萝卜', '20', 'g'),
('ingredient-174', 'recipe-052', '宝宝酱油', '少许', ''),

-- recipe-053: 海鲜乌冬面
('ingredient-175', 'recipe-053', '乌冬面', '80', 'g'),
('ingredient-176', 'recipe-053', '虾仁', '5', '只'),
('ingredient-177', 'recipe-053', '鱿鱼', '30', 'g'),
('ingredient-178', 'recipe-053', '西兰花', '30', 'g'),
('ingredient-179', 'recipe-053', '水', '300', 'ml'),

-- recipe-054: 香蕉鸡蛋饼
('ingredient-180', 'recipe-054', '香蕉', '1', '根'),
('ingredient-181', 'recipe-054', '鸡蛋', '1', '个'),

-- recipe-055: 土豆鸡蛋饼
('ingredient-182', 'recipe-055', '土豆', '100', 'g'),
('ingredient-183', 'recipe-055', '鸡蛋', '1', '个'),
('ingredient-184', 'recipe-055', '面粉', '20', 'g'),

-- recipe-056: 胡萝卜鸡蛋饼
('ingredient-185', 'recipe-056', '胡萝卜', '80', 'g'),
('ingredient-186', 'recipe-056', '鸡蛋', '1', '个'),
('ingredient-187', 'recipe-056', '面粉', '30', 'g'),

-- recipe-057: 西葫芦虾仁饼
('ingredient-188', 'recipe-057', '西葫芦', '100', 'g'),
('ingredient-189', 'recipe-057', '虾仁', '5', '只'),
('ingredient-190', 'recipe-057', '鸡蛋', '1', '个'),
('ingredient-191', 'recipe-057', '面粉', '30', 'g'),

-- recipe-058: 蔬菜鸡肉饼
('ingredient-192', 'recipe-058', '鸡胸肉', '80', 'g'),
('ingredient-193', 'recipe-058', '胡萝卜', '30', 'g'),
('ingredient-194', 'recipe-058', '西兰花', '30', 'g'),
('ingredient-195', 'recipe-058', '鸡蛋', '1', '个'),
('ingredient-196', 'recipe-058', '面粉', '20', 'g'),

-- recipe-059: 南瓜鸡蛋饼
('ingredient-197', 'recipe-059', '南瓜', '100', 'g'),
('ingredient-198', 'recipe-059', '鸡蛋', '1', '个'),
('ingredient-199', 'recipe-059', '面粉', '30', 'g'),

-- recipe-060: 玉米鸡蛋饼
('ingredient-200', 'recipe-060', '玉米粒', '80', 'g'),
('ingredient-201', 'recipe-060', '鸡蛋', '1', '个'),
('ingredient-202', 'recipe-060', '面粉', '30', 'g'),

-- recipe-061: 韭菜鸡蛋饼
('ingredient-203', 'recipe-061', '韭菜', '50', 'g'),
('ingredient-204', 'recipe-061', '鸡蛋', '2', '个'),
('ingredient-205', 'recipe-061', '面粉', '40', 'g'),

-- recipe-062: 番茄牛肉焖饭
('ingredient-206', 'recipe-062', '大米', '50', 'g'),
('ingredient-207', 'recipe-062', '牛肉', '50', 'g'),
('ingredient-208', 'recipe-062', '番茄', '1', '个'),
('ingredient-209', 'recipe-062', '洋葱', '20', 'g'),
('ingredient-210', 'recipe-062', '水', '150', 'ml'),

-- recipe-063: 蔬菜鸡肉焖饭
('ingredient-211', 'recipe-063', '大米', '50', 'g'),
('ingredient-212', 'recipe-063', '鸡胸肉', '50', 'g'),
('ingredient-213', 'recipe-063', '胡萝卜', '30', 'g'),
('ingredient-214', 'recipe-063', '西兰花', '30', 'g'),
('ingredient-215', 'recipe-063', '水', '150', 'ml'),

-- recipe-064: 虾仁蛋炒饭
('ingredient-216', 'recipe-064', '米饭', '100', 'g'),
('ingredient-217', 'recipe-064', '虾仁', '5', '只'),
('ingredient-218', 'recipe-064', '鸡蛋', '1', '个'),
('ingredient-219', 'recipe-064', '青豆', '20', 'g'),
('ingredient-220', 'recipe-064', '胡萝卜', '20', 'g'),

-- recipe-065: 香菇青菜饭
('ingredient-221', 'recipe-065', '大米', '50', 'g'),
('ingredient-222', 'recipe-065', '香菇', '3', '朵'),
('ingredient-223', 'recipe-065', '青菜', '40', 'g'),
('ingredient-224', 'recipe-065', '水', '150', 'ml'),

-- recipe-066: 胡萝卜肉末饭
('ingredient-225', 'recipe-066', '大米', '50', 'g'),
('ingredient-226', 'recipe-066', '猪肉末', '40', 'g'),
('ingredient-227', 'recipe-066', '胡萝卜', '40', 'g'),
('ingredient-228', 'recipe-066', '水', '150', 'ml'),

-- recipe-067: 咖喱鸡肉饭（宝宝版）
('ingredient-229', 'recipe-067', '大米', '60', 'g'),
('ingredient-230', 'recipe-067', '鸡胸肉', '60', 'g'),
('ingredient-231', 'recipe-067', '土豆', '50', 'g'),
('ingredient-232', 'recipe-067', '胡萝卜', '30', 'g'),
('ingredient-233', 'recipe-067', '宝宝咖喱块', '1', '块'),
('ingredient-234', 'recipe-067', '水', '200', 'ml'),

-- recipe-068: 什锦蔬菜炒饭
('ingredient-235', 'recipe-068', '米饭', '100', 'g'),
('ingredient-236', 'recipe-068', '鸡蛋', '1', '个'),
('ingredient-237', 'recipe-068', '火腿', '20', 'g'),
('ingredient-238', 'recipe-068', '玉米粒', '20', 'g'),
('ingredient-239', 'recipe-068', '青豆', '20', 'g'),
('ingredient-240', 'recipe-068', '胡萝卜', '20', 'g'),

-- recipe-069: 番茄虾仁烩饭
('ingredient-241', 'recipe-069', '大米', '60', 'g'),
('ingredient-242', 'recipe-069', '虾仁', '8', '只'),
('ingredient-243', 'recipe-069', '番茄', '1', '个'),
('ingredient-244', 'recipe-069', '洋葱', '20', 'g'),
('ingredient-245', 'recipe-069', '水', '200', 'ml'),

-- recipe-070: 肉酱意面饭
('ingredient-246', 'recipe-070', '意大利面', '60', 'g'),
('ingredient-247', 'recipe-070', '猪肉末', '50', 'g'),
('ingredient-248', 'recipe-070', '番茄', '1', '个'),
('ingredient-249', 'recipe-070', '洋葱', '20', 'g'),
('ingredient-250', 'recipe-070', '胡萝卜', '20', 'g');
-- ============================================================
-- 制作步骤表（recipe_steps）- 大众化辅食食谱
-- ============================================================

INSERT INTO recipe_steps (id, recipe_id, step_no, title, description, image_url) VALUES

-- recipe-036: 小米南瓜粥
('step-155', 'recipe-036', 1, '准备食材', '小米提前浸泡30分钟，南瓜去皮切小块。', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80'),
('step-156', 'recipe-036', 2, '煮粥', '小米和南瓜一起放入锅中，加水煮25分钟至软烂。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),
('step-157', 'recipe-036', 3, '搅拌成糊', '用勺子压碎南瓜，搅拌均匀即可。', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80'),

-- recipe-037: 胡萝卜大米粥
('step-158', 'recipe-037', 1, '准备食材', '大米洗净，胡萝卜去皮切小块。', 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=400&q=80'),
('step-159', 'recipe-037', 2, '煮粥', '大米和胡萝卜一起煮30分钟至软烂。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),
('step-160', 'recipe-037', 3, '搅拌', '用料理棒打成细腻米糊，或用勺子压碎。', 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=400&q=80'),

-- recipe-038: 青菜瘦肉粥
('step-161', 'recipe-038', 1, '处理食材', '大米洗净，瘦肉剁成细末，青菜焯水切碎。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),
('step-162', 'recipe-038', 2, '煮粥底', '大米加水煮25分钟成粥底。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),
('step-163', 'recipe-038', 3, '加肉末和青菜', '加入肉末煮5分钟，最后加青菜煮2分钟即可。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),

-- recipe-039: 香菇鸡肉粥
('step-164', 'recipe-039', 1, '准备食材', '大米洗净，香菇泡发切碎，鸡肉煮熟撕丝。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),
('step-165', 'recipe-039', 2, '煮粥', '大米和香菇一起煮30分钟。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),
('step-166', 'recipe-039', 3, '加鸡肉', '加入鸡肉丝煮5分钟，搅拌均匀即可。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),

-- recipe-040: 番茄牛肉粥
('step-167', 'recipe-040', 1, '处理食材', '番茄去皮去籽切碎，牛肉剁成泥。', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'),
('step-168', 'recipe-040', 2, '煮粥底', '大米加水煮25分钟。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'),
('step-169', 'recipe-040', 3, '加番茄和牛肉', '加入番茄和牛肉泥，煮15分钟至牛肉熟透。', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'),

-- recipe-046: 番茄鸡蛋面
('step-170', 'recipe-046', 1, '处理番茄', '番茄去皮切小块，鸡蛋打散。', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'),
('step-171', 'recipe-046', 2, '炒番茄', '锅中少许油，炒番茄出汁。', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'),
('step-172', 'recipe-046', 3, '煮面', '加水煮开，下面条煮软，倒入蛋液搅拌即可。', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'),

-- recipe-047: 青菜肉末面
('step-173', 'recipe-047', 1, '准备食材', '肉末剁细，青菜焯水切碎。', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'),
('step-174', 'recipe-047', 2, '炒肉末', '锅中少许油，炒肉末至变色。', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'),
('step-175', 'recipe-047', 3, '煮面', '加水煮开，下面条煮软，加青菜煮2分钟即可。', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'),

-- recipe-054: 香蕉鸡蛋饼
('step-176', 'recipe-054', 1, '混合食材', '香蕉压成泥，加入鸡蛋搅拌均匀。', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80'),
('step-177', 'recipe-054', 2, '煎饼', '平底锅刷少许油，倒入面糊，小火煎至两面金黄。', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80'),
('step-178', 'recipe-054', 3, '切块', '稍凉后切成小块，方便宝宝抓握。', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80'),

-- recipe-055: 土豆鸡蛋饼
('step-179', 'recipe-055', 1, '蒸土豆', '土豆蒸熟压成泥。', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80'),
('step-180', 'recipe-055', 2, '混合', '土豆泥加鸡蛋和少许面粉，搅拌成糊状。', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80'),
('step-181', 'recipe-055', 3, '煎饼', '平底锅刷油，倒入面糊煎至两面金黄。', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80'),

-- recipe-064: 虾仁蛋炒饭
('step-182', 'recipe-064', 1, '准备食材', '虾仁去虾线切小块，鸡蛋打散，蔬菜切丁。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80'),
('step-183', 'recipe-064', 2, '炒蛋和虾', '锅中少许油，炒鸡蛋盛出，再炒虾仁。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80'),
('step-184', 'recipe-064', 3, '炒饭', '加入米饭和蔬菜丁翻炒，最后加鸡蛋拌匀。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80'),

-- recipe-068: 什锦蔬菜炒饭
('step-185', 'recipe-068', 1, '准备食材', '所有蔬菜切小丁，火腿切丁，鸡蛋打散。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80'),
('step-186', 'recipe-068', 2, '炒蛋', '锅中少许油，炒鸡蛋盛出。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80'),
('step-187', 'recipe-068', 3, '炒饭', '加入所有食材和米饭翻炒均匀即可。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80');
-- ============================================================
-- 标签表（recipe_tags）- 大众化辅食食谱
-- ============================================================

INSERT INTO recipe_tags (id, recipe_id, name) VALUES

-- recipe-036: 小米南瓜粥
('tag-101', 'recipe-036', '粥类'),
('tag-102', 'recipe-036', '养胃'),
('tag-103', 'recipe-036', '6个月+'),
('tag-104', 'recipe-036', '易消化'),

-- recipe-037: 胡萝卜大米粥
('tag-105', 'recipe-037', '粥类'),
('tag-106', 'recipe-037', '护眼'),
('tag-107', 'recipe-037', '6个月+'),
('tag-108', 'recipe-037', '补维生素'),

-- recipe-038: 青菜瘦肉粥
('tag-109', 'recipe-038', '粥类'),
('tag-110', 'recipe-038', '补铁'),
('tag-111', 'recipe-038', '7个月+'),
('tag-112', 'recipe-038', '营养全面'),

-- recipe-039: 香菇鸡肉粥
('tag-113', 'recipe-039', '粥类'),
('tag-114', 'recipe-039', '增强免疫'),
('tag-115', 'recipe-039', '8个月+'),
('tag-116', 'recipe-039', '补蛋白'),

-- recipe-040: 番茄牛肉粥
('tag-117', 'recipe-040', '粥类'),
('tag-118', 'recipe-040', '开胃'),
('tag-119', 'recipe-040', '8个月+'),
('tag-120', 'recipe-040', '补铁补锌'),

-- recipe-041: 山药红枣粥
('tag-121', 'recipe-041', '粥类'),
('tag-122', 'recipe-041', '健脾'),
('tag-123', 'recipe-041', '8个月+'),
('tag-124', 'recipe-041', '调理肠胃'),

-- recipe-042: 鲜虾蔬菜粥
('tag-125', 'recipe-042', '粥类'),
('tag-126', 'recipe-042', '高蛋白'),
('tag-127', 'recipe-042', '10个月+'),
('tag-128', 'recipe-042', '营养丰富'),

-- recipe-043: 排骨青菜粥
('tag-129', 'recipe-043', '粥类'),
('tag-130', 'recipe-043', '补钙'),
('tag-131', 'recipe-043', '10个月+'),
('tag-132', 'recipe-043', '鲜美'),

-- recipe-044: 皮蛋瘦肉粥
('tag-133', 'recipe-044', '粥类'),
('tag-134', 'recipe-044', '广式'),
('tag-135', 'recipe-044', '12个月+'),
('tag-136', 'recipe-044', '经典'),

-- recipe-045: 鱼片蔬菜粥
('tag-137', 'recipe-045', '粥类'),
('tag-138', 'recipe-045', 'DHA'),
('tag-139', 'recipe-045', '12个月+'),
('tag-140', 'recipe-045', '促进大脑发育'),

-- recipe-046: 番茄鸡蛋面
('tag-141', 'recipe-046', '面条'),
('tag-142', 'recipe-046', '开胃'),
('tag-143', 'recipe-046', '8个月+'),
('tag-144', 'recipe-046', '快手'),

-- recipe-047: 青菜肉末面
('tag-145', 'recipe-047', '面条'),
('tag-146', 'recipe-047', '补铁'),
('tag-147', 'recipe-047', '8个月+'),
('tag-148', 'recipe-047', '营养均衡'),

-- recipe-048: 虾仁蔬菜面
('tag-149', 'recipe-048', '面条'),
('tag-150', 'recipe-048', '高蛋白'),
('tag-151', 'recipe-048', '10个月+'),
('tag-152', 'recipe-048', '色彩丰富'),

-- recipe-049: 香菇鸡肉面
('tag-153', 'recipe-049', '面条'),
('tag-154', 'recipe-049', '提鲜'),
('tag-155', 'recipe-049', '10个月+'),
('tag-156', 'recipe-049', '鲜美'),

-- recipe-050: 牛肉番茄面
('tag-157', 'recipe-050', '面条'),
('tag-158', 'recipe-050', '补铁补锌'),
('tag-159', 'recipe-050', '12个月+'),
('tag-160', 'recipe-050', '开胃'),

-- recipe-051: 三鲜汤面
('tag-161', 'recipe-051', '面条'),
('tag-162', 'recipe-051', '海鲜'),
('tag-163', 'recipe-051', '12个月+'),
('tag-164', 'recipe-051', '营养丰富'),

-- recipe-052: 炸酱面（宝宝版）
('tag-165', 'recipe-052', '面条'),
('tag-166', 'recipe-052', '酱香'),
('tag-167', 'recipe-052', '18个月+'),
('tag-168', 'recipe-052', '大宝宝最爱'),

-- recipe-053: 海鲜乌冬面
('tag-169', 'recipe-053', '面条'),
('tag-170', 'recipe-053', '海鲜'),
('tag-171', 'recipe-053', '18个月+'),
('tag-172', 'recipe-053', 'Q弹'),

-- recipe-054: 香蕉鸡蛋饼
('tag-173', 'recipe-054', '饼类'),
('tag-174', 'recipe-054', '无糖'),
('tag-175', 'recipe-054', '8个月+'),
('tag-176', 'recipe-054', '手指食物'),

-- recipe-055: 土豆鸡蛋饼
('tag-177', 'recipe-055', '饼类'),
('tag-178', 'recipe-055', '软嫩'),
('tag-179', 'recipe-055', '8个月+'),
('tag-180', 'recipe-055', '易消化'),

-- recipe-056: 胡萝卜鸡蛋饼
('tag-181', 'recipe-056', '饼类'),
('tag-182', 'recipe-056', '护眼'),
('tag-183', 'recipe-056', '10个月+'),
('tag-184', 'recipe-056', '色彩鲜艳'),

-- recipe-057: 西葫芦虾仁饼
('tag-185', 'recipe-057', '饼类'),
('tag-186', 'recipe-057', '高蛋白'),
('tag-187', 'recipe-057', '10个月+'),
('tag-188', 'recipe-057', '多汁'),

-- recipe-058: 蔬菜鸡肉饼
('tag-189', 'recipe-058', '饼类'),
('tag-190', 'recipe-058', '营养全面'),
('tag-191', 'recipe-058', '12个月+'),
('tag-192', 'recipe-058', '补蛋白'),

-- recipe-059: 南瓜鸡蛋饼
('tag-193', 'recipe-059', '饼类'),
('tag-194', 'recipe-059', '香甜'),
('tag-195', 'recipe-059', '12个月+'),
('tag-196', 'recipe-059', '软糯'),

-- recipe-060: 玉米鸡蛋饼
('tag-197', 'recipe-060', '饼类'),
('tag-198', 'recipe-060', '香甜'),
('tag-199', 'recipe-060', '18个月+'),
('tag-200', 'recipe-060', '快手'),

-- recipe-061: 韭菜鸡蛋饼
('tag-201', 'recipe-061', '饼类'),
('tag-202', 'recipe-061', '提香'),
('tag-203', 'recipe-061', '18个月+'),
('tag-204', 'recipe-061', '家常'),

-- recipe-062: 番茄牛肉焖饭
('tag-205', 'recipe-062', '饭类'),
('tag-206', 'recipe-062', '补铁'),
('tag-207', 'recipe-062', '10个月+'),
('tag-208', 'recipe-062', '一锅出'),

-- recipe-063: 蔬菜鸡肉焖饭
('tag-209', 'recipe-063', '饭类'),
('tag-210', 'recipe-063', '营养全面'),
('tag-211', 'recipe-063', '10个月+'),
('tag-212', 'recipe-063', '软烂'),

-- recipe-064: 虾仁蛋炒饭
('tag-213', 'recipe-064', '饭类'),
('tag-214', 'recipe-064', '炒饭'),
('tag-215', 'recipe-064', '12个月+'),
('tag-216', 'recipe-064', '高蛋白'),

-- recipe-065: 香菇青菜饭
('tag-217', 'recipe-065', '饭类'),
('tag-218', 'recipe-065', '提鲜'),
('tag-219', 'recipe-065', '12个月+'),
('tag-220', 'recipe-065', '营养均衡'),

-- recipe-066: 胡萝卜肉末饭
('tag-221', 'recipe-066', '饭类'),
('tag-222', 'recipe-066', '补铁'),
('tag-223', 'recipe-066', '12个月+'),
('tag-224', 'recipe-066', '护眼'),

-- recipe-067: 咖喱鸡肉饭（宝宝版）
('tag-225', 'recipe-067', '饭类'),
('tag-226', 'recipe-067', '咖喱'),
('tag-227', 'recipe-067', '18个月+'),
('tag-228', 'recipe-067', '开胃'),

-- recipe-068: 什锦蔬菜炒饭
('tag-229', 'recipe-068', '饭类'),
('tag-230', 'recipe-068', '炒饭'),
('tag-231', 'recipe-068', '18个月+'),
('tag-232', 'recipe-068', '色彩缤纷'),

-- recipe-069: 番茄虾仁烩饭
('tag-233', 'recipe-069', '饭类'),
('tag-234', 'recipe-069', '酸甜'),
('tag-235', 'recipe-069', '18个月+'),
('tag-236', 'recipe-069', '高蛋白'),

-- recipe-070: 肉酱意面饭
('tag-237', 'recipe-070', '饭类'),
('tag-238', 'recipe-070', '意面'),
('tag-239', 'recipe-070', '18个月+'),
('tag-240', 'recipe-070', '浓郁');
