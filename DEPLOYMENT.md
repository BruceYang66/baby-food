# 部署文档 - 婴儿辅食生成器

本文档说明如何将项目部署到生产环境（https://madaicode.cn）。

## 目录结构

```
/var/www/baby-food/
├── apps/
│   ├── api/                    # API 服务
│   │   ├── uploads/            # 上传文件目录（需要持久化）
│   │   ├── .env                # 生产环境变量
│   │   └── ...
│   ├── admin-web/              # 管理后台
│   │   └── dist/               # 构建产物
│   └── miniapp/                # 小程序（本地构建后上传）
└── ...
```

---

## 1. 服务器环境准备

### 1.1 安装依赖

```bash
# Node.js (推荐 v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Nginx
sudo apt-get install -y nginx

# PM2（进程管理）
sudo npm install -g pm2
```

### 1.2 创建数据库

```bash
sudo -u postgres psql

CREATE DATABASE baby_food;
CREATE USER baby_food_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE baby_food TO baby_food_user;
\q
```

---

## 2. 项目部署

### 2.1 克隆代码

```bash
cd /var/www
git clone <your-repo-url> baby-food
cd baby-food
```

### 2.2 安装依赖

```bash
npm install
```

### 2.3 配置环境变量

#### API 环境变量 (`apps/api/.env`)

```bash
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://baby_food_user:your_secure_password@localhost:5432/baby_food
JWT_SECRET=<生成一个长随机字符串>
WECHAT_APP_ID=<你的小程序AppID>
WECHAT_SECRET=<你的小程序AppSecret>
UPLOAD_BASE_URL=https://madaicode.cn

# 上传配置（选择一种模式）
# 模式1：本地存储（推荐单服务器部署）
UPLOAD_MODE=local

# 模式2：远程服务器（推荐分布式部署）
# UPLOAD_MODE=remote
# REMOTE_UPLOAD_URL=https://file-server.madaicode.cn/api/upload
# REMOTE_UPLOAD_TOKEN=your-secure-token
```

生成 JWT_SECRET：
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**上传配置说明：**
- 详细配置请参考 [docs/UPLOAD_CONFIG.md](docs/UPLOAD_CONFIG.md)
- 快速开始请参考 [docs/UPLOAD_QUICK_START.md](docs/UPLOAD_QUICK_START.md)

#### 管理后台环境变量 (`apps/admin-web/.env.production`)

```bash
VITE_API_BASE_URL=https://madaicode.cn/api
VITE_UPLOAD_BASE_URL=https://madaicode.cn
```

### 2.4 初始化数据库

```bash
cd apps/api
npm run db:init
npm run db:seed
npm run prisma:generate
cd ../..
```

### 2.5 构建项目

```bash
# 构建管理后台
npm run build:admin

# 构建 API
npm run build:api
```

### 2.6 创建上传目录

```bash
mkdir -p apps/api/uploads/images
chmod 755 apps/api/uploads
chmod 755 apps/api/uploads/images
```

---

## 3. Nginx 配置

### 3.1 复制配置文件

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/baby-food
```

### 3.2 修改配置文件

编辑 `/etc/nginx/sites-available/baby-food`，替换以下路径：

- SSL 证书路径：`/etc/nginx/ssl/madaicode.cn.crt` 和 `.key`
- uploads 目录：`/var/www/baby-food/apps/api/uploads/`
- 管理后台目录：`/var/www/baby-food/apps/admin-web/dist`

### 3.3 启用站点

```bash
sudo ln -s /etc/nginx/sites-available/baby-food /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. SSL 证书配置

### 4.1 使用 Let's Encrypt（推荐）

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d madaicode.cn -d www.madaicode.cn
```

### 4.2 手动配置证书

如果已有证书，将证书文件放到：
```
/etc/nginx/ssl/madaicode.cn.crt
/etc/nginx/ssl/madaicode.cn.key
```

---

## 5. 启动 API 服务

### 5.1 使用 PM2 启动

```bash
cd /var/www/baby-food/apps/api
pm2 start dist/app.js --name baby-food-api
pm2 save
pm2 startup
```

### 5.2 查看日志

```bash
pm2 logs baby-food-api
pm2 status
```

---

## 6. 小程序配置

### 6.1 配置服务器域名

在微信小程序后台（https://mp.weixin.qq.com）配置：

**request 合法域名：**
- `https://madaicode.cn`

**uploadFile 合法域名：**
- `https://madaicode.cn`

**downloadFile 合法域名：**
- `https://madaicode.cn`

### 6.2 构建并上传小程序

```bash
# 本地构建
npm run build:miniapp

# 使用微信开发者工具打开 dist/mp-weixin 目录
# 点击"上传"按钮上传代码
```

---

## 7. 验证部署

### 7.1 检查 API 健康状态

```bash
curl https://madaicode.cn/api/health
```

预期返回：
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "..."
  }
}
```

### 7.2 检查静态文件服务

上传一张测试图片后，访问：
```
https://madaicode.cn/uploads/images/test.jpg
```

### 7.3 检查管理后台

访问：
```
https://madaicode.cn
```

---

## 8. 日常维护

### 8.1 更新代码

```bash
cd /var/www/baby-food
git pull
npm install
npm run build:admin
npm run build:api
pm2 restart baby-food-api
```

### 8.2 备份数据库

```bash
pg_dump -U baby_food_user baby_food > backup_$(date +%Y%m%d).sql
```

### 8.3 查看日志

```bash
# API 日志
pm2 logs baby-food-api

# Nginx 日志
sudo tail -f /var/log/nginx/baby-food-access.log
sudo tail -f /var/log/nginx/baby-food-error.log
```

### 8.4 监控磁盘空间

```bash
# 检查 uploads 目录大小
du -sh /var/www/baby-food/apps/api/uploads

# 清理旧日志
pm2 flush
```

---

## 9. 故障排查

### 9.1 API 无法启动

```bash
# 检查端口占用
sudo lsof -i :3000

# 检查数据库连接
psql -U baby_food_user -d baby_food -h localhost

# 查看详细错误
pm2 logs baby-food-api --lines 100
```

### 9.2 图片无法访问

```bash
# 检查目录权限
ls -la /var/www/baby-food/apps/api/uploads/images

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/baby-food-error.log
```

### 9.3 小程序无法连接

1. 检查域名是否在小程序后台配置
2. 检查 SSL 证书是否有效
3. 检查 API 是否正常运行
4. 查看小程序控制台错误信息

---

## 10. 安全建议

1. **定期更新依赖**
   ```bash
   npm audit
   npm update
   ```

2. **配置防火墙**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **限制数据库访问**
   - 仅允许本地连接
   - 使用强密码

4. **定期备份**
   - 数据库每日备份
   - uploads 目录定期备份

5. **监控服务状态**
   ```bash
   pm2 install pm2-logrotate
   ```

---

## 11. 性能优化

### 11.1 启用 HTTP/2

已在 Nginx 配置中启用（`listen 443 ssl http2`）

### 11.2 配置 CDN（可选）

将 `/uploads/` 目录同步到 CDN，修改 `UPLOAD_BASE_URL` 为 CDN 域名。

### 11.3 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_recipes_content_status ON recipes(content_status);
CREATE INDEX idx_recipes_review_status ON recipes(review_status);
CREATE INDEX idx_recipes_updated_at ON recipes(updated_at);
```

---

## 联系方式

如有问题，请联系技术支持。
