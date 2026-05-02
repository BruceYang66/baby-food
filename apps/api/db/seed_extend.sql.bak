-- ============================================================
-- 辅食数据扩展种子（seed_extend.sql）
-- 在已执行 seed.sql 的基础上追加，可反复执行前先确认 id 不重复
-- 数据来源：中国营养学会《7-24月龄婴幼儿喂养指南》/ WHO 相关标准
-- ============================================================

-- ============================================================
-- PART 1：月龄饮食指南扩展（guide_stages + guide_food_rules）
-- seed.sql 已包含：6-8月、8-10月、10-12月、12-18月、18-24月 五个阶段
-- 新增：4-6月（准备期）作为 guide-006
-- ============================================================

INSERT INTO guide_stages (id, key, label, title, description, feeding_tips_json, qa_json, daily_schedule_json, sort_order) VALUES
('guide-006', '4-6', '4-6月', '4-6个月：辅食准备期', '纯母乳或配方奶喂养为主，观察宝宝发育信号——能稳定支撑头颈、对食物表现出兴趣、挺舌反射逐渐消失，满6月龄后方可正式引入辅食。此阶段重点是观察与等待，不建议提前添加。',
  '["此阶段以纯母乳或配方奶为唯一营养来源，不需要任何辅食","观察宝宝是否出现辅食准备信号：头颈可稳定支撑、对食物感兴趣、挺舌反射减弱","建议满6个月（180天）后再引入辅食，不宜过早","提前引入辅食会增加过敏风险，并可能影响母乳喂养"]',
  '[{"q":"宝宝4个月就对大人吃饭很感兴趣，能提前加辅食吗？","a":"不建议。对食物感兴趣是发育正常的表现，但不代表消化系统已准备好。过早添加辅食会增加肠道过敏风险，建议等满6月龄且出现多个准备信号后再开始。"},{"q":"母乳不够吃怎么办？","a":"4-6月纯母乳期不足时，应添加适合月龄的配方奶补足，而非提前引入辅食。可向儿科医生咨询合适的配方奶补充量。"},{"q":"怎么判断宝宝已经准备好吃辅食了？","a":"三个核心信号同时出现：①头颈可稳定支撑（俯卧时能抬头90°）；②看到食物会流口水/张嘴；③挺舌反射消失（勺子放入不会自动顶出）。"}]',
  '[{"time":"全天","title":"纯母乳/配方奶喂养","description":"按需喂养，每日600ml以上，这是4-6月龄唯一的营养来源"}]',
  0);

-- 4-6月 食物规则（准备期，以"禁止"和"观察信号"为主）
INSERT INTO guide_food_rules (id, stage_id, type, title, foods_json) VALUES
('guide-rule-021', 'guide-006', 'recommended', '可以尝试的第一口食物', '["高铁婴儿米粉（单一谷物）","南瓜泥","红薯泥","苹果泥（过滤无渣）","香蕉泥"]'),
('guide-rule-022', 'guide-006', 'forbidden',   '严格禁止添加',         '["蜂蜜（含肉毒杆菌风险）","盐、酱油、味精","糖及含糖饮品","鲜牛奶（消化蛋白不耐受）","整粒坚果","加工零食"]'),
('guide-rule-023', 'guide-006', 'cautious',    '谨慎观察后尝试',       '["蛋黄（部分指南建议6个月后引入）","豆腐泥（观察消化情况）"]');

-- 补充原有 10-12月 阶段规则（seed.sql 10-12月只有推荐，这里补充谨慎和禁止）
INSERT INTO guide_food_rules (id, stage_id, type, title, foods_json) VALUES
('guide-rule-024', 'guide-003', 'cautious',  '谨慎尝试', '["全蛋（先少量观察过敏）","带壳海鲜（虾蟹，观察过敏）","花生酱（薄薄涂抹）","部分热带水果（芒果、菠萝）"]'),
('guide-rule-025', 'guide-003', 'forbidden', '严格禁止', '["蜂蜜","盐（每日<0.5g）","鲜牛奶（1岁后才可引入）","整粒坚果","加工肉类","含糖饮料"]');

-- 补充原有 8-10月 禁止规则
INSERT INTO guide_food_rules (id, stage_id, type, title, foods_json) VALUES
('guide-rule-026', 'guide-002', 'forbidden',    '严格禁止',     '["蜂蜜","盐","糖","整粒葡萄/坚果","鲜牛奶","加工零食"]'),
('guide-rule-027', 'guide-002', 'recommended',  '适合手指食物', '["蒸软的胡萝卜条","去皮香蕉段","煮熟的豌豆（压扁）","豆腐小方","鸡蛋黄饼小块"]');

-- 补充原有 6-8月 谨慎规则
INSERT INTO guide_food_rules (id, stage_id, type, title, foods_json) VALUES
('guide-rule-028', 'guide-001', 'cautious',    '谨慎引入',     '["蛋黄（单独引入观察3天）","鱼泥（先从淡水鱼开始）","豆类泥（观察胀气）"]'),
('guide-rule-029', 'guide-001', 'recommended', '优先补铁食材', '["猪肝泥","牛肉泥","高铁婴儿米粉","红肉泥（猪/牛/羊）"]');

-- 12-18月 补充规则（seed.sql 12-18月只有 guide-rule-010/011/012，这里补充实操细节）
INSERT INTO guide_food_rules (id, stage_id, type, title, foods_json) VALUES
('guide-rule-030', 'guide-004', 'recommended', '推荐日常食物',   '["软米饭","馒头小块","各类软煮肉丁（鸡猪牛）","全蛋（蒸蛋羹/炒蛋）","豆腐","各类蔬菜丁","水果小块","全脂纯酸奶","深色叶菜（切碎）"]'),
('guide-rule-031', 'guide-004', 'cautious',    '谨慎少量尝试',   '["坚果碎（磨细混入食物）","花生酱（薄涂）","带壳海鲜（观察过敏）","菠萝（口腔刺激）","猕猴桃（过敏率较高）"]');

-- 18-24月 补充规则（seed.sql 18-24月只有 guide-rule-013/014/015，这里补充实操细节）
INSERT INTO guide_food_rules (id, stage_id, type, title, foods_json) VALUES
('guide-rule-032', 'guide-005', 'recommended', '推荐多样化食物', '["全谷物（糙米饭、全麦面）","各类豆类（豆腐、豆浆、红豆）","禽畜肉类（正常块状）","深海鱼（去刺）","深色蔬菜（西兰花、菠菜、胡萝卜）","各类时令水果","纯牛奶（每天 300-400ml）","鸡蛋（每天1个）"]'),
('guide-rule-033', 'guide-005', 'cautious',    '适量少吃',       '["精制白米面（搭配全谷物）","添加糖的烘焙食品","炒菜植物油（每天约5-10g）"]');


-- ============================================================
-- PART 2：病症饮食指导扩展（symptom_guides + symptom_food_rules）
-- 原有：腹泻、便秘、感冒 三种
-- 新增：发烧、积食、缺铁性贫血、湿疹过敏、幼儿急疹、出牙期不适、消化不良
-- ============================================================

INSERT INTO symptom_guides (id, symptom, title) VALUES
('symptom-004', '发烧',     '发烧期饮食建议'),
('symptom-005', '积食',     '积食期饮食建议'),
('symptom-006', '缺铁性贫血', '缺铁性贫血饮食建议'),
('symptom-007', '湿疹',     '湿疹过敏期饮食建议'),
('symptom-008', '幼儿急疹', '幼儿急疹期饮食建议'),
('symptom-009', '出牙',     '出牙不适期饮食建议'),
('symptom-010', '消化不良', '消化不良期饮食建议');

-- 发烧
INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
('symptom-rule-006',  'symptom-004', 'avoid',       '油腻荤腥（肉汤、肉末）',     '高蛋白食物在发热时难以消化，会加重肠胃负担和产热。'),
('symptom-rule-007',  'symptom-004', 'avoid',       '生冷水果（直接生食）',       '可能刺激胃肠，冰凉食物不利于退热后体温稳定。'),
('symptom-rule-008',  'symptom-004', 'avoid',       '鸡蛋（发烧时暂停）',         '蛋白质代谢产热，发烧时摄入会使体温进一步升高。'),
('symptom-rule-009',  'symptom-004', 'recommended', '温稀米粥',                   '易消化、补充水分和热量，减少消化系统负担。'),
('symptom-rule-010',  'symptom-004', 'recommended', '温开水（频繁少量补充）',     '发烧期体温升高导致大量失水，充足饮水是退烧关键。'),
('symptom-rule-011',  'symptom-004', 'recommended', '蒸梨水（温热）',             '润肺生津，有助于缓解发热引起的咽干不适。');

-- 积食
INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
('symptom-rule-012', 'symptom-005', 'avoid',       '鸡蛋、肉类（高蛋白）',       '积食时消化酶分泌不足，高蛋白食物会在肠道堆积产气。'),
('symptom-rule-013', 'symptom-005', 'avoid',       '配方奶或牛奶',               '乳糖和蛋白质在积食时不易消化，应暂时减量。'),
('symptom-rule-014', 'symptom-005', 'avoid',       '冷饮、冰激凌',               '寒凉食物会抑制胃肠蠕动，加重积食症状。'),
('symptom-rule-015', 'symptom-005', 'avoid',       '高油高糖点心',               '会进一步抑制胃酸分泌，延缓食物排空。'),
('symptom-rule-016', 'symptom-005', 'recommended', '山楂水（煮开无糖）',         '山楂含有机酸，有助于促进蛋白质和脂肪的消化分解。'),
('symptom-rule-017', 'symptom-005', 'recommended', '白萝卜水（煮熟）',           '行气消胀，促进胃肠蠕动，缓解腹胀不适。'),
('symptom-rule-018', 'symptom-005', 'recommended', '白粥（不加任何配料）',       '极易消化，给胃肠道充分休息，帮助恢复正常消化功能。'),
('symptom-rule-019', 'symptom-005', 'recommended', '蒸胡萝卜泥',                 '胡萝卜富含膳食纤维和果胶，有助于调节肠道菌群。');

-- 缺铁性贫血
INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
('symptom-rule-020', 'symptom-006', 'avoid',       '浓茶（即便是淡茶）',         '茶多酚与铁结合形成不溶性铁鞣酸，大幅降低铁的吸收率。'),
('symptom-rule-021', 'symptom-006', 'avoid',       '菠菜（单独食用）',           '草酸含量高，与铁结合生成草酸铁影响吸收，需焯水后配维C同食。'),
('symptom-rule-022', 'symptom-006', 'avoid',       '过量高钙食物同餐',           '钙离子会竞争铁的吸收通道，补铁餐次应与牛奶分开。'),
('symptom-rule-023', 'symptom-006', 'recommended', '猪肝泥（每周2-3次）',        '猪肝含血红素铁，吸收率高达20-30%，是婴幼儿最佳补铁食材之一。'),
('symptom-rule-024', 'symptom-006', 'recommended', '红肉泥（牛肉/猪肉）',        '动物性血红素铁吸收利用率显著高于植物性非血红素铁。'),
('symptom-rule-025', 'symptom-006', 'recommended', '维C丰富食物同餐（西兰花/番茄）', '维生素C可将三价铁还原为二价铁，使非血红素铁吸收率提升3-5倍。'),
('symptom-rule-026', 'symptom-006', 'recommended', '高铁婴儿强化米粉',           '每日摄入足量高铁米粉可有效预防6-12月龄铁缺乏，是主要铁来源。');

-- 湿疹过敏
INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
('symptom-rule-027', 'symptom-007', 'avoid',       '牛奶及奶制品（确认牛奶过敏时）', '牛奶蛋白是婴幼儿最常见过敏原之一，需经医生确认后严格回避。'),
('symptom-rule-028', 'symptom-007', 'avoid',       '鸡蛋蛋白（蛋黄通常安全）',   '卵清蛋白是主要过敏蛋白，引入时先从蛋黄开始，逐步尝试全蛋。'),
('symptom-rule-029', 'symptom-007', 'avoid',       '海鲜（虾蟹贝类）',           '甲壳类过敏终生不消失，确认过敏后需永久回避。'),
('symptom-rule-030', 'symptom-007', 'avoid',       '花生及花生制品',             '花生过敏可能引发严重过敏反应，初次引入务必从极少量开始。'),
('symptom-rule-031', 'symptom-007', 'recommended', '南瓜泥、红薯泥',             '低敏温和食材，富含β-胡萝卜素，有助于维持皮肤健康。'),
('symptom-rule-032', 'symptom-007', 'recommended', '已确认安全的蔬菜泥',         '坚持单一食材逐步引入，每种新食材观察3-5天再引入下一种。');

-- 幼儿急疹
INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
('symptom-rule-033', 'symptom-008', 'avoid',       '新添加的从未尝过的辅食',     '急疹期免疫系统处于应激状态，此时引入新食材可能被误判为过敏源。'),
('symptom-rule-034', 'symptom-008', 'avoid',       '刺激性食物（辛酸苦辣）',     '口腔和咽喉黏膜在发热期敏感，刺激性食物会加重不适和哭闹。'),
('symptom-rule-035', 'symptom-008', 'recommended', '温热流质辅食（稀粥、蔬菜汤）', '急疹伴高烧期间食欲下降，流质食物更易接受，同时补充水分。'),
('symptom-rule-036', 'symptom-008', 'recommended', '母乳（首选）',               '急疹期坚持母乳可提供免疫因子，帮助宝宝平稳度过出疹期。');

-- 出牙期不适
INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
('symptom-rule-037', 'symptom-009', 'avoid',       '过硬食物（饼干、硬果块）',   '出牙期牙龈敏感肿胀，过硬食物会增加疼痛，导致拒食。'),
('symptom-rule-038', 'symptom-009', 'avoid',       '过烫或过冷食物',             '温度极端会刺激敏感的出牙处牙龈，加剧不适。'),
('symptom-rule-039', 'symptom-009', 'recommended', '冰镇（不结冰）的香蕉段',     '微凉温度可轻微缓解牙龈肿胀不适，香蕉软糯不伤牙龈。'),
('symptom-rule-040', 'symptom-009', 'recommended', '冷藏过的黄瓜条（手抓磨牙）', '冷藏后质地略硬可帮助按摩牙龈，同时训练手抓能力。'),
('symptom-rule-041', 'symptom-009', 'recommended', '软烂的粥类和细面',           '质地柔软不需要过多咀嚼，降低进食痛苦，保证热量摄入。');

-- 消化不良
INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
('symptom-rule-042', 'symptom-010', 'avoid',       '高脂肉类（肥肉、动物皮）',   '脂肪需要更多消化酶分解，消化不良时会在胃中长时间滞留。'),
('symptom-rule-043', 'symptom-010', 'avoid',       '豆类（整粒）',               '豆类产气性强，会加剧消化不良引起的腹胀不适。'),
('symptom-rule-044', 'symptom-010', 'avoid',       '生食蔬菜水果',               '纤维未经烹煮软化，消化不良时难以分解，增加肠道负担。'),
('symptom-rule-045', 'symptom-010', 'recommended', '山药粥',                     '山药富含黏液蛋白和淀粉酶，有助于保护胃黏膜，促进消化。'),
('symptom-rule-046', 'symptom-010', 'recommended', '蒸苹果泥（加热后）',         '苹果中的果胶加热后释放，可调节肠道菌群，改善消化功能。'),
('symptom-rule-047', 'symptom-010', 'recommended', '小米粥（去米油单喝）',       '小米粥米油富含维生素B族和不饱和脂肪酸，温和养护胃肠。');

-- 补充原有症状的额外规则
INSERT INTO symptom_food_rules (id, symptom_guide_id, type, food, reason) VALUES
-- 腹泻追加
('symptom-rule-048', 'symptom-001', 'avoid',       '全脂牛奶/配方奶（急性腹泻期）', '腹泻期间肠道乳糖酶活性下降，乳糖不耐受会加重水样便。'),
('symptom-rule-049', 'symptom-001', 'avoid',       '高纤维蔬菜（菠菜、芹菜）',   '不溶性纤维加快肠道蠕动，急性腹泻期会加重腹泻频次。'),
('symptom-rule-050', 'symptom-001', 'recommended', '蒸苹果泥',                   '苹果富含果胶，可吸附肠道水分和毒素，有止泻作用。'),
('symptom-rule-051', 'symptom-001', 'recommended', '胡萝卜泥（煮熟）',           '熟胡萝卜含碱性果胶，可以结合并吸附肠道内的细菌和毒素。'),
-- 便秘追加
('symptom-rule-052', 'symptom-002', 'avoid',       '香蕉（未熟透的青香蕉）',     '未熟香蕉富含鞣酸，反而有收敛止泻作用，会加重便秘。'),
('symptom-rule-053', 'symptom-002', 'avoid',       '精白米面为主的食物',         '缺乏膳食纤维，长期单一精制食物是婴幼儿便秘的常见诱因。'),
('symptom-rule-054', 'symptom-002', 'recommended', '西梅泥（天然通便）',         '西梅含山梨醇和氯原酸，具有天然温和的通便效果，适合婴儿。'),
('symptom-rule-055', 'symptom-002', 'recommended', '火龙果泥（带黑籽）',         '黑色籽粒富含不溶性膳食纤维，可有效刺激肠道蠕动。'),
('symptom-rule-056', 'symptom-002', 'recommended', '西兰花泥（煮熟）',           '西兰花富含膳食纤维和水分，是婴幼儿便秘的优质食疗食材。'),
-- 感冒追加
('symptom-rule-057', 'symptom-003', 'avoid',       '甜食和含糖饮品',             '糖分会抑制免疫细胞活性，感冒期间高糖饮食会延长病程。'),
('symptom-rule-058', 'symptom-003', 'avoid',       '冷饮和冷食',                 '寒凉食物刺激咽喉，加重鼻塞和咳嗽症状。'),
('symptom-rule-059', 'symptom-003', 'recommended', '温热南瓜粥',                 '南瓜富含β-胡萝卜素可在体内转化为维A，支持呼吸道黏膜修复。'),
('symptom-rule-060', 'symptom-003', 'recommended', '葱白姜水（极少量）',         '葱白含挥发性硫化物，有轻微发汗解表作用，适合风寒感冒初期。');


-- ============================================================
-- PART 3：食谱扩展（覆盖 4-6月、12-18月、18-24月 新增阶段
--          以及各月龄补铁/补钙/通便/开胃/手抓食/病期 等功能分类）
-- id 从 recipe-011 开始，tag/ingredient/step 对应偏移
-- ============================================================

INSERT INTO recipes (id, title, summary, cover_image, age_label, duration_label, difficulty_label, source, creator, favorites, review_focus, content_status, review_status) VALUES

-- ── 4-6月（尝试期）────────────────────────────────────────────
('recipe-011', '高铁南瓜米糊',
 '宝宝第一口辅食首选，单一谷物配南瓜泥，口感细腻温和，补铁同时补充β-胡萝卜素。',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80',
 '6个月+', '10分钟', '初级', '营养师精品', '陈营养师', 1205, '补铁首选，质地需极细腻', 'published', 'approved'),

('recipe-012', '红薯泥（第一口）',
 '天然甜味易接受，红薯富含维生素A前体，蒸熟压泥即可，无需任何添加。',
 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=800&q=80',
 '6个月+', '15分钟', '初级', '营养师精品', '王营养师', 987, '首次引入甜味食材，观察接受度', 'published', 'approved'),

('recipe-013', '蛋黄米粉泥',
 '蛋黄富含卵磷脂和DHA，与高铁米粉组合，补铁补脑一步到位，适合6个月后引入。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
 '6个月+', '12分钟', '初级', '营养师精品', '陈营养师', 743, '先确认蛋黄不过敏再添加米粉', 'published', 'approved'),

-- ── 6-8月（泥糊状，重点补铁）──────────────────────────────────
('recipe-014', '猪肝红薯泥',
 '猪肝血红素铁吸收率高达20%，搭配红薯去腥提甜，是预防缺铁性贫血的明星辅食。',
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
 '7个月+', '20分钟', '中级', '营养师精品', '陈营养师', 1356, '焯水步骤不可省略，去腥彻底', 'published', 'approved'),

('recipe-015', '牛肉西兰花泥',
 '牛肉血红素铁+西兰花维C黄金组合，铁吸收率提升3-5倍，细腻顺滑适合7月龄+。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '7个月+', '25分钟', '中级', '营养师精品', '刘营养师', 892, '西兰花需去梗只用花冠部分', 'published', 'approved'),

('recipe-016', '三文鱼豆腐泥',
 '三文鱼DHA丰富助大脑发育，嫩豆腐补钙，两者同蒸口感极嫩，去刺需仔细。',
 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
 '7个月+', '18分钟', '中级', '营养师精品', '王营养师', 668, 'DHA补充，去刺操作须详述', 'published', 'approved'),

-- ── 8-10月（碎末状，引入手抓食）──────────────────────────────
('recipe-017', '香菇鸡肉蔬菜粥',
 '香菇多糖增强免疫力，鸡肉碎末补蛋白，蔬菜丰富维生素，稠粥质地适合8月龄+。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '8个月+', '30分钟', '初级', '营养师精品', '陈营养师', 1102, '香菇需切极细，观察消化情况', 'published', 'approved'),

('recipe-018', '胡萝卜手指条（初级手抓）',
 '胡萝卜蒸至软透切条，色彩鲜艳易抓握，锻炼精细动作，β-胡萝卜素护眼。',
 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=80',
 '8个月+', '15分钟', '初级', '营养师精品', '王营养师', 634, '软度标准：两指可轻松压断', 'published', 'approved'),

('recipe-019', '龙利鱼蒸豆腐',
 '龙利鱼无刺DHA丰富，嫩豆腐补钙，整体质地极软，适合咀嚼能力刚起步的宝宝。',
 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
 '8-10月', '20分钟', '初级', '营养师精品', '刘营养师', 821, '龙利鱼无刺优势需在描述中突出', 'published', 'approved'),

('recipe-020', '番茄鸡蛋软面片',
 '番茄酸甜开胃促进食欲，鸡蛋提供优质蛋白，细面片煮至极软，适合8月龄+练习咀嚼。',
 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80',
 '8-10月', '20分钟', '初级', '营养师精品', '陈营养师', 956, '确认鸡蛋不过敏后使用', 'published', 'approved'),

-- ── 10-12月（软块状，手抓食多样化）───────────────────────────
('recipe-021', '土豆鸡肉小丸子',
 '土豆泥绑住鸡肉末成型，软糯不散，适合练习手抓和牙床咀嚼，蒸制无需用油。',
 'https://images.unsplash.com/photo-1606851091851-e8c8c0fad5b4?auto=format&fit=crop&w=800&q=80',
 '10个月+', '25分钟', '中级', '营养师精品', '王营养师', 743, '大小控制在直径2cm左右，防窒息', 'published', 'approved'),

('recipe-022', '三鲜豆腐羹',
 '嫩豆腐、虾仁末、青豆泥组合，钙、蛋白质双补，羹状不需咀嚼即可吞咽，适合出牙期。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '10-12月', '20分钟', '中级', '营养师精品', '陈营养师', 589, '虾仁先确认不过敏，去虾线处理', 'published', 'approved'),

('recipe-023', '五彩蔬菜蛋饼',
 '鸡蛋+胡萝卜丝+菠菜碎的手指食物，色彩丰富激发食欲，平底锅少油薄摊，适合手抓。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
 '10个月+', '15分钟', '初级', '营养师精品', '刘营养师', 867, '厚度控制在5mm，便于宝宝抓握', 'published', 'approved'),

-- ── 12-18月（软固体，向家庭餐过渡）───────────────────────────
('recipe-024', '冬瓜虾仁小馄饨',
 '薄皮大馅，冬瓜清热消暑，虾仁补钙提鲜，皮薄馅嫩，适合12月龄+练习咬断能力。',
 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=800&q=80',
 '12个月+', '35分钟', '中级', '营养师精品', '王营养师', 512, '虾仁剁至极碎，馄饨大小适中', 'published', 'approved'),

('recipe-025', '黑芝麻芋头泥',
 '芋头补钾富含膳食纤维，熟黑芝麻碎提供优质油脂和钙质，口感绵密香浓，适合12月龄+。',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80',
 '12个月+', '20分钟', '初级', '营养师精品', '陈营养师', 445, '芋头需戴手套处理，防止皮肤过敏', 'published', 'approved'),

('recipe-026', '西兰花牛肉软饭',
 '牛肉丁+西兰花小朵+软米饭，主食蛋白蔬菜一碗搞定，铁和维C黄金搭档，适合12月龄+。',
 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80',
 '12个月+', '30分钟', '初级', '营养师精品', '刘营养师', 688, '牛肉需焖至可轻松用舌头压碎', 'published', 'approved'),

('recipe-027', '什锦蔬菜蛋卷',
 '鸡蛋薄饼包裹菠菜末、胡萝卜丝、香菇碎，手指食物锻炼抓握，多色蔬菜营养均衡。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
 '15个月+', '20分钟', '中级', '营养师精品', '王营养师', 423, '卷紧后切段，直径约2.5cm方便抓握', 'published', 'approved'),

-- ── 18-24月（接近成人食物）────────────────────────────────────
('recipe-028', '番茄牛肉疙瘩汤',
 '番茄红素+牛肉铁质+面疙瘩碳水，酸甜浓汤开胃，适合18月龄+，全家可一起吃（少盐版）。',
 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
 '18个月+', '35分钟', '中级', '营养师精品', '陈营养师', 534, '宝宝份额不加盐，成人另行调味', 'published', 'approved'),

('recipe-029', '燕麦水果粥',
 '即食燕麦富含β-葡聚糖促进肠道健康，搭配时令水果丁，天然甜味无需添加糖，适合18月+。',
 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80',
 '18个月+', '15分钟', '初级', '营养师精品', '刘营养师', 612, '选用无添加纯燕麦片，非即食冲泡款', 'published', 'approved'),

('recipe-030', '彩椒鸡肉炒软饭',
 '红黄彩椒维C丰富，鸡肉提供蛋白质，少油翻炒软米饭，颜色鲜亮激发18月龄+宝宝食欲。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '18个月+', '25分钟', '中级', '营养师精品', '王营养师', 398, '彩椒去皮后更易消化，不加任何调味盐', 'published', 'approved'),

-- ── 病期/功能性食谱 ────────────────────────────────────────────
('recipe-031', '焦米粥（腹泻专用）',
 '大米炒至微黄再煮粥，焦化淀粉吸附作用强，是腹泻期最经典的食疗辅食，温和止泻。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '6个月+', '30分钟', '初级', '营养师精品', '陈营养师', 789, '腹泻专用，效果需在描述中说明机理', 'published', 'approved'),

('recipe-032', '蒸梨银耳羹（润肺止咳）',
 '银耳含多糖润燥，蒸梨生津止渴，两者同炖质地软糯，适合感冒咳嗽或秋冬干燥期调理。',
 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=800&q=80',
 '10个月+', '40分钟', '初级', '营养师精品', '刘营养师', 456, '银耳需充分泡发至无硬心', 'published', 'approved'),

('recipe-033', '山药小米南瓜粥（积食调理）',
 '山药健脾护胃，小米养胃易消化，南瓜提供天然甜味，积食期三餐替换粥类减轻肠胃负担。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
 '7个月+', '25分钟', '初级', '营养师精品', '王营养师', 634, '积食调理，粥稠度根据症状调节', 'published', 'approved'),

('recipe-034', '西梅燕麦泥（通便专用）',
 '西梅山梨醇天然通便，燕麦β-葡聚糖软化粪便，两者搭配是婴幼儿便秘的温和食疗首选。',
 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80',
 '8个月+', '15分钟', '初级', '营养师精品', '陈营养师', 567, '通便专用，西梅需选无添加纯果泥', 'published', 'approved'),

('recipe-035', '菠菜猪肝蛋黄泥（补铁强化）',
 '猪肝+蛋黄双铁源叠加，菠菜焯水后维C促进铁吸收，是缺铁性贫血期的强化补铁方案。',
 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80',
 '8个月+', '25分钟', '中级', '营养师精品', '刘营养师', 712, '补铁强化专用，猪肝每周不超过2次', 'published', 'approved');


-- ── 食谱标签 ─────────────────────────────────────────────────
INSERT INTO recipe_tags (id, recipe_id, name) VALUES
-- recipe-011 高铁南瓜米糊
('tag-021', 'recipe-011', '高效补铁'), ('tag-022', 'recipe-011', '第一口辅食'), ('tag-023', 'recipe-011', '护眼'),
-- recipe-012 红薯泥
('tag-024', 'recipe-012', '天然甜味'), ('tag-025', 'recipe-012', '维生素A'), ('tag-026', 'recipe-012', '第一口辅食'),
-- recipe-013 蛋黄米粉泥
('tag-027', 'recipe-013', 'DHA'), ('tag-028', 'recipe-013', '补铁'), ('tag-029', 'recipe-013', '促大脑发育'),
-- recipe-014 猪肝红薯泥
('tag-030', 'recipe-014', '高效补铁'), ('tag-031', 'recipe-014', '预防贫血'), ('tag-032', 'recipe-014', '好消化'),
-- recipe-015 牛肉西兰花泥
('tag-033', 'recipe-015', '补铁'), ('tag-034', 'recipe-015', '优质蛋白'), ('tag-035', 'recipe-015', '维C促吸收'),
-- recipe-016 三文鱼豆腐泥
('tag-036', 'recipe-016', 'DHA'), ('tag-037', 'recipe-016', '补钙'), ('tag-038', 'recipe-016', '促大脑发育'),
-- recipe-017 香菇鸡肉蔬菜粥
('tag-039', 'recipe-017', '增强免疫'), ('tag-040', 'recipe-017', '均衡营养'), ('tag-041', 'recipe-017', '稠粥'),
-- recipe-018 胡萝卜手指条
('tag-042', 'recipe-018', '手抓食'), ('tag-043', 'recipe-018', '护眼'), ('tag-044', 'recipe-018', '锻炼抓握'),
-- recipe-019 龙利鱼蒸豆腐
('tag-045', 'recipe-019', 'DHA'), ('tag-046', 'recipe-019', '补钙'), ('tag-047', 'recipe-019', '无刺安全'),
-- recipe-020 番茄鸡蛋软面片
('tag-048', 'recipe-020', '开胃'), ('tag-049', 'recipe-020', '优质蛋白'), ('tag-050', 'recipe-020', '软烂面食'),
-- recipe-021 土豆鸡肉小丸子
('tag-051', 'recipe-021', '手抓食'), ('tag-052', 'recipe-021', '锻炼咀嚼'), ('tag-053', 'recipe-021', '无油健康'),
-- recipe-022 三鲜豆腐羹
('tag-054', 'recipe-022', '补钙'), ('tag-055', 'recipe-022', '优质蛋白'), ('tag-056', 'recipe-022', '出牙期适用'),
-- recipe-023 五彩蔬菜蛋饼
('tag-057', 'recipe-023', '手抓食'), ('tag-058', 'recipe-023', '色彩丰富'), ('tag-059', 'recipe-023', '均衡营养'),
-- recipe-024 冬瓜虾仁小馄饨
('tag-060', 'recipe-024', '补钙'), ('tag-061', 'recipe-024', '清热'), ('tag-062', 'recipe-024', '咀嚼训练'),
-- recipe-025 黑芝麻芋头泥
('tag-063', 'recipe-025', '补钙'), ('tag-064', 'recipe-025', '健康油脂'), ('tag-065', 'recipe-025', '高纤维'),
-- recipe-026 西兰花牛肉软饭
('tag-066', 'recipe-026', '补铁'), ('tag-067', 'recipe-026', '维C促吸收'), ('tag-068', 'recipe-026', '均衡一碗'),
-- recipe-027 什锦蔬菜蛋卷
('tag-069', 'recipe-027', '手抓食'), ('tag-070', 'recipe-027', '多彩蔬菜'), ('tag-071', 'recipe-027', '锻炼抓握'),
-- recipe-028 番茄牛肉疙瘩汤
('tag-072', 'recipe-028', '开胃'), ('tag-073', 'recipe-028', '补铁'), ('tag-074', 'recipe-028', '全家版少盐'),
-- recipe-029 燕麦水果粥
('tag-075', 'recipe-029', '高纤维'), ('tag-076', 'recipe-029', '无添加糖'), ('tag-077', 'recipe-029', '肠道健康'),
-- recipe-030 彩椒鸡肉炒软饭
('tag-078', 'recipe-030', '维C丰富'), ('tag-079', 'recipe-030', '色彩激发食欲'), ('tag-080', 'recipe-030', '优质蛋白'),
-- recipe-031 焦米粥
('tag-081', 'recipe-031', '腹泻专用'), ('tag-082', 'recipe-031', '温和止泻'), ('tag-083', 'recipe-031', '病期适用'),
-- recipe-032 蒸梨银耳羹
('tag-084', 'recipe-032', '润肺止咳'), ('tag-085', 'recipe-032', '病期适用'), ('tag-086', 'recipe-032', '秋冬调理'),
-- recipe-033 山药小米南瓜粥
('tag-087', 'recipe-033', '积食调理'), ('tag-088', 'recipe-033', '健脾养胃'), ('tag-089', 'recipe-033', '病期适用'),
-- recipe-034 西梅燕麦泥
('tag-090', 'recipe-034', '天然通便'), ('tag-091', 'recipe-034', '高纤维'), ('tag-092', 'recipe-034', '便秘专用'),
-- recipe-035 菠菜猪肝蛋黄泥
('tag-093', 'recipe-035', '强化补铁'), ('tag-094', 'recipe-035', '预防贫血'), ('tag-095', 'recipe-035', '维C促吸收');


-- ── 食谱食材 ─────────────────────────────────────────────────
INSERT INTO recipe_ingredients (id, recipe_id, name, amount, unit) VALUES
-- recipe-011 高铁南瓜米糊
('ing-031', 'recipe-011', '高铁婴儿米粉', '20', '克'),
('ing-032', 'recipe-011', '南瓜',         '40', '克'),
('ing-033', 'recipe-011', '温开水或配方奶', '80', '毫升'),
-- recipe-012 红薯泥
('ing-034', 'recipe-012', '红薯',   '80', '克'),
('ing-035', 'recipe-012', '配方奶', '20', '毫升'),
-- recipe-013 蛋黄米粉泥
('ing-036', 'recipe-013', '熟鸡蛋黄',     '1', '个'),
('ing-037', 'recipe-013', '高铁婴儿米粉', '15', '克'),
('ing-038', 'recipe-013', '温开水',       '60', '毫升'),
-- recipe-014 猪肝红薯泥
('ing-039', 'recipe-014', '猪肝', '30', '克'),
('ing-040', 'recipe-014', '红薯', '50', '克'),
('ing-041', 'recipe-014', '姜片（焯水去腥用）', '2', '片'),
-- recipe-015 牛肉西兰花泥
('ing-042', 'recipe-015', '瘦牛肉',  '35', '克'),
('ing-043', 'recipe-015', '西兰花',  '40', '克'),
('ing-044', 'recipe-015', '橄榄油',  '2', '毫升'),
-- recipe-016 三文鱼豆腐泥
('ing-045', 'recipe-016', '三文鱼', '35', '克'),
('ing-046', 'recipe-016', '嫩豆腐', '50', '克'),
('ing-047', 'recipe-016', '姜丝（去腥）', '少许', NULL),
-- recipe-017 香菇鸡肉蔬菜粥
('ing-048', 'recipe-017', '大米',   '30', '克'),
('ing-049', 'recipe-017', '鸡腿肉', '35', '克'),
('ing-050', 'recipe-017', '鲜香菇', '20', '克'),
('ing-051', 'recipe-017', '菠菜',   '20', '克'),
-- recipe-018 胡萝卜手指条
('ing-052', 'recipe-018', '胡萝卜', '1', '根（约100克）'),
-- recipe-019 龙利鱼蒸豆腐
('ing-053', 'recipe-019', '龙利鱼', '40', '克'),
('ing-054', 'recipe-019', '嫩豆腐', '60', '克'),
('ing-055', 'recipe-019', '葱姜水', '10', '毫升'),
-- recipe-020 番茄鸡蛋软面片
('ing-056', 'recipe-020', '宝宝面片', '30', '克'),
('ing-057', 'recipe-020', '番茄',     '50', '克'),
('ing-058', 'recipe-020', '鸡蛋',     '1', '个'),
-- recipe-021 土豆鸡肉小丸子
('ing-059', 'recipe-021', '土豆',   '60', '克'),
('ing-060', 'recipe-021', '鸡胸肉', '40', '克'),
('ing-061', 'recipe-021', '葱姜水', '5',  '毫升'),
-- recipe-022 三鲜豆腐羹
('ing-062', 'recipe-022', '嫩豆腐', '60', '克'),
('ing-063', 'recipe-022', '虾仁',   '25', '克'),
('ing-064', 'recipe-022', '豌豆',   '20', '克'),
-- recipe-023 五彩蔬菜蛋饼
('ing-065', 'recipe-023', '鸡蛋',   '2', '个'),
('ing-066', 'recipe-023', '胡萝卜', '30', '克'),
('ing-067', 'recipe-023', '菠菜',   '25', '克'),
-- recipe-024 冬瓜虾仁小馄饨
('ing-068', 'recipe-024', '馄饨皮', '10', '张'),
('ing-069', 'recipe-024', '鲜虾仁', '40', '克'),
('ing-070', 'recipe-024', '冬瓜',   '50', '克'),
-- recipe-025 黑芝麻芋头泥
('ing-071', 'recipe-025', '芋头',     '80', '克'),
('ing-072', 'recipe-025', '熟黑芝麻', '5',  '克'),
('ing-073', 'recipe-025', '配方奶',   '15', '毫升'),
-- recipe-026 西兰花牛肉软饭
('ing-074', 'recipe-026', '软米饭',  '70', '克'),
('ing-075', 'recipe-026', '牛肉丁',  '35', '克'),
('ing-076', 'recipe-026', '西兰花',  '30', '克'),
-- recipe-027 什锦蔬菜蛋卷
('ing-077', 'recipe-027', '鸡蛋',   '2', '个'),
('ing-078', 'recipe-027', '菠菜',   '20', '克'),
('ing-079', 'recipe-027', '胡萝卜', '25', '克'),
('ing-080', 'recipe-027', '鲜香菇', '15', '克'),
-- recipe-028 番茄牛肉疙瘩汤
('ing-081', 'recipe-028', '中筋面粉', '50', '克'),
('ing-082', 'recipe-028', '番茄',     '80', '克'),
('ing-083', 'recipe-028', '牛肉末',   '40', '克'),
('ing-084', 'recipe-028', '鸡蛋',     '1', '个'),
-- recipe-029 燕麦水果粥
('ing-085', 'recipe-029', '即食纯燕麦片', '30', '克'),
('ing-086', 'recipe-029', '香蕉',         '30', '克'),
('ing-087', 'recipe-029', '蓝莓',         '15', '克'),
('ing-088', 'recipe-029', '配方奶或全脂奶', '100', '毫升'),
-- recipe-030 彩椒鸡肉炒软饭
('ing-089', 'recipe-030', '软米饭',  '80', '克'),
('ing-090', 'recipe-030', '鸡胸肉',  '35', '克'),
('ing-091', 'recipe-030', '红彩椒',  '25', '克'),
('ing-092', 'recipe-030', '黄彩椒',  '25', '克'),
('ing-093', 'recipe-030', '植物油',  '3',  '毫升'),
-- recipe-031 焦米粥
('ing-094', 'recipe-031', '大米', '30', '克'),
('ing-095', 'recipe-031', '水',   '400', '毫升'),
-- recipe-032 蒸梨银耳羹
('ing-096', 'recipe-032', '雪梨',   '1', '个（约150克）'),
('ing-097', 'recipe-032', '干银耳', '5', '克'),
-- recipe-033 山药小米南瓜粥
('ing-098', 'recipe-033', '小米',   '25', '克'),
('ing-099', 'recipe-033', '山药',   '50', '克'),
('ing-100', 'recipe-033', '南瓜',   '40', '克'),
-- recipe-034 西梅燕麦泥
('ing-101', 'recipe-034', '西梅（去核）',   '3', '颗（约45克）'),
('ing-102', 'recipe-034', '即食纯燕麦片', '20', '克'),
('ing-103', 'recipe-034', '温水',          '60', '毫升'),
-- recipe-035 菠菜猪肝蛋黄泥
('ing-104', 'recipe-035', '猪肝', '25', '克'),
('ing-105', 'recipe-035', '菠菜', '30', '克'),
('ing-106', 'recipe-035', '熟蛋黄', '1', '个'),
('ing-107', 'recipe-035', '柠檬汁（去腥）', '几滴', NULL);


-- ── 制作步骤 ─────────────────────────────────────────────────
INSERT INTO recipe_steps (id, recipe_id, step_no, title, description, image_url) VALUES
-- recipe-011 高铁南瓜米糊
('step-101', 'recipe-011', 1, '蒸熟南瓜', '南瓜去皮切小块，上锅蒸8分钟至可轻松用筷子穿透，取出压成细泥。',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80'),
('step-102', 'recipe-011', 2, '调制米粉', '高铁婴儿米粉用80℃温水（或配方奶）按说明冲调至丝滑泥状，不能有干粉颗粒。',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80'),
('step-103', 'recipe-011', 3, '混合喂食', '将南瓜泥拌入米糊，调整稠度至挂勺不滴落，确认温度36-40℃后即可喂食。',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80'),

-- recipe-012 红薯泥
('step-104', 'recipe-012', 1, '蒸熟红薯', '红薯去皮切块，上锅蒸12分钟至完全软透，用叉子能轻松穿透为准。',
 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=800&q=80'),
('step-105', 'recipe-012', 2, '压制成泥', '趁热用叉子压成泥，加入少量配方奶调节稠度，过筛去除纤维颗粒更细腻。',
 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=800&q=80'),
('step-106', 'recipe-012', 3, '检查温度', '将红薯泥温度控制在36-38℃，过热会烫伤口腔黏膜，宝宝第一次尝试每次仅给1-2勺。',
 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=800&q=80'),

-- recipe-013 蛋黄米粉泥
('step-107', 'recipe-013', 1, '煮熟鸡蛋取黄', '鸡蛋冷水下锅，煮沸后再煮8分钟，取出剥壳，剥开蛋白只取蛋黄备用。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80'),
('step-108', 'recipe-013', 2, '调制米粉底', '高铁米粉用温开水冲调好，加入压碎的蛋黄，充分搅拌至融合无颗粒。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80'),
('step-109', 'recipe-013', 3, '首次少量尝试', '首次引入蛋黄仅给1/4个，连续观察3天，无过敏反应后可逐步增至1整个。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80'),

-- recipe-014 猪肝红薯泥
('step-110', 'recipe-014', 1, '猪肝处理去腥', '猪肝用清水浸泡30分钟换水2次，切片后加姜片冷水下锅焯至变色捞出，去除血沫。',
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'),
('step-111', 'recipe-014', 2, '红薯蒸熟备用', '红薯去皮切块蒸10分钟至软，与焯熟猪肝一起放入料理机。',
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'),
('step-112', 'recipe-014', 3, '打泥过筛', '加入少量温开水一起打成细泥，过细筛确保无颗粒，猪肝纤维质地较粗需过筛。',
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'),

-- recipe-015 牛肉西兰花泥
('step-113', 'recipe-015', 1, '牛肉蒸熟', '瘦牛肉冷水下锅焯水去血沫，转蒸锅蒸20分钟至完全熟透。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-114', 'recipe-015', 2, '西兰花焯水', '西兰花只取花冠部分，沸水焯2分钟至翠绿，捞出冲冷水保持色泽。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-115', 'recipe-015', 3, '打泥混合', '牛肉和西兰花加少量橄榄油及温水一起打成细腻泥糊，维C促进铁吸收效果最佳。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),

-- recipe-016 三文鱼豆腐泥
('step-116', 'recipe-016', 1, '三文鱼去刺处理', '三文鱼切厚片，仔细用镊子顺鱼刺方向逐根拔除，无刺是喂食安全关键。',
 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80'),
('step-117', 'recipe-016', 2, '同蒸至熟', '三文鱼片铺在嫩豆腐上，放几根姜丝去腥，上锅蒸8分钟至鱼肉变色熟透。',
 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80'),
('step-118', 'recipe-016', 3, '混合打泥', '去除姜丝，将三文鱼和豆腐一起打成细腻泥糊，加少量蒸鱼汤汁调稀度。',
 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80'),

-- recipe-017 香菇鸡肉蔬菜粥
('step-119', 'recipe-017', 1, '大米煮基础粥', '大米洗净加水8倍，大火煮沸后转小火煮20分钟至粥底粘稠。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-120', 'recipe-017', 2, '食材预处理', '鸡腿肉去皮焯水剁成极细肉末；香菇去蒂切极细末；菠菜焯水后挤干切碎。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-121', 'recipe-017', 3, '加料煮熟', '将鸡肉末、香菇末加入粥中继续煮5分钟，关火后加入菠菜碎拌匀，调整粘稠度。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),

-- recipe-018 胡萝卜手指条
('step-122', 'recipe-018', 1, '切条处理', '胡萝卜去皮，切成约1cm×1cm×6cm的长条，大小便于宝宝拳握但不易整根吞咽。',
 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=80'),
('step-123', 'recipe-018', 2, '上锅蒸透', '胡萝卜条上锅蒸15分钟，检测标准：用拇指和食指夹住能轻松压断即可。',
 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=80'),
('step-124', 'recipe-018', 3, '冷却后喂食', '稍微冷却至不烫手后给宝宝自由抓握，全程陪同监护防止整根放入口腔。',
 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=80'),

-- recipe-019 龙利鱼蒸豆腐
('step-125', 'recipe-019', 1, '食材准备', '龙利鱼解冻后用葱姜水腌制5分钟去腥；嫩豆腐切1.5cm厚片铺于蒸盘底部。',
 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80'),
('step-126', 'recipe-019', 2, '叠放上锅蒸', '龙利鱼片铺于豆腐上，上锅大火蒸8分钟，鱼肉全程变白无透明即熟。',
 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80'),
('step-127', 'recipe-019', 3, '捣碎或打泥', '根据月龄选择：8-9月打成细泥；10月龄后可捣碎保留小颗粒，加蒸出的汤汁调稀。',
 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80'),

-- recipe-020 番茄鸡蛋软面片
('step-128', 'recipe-020', 1, '番茄去皮打汁', '番茄划十字刀，沸水烫30秒后去皮，切块用料理机打成汁，过滤去籽备用。',
 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80'),
('step-129', 'recipe-020', 2, '面片煮软', '宝宝面片加入番茄汁中，加水补足量，小火煮至面片完全软烂（约8分钟）。',
 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80'),
('step-130', 'recipe-020', 3, '打散鸡蛋加入', '鸡蛋打散后淋入沸腾的汤中，边淋边用筷子顺一个方向搅拌成蛋花，关火即可。',
 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80'),

-- recipe-021 土豆鸡肉小丸子
('step-131', 'recipe-021', 1, '食材蒸熟', '土豆去皮切块蒸15分钟；鸡胸肉加葱姜水搅打成泥，蒸5分钟至熟。',
 'https://images.unsplash.com/photo-1606851091851-e8c8c0fad5b4?auto=format&fit=crop&w=800&q=80'),
('step-132', 'recipe-021', 2, '混合成团', '土豆趁热压成泥，与鸡肉泥混合揉均匀，以用手捏不散为合适稠度。',
 'https://images.unsplash.com/photo-1606851091851-e8c8c0fad5b4?auto=format&fit=crop&w=800&q=80'),
('step-133', 'recipe-021', 3, '搓圆蒸制', '取约直径2cm大小搓成圆球，上锅蒸5分钟固定形状，冷却至不烫手后提供。',
 'https://images.unsplash.com/photo-1606851091851-e8c8c0fad5b4?auto=format&fit=crop&w=800&q=80'),

-- recipe-022 三鲜豆腐羹
('step-134', 'recipe-022', 1, '食材处理', '虾仁去虾线剁成极细泥；豌豆煮熟压成泥；嫩豆腐切小丁备用。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-135', 'recipe-022', 2, '煮制成羹', '锅中加适量水烧开，放入豆腐丁煮2分钟，加入虾仁泥和豌豆泥，小火搅拌均匀。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-136', 'recipe-022', 3, '确认熟度', '虾仁变色（粉红色）后即熟，用少量玉米淀粉水勾薄芡，使汤汁裹住豆腐更易吞咽。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),

-- recipe-023 五彩蔬菜蛋饼
('step-137', 'recipe-023', 1, '蔬菜预处理', '胡萝卜擦丝；菠菜焯水挤干切碎末，两者加入蛋液中充分搅拌均匀。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80'),
('step-138', 'recipe-023', 2, '摊成薄饼', '平底锅刷薄薄一层植物油，中小火热锅，倒入蛋液菜末糊摊成5mm厚圆饼。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80'),
('step-139', 'recipe-023', 3, '切条提供', '两面煎至定型金黄，稍凉后切成约1.5cm宽的条状，便于宝宝抓握不易掉渣。',
 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80'),

-- recipe-031 焦米粥
('step-140', 'recipe-031', 1, '干炒大米至微黄', '锅中不放油，中小火将大米炒至米粒均匀变为淡黄色，飘出米香即可，注意不要炒焦。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-141', 'recipe-031', 2, '加水熬煮', '炒米加入12-15倍清水，大火烧开后转小火煮25分钟至粥体粘稠，期间定时搅拌防粘锅。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-142', 'recipe-031', 3, '调整浓度', '腹泻急性期给较稀的米汤；恢复期可稍增稠。每次少量多餐，不加任何调味品。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),

-- recipe-032 蒸梨银耳羹
('step-143', 'recipe-032', 1, '银耳泡发', '干银耳提前用凉水泡发2小时至完全展开，去除根部黄色硬蒂，撕成小朵。',
 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=800&q=80'),
('step-144', 'recipe-032', 2, '梨处理入锅', '雪梨去皮去核切小块，与银耳一起放入炖盅，加适量清水，小火炖40分钟。',
 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=800&q=80'),
('step-145', 'recipe-032', 3, '打泥过筛', '炖好后取适量打成细泥过筛，银耳胶质充分炖出后口感顺滑，无需添加任何糖分。',
 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=800&q=80'),

-- recipe-033 山药小米南瓜粥
('step-146', 'recipe-033', 1, '食材备料', '小米提前浸泡15分钟；山药去皮（戴手套防过敏）切小丁；南瓜去皮切小块。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-147', 'recipe-033', 2, '同锅熬煮', '所有食材加8倍水大火煮开，转小火煮20分钟，期间搅拌使南瓜自然化入粥中增甜。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),
('step-148', 'recipe-033', 3, '调整稠度', '用勺背压碎山药丁使粥体更绵密，积食期建议喝稀一些的粥底，不额外加任何配料。',
 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'),

-- recipe-034 西梅燕麦泥
('step-149', 'recipe-034', 1, '西梅去核处理', '新鲜西梅对半切去核，或选用无添加纯西梅果泥，取约45克（3颗大西梅）备用。',
 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80'),
('step-150', 'recipe-034', 2, '燕麦泡软', '即食燕麦片加60ml温水浸泡5分钟至完全软化，与西梅一起放入料理机。',
 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80'),
('step-151', 'recipe-034', 3, '打泥喂食', '打成细腻泥糊，每次给1-2勺（约10-15g），每天1次，连续2-3天观察排便改善情况。',
 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80'),

-- recipe-035 菠菜猪肝蛋黄泥
('step-152', 'recipe-035', 1, '猪肝处理', '猪肝浸泡30分钟后切片，滴几滴柠檬汁腌5分钟，冷水下锅焯至变色，沥干备用。',
 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80'),
('step-153', 'recipe-035', 2, '菠菜焯水', '菠菜沸水焯烫1分钟，捞出冲冷水保留翠绿色，挤干水分切碎（焯水可去除大部分草酸）。',
 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80'),
('step-154', 'recipe-035', 3, '混合打泥', '将猪肝、焯水菠菜、熟蛋黄一起加少量温水打成细泥过筛，猪肝每周摄入不超过2次。',
 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80');
