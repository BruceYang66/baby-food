-- ============================================================
-- 表结构注释（适用于已建表的生产/开发库，直接执行即可）
-- 执行方式：psql -d baby_food -f comments.sql
-- ============================================================

-- ── 枚举类型 ──────────────────────────────────────────────────
COMMENT ON TYPE content_status IS '食谱内容状态：draft=草稿，pending_review=待审核，published=已发布，offline=已下架，trash=已删除';
COMMENT ON TYPE review_status IS '食谱审核状态：none=未发起，pending=审核中，approved=已通过，rejected=已驳回';

-- ── users ──────────────────────────────────────────────────────
COMMENT ON TABLE  users                  IS '小程序用户表，每条记录对应一个微信登录用户';
COMMENT ON COLUMN users.id               IS '用户唯一标识，cuid 格式';
COMMENT ON COLUMN users.nickname         IS '用户昵称，微信首次登录时自动生成，后续可编辑';
COMMENT ON COLUMN users.avatar_url       IS '头像 URL，存放第三方图床或微信 CDN 地址';
COMMENT ON COLUMN users.wechat_open_id   IS '微信 openid，与 AppID 绑定，全局唯一，用于登录识别';
COMMENT ON COLUMN users.activity_label   IS '活跃度标签，运营展示用（如：高活跃/中活跃/低活跃）';
COMMENT ON COLUMN users.status_label     IS '账号状态标签，运营展示用（如：正常/待回访/已封禁）';
COMMENT ON COLUMN users.created_at       IS '账号创建时间（首次登录时间）';

-- ── babies ─────────────────────────────────────────────────────
COMMENT ON TABLE  babies                 IS '宝宝档案表，每个用户当前只支持一个宝宝档案';
COMMENT ON COLUMN babies.id              IS '宝宝档案唯一标识，cuid 格式';
COMMENT ON COLUMN babies.user_id         IS '所属用户 ID，关联 users.id';
COMMENT ON COLUMN babies.nickname        IS '宝宝昵称，家长自定义';
COMMENT ON COLUMN babies.birth_date      IS '宝宝出生日期，用于计算月龄和辅食阶段';
COMMENT ON COLUMN babies.stage_label     IS '当前辅食阶段标签（由出生日期自动计算写入），如：泥糊状辅食阶段';

-- ── baby_allergens ─────────────────────────────────────────────
COMMENT ON TABLE  baby_allergens         IS '宝宝过敏原记录表，一个宝宝可有多条';
COMMENT ON COLUMN baby_allergens.id      IS '记录唯一标识';
COMMENT ON COLUMN baby_allergens.baby_id IS '所属宝宝 ID，关联 babies.id';
COMMENT ON COLUMN baby_allergens.name    IS '过敏原名称，如：鸡蛋、花生、牛奶';
COMMENT ON COLUMN baby_allergens.severity IS '严重程度：低/中/高，可为空（未知严重度）';

-- ── recipes ───────────────────────────────────────────────────
COMMENT ON TABLE  recipes                  IS '辅食食谱主表，含内容状态与审核状态双轨管理';
COMMENT ON COLUMN recipes.id               IS '食谱唯一标识，cuid 格式';
COMMENT ON COLUMN recipes.title            IS '食谱名称';
COMMENT ON COLUMN recipes.summary          IS '食谱简介，约 20-50 字，展示在列表卡片';
COMMENT ON COLUMN recipes.cover_image      IS '封面图 URL';
COMMENT ON COLUMN recipes.age_label        IS '适用月龄标签，如：6个月+、8-10月、1-2岁';
COMMENT ON COLUMN recipes.duration_label   IS '制作时长标签，如：15分钟、30分钟';
COMMENT ON COLUMN recipes.difficulty_label IS '难度标签：初级/中级/高级';
COMMENT ON COLUMN recipes.source           IS '食谱来源渠道，如：营养师精品/批量导入/手机快速添加';
COMMENT ON COLUMN recipes.creator         IS '创建人昵称（运营/营养师姓名）';
COMMENT ON COLUMN recipes.favorites        IS '收藏数（冗余字段，方便排序）';
COMMENT ON COLUMN recipes.review_focus     IS '审核重点备注，供审核员参考';
COMMENT ON COLUMN recipes.content_status   IS '内容状态，控制是否对外可见（见 content_status 枚举）';
COMMENT ON COLUMN recipes.review_status    IS '审核状态，控制审核流程（见 review_status 枚举）';
COMMENT ON COLUMN recipes.created_at       IS '食谱创建时间';
COMMENT ON COLUMN recipes.updated_at       IS '食谱最后更新时间';

-- ── recipe_ingredients ────────────────────────────────────────
COMMENT ON TABLE  recipe_ingredients          IS '食谱食材明细表';
COMMENT ON COLUMN recipe_ingredients.id       IS '食材记录唯一标识';
COMMENT ON COLUMN recipe_ingredients.recipe_id IS '所属食谱 ID，关联 recipes.id';
COMMENT ON COLUMN recipe_ingredients.name     IS '食材名称，如：胡萝卜、猪肝';
COMMENT ON COLUMN recipe_ingredients.amount   IS '用量数字，如：50';
COMMENT ON COLUMN recipe_ingredients.unit     IS '用量单位，如：克、毫升；可为空（整个、适量）';

-- ── recipe_steps ──────────────────────────────────────────────
COMMENT ON TABLE  recipe_steps              IS '食谱制作步骤表，按 step_no 排序展示';
COMMENT ON COLUMN recipe_steps.id           IS '步骤唯一标识';
COMMENT ON COLUMN recipe_steps.recipe_id    IS '所属食谱 ID，关联 recipes.id';
COMMENT ON COLUMN recipe_steps.step_no      IS '步骤序号，从 1 开始';
COMMENT ON COLUMN recipe_steps.title        IS '步骤小标题，如：焯水去腥';
COMMENT ON COLUMN recipe_steps.description  IS '步骤详细说明';
COMMENT ON COLUMN recipe_steps.image_url    IS '步骤配图 URL，可为空';

-- ── recipe_tags ───────────────────────────────────────────────
COMMENT ON TABLE  recipe_tags           IS '食谱标签表，支持多标签筛选';
COMMENT ON COLUMN recipe_tags.id        IS '标签记录唯一标识';
COMMENT ON COLUMN recipe_tags.recipe_id IS '所属食谱 ID，关联 recipes.id';
COMMENT ON COLUMN recipe_tags.name      IS '标签内容，如：高铁、补钙、手抓食、开胃';

-- ── meal_plans ────────────────────────────────────────────────
COMMENT ON TABLE  meal_plans                   IS '每日辅食计划表，每条记录代表一天的膳食安排';
COMMENT ON COLUMN meal_plans.id                IS '计划唯一标识';
COMMENT ON COLUMN meal_plans.user_id           IS '所属用户 ID，关联 users.id';
COMMENT ON COLUMN meal_plans.title             IS '计划标题，如：今日辅食计划';
COMMENT ON COLUMN meal_plans.date_label        IS '日期展示标签，如：今天 · 4月9日（含"今天"关键词用于识别当日计划）';
COMMENT ON COLUMN meal_plans.nutrition_score   IS '营养评分（0-100），系统根据食谱营养素计算';
COMMENT ON COLUMN meal_plans.water_suggestion  IS '建议饮水量，如：450ml，依月龄推算';

-- ── meal_plan_items ───────────────────────────────────────────
COMMENT ON TABLE  meal_plan_items               IS '膳食计划条目表，每条记录对应计划中的一个餐次';
COMMENT ON COLUMN meal_plan_items.id            IS '条目唯一标识';
COMMENT ON COLUMN meal_plan_items.meal_plan_id  IS '所属膳食计划 ID，关联 meal_plans.id';
COMMENT ON COLUMN meal_plan_items.recipe_id     IS '关联食谱 ID（可为空，表示自定义非食谱餐次）';
COMMENT ON COLUMN meal_plan_items.slot          IS '餐次标识：breakfast=早餐，lunch=午餐，dinner=晚餐，snack=加餐';
COMMENT ON COLUMN meal_plan_items.time          IS '建议进食时间，格式 HH:mm';
COMMENT ON COLUMN meal_plan_items.title         IS '餐次展示名称（冗余自食谱，或自定义）';
COMMENT ON COLUMN meal_plan_items.focus         IS '该餐次的营养重点说明，如：补充优质蛋白';

-- ── guide_stages ──────────────────────────────────────────────
COMMENT ON TABLE  guide_stages             IS '月龄饮食指南阶段表，每条记录对应一个月龄区间';
COMMENT ON COLUMN guide_stages.id          IS '阶段唯一标识';
COMMENT ON COLUMN guide_stages.key         IS '阶段索引键，如：6-8、8-10、12-18（对应月龄区间）';
COMMENT ON COLUMN guide_stages.label       IS '阶段展示标签，如：6-8月';
COMMENT ON COLUMN guide_stages.title       IS '阶段标题，如：6-8个月：尝试颗粒感';
COMMENT ON COLUMN guide_stages.description IS '阶段描述，介绍该阶段宝宝发育特点和喂养重点';

-- ── guide_food_rules ─────────────────────────────────────────
COMMENT ON TABLE  guide_food_rules            IS '月龄饮食指南食物规则表，关联 guide_stages';
COMMENT ON COLUMN guide_food_rules.id         IS '规则唯一标识';
COMMENT ON COLUMN guide_food_rules.stage_id   IS '所属阶段 ID，关联 guide_stages.id';
COMMENT ON COLUMN guide_food_rules.type       IS '规则类型：recommended=推荐，cautious=谨慎尝试，forbidden=严格禁止';
COMMENT ON COLUMN guide_food_rules.title      IS '规则标题，如：推荐添加、严格禁止';
COMMENT ON COLUMN guide_food_rules.foods_json IS '食物列表，JSON 数组格式，如：["南瓜泥","鸡肉泥"]';

-- ── symptom_guides ────────────────────────────────────────────
COMMENT ON TABLE  symptom_guides          IS '病症饮食指导主表，每条对应一种症状';
COMMENT ON COLUMN symptom_guides.id       IS '症状指导唯一标识';
COMMENT ON COLUMN symptom_guides.symptom  IS '症状名称，如：腹泻、便秘、感冒（唯一索引，用于查询）';
COMMENT ON COLUMN symptom_guides.title    IS '指导标题，如：腹泻期饮食建议';

-- ── symptom_food_rules ────────────────────────────────────────
COMMENT ON TABLE  symptom_food_rules                   IS '病症食物规则表，记录各症状的忌口与推荐食物';
COMMENT ON COLUMN symptom_food_rules.id                IS '规则唯一标识';
COMMENT ON COLUMN symptom_food_rules.symptom_guide_id  IS '所属症状指导 ID，关联 symptom_guides.id';
COMMENT ON COLUMN symptom_food_rules.type              IS '规则类型：avoid=忌口，recommended=推荐';
COMMENT ON COLUMN symptom_food_rules.food              IS '食物名称，如：高油脂食物、蒸苹果泥';
COMMENT ON COLUMN symptom_food_rules.reason            IS '建议原因说明，帮助家长理解';

-- ── recipe_reviews ────────────────────────────────────────────
COMMENT ON TABLE  recipe_reviews            IS '食谱审核记录表，记录每次审核操作历史';
COMMENT ON COLUMN recipe_reviews.id         IS '审核记录唯一标识';
COMMENT ON COLUMN recipe_reviews.recipe_id  IS '被审核食谱 ID，关联 recipes.id';
COMMENT ON COLUMN recipe_reviews.action     IS '审核操作（与 review_status 枚举同值）：pending=提交审核，approved=通过，rejected=驳回';
COMMENT ON COLUMN recipe_reviews.comment    IS '审核意见，可为空';
COMMENT ON COLUMN recipe_reviews.created_at IS '审核操作时间';

-- ── recipe_versions ───────────────────────────────────────────
COMMENT ON TABLE  recipe_versions            IS '食谱版本快照表，每次发布前保存当前版本';
COMMENT ON COLUMN recipe_versions.id         IS '版本记录唯一标识';
COMMENT ON COLUMN recipe_versions.recipe_id  IS '所属食谱 ID，关联 recipes.id';
COMMENT ON COLUMN recipe_versions.version_no IS '版本号，从 1 开始递增';
COMMENT ON COLUMN recipe_versions.snapshot   IS '食谱内容 JSON 快照（含标题、食材、步骤等核心字段）';
COMMENT ON COLUMN recipe_versions.created_at IS '版本创建时间';

-- ── import_jobs ───────────────────────────────────────────────
COMMENT ON TABLE  import_jobs            IS '批量导入任务记录表，记录每次食谱导入操作';
COMMENT ON COLUMN import_jobs.id         IS '任务唯一标识';
COMMENT ON COLUMN import_jobs.file_name  IS '上传文件名，如：春季辅食补充批次.xlsx';
COMMENT ON COLUMN import_jobs.operator   IS '操作人昵称';
COMMENT ON COLUMN import_jobs.total      IS '本次导入总条数';
COMMENT ON COLUMN import_jobs.success    IS '导入成功条数';
COMMENT ON COLUMN import_jobs.failed     IS '导入失败条数';
COMMENT ON COLUMN import_jobs.status     IS '任务状态：completed=完成，failed=失败，processing=处理中';
COMMENT ON COLUMN import_jobs.created_at IS '导入任务创建时间';

-- ── system_settings ───────────────────────────────────────────
COMMENT ON TABLE  system_settings             IS '系统配置表，键值对形式存储全局参数';
COMMENT ON COLUMN system_settings.id          IS '配置项唯一标识';
COMMENT ON COLUMN system_settings.setting_key IS '配置键名，如：app_name、daily_reminder（唯一索引）';
COMMENT ON COLUMN system_settings.setting_val IS '配置值，统一存为字符串';
COMMENT ON COLUMN system_settings.updated_at  IS '配置最后修改时间';

-- ── user_favorites ─────────────────────────────────────────────
COMMENT ON TABLE  user_favorites             IS '用户食谱收藏表，支持跨设备同步；同一用户同一食谱不重复（唯一约束）';
COMMENT ON COLUMN user_favorites.id          IS '收藏记录唯一标识，cuid 格式';
COMMENT ON COLUMN user_favorites.user_id     IS '收藏用户 ID，关联 users.id';
COMMENT ON COLUMN user_favorites.recipe_id   IS '被收藏食谱 ID，关联 recipes.id';
COMMENT ON COLUMN user_favorites.created_at  IS '收藏时间，也用于排序（最近收藏排前）';

-- ── user_feedback ──────────────────────────────────────────────
COMMENT ON TABLE  user_feedback             IS '用户意见反馈表，记录通过帮助中心提交的反馈内容';
COMMENT ON COLUMN user_feedback.id          IS '反馈记录唯一标识，cuid 格式';
COMMENT ON COLUMN user_feedback.user_id     IS '提交反馈的用户 ID，关联 users.id；需登录后提交，不为空';
COMMENT ON COLUMN user_feedback.content     IS '反馈正文，最长 500 字';
COMMENT ON COLUMN user_feedback.created_at  IS '反馈提交时间';
