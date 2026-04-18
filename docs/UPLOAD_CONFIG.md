# 图片上传配置说明

本项目支持两种图片上传模式：**本地存储** 和 **远程服务器**。

---

## 配置方式

在 `apps/api/.env` 文件中配置：

### 模式 1：本地存储（默认）

适用于开发环境或单服务器部署。

```bash
# 上传模式
UPLOAD_MODE=local

# 上传文件基础URL（可选，留空则使用相对路径）
UPLOAD_BASE_URL=
```

**工作原理：**
- 图片保存到 `apps/api/uploads/images/` 目录
- 返回相对路径：`/uploads/images/xxx.jpg`
- 通过 Nginx 或 Express 静态文件服务访问

---

### 模式 2：远程服务器

适用于分布式部署或使用专门的文件服务器。

```bash
# 上传模式
UPLOAD_MODE=remote

# 远程上传地址（必填）
REMOTE_UPLOAD_URL=https://madaicode.cn/api/admin/upload/image

# 远程上传认证令牌（可选）
REMOTE_UPLOAD_TOKEN=your-secure-token-here

# 上传文件基础URL（可选）
UPLOAD_BASE_URL=https://madaicode.cn
```

**工作原理：**
- 本地 API 接收图片后，转发到远程服务器
- 远程服务器返回图片 URL
- 本地 API 将 URL 返回给前端

---

## 使用场景

### 场景 1：开发环境

```bash
UPLOAD_MODE=local
UPLOAD_BASE_URL=http://localhost:3000
```

图片保存在本地，通过 `http://localhost:3000/uploads/images/xxx.jpg` 访问。

---

### 场景 2：生产环境 - 单服务器

```bash
UPLOAD_MODE=local
UPLOAD_BASE_URL=https://madaicode.cn
```

图片保存在服务器本地，通过 Nginx 提供静态文件服务。

**Nginx 配置：**
```nginx
location /uploads/ {
    alias /var/www/baby-food/apps/api/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

---

### 场景 3：生产环境 - 分布式部署

```bash
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://file-server.madaicode.cn/api/upload
REMOTE_UPLOAD_TOKEN=abc123xyz456
UPLOAD_BASE_URL=https://cdn.madaicode.cn
```

**架构：**
```
用户 → 管理后台 → 本地API → 文件服务器 → CDN
```

**优点：**
- 文件集中管理
- 支持 CDN 加速
- 负载均衡

---

## 远程服务器接口规范

如果使用 `UPLOAD_MODE=remote`，远程服务器需要提供以下接口：

### 请求

```http
POST /api/admin/upload/image
Content-Type: multipart/form-data
Authorization: Bearer {REMOTE_UPLOAD_TOKEN}

image: <binary file>
```

### 响应

**成功：**
```json
{
  "ok": true,
  "data": {
    "url": "/uploads/images/1234567890-abc.jpg"
  }
}
```

**失败：**
```json
{
  "ok": false,
  "message": "上传失败原因"
}
```

---

## 切换上传模式

### 从本地切换到远程

1. 修改 `.env` 配置：
   ```bash
   UPLOAD_MODE=remote
   REMOTE_UPLOAD_URL=https://your-server.com/api/upload
   REMOTE_UPLOAD_TOKEN=your-token
   ```

2. 重启 API 服务：
   ```bash
   pm2 restart baby-food-api
   ```

3. 测试上传功能

### 从远程切换到本地

1. 修改 `.env` 配置：
   ```bash
   UPLOAD_MODE=local
   ```

2. 确保 `uploads/images` 目录存在：
   ```bash
   mkdir -p apps/api/uploads/images
   ```

3. 重启 API 服务

---

## 数据迁移

### 迁移已上传的图片

如果从本地模式切换到远程模式，需要迁移已有图片：

```bash
# 1. 打包本地图片
cd apps/api/uploads
tar -czf images.tar.gz images/

# 2. 上传到远程服务器
scp images.tar.gz user@remote-server:/path/to/uploads/

# 3. 在远程服务器解压
ssh user@remote-server
cd /path/to/uploads
tar -xzf images.tar.gz

# 4. 更新数据库中的图片路径（如果需要）
# 运行数据库迁移脚本
```

---

## 故障排查

### 问题 1：上传失败 - "未配置远程上传地址"

**原因：** `UPLOAD_MODE=remote` 但未设置 `REMOTE_UPLOAD_URL`

**解决：** 在 `.env` 中添加 `REMOTE_UPLOAD_URL`

---

### 问题 2：远程上传失败 - 401 Unauthorized

**原因：** 远程服务器需要认证，但未设置或令牌错误

**解决：** 检查 `REMOTE_UPLOAD_TOKEN` 是否正确

---

### 问题 3：图片无法显示

**原因：** 图片 URL 不正确

**解决：**
1. 检查 `UPLOAD_BASE_URL` 配置
2. 检查 Nginx 静态文件配置
3. 查看浏览器控制台错误信息

---

## 安全建议

1. **使用 HTTPS** - 生产环境必须使用 HTTPS
2. **限制文件大小** - 当前限制 5MB，可在代码中调整
3. **验证文件类型** - 只允许图片格式（jpg, png, gif, webp）
4. **使用强令牌** - `REMOTE_UPLOAD_TOKEN` 应使用长随机字符串
5. **定期备份** - 定期备份 uploads 目录

---

## 性能优化

### 使用 CDN

1. 将图片同步到 CDN
2. 修改 `UPLOAD_BASE_URL` 为 CDN 域名
3. 配置 CDN 缓存策略

### 图片压缩

可以在上传时自动压缩图片（需要额外开发）：

```typescript
import sharp from 'sharp'

// 压缩图片
const compressedBuffer = await sharp(req.file.buffer)
  .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85 })
  .toBuffer()
```

---

## 相关文件

- 配置文件：`apps/api/.env`
- 环境变量定义：`apps/api/src/config/env.ts`
- 上传接口：`apps/api/src/app.ts` (搜索 `/api/admin/upload/image`)
- 前端上传组件：`apps/admin-web/src/components/common/ImageUploader.vue`
