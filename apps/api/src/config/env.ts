import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const currentFilePath = fileURLToPath(import.meta.url)
const envFilePath = path.resolve(path.dirname(currentFilePath), '../../.env')

config({ path: envFilePath })

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  wechatAppId: process.env.WECHAT_APP_ID || '',
  wechatSecret: process.env.WECHAT_SECRET || '',
  uploadBaseUrl: process.env.UPLOAD_BASE_URL || '',
  uploadMode: process.env.UPLOAD_MODE || 'local',
  remoteUploadUrl: process.env.REMOTE_UPLOAD_URL || '',
  remoteUploadToken: process.env.REMOTE_UPLOAD_TOKEN || ''
}

export function hasDatabaseUrl() {
  return Boolean(env.databaseUrl)
}
