-- ============================================================
-- 按用户 ID 清除用户及其所有关联数据
-- 用法：将下方 :target_user_id 替换为实际用户 ID，然后执行
--
-- 示例（psql）：
--   psql $DATABASE_URL -v target_user_id="'cm_abc123'" -f delete_user.sql
--
-- 或直接替换后执行：
--   psql $DATABASE_URL -f delete_user.sql
-- ============================================================

BEGIN;

-- 1. 声明目标用户 ID（修改此处）
DO $$
DECLARE
  target_user_id TEXT := 'REPLACE_WITH_USER_ID';  -- <-- 改这里
  baby_ids       TEXT[];
  meal_plan_ids  TEXT[];
BEGIN

  -- 确认用户存在
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
    RAISE EXCEPTION '用户不存在: %', target_user_id;
  END IF;

  RAISE NOTICE '开始清除用户 % 的数据...', target_user_id;

  -- 收集该用户拥有的所有 baby id
  SELECT ARRAY(SELECT id FROM babies WHERE user_id = target_user_id)
    INTO baby_ids;

  -- 收集这些 baby 的所有 meal_plan id
  IF array_length(baby_ids, 1) > 0 THEN
    SELECT ARRAY(SELECT id FROM meal_plans WHERE baby_id = ANY(baby_ids))
      INTO meal_plan_ids;
  ELSE
    meal_plan_ids := ARRAY[]::TEXT[];
  END IF;

  -- ── 用户行为数据 ──────────────────────────────────────────
  DELETE FROM user_favorites           WHERE user_id = target_user_id;
  DELETE FROM user_knowledge_favorites WHERE user_id = target_user_id;
  DELETE FROM user_feedback            WHERE user_id = target_user_id;
  DELETE FROM user_login_logs          WHERE user_id = target_user_id;

  -- ── 邀请（作为邀请人或被邀请人）──────────────────────────
  DELETE FROM baby_invites
    WHERE inviter_user_id = target_user_id
       OR invitee_user_id = target_user_id;

  -- ── 家庭成员关系 ──────────────────────────────────────────
  DELETE FROM baby_members WHERE user_id = target_user_id;

  -- ── Baby 相关数据（仅该用户拥有的 baby）──────────────────
  IF array_length(baby_ids, 1) > 0 THEN

    -- 喂养记录
    IF array_length(meal_plan_ids, 1) > 0 THEN
      DELETE FROM feeding_records
        WHERE meal_plan_id = ANY(meal_plan_ids);

      DELETE FROM meal_plan_items
        WHERE meal_plan_id = ANY(meal_plan_ids);
    END IF;

    DELETE FROM meal_plans       WHERE baby_id = ANY(baby_ids);
    DELETE FROM custom_recipes   WHERE baby_id = ANY(baby_ids);
    DELETE FROM vaccine_records  WHERE baby_id = ANY(baby_ids);
    DELETE FROM baby_allergens   WHERE baby_id = ANY(baby_ids);

    -- 清除其他用户对这些 baby 的成员关系和邀请
    DELETE FROM baby_members WHERE baby_id = ANY(baby_ids);
    DELETE FROM baby_invites WHERE baby_id = ANY(baby_ids);

    DELETE FROM babies WHERE id = ANY(baby_ids);

  END IF;

  -- ── 最后删除用户本身 ──────────────────────────────────────
  DELETE FROM users WHERE id = target_user_id;

  RAISE NOTICE '✓ 用户 % 及其所有数据已清除', target_user_id;

END $$;

COMMIT;
