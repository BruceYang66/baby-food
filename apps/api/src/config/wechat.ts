import { env } from './env.js'

export const wechatConfig = {
  appId: env.wechatAppId,
  secret: env.wechatSecret,
  note: '仅允许后端读取微信密钥，前端禁止存储 secret。'
}
