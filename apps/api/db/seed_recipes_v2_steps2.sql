
-- ============================================================
-- Steps for 12-18 month key recipes
-- ============================================================
INSERT INTO recipe_steps (id, recipe_id, step_no, title, description, image_url) VALUES
('step-v2-031', 'recipe-096', 1, '处理牛肉', '牛肉末加少量淀粉和姜汁腌制10分钟去腥，番茄用开水烫后去皮切小丁。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-032', 'recipe-096', 2, '炒制食材', '锅中加少量油，先炒番茄出汁，加入牛肉末翻炒至变色，加少量水焖煮5分钟。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-033', 'recipe-096', 3, '拌入软饭', '将炒好的番茄牛肉浇在软饭上，搅拌均匀，确保饭粒软烂，温度适宜后喂食。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-034', 'recipe-102', 1, '煮面条', '细面条折成短段，锅中加水烧开，下面条煮8分钟至软烂，捞出备用。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-035', 'recipe-102', 2, '炒番茄蛋', '番茄去皮切丁，锅中加少量油，先炒番茄出汁，打入鸡蛋搅散成蛋花，加少量水。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-036', 'recipe-102', 3, '混合装碗', '将煮好的面条加入番茄蛋汤中，搅拌均匀，确保面条足够软烂，温度适宜后喂食。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-037', 'recipe-103', 1, '处理三文鱼', '三文鱼去皮去刺，切小块，加几滴柠檬汁腌制5分钟，上锅蒸8分钟至熟，用叉子压碎。', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80'),
('step-v2-038', 'recipe-103', 2, '炒饭', '锅中加少量油，加入胡萝卜末翻炒1分钟，加入米饭翻炒均匀，加入三文鱼碎继续翻炒。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-039', 'recipe-103', 3, '出锅装碗', '翻炒均匀后出锅，确保米饭不过干，温度降至适宜后喂食，可加少量温水调节。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-040', 'recipe-113', 1, '准备食材', '香菇洗净切成细末，鸡蛋打散，加入80ml温水搅拌均匀，加入香菇末混合。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-041', 'recipe-113', 2, '过筛蒸制', '蛋液用细筛过滤一遍，去除气泡，蒸锅水开后放入，盖保鲜膜扎孔，中小火蒸12分钟。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-042', 'recipe-113', 3, '检查出锅', '用牙签插入蒸蛋，无液体流出即熟，表面光滑无气泡，温度适宜后喂食。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-043', 'recipe-123', 1, '准备食材', '熟香蕉去皮，用叉子压成细腻泥状。鸡蛋打散，加入香蕉泥和燕麦粉搅拌均匀。', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'),
('step-v2-044', 'recipe-123', 2, '煎制松饼', '平底锅小火加热，加少量油，用勺子舀入面糊，煎至表面起泡后翻面，两面金黄即可。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-045', 'recipe-123', 3, '出锅装盘', '松饼出锅后稍微冷却，切成适合宝宝抓握的小块，可作为手指食物或加餐零食。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Steps for 19-24 month key recipes
-- ============================================================
INSERT INTO recipe_steps (id, recipe_id, step_no, title, description, image_url) VALUES
('step-v2-046', 'recipe-126', 1, '煮意面', '意大利面折成短段，锅中加水烧开，下意面煮10分钟至软烂，捞出备用。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-047', 'recipe-126', 2, '炒番茄牛肉酱', '番茄去皮切丁，锅中加少量油，炒番茄出汁，加入牛肉末翻炒至变色，加少量水焖煮8分钟。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-048', 'recipe-126', 3, '拌面装碗', '将番茄牛肉酱浇在意面上，搅拌均匀，确保意面足够软烂，温度适宜后喂食。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-049', 'recipe-130', 1, '准备南瓜蛋液', '南瓜蒸熟后压成泥，鸡蛋打散，加入南瓜泥和面粉搅拌成均匀面糊，稠度适中。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-050', 'recipe-130', 2, '煎制蛋饼', '平底锅小火加热，加少量油，倒入面糊摊成薄饼，煎至底部金黄后翻面，两面熟透。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-051', 'recipe-130', 3, '切块装盘', '蛋饼出锅后切成适合宝宝抓握的小块，颜色金黄，可作为早餐或加餐手指食物。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-052', 'recipe-135', 1, '准备食材', '番茄去皮切丁，鸡蛋打散备用，米饭提前蒸好备用。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-053', 'recipe-135', 2, '炒番茄蛋', '锅中加少量油，先炒番茄出汁，倒入蛋液翻炒成蛋花，加少量盐调味（可省略）。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-054', 'recipe-135', 3, '加入米饭', '加入米饭翻炒均匀，让米饭充分吸收番茄汁，颜色橙红，出锅温度适宜后喂食。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-055', 'recipe-144', 1, '准备食材', '熟香蕉压成泥，即食燕麦加少量温水泡软，鸡蛋打散，三者混合搅拌均匀。', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'),
('step-v2-056', 'recipe-144', 2, '烤制燕麦饼', '烤箱预热180°C，将面糊用勺子舀在烤盘上，压成圆饼形，烤15分钟至金黄。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-057', 'recipe-144', 3, '出炉冷却', '燕麦饼出炉后冷却5分钟，外酥内软，天然甜味无需加糖，是宝宝健康零食。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Steps for 24+ month key recipes
-- ============================================================
INSERT INTO recipe_steps (id, recipe_id, step_no, title, description, image_url) VALUES
('step-v2-058', 'recipe-156', 1, '煮意大利面', '意大利面折成短段，锅中加水烧开，下意面煮12分钟至软烂，捞出备用。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-059', 'recipe-156', 2, '制作番茄牛肉酱', '番茄去皮切丁，锅中加少量油，炒番茄出汁，加入牛肉末翻炒，加少量水焖煮10分钟至浓稠。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-060', 'recipe-156', 3, '拌面出锅', '将番茄牛肉酱浇在意面上，搅拌均匀，可撒少量奶酪碎增加风味，温度适宜后喂食。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-061', 'recipe-160', 1, '准备食材', '南瓜去皮切块蒸熟，鸡肉切小丁，咖喱粉用少量温水调开（温和版，量要少）。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-062', 'recipe-160', 2, '炒制咖喱', '锅中加少量油，炒鸡肉丁至变色，加入南瓜块翻炒，加入咖喱水和适量清水，焖煮10分钟。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-063', 'recipe-160', 3, '浇饭装碗', '将咖喱南瓜鸡肉浇在米饭上，搅拌均匀，颜色金黄香气诱人，温度适宜后喂食。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-064', 'recipe-165', 1, '煮面条', '细面条折成短段，锅中加水烧开，下面条煮8分钟至软烂，捞出备用。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-065', 'recipe-165', 2, '炒番茄蛋汤', '番茄去皮切丁，锅中加少量油，炒番茄出汁，加入适量水烧开，打入鸡蛋搅散成蛋花。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-066', 'recipe-165', 3, '下面装碗', '将煮好的面条放入番茄蛋汤中，搅拌均匀，酸甜开胃，温度适宜后喂食。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80'),
('step-v2-067', 'recipe-180', 1, '准备面糊', '熟香蕉压成泥，即食燕麦加少量温水泡软，鸡蛋打散，三者混合搅拌成均匀面糊。', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'),
('step-v2-068', 'recipe-180', 2, '煎制松饼', '平底锅小火加热，加少量油，用勺子舀入面糊，煎至表面起泡后翻面，两面金黄即可。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-069', 'recipe-180', 3, '出锅装盘', '松饼出锅后稍微冷却，外酥内软，天然甜味，是宝宝健康早餐或零食的好选择。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-070', 'recipe-184', 1, '准备食材', '西红柿去皮切丁，鸡蛋打散备用，米饭提前蒸好备用。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('step-v2-071', 'recipe-184', 2, '炒西红柿蛋', '锅中加少量油，先炒西红柿出汁，倒入蛋液翻炒成蛋花，颜色红黄相间。', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80'),
('step-v2-072', 'recipe-184', 3, '加入米饭', '加入米饭翻炒均匀，让米饭充分吸收西红柿汁，颜色橙红，出锅温度适宜后喂食。', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80')
ON CONFLICT DO NOTHING;
