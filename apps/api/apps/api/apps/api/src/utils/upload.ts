import fetch from 'node-fetch'
import FormData from 'form-data'
import { env } from '../config/env.js'

/**
 * 上传文件到远程服务器
 */
export async function uploadToRemote(file: Express.Multer.File): Promise<string> {
  if (!env.remoteUploadUrl) {
    throw new Error('未配置远程上传地址 REMOTE_UPLOAD_URL')
  }

  const formData = new FormData()
  formData.append('image', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype
  })

  const headers: Record<string, string> = {}
  if (env.remoteUploadToken) {
    headers['Authorization'] = `Bearer ${env.remoteUploadToken}`
  }

  const response = await fetch(env.remoteUploadUrl, {
    method: 'POST',
    body: formData,
    headers
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`远程上传失败: ${response.status} ${errorText}`)
  }

  const result = await response.json() as { ok: boolean; data?: { url: string }; message?: string }

  if (!result.ok || !result.data?.url) {
    throw new Error(result.message || '远程上传失败')
  }

  return result.data.url
}
