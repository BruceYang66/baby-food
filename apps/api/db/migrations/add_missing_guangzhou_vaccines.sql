-- 补齐广州/广东 0-6 岁儿童常用非免疫规划疫苗缺项
-- 不包含狂犬、黄热、霍乱、伤寒等旅行或暴露后场景疫苗

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-041',
  '23价肺炎球菌多糖疫苗',
  '肺炎球菌感染',
  '2岁+',
  '满2岁（高风险儿童优先）',
  CAST('optional' AS vaccine_category),
  '覆盖更多血清型，适合2岁以上高风险儿童。广州地区参考价格：198-228元/针。',
  '["接种前确认无发热","接种后留观30分钟","功能性或解剖性无脾等高风险儿童可优先评估"]',
  41
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-041' OR name = '23价肺炎球菌多糖疫苗'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-042',
  '五价轮状病毒疫苗第1剂',
  '轮状病毒感染',
  '2-3月龄',
  '满6周龄起，首剂不晚于12周龄',
  CAST('optional' AS vaccine_category),
  '口服五价重配轮状病毒减毒活疫苗第1剂。按广东/广州常用程序共3剂，第3剂不晚于32周龄。',
  '["口服疫苗，接种前后半小时避免进食","各剂间隔4-10周","首剂应尽早开始，不晚于12周龄"]',
  42
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-042' OR name = '五价轮状病毒疫苗第1剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-043',
  '五价轮状病毒疫苗第2剂',
  '轮状病毒感染',
  '3-5月龄',
  '与第1剂间隔4-10周',
  CAST('optional' AS vaccine_category),
  '口服五价重配轮状病毒减毒活疫苗第2剂。',
  '["口服疫苗，接种前后半小时避免进食","若近期腹泻或呕吐需先咨询门诊","按预约时间完成后续剂次"]',
  43
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-043' OR name = '五价轮状病毒疫苗第2剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-044',
  '五价轮状病毒疫苗第3剂',
  '轮状病毒感染',
  '4-7月龄',
  '与第2剂间隔4-10周，且第3剂不晚于32周龄',
  CAST('optional' AS vaccine_category),
  '口服五价重配轮状病毒减毒活疫苗第3剂，完成3剂程序。',
  '["口服疫苗，接种前后半小时避免进食","第3剂需在32周龄前完成","完成全程后保护更稳定"]',
  44
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-044' OR name = '五价轮状病毒疫苗第3剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-045',
  '四联疫苗第1剂',
  '百日咳/白喉/破伤风/Hib',
  '3月龄',
  '满3月龄',
  CAST('optional' AS vaccine_category),
  '无细胞百白破-Hib联合疫苗第1剂，可替代百白破和Hib的对应剂次。',
  '["接种前确认无发热","接种后留观30分钟","如已选择五联疫苗通常无需重复接种"]',
  45
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-045' OR name = '四联疫苗第1剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-046',
  '四联疫苗第2剂',
  '百日咳/白喉/破伤风/Hib',
  '4月龄',
  '满4月龄',
  CAST('optional' AS vaccine_category),
  '无细胞百白破-Hib联合疫苗第2剂。',
  '["与前一剂保持程序间隔","接种后注意观察精神状态","局部轻微红肿一般可自行缓解"]',
  46
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-046' OR name = '四联疫苗第2剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-047',
  '四联疫苗第3剂',
  '百日咳/白喉/破伤风/Hib',
  '5月龄',
  '满5月龄',
  CAST('optional' AS vaccine_category),
  '无细胞百白破-Hib联合疫苗第3剂，完成基础免疫。',
  '["按预约时间完成基础免疫","接种后注意休息补水","若选择五联疫苗通常无需重复接种"]',
  47
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-047' OR name = '四联疫苗第3剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-048',
  '四联疫苗第4剂',
  '百日咳/白喉/破伤风/Hib',
  '18月龄',
  '18-24月龄加强1剂',
  CAST('optional' AS vaccine_category),
  '无细胞百白破-Hib联合疫苗加强剂。',
  '["加强剂建议按程序完成","接种后留观30分钟","如已选择五联疫苗通常无需重复接种"]',
  48
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-048' OR name = '四联疫苗第4剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-049',
  '脊灰灭活疫苗（自费）第1剂',
  '脊髓灰质炎',
  '2月龄',
  '满2月龄',
  CAST('optional' AS vaccine_category),
  '自费全程灭活脊灰疫苗第1剂。广东非免疫规划程序为2、3、4月龄基础3剂，18月龄加强1剂。',
  '["与门诊确认是否作为全程灭活方案接种","接种后留观30分钟","按程序完成后续剂次"]',
  49
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-049' OR name = '脊灰灭活疫苗（自费）第1剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-050',
  '脊灰灭活疫苗（自费）第2剂',
  '脊髓灰质炎',
  '3月龄',
  '满3月龄',
  CAST('optional' AS vaccine_category),
  '自费全程灭活脊灰疫苗第2剂。',
  '["与前一剂保持程序间隔","接种后注意观察","如改用联合疫苗需由门诊确认程序衔接"]',
  50
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-050' OR name = '脊灰灭活疫苗（自费）第2剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-051',
  '脊灰灭活疫苗（自费）第3剂',
  '脊髓灰质炎',
  '4月龄',
  '满4月龄',
  CAST('optional' AS vaccine_category),
  '自费全程灭活脊灰疫苗第3剂，完成基础免疫。',
  '["按程序完成基础3剂","接种后避免剧烈活动","如有异常反应及时联系门诊"]',
  51
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-051' OR name = '脊灰灭活疫苗（自费）第3剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-052',
  '脊灰灭活疫苗（自费）加强剂',
  '脊髓灰质炎',
  '18月龄',
  '满18月龄',
  CAST('optional' AS vaccine_category),
  '自费全程灭活脊灰疫苗加强剂。',
  '["加强剂建议按时完成","接种后留观30分钟","与既往接种记录一并核对"]',
  52
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-052' OR name = '脊灰灭活疫苗（自费）加强剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-053',
  '乙脑灭活疫苗第1剂',
  '流行性乙型脑炎',
  '8月龄',
  '满8月龄',
  CAST('optional' AS vaccine_category),
  '乙型脑炎灭活疫苗第1剂。广东非免疫规划程序为8月龄2剂，间隔7-10天，2岁和6岁各加强1剂。',
  '["接种前确认无发热","接种后留观30分钟","夏秋季前完成更有利于建立保护"]',
  53
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-053' OR name = '乙脑灭活疫苗第1剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-054',
  '乙脑灭活疫苗第2剂',
  '流行性乙型脑炎',
  '8月龄',
  '第1剂后7-10天',
  CAST('optional' AS vaccine_category),
  '乙型脑炎灭活疫苗第2剂，完成基础2剂。',
  '["注意与第1剂间隔7-10天","接种后留观30分钟","按门诊预约完成基础免疫"]',
  54
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-054' OR name = '乙脑灭活疫苗第2剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-055',
  '乙脑灭活疫苗第3剂',
  '流行性乙型脑炎',
  '2岁',
  '满2岁',
  CAST('optional' AS vaccine_category),
  '乙型脑炎灭活疫苗第3剂（第1次加强）。',
  '["加强剂前核对既往2剂记录","接种后注意观察精神状态","必要时与门诊确认程序衔接"]',
  55
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-055' OR name = '乙脑灭活疫苗第3剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-056',
  '乙脑灭活疫苗第4剂',
  '流行性乙型脑炎',
  '6岁',
  '满6岁',
  CAST('optional' AS vaccine_category),
  '乙型脑炎灭活疫苗第4剂（第2次加强）。',
  '["建议入学前完成程序核对","接种后留观30分钟","如已走减毒活疫苗程序需先咨询门诊"]',
  56
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-056' OR name = '乙脑灭活疫苗第4剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-057',
  '甲肝灭活疫苗第1剂',
  '甲型肝炎',
  '18月龄',
  '18月龄及以上',
  CAST('optional' AS vaccine_category),
  '甲型肝炎灭活疫苗第1剂。广东非免疫规划程序为2剂，两剂间隔至少6个月。',
  '["接种前确认无发热","接种后留观30分钟","注意与减毒活甲肝疫苗不要重复程序"]',
  57
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-057' OR name = '甲肝灭活疫苗第1剂'
);

INSERT INTO vaccine_schedules (id, name, disease, stage_label, recommended_age_label, category, description, precautions_json, sort_order)
SELECT
  'vaccine-schedule-058',
  '甲肝灭活疫苗第2剂',
  '甲型肝炎',
  '2岁',
  '与第1剂间隔至少6个月',
  CAST('optional' AS vaccine_category),
  '甲型肝炎灭活疫苗第2剂，完成2剂程序。',
  '["与第1剂至少间隔6个月","完成2剂后保护更完整","按门诊预约时间完成"]',
  58
WHERE NOT EXISTS (
  SELECT 1
  FROM vaccine_schedules
  WHERE id = 'vaccine-schedule-058' OR name = '甲肝灭活疫苗第2剂'
);