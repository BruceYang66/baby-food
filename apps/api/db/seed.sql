INSERT INTO users (id, nickname, avatar_url, wechat_open_id) VALUES
('user-001', '糯米妈妈', 'https://example.com/avatar-1.jpg', 'openid-demo-001');

INSERT INTO babies (id, user_id, nickname, birth_date, stage_label) VALUES
('baby-001', 'user-001', '小糯米', '2025-08-18', '碎末状辅食阶段');

INSERT INTO recipes (id, title, summary, cover_image, age_label, duration_label, difficulty_label, content_status, review_status) VALUES
('recipe-001', '红薯山药小米粥', '适合 8 个月宝宝的温和早餐', 'https://example.com/recipe-1.jpg', '8个月+', '20分钟', '初级', 'published', 'approved'),
('recipe-002', '鳕鱼西兰花软饭', '高蛋白午餐主食', 'https://example.com/recipe-2.jpg', '8-10月', '25分钟', '中级', 'pending_review', 'pending');

INSERT INTO guide_stages (id, key, label, title, description) VALUES
('guide-001', '6-8', '6-8月', '6-8个月：尝试颗粒感', '从细腻泥糊状逐步过渡到带细小颗粒的碎末状。');

INSERT INTO system_settings (id, setting_key, setting_val) VALUES
('setting-001', 'app_name', '沐爸AI育儿'),
('setting-002', 'share_slogan', '科学辅食，悦享成长');
