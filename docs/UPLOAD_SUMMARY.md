# 图片上传功能 - 完成总结

## ✅ 已完成的工作

### 1. 核心功能实现

#### 支持两种上传模式
- **本地存储模式** (`UPLOAD_MODE=local`)
  - 图片保存在 `apps/api/uploads/images/` 目录
  - 通过 Nginx 提供静态文件服务
  - 适用于单服务器部署

- **远程服务器模式** (`UPLOAD_MODE=remote`)
  - 图片转发到远程服务器
  - 支持认证令牌保护
  - 适用于分布式部署或 CDN

#### 自动化处理
- ✅ 自动创建上传目录
- ✅ 文件类型验证（仅支持图片）
- ✅ 文件大小限制（5MB）
- ✅ 兼容相对路径和完整URL
- ✅ 完整的错误处理

---

### 2. 代码修改

#### 新增文件
- `apps/api/src/utils/upload.ts` - 远程上传工具函数
- `apps/api/uploads/images/.gitkeep` - 保持目录结构
- `apps/api/uploads/.gitignore` - 忽略上传文件

#### 修改文件
- `apps/api/src/config/env.ts` - 添加上传配置
- `apps/api/src/app.ts` - 实现双模式上传逻辑
- `apps/api/.env.example` - 添加上传配置示例
- `apps/admin-web/src/components/common/ImageUploader.vue` - 修复重复声明
- `apps/admin-web/src/components/recipes/RecipeEditorForm.vue` - 使用 normalizeImageUrl
- `apps/admin-web/src/components/recipes/RecipeTable.vue` - 使用 normalizeImageUrl
- `apps/admin-web/src/components/knowledge/KnowledgeTable.vue` - 使用 normalizeImageUrl

---

### 3. 文档完善

#### 新增文档
- `README_UPLOAD.md` - 图片上传功能总览
- `docs/UPLOAD_CONFIG.md` - 完整配置说明（6000+ 字）
- `docs/UPLOAD_QUICK_START.md` - 快速配置指南
- `docs/WECHAT_DOMAIN_CONFIG.md` - 小程序域名配置

#### 更新文档
- `DEPLOYMENT.md` - 添加上传配置说明
- `nginx.conf.example` - 完整的 Nginx 配置

---

## 🚀 使用方法

### 开发环境 - 上传到本地

```bash
# apps/api/.env
UPLOAD_MODE=local
UPLOAD_BASE_URL=http://localhost:3000
```

### 开发环境 - 上传到服务器

```bash
# apps/api/.env
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://madaicode.cn/api/admin/upload/image
REMOTE_UPLOAD_TOKEN=your-secure-token
UPLOAD_BASE_URL=https://madaicode.cn
```

### 生产环境 - 单服务器

```bash
# apps/api/.env
UPLOAD_MODE=local
UPLOAD_BASE_URL=https://madaicode.cn
```

### 生产环境 - 分布式/CDN

```bash
# apps/api/.env
UPLOAD_MODE=remote
REMOTE_UPLOAD_URL=https://file-server.madaicode.cn/api/upload
REMOTE_UPLOAD_TOKEN=prod-secure-token
UPLOAD_BASE_URL=https://cdn.madaicode.cn
```

---

## 📋 配置清单

### 环境变量

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `UPLOAD_MODE` | 是 | 上传模式 | `local` 或 `remote` |
| `UPLOAD_BASE_URL` | 否 | 图片访问基础URL | `https://madaicode.cn` |
| `REMOTE_UPLOAD_URL` | remote时必填 | 远程上传接口 | `https://server.com/api/upload` |
| `REMOTE_UPLOAD_TOKEN` | 否 | 远程上传令牌 | `abc123xyz` |

### Nginx 配置（本地模式）

```nginx
location /uploads/ {
    alias /var/www/baby-food/apps/api/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin *;
}
```

### 小程序域名配置

在微信小程序后台配置：
- **request 合法域名**: `https://madaicode.cn`
- **uploadFile 合法域名**: `https://madaicode.cn`
- **downloadFile 合法域名**: `https://madaicode.cn`

---

## 🎯 测试步骤

1. **配置环境变量**
   ```bash
   cd apps/api
   cp .env.example .env
   # 编辑 .env，设置 UPLOAD_MODE 等
   ```

2. **启动服务**
   ```bash
   # 启动 API
   cd apps/api
   npm run build
   npm run dev

   # 启动管理后台
   cd apps/admin-web
   npm run dev
   ```

3. **测试上传**
   - 访问 `http://localhost:5173`
   - 进入食谱管理 → 新建食谱
   - 上传封面图片
   - 查看图片是否正常显示

4. **验证图片URL**
   - 本地模式：`http://localhost:3000/uploads/images/xxx.jpg`
   - 远程模式：`https://madaicode.cn/uploads/images/xxx.jpg`

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [README_UPLOAD.md](../README_UPLOAD.md) | 功能总览和快速开始 |
| [docs/UPLOAD_CONFIG.md](./UPLOAD_CONFIG.md) | 完整配置说明 |
| [docs/UPLOAD_QUICK_START.md](./UPLOAD_QUICK_START.md) | 快速配置指南 |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | 部署文档 |
| [nginx.conf.example](../nginx.conf.example) | Nginx 配置示例 |
| [docs/WECHAT_DOMAIN_CONFIG.md](./WECHAT_DOMAIN_CONFIG.md) | 小程序域名配置 |

---

## 🔧 技术实现

### 前端（ImageUploader.vue）

```typescript
// 上传文件
const response = await fetch(`${API_BASE_URL}/api/admin/upload/image`, {
  method: 'POST',
  body: formData
})

// 返回相对路径或完整URL
emit('update:modelValue', result.data.url)
```

### 后端（app.ts）

```typescript
// 根据模式选择存储方式
const storage = env.uploadMode === 'remote'
  ? multer.memoryStorage()  // 远程：内存存储
  : multer.diskStorage({    // 本地：磁盘存储
      destination: uploadDir,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.random()
        cb(null, uniqueSuffix + path.extname(file.originalname))
      }
    })

// 上传处理
if (env.uploadMode === 'remote') {
  // 转发到远程服务器
  const response = await fetch(env.remoteUploadUrl, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${env.remoteUploadToken}` }
  })
  imageUrl = response.data.url
} else {
  // 本地存储
  imageUrl = `/uploads/images/${req.file.filename}`
}
```

### 图片URL处理（api.ts）

```typescript
export function normalizeImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url  // 完整URL，直接返回
  }
  return `${UPLOAD_BASE_URL}${url}`  // 相对路径，拼接域名
}
```

---

## ⚠️ 注意事项

1. **生产环境必须使用 HTTPS**
2. **定期备份 uploads 目录**
3. **使用强随机令牌** - `REMOTE_UPLOAD_TOKEN` 应使用长随机字符串
4. **配置 Nginx 静态文件服务**（本地模式）
5. **小程序配置域名白名单**
6. **检查目录权限** - `uploads/images` 需要写入权限

---

## 🆘 常见问题

### Q1: 上传失败 500 错误
**原因**: `uploads/images` 目录不存在或无权限  
**解决**: 
```bash
mkdir -p apps/api/uploads/images
chmod 755 apps/api/uploads/images
```

### Q2: 图片无法显示
**原因**: URL 不正确或 Nginx 未配置  
**解决**: 
- 检查 `UPLOAD_BASE_URL` 配置
- 检查 Nginx 静态文件配置
- 查看浏览器控制台错误

### Q3: 远程上传失败 401
**原因**: 认证令牌不正确  
**解决**: 检查 `REMOTE_UPLOAD_TOKEN` 是否匹配

### Q4: 小程序图片无法加载
**原因**: 域名未配置白名单  
**解决**: 在微信小程序后台配置 `downloadFile` 合法域名

---

## 🎉 总结

图片上传功能已完全实现，支持：
- ✅ 本地存储和远程服务器两种模式
- ✅ 自动目录创建和错误处理
- ✅ 完整的文档和配置示例
- ✅ 兼容开发和生产环境
- ✅ 支持小程序预览

现在可以根据实际需求选择合适的上传模式，并参考文档进行配置！
