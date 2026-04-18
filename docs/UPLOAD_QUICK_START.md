# 快速配置：上传到服务器

## 步骤 1：配置本地开发环境

编辑 `apps/api/.env`：

```bash
# 开发环境 - 上传到远程服务器
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://madaicode.cn/api/admin/upload/image
REMOTE_UPLOAD_TOKEN=your-secure-token
UPLOAD_BASE_URL=https://madaicode.cn
```

## 步骤 2：重启本地 API

```bash
# 停止当前 API
# Ctrl+C 或者找到进程并 kill

# 重新构建并启动
cd apps/api
npm run build
npm run dev
```

## 步骤 3：测试上传

1. 访问管理后台：`http://localhost:5173`
2. 进入食谱管理 → 新建食谱
3. 上传图片
4. 查看图片是否正常显示

## 步骤 4：验证图片地址

上传成功后，图片 URL 应该是：
```
https://madaicode.cn/uploads/images/1234567890-abc.jpg
```

---

## 生产环境配置

### 服务器端 `.env` 配置

```bash
# 生产环境 - 本地存储
UPLOAD_MODE=local
UPLOAD_BASE_URL=https://madaicode.cn
```

### Nginx 配置

确保 Nginx 已配置静态文件服务（参考 `nginx.conf.example`）：

```nginx
location /uploads/ {
    alias /var/www/baby-food/apps/api/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin *;
}
```

---

## 常见问题

### Q1: 本地开发时，如何上传到服务器？

**A:** 设置 `UPLOAD_MODE=remote`，本地 API 会将图片转发到远程服务器。

### Q2: 生产环境应该用哪种模式？

**A:** 
- **单服务器**：使用 `local` 模式，通过 Nginx 提供静态文件
- **多服务器/CDN**：使用 `remote` 模式，上传到专门的文件服务器

### Q3: 如何保护远程上传接口？

**A:** 设置 `REMOTE_UPLOAD_TOKEN`，远程服务器验证 `Authorization` 头。

---

## 配置示例

### 示例 1：本地开发 → 生产服务器

```bash
# apps/api/.env (本地)
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://madaicode.cn/api/admin/upload/image
REMOTE_UPLOAD_TOKEN=dev-token-123
UPLOAD_BASE_URL=https://madaicode.cn
```

### 示例 2：生产环境 → 本地存储

```bash
# apps/api/.env (服务器)
UPLOAD_MODE=local
UPLOAD_BASE_URL=https://madaicode.cn
```

### 示例 3：生产环境 → CDN

```bash
# apps/api/.env (服务器)
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://cdn-upload.madaicode.cn/api/upload
REMOTE_UPLOAD_TOKEN=prod-token-xyz
UPLOAD_BASE_URL=https://cdn.madaicode.cn
```

---

## 下一步

详细配置说明请参考：[docs/UPLOAD_CONFIG.md](./UPLOAD_CONFIG.md)
