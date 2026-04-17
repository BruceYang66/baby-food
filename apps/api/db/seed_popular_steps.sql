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
