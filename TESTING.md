# 功能测试验证清单

## 1. 辅食生成逻辑优化 ✅

### 测试步骤：
1. 启动 API 服务：`npm run dev:api`
2. 启动小程序：`npm run dev:miniapp`
3. 登录后进入"生成今日辅食"页面

### 验证点：
- [ ] 年龄段默认选择：根据宝宝月龄自动选择对应年龄段（6-8月、9-11月、12-18月、19-24月、2岁+）
- [ ] 月龄段筛选：选择不同年龄段后，生成的食谱符合该年龄段
- [ ] 排除食材：勾选排除标签（如"鱼虾"、"蛋类"），生成的食谱不包含这些食材
- [ ] 避免重复：
  - 选择"近一周"，生成的食谱不包含近7天内的食谱
  - 选择"近一个月"，生成的食谱不包含近30天内的食谱
  - 选择"不限制"，可能包含历史食谱
- [ ] 重新生成：每次点击"重新生成"，返回不同的食谱组合

### API 测试：
```bash
# 测试生成接口
curl -X POST http://localhost:3000/api/app/meal-plans/generate-today \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mealCount": "3餐",
    "goals": ["补钙", "补铁"],
    "ageRange": "6-8月",
    "excludeTags": ["鱼虾", "蛋类"],
    "avoidRepeat": "近一周"
  }'
```

---

## 2. 首页分享功能 ✅

### 测试步骤：
1. 登录后进入首页
2. 查看右上角是否有分享按钮（📤）

### 验证点：
- [ ] 分享按钮显示正常
- [ ] 点击分享按钮，提示"点击右上角 ··· 分享"
- [ ] 点击右上角 ··· 菜单，可以看到"转发"和"分享到朋友圈"选项
- [ ] 转发给好友时，显示标题："{宝宝昵称}的育儿助手"
- [ ] 分享到朋友圈时，显示标题："养娃小管家 - 科学喂养，健康成长"

---

## 3. 微信登录获取用户信息 ✅

### 测试步骤：
1. 清除小程序缓存
2. 重新进入小程序
3. 点击"微信一键登录"

### 验证点：
- [ ] 弹出授权弹窗，请求获取用户信息
- [ ] 授权后，用户昵称和头像正确显示在首页
- [ ] 数据库 `users` 表中，`nickname` 和 `avatar_url` 字段已更新
- [ ] 数据库 `user_login_logs` 表中，新增一条登录记录，包含：
  - `user_id`：用户ID
  - `nickname`：用户昵称
  - `avatar_url`：用户头像
  - `login_at`：登录时间
  - `ip_address`：IP地址（可选）
  - `user_agent`：用户代理（可选）

### 数据库验证：
```sql
-- 查看用户表
SELECT id, nickname, avatar_url, wechat_open_id, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- 查看登录日志
SELECT id, user_id, nickname, login_at, ip_address FROM user_login_logs ORDER BY login_at DESC LIMIT 10;
```

---

## 4. 数据库迁移

### 执行步骤：
```bash
# 进入 API 目录
cd apps/api

# 方式1：运行迁移脚本
psql -U your_user -d baby_food -f db/migrations/add_user_login_logs.sql

# 方式2：重新初始化数据库（会清空数据）
npm run db:reset

# 生成 Prisma 客户端
npm run prisma:generate
```

---

## 5. 整体流程测试

### 完整用户流程：
1. [ ] 新用户打开小程序
2. [ ] 点击"微信一键登录"，授权获取用户信息
3. [ ] 登录成功，进入首页，显示用户昵称和头像
4. [ ] 点击右上角分享按钮，可以分享给好友
5. [ ] 创建宝宝档案（如果还没有）
6. [ ] 进入"生成今日辅食"页面
7. [ ] 验证年龄段已自动选择
8. [ ] 选择特殊需求（如"补钙"、"补铁"）
9. [ ] 选择排除食材（如"鱼虾"）
10. [ ] 选择避免重复（如"近一周"）
11. [ ] 点击"一键生成"，查看生成的食谱
12. [ ] 点击"重新生成"，验证食谱有变化
13. [ ] 保存计划
14. [ ] 返回首页，查看快捷操作中的"继续上次计划"

---

## 常见问题

### Q1: Prisma 生成失败（EPERM 错误）
**解决方案：**
1. 关闭所有正在运行的 Node 进程
2. 关闭 VS Code 或其他编辑器
3. 重新运行 `npm run prisma:generate`
4. 如果仍然失败，重启电脑后再试

### Q2: 数据库表不存在
**解决方案：**
```bash
cd apps/api
npm run db:init
npm run db:seed
```

### Q3: 微信登录失败
**检查项：**
1. `.env` 文件中的 `WECHAT_APP_ID` 和 `WECHAT_SECRET` 是否正确
2. 小程序是否已在微信公众平台配置
3. 服务器域名是否已添加到小程序白名单

---

## 性能优化建议

1. **数据库索引**：已为 `user_login_logs` 表添加 `(user_id, login_at)` 复合索引
2. **缓存策略**：考虑对食谱查询结果进行缓存
3. **分页加载**：登录日志较多时，建议实现分页查询

---

## 下一步优化方向

1. 增加用户行为分析（基于登录日志）
2. 实现食谱推荐算法优化
3. 增加用户偏好学习功能
4. 优化图片加载性能
5. 增加离线缓存功能
