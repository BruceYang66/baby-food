-- 疫苗数据初始化脚本（修正版）
-- 基于 knowledge_base/01_婴儿疫苗接种指南.txt

-- 清空现有疫苗数据（先删除关联记录，再删除疫苗计划）
DELETE FROM vaccine_records;
DELETE FROM vaccine_schedules;

-- ============================================
-- 一类疫苗（免费必打）
-- ============================================

-- 出生 (sort_order: 1-9)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_bcg_birth', '卡介苗（BCG）', '结核病', '出生', '出生24小时内', 'free', '预防结核病，通常在出生后24小时内接种', '["接种后2-3周局部会出现红肿硬结", "3-4周后形成脓疱或溃疡属正常反应", "保持接种部位清洁干燥", "不要挤压或包扎"]', 1),
  ('vaccine_hepb_1', '乙肝疫苗第1剂', '乙型肝炎', '出生', '出生24小时内', 'free', '预防乙型肝炎，第一剂需在出生后24小时内完成', '["接种后可能出现接种部位红肿", "少数婴儿可能出现低热", "母亲为乙肝病毒携带者的新生儿需在12小时内接种"]', 2);

-- 1月龄 (sort_order: 10-19)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_hepb_2', '乙肝疫苗第2剂', '乙型肝炎', '1月龄', '满1个月', 'free', '乙肝疫苗第二剂，与第一剂间隔1个月', '["接种后注意观察有无过敏反应", "保持接种部位清洁"]', 10);

-- 2月龄 (sort_order: 20-29)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_polio_1', '脊灰疫苗第1剂', '脊髓灰质炎（小儿麻痹症）', '2月龄', '满2个月', 'free', '预防脊髓灰质炎（小儿麻痹症），第一剂', '["口服疫苗前后半小时不要进食", "接种后注意观察"]', 20);

-- 3月龄 (sort_order: 30-39)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_polio_2', '脊灰疫苗第2剂', '脊髓灰质炎', '3月龄', '满3个月', 'free', '脊灰疫苗第二剂，与第一剂间隔1个月', '["口服疫苗前后半小时不要进食"]', 30),
  ('vaccine_dpt_1', '百白破疫苗第1剂', '百日咳、白喉、破伤风', '3月龄', '满3个月', 'free', '预防百日咳、白喉、破伤风三种疾病', '["接种后可能出现发热、局部红肿", "发热超过38.5℃需就医", "接种后24小时内避免洗澡"]', 31);

-- 4月龄 (sort_order: 40-49)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_polio_3', '脊灰疫苗第3剂', '脊髓灰质炎', '4月龄', '满4个月', 'free', '脊灰疫苗第三剂，与第二剂间隔1个月', '["口服疫苗前后半小时不要进食"]', 40),
  ('vaccine_dpt_2', '百白破疫苗第2剂', '百日咳、白喉、破伤风', '4月龄', '满4个月', 'free', '百白破疫苗第二剂，与第一剂间隔1个月', '["接种后可能出现发热、局部红肿"]', 41);

-- 5月龄 (sort_order: 50-59)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_dpt_3', '百白破疫苗第3剂', '百日咳、白喉、破伤风', '5月龄', '满5个月', 'free', '百白破疫苗第三剂，与第二剂间隔1个月', '["接种后可能出现发热、局部红肿"]', 50);

-- 6月龄 (sort_order: 60-69)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_hepb_3', '乙肝疫苗第3剂', '乙型肝炎', '6月龄', '满6个月', 'free', '乙肝疫苗第三剂，完成基础免疫', '["接种后1-2个月可检测抗体水平"]', 60),
  ('vaccine_mening_1', 'A群流脑疫苗第1剂', '流行性脑脊髓膜炎', '6月龄', '满6个月', 'free', '预防A群流行性脑脊髓膜炎，第一剂', '["接种后可能出现发热、烦躁", "注意观察精神状态"]', 61);

-- 8月龄 (sort_order: 80-89)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_mmr_1', '麻腮风疫苗第1剂', '麻疹、腮腺炎、风疹', '8月龄', '满8个月', 'free', '预防麻疹、腮腺炎、风疹三种疾病', '["接种后5-12天可能出现发热、皮疹", "属正常反应，一般2-3天消退", "过敏体质儿童需提前告知医生"]', 80),
  ('vaccine_je_1', '乙脑减毒活疫苗', '流行性乙型脑炎', '8月龄', '满8个月', 'free', '预防流行性乙型脑炎', '["接种后可能出现发热", "注意观察精神状态"]', 81);

-- 9月龄 (sort_order: 90-99)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_mening_2', 'A群流脑疫苗第2剂', '流行性脑脊髓膜炎', '9月龄', '满9个月', 'free', 'A群流脑疫苗第二剂，与第一剂间隔3个月', '["接种后可能出现发热、烦躁"]', 90);

-- 18月龄 (sort_order: 180-189)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_dpt_4', '百白破疫苗第4剂（加强）', '百日咳、白喉、破伤风', '18月龄', '满18个月', 'free', '百白破疫苗加强针，巩固免疫效果', '["接种后可能出现发热、局部红肿"]', 180),
  ('vaccine_mmr_2', '麻腮风疫苗第2剂', '麻疹、腮腺炎、风疹', '18月龄', '满18个月', 'free', '麻腮风疫苗第二剂，加强免疫', '["接种后5-12天可能出现发热、皮疹"]', 181),
  ('vaccine_hepa_1', '甲肝减毒活疫苗', '甲型肝炎', '18月龄', '满18个月', 'free', '预防甲型肝炎', '["接种后可能出现轻微发热", "保持接种部位清洁"]', 182);

-- 2岁 (sort_order: 240-249)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_je_boost', '乙脑减毒活疫苗加强', '流行性乙型脑炎', '2岁', '满2岁', 'free', '乙脑疫苗加强针', '["接种后可能出现发热"]', 240);

-- 3岁 (sort_order: 360-369)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_mening_ac', 'A+C群流脑疫苗', '流行性脑脊髓膜炎', '3岁', '满3岁', 'free', '预防A群和C群流行性脑脊髓膜炎', '["接种后可能出现发热、烦躁"]', 360);

-- 4岁 (sort_order: 480-489)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_polio_boost', '脊灰疫苗加强', '脊髓灰质炎', '4岁', '满4岁', 'free', '脊灰疫苗加强针', '["口服疫苗前后半小时不要进食"]', 480);

-- 6岁 (sort_order: 720-729)
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_dt_boost', '白破疫苗加强', '白喉、破伤风', '6岁', '满6岁', 'free', '预防白喉、破伤风，加强针', '["接种后可能出现局部红肿"]', 720),
  ('vaccine_mening_ac_boost', 'A+C群流脑疫苗加强', '流行性脑脊髓膜炎', '6岁', '满6岁', 'free', 'A+C群流脑疫苗加强针', '["接种后可能出现发热、烦躁"]', 721);

-- ============================================
-- 二类疫苗（自费疫苗，建议补充）
-- ============================================

-- 13价肺炎球菌结合疫苗（推荐程度：★★★★★）
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_pcv13_1', '13价肺炎疫苗第1剂', '肺炎链球菌感染', '2月龄', '满2个月', 'optional', '预防肺炎链球菌感染，包括肺炎、脑膜炎、中耳炎等。推荐程度：★★★★★', '["接种后可能出现发热、局部红肿", "是目前最推荐的自费疫苗之一", "与免费疫苗不冲突，可同时接种"]', 21),
  ('vaccine_pcv13_2', '13价肺炎疫苗第2剂', '肺炎链球菌感染', '4月龄', '满4个月', 'optional', '13价肺炎疫苗第二剂，与第一剂间隔2个月', '["接种后可能出现发热、局部红肿"]', 42),
  ('vaccine_pcv13_3', '13价肺炎疫苗第3剂', '肺炎链球菌感染', '6月龄', '满6个月', 'optional', '13价肺炎疫苗第三剂，与第二剂间隔2个月', '["接种后可能出现发热、局部红肿"]', 62),
  ('vaccine_pcv13_boost', '13价肺炎疫苗加强', '肺炎链球菌感染', '12-15月龄', '满12-15个月', 'optional', '13价肺炎疫苗加强针', '["接种后可能出现发热、局部红肿"]', 135);

-- 五联疫苗（可替代百白破+脊灰+Hib）
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_pentavalent_1', '五联疫苗第1剂', '百日咳、白喉、破伤风、脊髓灰质炎、b型流感嗜血杆菌', '2月龄', '满2个月', 'optional', '一针预防五种疾病，可替代百白破和脊灰疫苗，减少接种次数', '["可替代免费的百白破和脊灰疫苗", "接种后可能出现发热、局部红肿", "减少宝宝接种痛苦"]', 22),
  ('vaccine_pentavalent_2', '五联疫苗第2剂', '百日咳、白喉、破伤风、脊髓灰质炎、b型流感嗜血杆菌', '3月龄', '满3个月', 'optional', '五联疫苗第二剂，与第一剂间隔1个月', '["接种后可能出现发热、局部红肿"]', 32),
  ('vaccine_pentavalent_3', '五联疫苗第3剂', '百日咳、白喉、破伤风、脊髓灰质炎、b型流感嗜血杆菌', '4月龄', '满4个月', 'optional', '五联疫苗第三剂，与第二剂间隔1个月', '["接种后可能出现发热、局部红肿"]', 43),
  ('vaccine_pentavalent_boost', '五联疫苗加强', '百日咳、白喉、破伤风、脊髓灰质炎、b型流感嗜血杆菌', '18月龄', '满18个月', 'optional', '五联疫苗加强针', '["接种后可能出现发热、局部红肿"]', 183);

-- 手足口病疫苗（EV71疫苗）（推荐程度：★★★★）
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_ev71_1', '手足口病疫苗第1剂', 'EV71病毒引起的手足口病', '6月龄', '满6个月', 'optional', '预防由EV71病毒引起的手足口病重症。推荐程度：★★★★', '["接种2剂，间隔1个月", "5岁前完成接种", "手足口病高发期前接种效果最佳"]', 63),
  ('vaccine_ev71_2', '手足口病疫苗第2剂', 'EV71病毒引起的手足口病', '7月龄', '满7个月', 'optional', '手足口病疫苗第二剂，与第一剂间隔1个月', '["完成2剂接种可获得较好保护"]', 70);

-- 水痘疫苗（推荐程度：★★★★）
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_varicella_1', '水痘疫苗第1剂', '水痘', '12月龄', '满12个月', 'optional', '预防水痘，建议接种2剂。推荐程度：★★★★', '["接种后可能出现轻微发热、皮疹", "接种2剂保护效果更好"]', 125),
  ('vaccine_varicella_2', '水痘疫苗第2剂', '水痘', '4岁', '满4岁', 'optional', '水痘疫苗第二剂，与第一剂间隔3个月以上', '["完成2剂接种可获得更好保护"]', 481);

-- 流感疫苗（推荐程度：★★★★）
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_flu_annual', '流感疫苗（年度）', '流行性感冒', '6月龄起', '满6个月起，每年接种', 'optional', '预防流行性感冒，每年接种一次。推荐程度：★★★★', '["每年流感季节前接种", "6个月-3岁首次接种需接种2剂", "流感病毒每年变异，需每年接种"]', 64);

-- 轮状病毒疫苗（推荐程度：★★★）
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_rotavirus_oral', '轮状病毒疫苗（口服）', '轮状病毒引起的腹泻', '2月龄-3岁', '2个月-3岁，每年1剂', 'optional', '预防轮状病毒引起的腹泻。推荐程度：★★★', '["口服疫苗", "接种前后半小时不要进食", "秋冬季腹泻高发期前接种", "每年接种1剂"]', 23);

-- Hib疫苗（b型流感嗜血杆菌疫苗）
INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
VALUES
  ('vaccine_hib_1', 'Hib疫苗第1剂', 'b型流感嗜血杆菌感染', '2月龄', '满2个月', 'optional', '预防b型流感嗜血杆菌引起的脑膜炎、肺炎等', '["接种后可能出现发热、局部红肿", "如选择五联疫苗则无需单独接种"]', 24),
  ('vaccine_hib_2', 'Hib疫苗第2剂', 'b型流感嗜血杆菌感染', '4月龄', '满4个月', 'optional', 'Hib疫苗第二剂，与第一剂间隔2个月', '["接种后可能出现发热、局部红肿"]', 44),
  ('vaccine_hib_3', 'Hib疫苗第3剂', 'b型流感嗜血杆菌感染', '6月龄', '满6个月', 'optional', 'Hib疫苗第三剂，与第二剂间隔2个月', '["接种后可能出现发热、局部红肿"]', 65),
  ('vaccine_hib_boost', 'Hib疫苗加强', 'b型流感嗜血杆菌感染', '18月龄', '满18个月', 'optional', 'Hib疫苗加强针', '["接种后可能出现发热、局部红肿"]', 184);

-- 验证数据
SELECT
  category,
  stage_label,
  name,
  sort_order,
  recommended_age_label
FROM vaccine_schedules
ORDER BY category, sort_order, name;
