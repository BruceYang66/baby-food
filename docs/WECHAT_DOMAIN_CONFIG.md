# 小程序域名配置说明

## 微信小程序后台配置

登录微信小程序后台：https://mp.weixin.qq.com

进入 **开发 > 开发管理 > 开发设置 > 服务器域名**

### 1. request 合法域名
用于 API 请求（wx.request）

```
https://madaicode.cn
```

### 2. uploadFile 合法域名
用于图片上传（wx.uploadFile）

```
https://madaicode.cn
```

### 3. downloadFile 合法域名
用于图片下载和预览（wx.downloadFile）

```
https://madaicode.cn
```

---

## 注意事项

1. **域名必须使用 HTTPS**
   - 小程序要求所有网络请求必须使用 HTTPS
   - 确保 SSL 证书有效且未过期

2. **域名备案**
   - 域名必须完成 ICP 备案
   - 备案主体需与小程序主体一致

3. **配置生效时间**
   - 域名配置后立即生效
   - 每月最多修改 5 次

4. **开发调试**
   - 开发阶段可在微信开发者工具中勾选"不校验合法域名"
   - 生产环境必须配置正确的域名

---

## 验证配置

### 1. 测试 API 连接

在小程序中测试：

```javascript
wx.request({
  url: 'https://madaicode.cn/api/health',
  success(res) {
    console.log('API 连接成功', res.data)
  },
  fail(err) {
    console.error('API 连接失败', err)
  }
})
```

### 2. 测试图片访问

```javascript
wx.downloadFile({
  url: 'https://madaicode.cn/uploads/images/test.jpg',
  success(res) {
    console.log('图片下载成功', res.tempFilePath)
  },
  fail(err) {
    console.error('图片下载失败', err)
  }
})
```

---

## 常见问题

### Q1: 提示"不在以下 request 合法域名列表中"

**解决方案：**
1. 检查域名是否正确配置
2. 确认使用的是 HTTPS 协议
3. 等待配置生效（通常立即生效）

### Q2: 图片无法显示

**解决方案：**
1. 检查 downloadFile 合法域名是否配置
2. 确认图片 URL 格式正确（完整的 HTTPS URL）
3. 检查 Nginx 配置中的 CORS 设置

### Q3: 开发环境正常，生产环境报错

**解决方案：**
1. 取消勾选"不校验合法域名"
2. 使用真实域名测试
3. 检查生产环境的 SSL 证书

---

## 相关文档

- [微信小程序服务器域名配置](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
- [SSL 证书申请指南](https://letsencrypt.org/)
