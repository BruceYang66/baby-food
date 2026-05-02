-- ============================================================
-- 批量按用户 ID 清除用户及其所有关联数据
-- 用法：修改下方 target_user_ids 数组后执行
--
-- 示例（psql）：
--   psql $DATABASE_URL -f delete_users_batch.sql
-- ============================================================

BEGIN;

DO $$
DECLARE
  -- ↓↓↓ 在此填写要删除的用户 ID 列表 ↓↓↓
  target_user_ids TEXT[] := ARRAY[
    'USER_ID_1',
    'USER_ID_2',
    'USER_ID_3'
  ];
  -- ↑↑↑ ─────────────────────────────── ↑↑↑

  uid            TEXT;
  baby_ids       TEXT[];
  meal_plan_ids  TEXT[];
  deleted_count  INT := 0;
BEGIN

  FOREACH uid IN ARRAY target_user_ids LOOP

    IF NOT EXISTS (SELECT 1 FROM users WHERE id = uid) THEN
      RAISE WARNING '用户不存在，跳过: %', uid;
      CONTINUE;
    END IF;

    -- 收集 baby ids
    SELECT ARRAY(SELECT id FROM babies WHERE user_id = uid) INTO baby_ids;

    -- 收集 meal_plan ids
    IF array_length(baby_ids, 1) > 0 THEN
      SELECT ARRAY(SELECT id FROM meal_plans WHERE baby_id = ANY(baby_ids))
        INTO meal_plan_ids;
    ELSE
      meal_plan_ids := ARRAY[]::TEXT[];
    END IF;

    -- 用户行为数据
    DELETE FROM user_favorites           WHERE user_id = uid;
    DELETE FROM user_knowledge_favorites WHERE user_id = uid;
    DELETE FROM user_feedback            WHERE user_id = uid;
    DELETE FROM user_login_logs          WHERE user_id = uid;

    -- 邀请
    DELETE FROM baby_invites
      WHERE inviter_user_id = uid OR invitee_user_id = uid;

    -- 家庭成员关系
    DELETE FROM baby_members WHERE user_id = uid;

    -- Baby 相关数据
    IF array_length(baby_ids, 1) > 0 THEN

      IF array_length(meal_plan_ids, 1) > 0 THEN
        DELETE FROM feeding_records  WHERE meal_plan_id = ANY(meal_plan_ids);
        DELETE FROM meal_plan_items  WHERE meal_plan_id = ANY(meal_plan_ids);
      END IF;

      DELETE FROM meal_plans      WHERE baby_id = ANY(baby_ids);
      DELETE FROM custom_recipes  WHERE baby_id = ANY(baby_ids);
      DELETE FROM vaccine_records WHERE baby_id = ANY(baby_ids);
      DELETE FROM baby_allergens  WHERE baby_id = ANY(baby_ids);
      DELETE FROM baby_members    WHERE baby_id = ANY(baby_ids);
      DELETE FROM baby_invites    WHERE baby_id = ANY(baby_ids);
      DELETE FROM babies          WHERE id = ANY(baby_ids);

    END IF;

    DELETE FROM users WHERE id = uid;

    deleted_count := deleted_count + 1;
    RAISE NOTICE '✓ 已删除用户: %', uid;

  END LOOP;

  RAISE NOTICE '完成，共删除 % 个用户', deleted_count;

END $$;

COMMIT;
