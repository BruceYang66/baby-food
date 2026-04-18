# 图片上传功能说明

## ✅ 已完成功能

本项目的图片上传功能已完全实现，支持两种上传模式：

### 1. 本地存储模式（默认）
- 图片保存在 `apps/api/uploads/images/` 目录
- 适用于单服务器部署
- 通过 Nginx 提供静态文件服务

### 2. 远程服务器模式
- 图片转发到远程服务器
- 适用于分布式部署或使用 CDN
- 支持认证令牌保护

---

## 🚀 快速开始

### 开发环境（上传到本地）

```bash
# apps/api/.env
UPLOAD_MODE=local
UPLOAD_BASE_URL=http://localhost:3000
```

### 开发环境（上传到服务器）

```bash
# apps/api/.env
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://madaicode.cn/api/admin/upload/image
REMOTE_UPLOAD_TOKEN=your-token
UPLOAD_BASE_URL=https://madaicode.cn
```

### 生产环境

```bash
# apps/api/.env
UPLOAD_MODE=local
UPLOAD_BASE_URL=https://madaicode.cn
```

---

## 📚 详细文档

- **快速配置指南**: [docs/UPLOAD_QUICK_START.md](docs/UPLOAD_QUICK_START.md)
- **完整配置说明**: [docs/UPLOAD_CONFIG.md](docs/UPLOAD_CONFIG.md)
- **部署文档**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🔧 配置说明

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| `UPLOAD_MODE` | 上传模式：`local` 或 `remote` | `local` |
| `UPLOAD_BASE_URL` | 图片访问基础URL | `https://madaicode.cn` |
| `REMOTE_UPLOAD_URL` | 远程上传接口地址 | `https://server.com/api/upload` |
| `REMOTE_UPLOAD_TOKEN` | 远程上传认证令牌 | `abc123xyz` |

---

## ✨ 功能特性

- ✅ 支持本地和远程两种上传模式
- ✅ 自动创建上传目录
- ✅ 文件类型验证（仅支持图片）
- ✅ 文件大小限制（5MB）
- ✅ 兼容相对路径和完整URL
- ✅ 支持认证令牌保护
- ✅ 完整的错误处理

---

## 🎯 使用场景

### 场景 1：本地开发测试
```bash
UPLOAD_MODE=local
```
图片保存在本地，快速测试。

### 场景 2：开发环境连接生产服务器
```bash
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://madaicode.cn/api/admin/upload/image
```
本地开发时，图片直接上传到生产服务器。

### 场景 3：生产环境单服务器
```bash
UPLOAD_MODE=local
```
图片保存在服务器本地，通过 Nginx 提供服务。

### 场景 4：生产环境分布式部署
```bash
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://file-server.com/api/upload
```
图片上传到专门的文件服务器或 CDN。

---

## 🔍 测试上传功能

1. 启动 API 服务：
   ```bash
   cd apps/api
   npm run dev
   ```

2. 启动管理后台：
   ```bash
   cd apps/admin-web
   npm run dev
   ```

3. 访问 `http://localhost:5173`

4. 进入食谱管理 → 新建食谱 → 上传封面图

5. 查看图片是否正常显示

---

## 📝 相关文件

- 上传接口：`apps/api/src/app.ts` (搜索 `/api/admin/upload/image`)
- 环境配置：`apps/api/src/config/env.ts`
- 前端组件：`apps/admin-web/src/components/common/ImageUploader.vue`
- 图片处理：`apps/admin-web/src/services/api.ts` (`normalizeImageUrl`)

---

## ⚠️ 注意事项

1. **生产环境必须使用 HTTPS**
2. **定期备份 uploads 目录**
3. **使用强随机令牌保护远程上传接口**
4. **配置 Nginx 静态文件服务**（本地模式）
5. **小程序需要配置域名白名单**

---

## 🆘 故障排查

### 上传失败 500 错误
- 检查 `uploads/images` 目录是否存在
- 检查目录权限是否正确
- 查看 API 日志获取详细错误

### 图片无法显示
- 检查 `UPLOAD_BASE_URL` 配置
- 检查 Nginx 静态文件配置
- 使用浏览器开发者工具查看图片 URL

### 远程上传失败
- 检查 `REMOTE_UPLOAD_URL` 是否正确
- 检查 `REMOTE_UPLOAD_TOKEN` 是否匹配
- 确认远程服务器接口正常工作

---

## 📞 获取帮助

如有问题，请查看：
1. [快速配置指南](docs/UPLOAD_QUICK_START.md)
2. [完整配置说明](docs/UPLOAD_CONFIG.md)
3. [部署文档](DEPLOYMENT.md)
