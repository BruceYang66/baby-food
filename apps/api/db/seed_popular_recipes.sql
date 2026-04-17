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
