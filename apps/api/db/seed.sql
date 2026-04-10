INSERT INTO users (id, nickname, avatar_url, wechat_open_id, activity_label, status_label) VALUES
('user-001', '糯米妈妈', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80', 'openid-demo-001', '高活跃', '正常'),
('user-002', '暖暖爸比', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80', 'openid-demo-002', '中活跃', '正常'),
('user-003', '星星妈', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=80', 'openid-demo-003', '低活跃', '待回访'),
('user-004', '乐乐外婆', 'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=160&q=80', 'openid-demo-004', '中活跃', '正常'),
('user-005', '果果妈妈', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80', 'openid-demo-005', '高活跃', '正常');

INSERT INTO babies (id, user_id, nickname, birth_date, stage_label) VALUES
('baby-001', 'user-001', '小糯米', '2025-08-18', '碎末状辅食阶段'),
('baby-002', 'user-002', '暖暖', '2025-06-02', '软烂颗粒阶段'),
('baby-003', 'user-003', '星星', '2025-11-11', '泥糊状辅食阶段'),
('baby-004', 'user-004', '乐乐', '2024-12-20', '手抓食过渡阶段'),
('baby-005', 'user-005', '果果', '2025-04-27', '软饭阶段');

INSERT INTO baby_allergens (id, baby_id, name, severity) VALUES
('allergy-001', 'baby-001', '鸡蛋', '中'),
('allergy-002', 'baby-001', '花生', '高'),
('allergy-003', 'baby-002', '虾', '中'),
('allergy-004', 'baby-004', '牛奶', '低');

INSERT INTO recipes (id, title, summary, cover_image, age_label, duration_label, difficulty_label, source, creator, favorites, review_focus, content_status, review_status) VALUES
('recipe-001', '红薯山药小米粥', '适合 8 个月宝宝的温和早餐，帮助晨起胃口打开。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', '8个月+', '20分钟', '初级', '营养师精品', '陈营养师', 928, '健脾唤醒肠胃', 'published', 'approved'),
('recipe-002', '鳕鱼西兰花软饭', '高蛋白午餐主食，适合提升优质蛋白摄入。', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', '8-10月', '25分钟', '中级', '批量导入', '运营-小顾', 314, '补充优质蛋白', 'pending_review', 'pending'),
('recipe-003', '贝贝南瓜猪肝泥', '晚间高铁修复搭配，口感细腻更易接受。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', '8个月+', '18分钟', '中级', '手机快速添加', '外采营养师', 122, '高铁修复', 'draft', 'none'),
('recipe-004', '鸡肉胡萝卜烂面', '适合作为午餐主食，软烂顺滑，训练吞咽。', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80', '7-9月', '22分钟', '初级', '营养师精品', '陈营养师', 688, '细颗粒接受度高', 'published', 'approved'),
('recipe-005', '牛油果香蕉酸奶碗', '午后加餐，帮助补充能量和顺滑口感。', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80', '1-2岁', '10分钟', '初级', '手机快速添加', '外采营养师', 122, '加餐接受度高', 'draft', 'none'),
('recipe-006', '菠菜猪肝软饭', '高铁主食组合，适合近期补铁强化。', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80', '10-12月', '28分钟', '中级', '运营补齐', '王营养师', 503, '高铁热门需求', 'pending_review', 'pending'),
('recipe-007', '三文鱼山药泥', 'DHA 和温和淀粉搭配，适合晚餐修复。', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80', '6-8月', '18分钟', '初级', '历史版本', '陈营养师', 503, '腥味处理需明确', 'offline', 'approved'),
('recipe-008', '苹果小米蒸糕', '手抓点心，适合上午加餐与病期恢复。', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', '10个月+', '26分钟', '中级', '手动创建', '陈营养师', 406, '病期点心补齐', 'pending_review', 'pending'),
('recipe-009', '山药鳕鱼小方', '适合练习抓握的软方块辅食。', 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80', '11个月+', '24分钟', '中级', '营养师精品', '刘营养师', 571, '手抓食覆盖提升', 'published', 'approved'),
('recipe-010', '番茄牛肉软烩饭', '酸甜更开胃，适合午餐主食变化。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', '12个月+', '30分钟', '中级', '批量导入', '运营-阿辰', 362, '饭粒软度说明需加强', 'published', 'approved');

INSERT INTO recipe_tags (id, recipe_id, name) VALUES
('tag-001', 'recipe-001', '高纤维'),
('tag-002', 'recipe-001', '健脾'),
('tag-003', 'recipe-002', '优质蛋白'),
('tag-004', 'recipe-002', 'DHA'),
('tag-005', 'recipe-003', '高效补铁'),
('tag-006', 'recipe-003', '好消化'),
('tag-007', 'recipe-004', '软烂面食'),
('tag-008', 'recipe-004', '吞咽训练'),
('tag-009', 'recipe-005', '能量加餐'),
('tag-010', 'recipe-005', '顺滑口感'),
('tag-011', 'recipe-006', '高铁'),
('tag-012', 'recipe-006', '软饭'),
('tag-013', 'recipe-007', 'DHA'),
('tag-014', 'recipe-007', '健脾'),
('tag-015', 'recipe-008', '手抓点心'),
('tag-016', 'recipe-008', '病期适用'),
('tag-017', 'recipe-009', '手抓食'),
('tag-018', 'recipe-009', '优质蛋白'),
('tag-019', 'recipe-010', '开胃'),
('tag-020', 'recipe-010', '午餐主食');

INSERT INTO recipe_ingredients (id, recipe_id, name, amount, unit) VALUES
('ingredient-001', 'recipe-001', '红薯', '50', '克'),
('ingredient-002', 'recipe-001', '山药', '40', '克'),
('ingredient-003', 'recipe-001', '小米', '20', '克'),
('ingredient-004', 'recipe-002', '鸡肉', '40', '克'),
('ingredient-005', 'recipe-002', '南瓜', '60', '克'),
('ingredient-006', 'recipe-002', '宝宝面', '30', '克'),
('ingredient-007', 'recipe-003', '猪肝', '25', '克'),
('ingredient-008', 'recipe-003', '南瓜', '60', '克'),
('ingredient-009', 'recipe-003', '配方奶', '20', '毫升'),
('ingredient-010', 'recipe-004', '鸡肉', '35', '克'),
('ingredient-011', 'recipe-004', '胡萝卜', '35', '克'),
('ingredient-012', 'recipe-004', '细面', '30', '克'),
('ingredient-013', 'recipe-005', '牛油果', '40', '克'),
('ingredient-014', 'recipe-005', '香蕉', '35', '克'),
('ingredient-015', 'recipe-005', '无糖酸奶', '50', '克'),
('ingredient-016', 'recipe-006', '菠菜', '30', '克'),
('ingredient-017', 'recipe-006', '猪肝', '25', '克'),
('ingredient-018', 'recipe-006', '软饭', '60', '克'),
('ingredient-019', 'recipe-007', '三文鱼', '35', '克'),
('ingredient-020', 'recipe-007', '山药', '50', '克'),
('ingredient-021', 'recipe-008', '苹果', '50', '克'),
('ingredient-022', 'recipe-008', '小米粉', '30', '克'),
('ingredient-023', 'recipe-009', '鳕鱼', '35', '克'),
('ingredient-024', 'recipe-009', '山药', '45', '克'),
('ingredient-025', 'recipe-010', '牛肉', '40', '克'),
('ingredient-026', 'recipe-010', '番茄', '50', '克'),
('ingredient-027', 'recipe-010', '软饭', '70', '克');

INSERT INTO recipe_steps (id, recipe_id, step_no, title, description, image_url) VALUES
('step-001', 'recipe-001', 1, '浸泡小米', '小米提前浸泡 15 分钟，红薯和山药去皮切小块。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-002', 'recipe-001', 2, '煮至软烂', '所有食材加水煮 18 分钟，至可轻松压碎。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-003', 'recipe-001', 3, '打成细粥', '根据月龄调整浓稠度，搅打或压成细腻粥。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-004', 'recipe-002', 1, '处理食材', '鸡肉焯水后剁碎，南瓜蒸软备用。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-005', 'recipe-002', 2, '混合煮制', '宝宝面煮软后切短，与鸡肉、南瓜一起翻拌。', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'),
('step-006', 'recipe-002', 3, '调整颗粒度', '根据月龄调整颗粒度，出锅前确认温度适宜。', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'),
('step-007', 'recipe-003', 1, '焯水去腥', '猪肝切片后焯水，南瓜蒸熟备用。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'),
('step-008', 'recipe-003', 2, '打泥混合', '猪肝与南瓜加少量配方奶打成细泥。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'),
('step-009', 'recipe-003', 3, '小火回温', '回温至适口，确认无明显颗粒后再喂。', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'),
('step-010', 'recipe-006', 1, '准备食材', '菠菜焯水切碎，猪肝去筋膜后焯熟。', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80'),
('step-011', 'recipe-006', 2, '翻拌软饭', '猪肝剁细与菠菜、软饭混合，小火翻拌。', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80'),
('step-012', 'recipe-006', 3, '调整湿润度', '必要时加少量温水调节，保证易吞咽。', 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80'),
('step-013', 'recipe-008', 1, '蒸熟苹果', '苹果去皮蒸熟后压泥。', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'),
('step-014', 'recipe-008', 2, '混合成糊', '苹果泥与小米粉调成均匀糊状。', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'),
('step-015', 'recipe-008', 3, '二次蒸制定型', '倒入模具蒸 12 分钟，稍凉后切块。', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80');

INSERT INTO meal_plans (id, user_id, title, plan_date, date_label, nutrition_score, water_suggestion) VALUES
('plan-001', 'user-001', '今日辅食计划', '2026-04-10', '今天 · 4月10日', 98, '450ml'),
('plan-002', 'user-001', '历史辅食计划', '2026-04-09', '2026年4月9日', 100, '450ml'),
('plan-003', 'user-001', '历史辅食计划', '2026-04-08', '2026年4月8日', 85, '420ml'),
('plan-004', 'user-001', '历史辅食计划', '2026-04-07', '2026年4月7日', 92, '430ml'),
('plan-005', 'user-002', '今日辅食计划', '2026-04-10', '今天 · 4月10日', 94, '500ml'),
('plan-006', 'user-005', '今日辅食计划', '2026-04-10', '今天 · 4月10日', 96, '520ml');

INSERT INTO meal_plan_items (id, meal_plan_id, recipe_id, slot, time, title, focus) VALUES
('meal-001', 'plan-001', 'recipe-001', 'breakfast', '08:00', '红薯山药小米粥', '温和唤醒肠胃'),
('meal-002', 'plan-001', 'recipe-002', 'lunch', '12:30', '鳕鱼西兰花软饭', '补充优质蛋白'),
('meal-003', 'plan-001', 'recipe-003', 'dinner', '18:00', '贝贝南瓜猪肝泥', '晚间高铁修复'),
('meal-004', 'plan-002', 'recipe-004', 'breakfast', '08:10', '鸡肉胡萝卜烂面', '软烂面食接受良好'),
('meal-005', 'plan-002', 'recipe-009', 'lunch', '12:20', '山药鳕鱼小方', '手抓练习增加兴趣'),
('meal-006', 'plan-002', 'recipe-010', 'dinner', '17:50', '番茄牛肉软烩饭', '开胃提升晚餐完成度'),
('meal-007', 'plan-003', 'recipe-001', 'breakfast', '08:00', '红薯山药小米粥', '平稳过渡晨起胃口'),
('meal-008', 'plan-003', 'recipe-006', 'lunch', '12:10', '菠菜猪肝软饭', '高铁强化日'),
('meal-009', 'plan-003', 'recipe-005', 'snack', '15:30', '牛油果香蕉酸奶碗', '午后加餐补能量'),
('meal-010', 'plan-004', 'recipe-007', 'breakfast', '08:15', '三文鱼山药泥', '温和补充 DHA'),
('meal-011', 'plan-004', 'recipe-004', 'lunch', '12:00', '鸡肉胡萝卜烂面', '提高午餐完成度'),
('meal-012', 'plan-004', 'recipe-008', 'dinner', '17:40', '苹果小米蒸糕', '病后恢复期更易接受'),
('meal-013', 'plan-005', 'recipe-009', 'breakfast', '08:20', '山药鳕鱼小方', '适合手抓练习'),
('meal-014', 'plan-005', 'recipe-010', 'lunch', '12:40', '番茄牛肉软烩饭', '开胃提升午餐摄入'),
('meal-015', 'plan-005', 'recipe-005', 'snack', '15:20', '牛油果香蕉酸奶碗', '补充顺滑口感加餐'),
('meal-016', 'plan-006', 'recipe-004', 'breakfast', '08:05', '鸡肉胡萝卜烂面', '训练咀嚼与吞咽'),
('meal-017', 'plan-006', 'recipe-006', 'lunch', '12:15', '菠菜猪肝软饭', '高铁日重点安排'),
('meal-018', 'plan-006', 'recipe-010', 'dinner', '18:05', '番茄牛肉软烩饭', '增加主食变化');

INSERT INTO recipe_reviews (id, recipe_id, action, comment, created_at) VALUES
('review-001', 'recipe-002', 'pending', '10-12月覆盖补齐', '2026-04-09 09:10:00'),
('review-002', 'recipe-006', 'pending', '高铁热门需求，需明确猪肝处理', '2026-04-09 08:50:00'),
('review-003', 'recipe-008', 'pending', '病期点心补齐，检查甜度说明', '2026-04-09 08:35:00'),
('review-004', 'recipe-007', 'approved', '步骤图补齐后通过', '2026-04-02 16:05:00');

INSERT INTO import_jobs (id, file_name, operator, total, success, failed, status, created_at) VALUES
('import-001', '春季辅食补充批次.xlsx', '运营-小顾', 86, 78, 8, 'completed', '2026-04-09 08:40:00'),
('import-002', '病期食谱.csv', '陈营养师', 24, 24, 0, 'completed', '2026-04-08 16:12:00'),
('import-003', '月龄禁忌修订.xlsx', '管理员', 18, 15, 3, 'failed', '2026-04-07 11:20:00'),
('import-004', '高铁专题食谱.xlsx', '运营-阿辰', 42, 39, 3, 'completed', '2026-04-06 15:05:00'),
('import-005', '手抓食专题.csv', '刘营养师', 16, 14, 2, 'completed', '2026-04-05 10:18:00');

INSERT INTO guide_stages (id, key, label, title, description) VALUES
('guide-001', '6-8', '6-8月', '6-8个月：尝试颗粒感', '从细腻泥糊状逐步过渡到带细小颗粒的碎末状，每次引入一种新食材并观察3天。'),
('guide-002', '8-10', '8-10月', '8-10个月：增加咀嚼练习', '逐步从碎末状过渡到小颗粒和软块状，鼓励手抓食，培养自主进食兴趣。'),
('guide-003', '10-12', '10-12月', '10-12个月：接近家庭餐过渡', '可提供软饭、软菜和更丰富的主食变化，食物质地接近家庭餐但仍需软烂。'),
('guide-004', '12-18', '12-18月', '12-18个月：建立三餐规律', '断奶过渡期，逐步建立一日三餐加两次点心的节律，食物种类与大人同桌但单独调味。'),
('guide-005', '18-24', '18-24月', '18-24个月：丰富食物多样性', '饮食接近成人，重点是培养不挑食习惯、丰富食物色彩与口味，继续控盐少油。');

INSERT INTO guide_food_rules (id, stage_id, type, title, foods_json) VALUES
-- 6-8月
('guide-rule-001', 'guide-001', 'recommended', '推荐添加', '["高铁米粉","南瓜泥","红薯泥","鸡肉泥","猪肝泥","苹果泥","香蕉泥","西兰花泥","胡萝卜泥","豌豆泥"]'),
('guide-rule-002', 'guide-001', 'cautious', '谨慎尝试', '["鸡蛋黄（少量开始）","三文鱼泥","牛肉泥","菠菜泥（需焯水去草酸）"]'),
('guide-rule-003', 'guide-001', 'forbidden', '严格禁止', '["蜂蜜","食盐","糖","整粒坚果","鲜奶（作为主饮）","加工零食","虾蟹类","花生酱"]'),
-- 8-10月
('guide-rule-004', 'guide-002', 'recommended', '推荐添加', '["软饭","小面片","牛油果块","鸡蛋羹","豆腐","鳕鱼","猪肉末","黄瓜条","土豆泥","玉米糊"]'),
('guide-rule-005', 'guide-002', 'cautious', '谨慎尝试', '["虾泥","芝麻酱","全蛋（先引入蛋白）","菌菇类","草莓","猕猴桃"]'),
('guide-rule-006', 'guide-002', 'forbidden', '严格禁止', '["蜂蜜","食盐","糖","整粒葡萄","整粒坚果","加工火腿肠","含糖饮料","辛辣刺激食物"]'),
-- 10-12月
('guide-rule-007', 'guide-003', 'recommended', '推荐添加', '["番茄牛肉软饭","蒸糕","软煮蔬菜段","蛋饼","馒头小块","原味奶酪","时令水果块","肉丸"]'),
('guide-rule-008', 'guide-003', 'cautious', '谨慎尝试', '["贝类（蛤蜊等）","芒果（过敏风险）","花生碎（混入食物）","菠萝"]'),
('guide-rule-009', 'guide-003', 'forbidden', '严格禁止', '["蜂蜜","食盐（每日<1克）","整粒坚果","爆米花","加工肉制品","含糖饮料","茶和咖啡"]'),
-- 12-18月
('guide-rule-010', 'guide-004', 'recommended', '推荐添加', '["杂粮软饭","蒸蛋","清蒸鱼","豆腐脑","少油清炒蔬菜","酸奶","全麦面包","各类瓜果","牛肉丸","虾仁"]'),
('guide-rule-011', 'guide-004', 'cautious', '谨慎尝试', '["坚果碎（混入食物中）","生冷水果（少量）","花生酱（薄涂）","低辣食物"]'),
('guide-rule-012', 'guide-004', 'forbidden', '严格禁止', '["蜂蜜","高盐腌制食品","含糖饮料","碳酸饮料","果冻","整粒坚果","辛辣食物","咖啡因饮品"]'),
-- 18-24月
('guide-rule-013', 'guide-005', 'recommended', '推荐添加', '["各色深色蔬菜","杂粮饭","瘦肉","鸡蛋","豆制品","鱼虾","新鲜水果","低糖酸奶","坚果碎","菌菇类"]'),
('guide-rule-014', 'guide-005', 'cautious', '谨慎尝试', '["生鱼片","半生熟蛋","少量调味料","偶尔低糖零食"]'),
('guide-rule-015', 'guide-005', 'forbidden', '严格禁止', '["含添加糖饮料","高盐零食（薯片饼干）","频繁油炸食品","含糖调味乳","整粒坚果","咖啡因饮品"]');

INSERT INTO symptom_guides (id, symptom, title) VALUES
('symptom-001', '腹泻', '腹泻期饮食建议'),
('symptom-002', '便秘', '便秘期饮食建议'),
('symptom-003', '感冒', '感冒期饮食建议');

INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
('symptom-rule-001', 'symptom-001', 'avoid', '高油脂食物', '会增加肠胃负担。'),
('symptom-rule-002', 'symptom-001', 'recommended', '焦米粥', '更温和，利于恢复。'),
('symptom-rule-003', 'symptom-002', 'recommended', '西梅泥', '帮助增加膳食纤维摄入。'),
('symptom-rule-004', 'symptom-002', 'avoid', '高糖点心', '会挤占正餐并影响排便节律。'),
('symptom-rule-005', 'symptom-003', 'recommended', '温热软粥', '更易吞咽，减轻不适。');

INSERT INTO recipe_versions (id, recipe_id, version_no, snapshot, created_at) VALUES
('version-001', 'recipe-002', 1, '{"title":"鳕鱼西兰花软饭","summary":"高蛋白午餐主食"}', '2026-04-08 18:22:00'),
('version-002', 'recipe-006', 2, '{"title":"菠菜猪肝软饭","summary":"高铁主食组合"}', '2026-04-09 08:40:00');

INSERT INTO system_settings (id, setting_key, setting_val) VALUES
('setting-001', 'app_name', '宝宝辅食智囊'),
('setting-002', 'share_slogan', '科学辅食，悦享成长'),
('setting-003', 'home_hero_text', '根据宝宝成长阶段生成今日辅食'),
('setting-004', 'daily_reminder', '08:00 自动推送'),
('setting-005', 'export_permission', '运营经理以上可导出'),
('setting-006', 'account_roles', '管理员 / 运营 / 营养师 / 审核员');

-- ── user_favorites（演示数据：user-001 收藏了 3 道食谱） ────────
INSERT INTO user_favorites (id, user_id, recipe_id, created_at) VALUES
('fav-001', 'user-001', 'recipe-001', '2026-04-08 09:12:00'),
('fav-002', 'user-001', 'recipe-004', '2026-04-09 10:35:00'),
('fav-003', 'user-001', 'recipe-009', '2026-04-10 08:50:00'),
-- user-002 收藏了 2 道食谱
('fav-004', 'user-002', 'recipe-004', '2026-04-07 14:22:00'),
('fav-005', 'user-002', 'recipe-010', '2026-04-09 16:45:00');

-- ── user_feedback（演示数据：2 条反馈，方便后台展示） ────────────
INSERT INTO user_feedback (id, user_id, content, created_at) VALUES
('feedback-001', 'user-001', '希望生成计划时可以选择食材偏好，比如不喜欢西兰花可以屏蔽掉。', '2026-04-09 21:30:00'),
('feedback-002', 'user-002', '月龄指南页面内容很实用，建议每个阶段加一个营养素达标参考表格。', '2026-04-10 07:15:00');
