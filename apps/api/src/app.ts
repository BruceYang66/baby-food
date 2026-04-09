import express from 'express'
import { env } from './config/env.js'
import { wechatConfig } from './config/wechat.js'

const app = express()
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'baby-food-api', env: env.nodeEnv })
})

app.post('/api/app/auth/wechat-login', (_req, res) => {
  res.json({
    ok: true,
    message: '微信登录接口骨架已建立，实际换取 session 需调用微信服务端接口。',
    appId: wechatConfig.appId,
    secretStoredOnServer: Boolean(wechatConfig.secret)
  })
})

app.get('/api/app/home', (_req, res) => {
  res.json({ ok: true, data: { summary: 'home mock' } })
})

app.post('/api/app/meal-plans/generate-today', (_req, res) => {
  res.json({ ok: true, data: { summary: 'generate today mock' } })
})

app.get('/api/app/meal-plans/history', (_req, res) => {
  res.json({ ok: true, data: [] })
})

app.get('/api/app/recipes/:id', (req, res) => {
  res.json({ ok: true, data: { id: req.params.id } })
})

app.get('/api/app/guides/stages/:stageKey', (req, res) => {
  res.json({ ok: true, data: { key: req.params.stageKey } })
})

app.get('/api/app/taboo/query', (req, res) => {
  res.json({ ok: true, data: { symptom: req.query.symptom || '腹泻' } })
})

app.get('/api/app/profile', (_req, res) => {
  res.json({ ok: true, data: { profile: 'mock' } })
})

app.post('/api/admin/auth/login', (_req, res) => {
  res.json({ ok: true, data: { token: 'mock-admin-token' } })
})

app.get('/api/admin/dashboard/overview', (_req, res) => {
  res.json({ ok: true, data: { metrics: [] } })
})

app.get('/api/admin/recipes', (_req, res) => {
  res.json({ ok: true, data: [] })
})

app.post('/api/admin/recipes', (_req, res) => {
  res.json({ ok: true, message: 'create recipe mock' })
})

app.put('/api/admin/recipes/:id', (req, res) => {
  res.json({ ok: true, message: `update recipe ${req.params.id} mock` })
})

app.post('/api/admin/recipes/:id/submit-review', (req, res) => {
  res.json({ ok: true, message: `submit review ${req.params.id} mock` })
})

app.post('/api/admin/recipes/:id/publish', (req, res) => {
  res.json({ ok: true, message: `publish ${req.params.id} mock` })
})

app.post('/api/admin/recipes/:id/offline', (req, res) => {
  res.json({ ok: true, message: `offline ${req.params.id} mock` })
})

app.post('/api/admin/recipes/:id/restore', (req, res) => {
  res.json({ ok: true, message: `restore ${req.params.id} mock` })
})

app.post('/api/admin/imports/recipes', (_req, res) => {
  res.json({ ok: true, message: 'import recipes mock' })
})

app.get('/api/admin/reviews/pending', (_req, res) => {
  res.json({ ok: true, data: [] })
})

app.post('/api/admin/reviews/:recipeId/approve', (req, res) => {
  res.json({ ok: true, message: `approve ${req.params.recipeId} mock` })
})

app.post('/api/admin/reviews/:recipeId/reject', (req, res) => {
  res.json({ ok: true, message: `reject ${req.params.recipeId} mock` })
})

app.get('/api/admin/users', (_req, res) => {
  res.json({ ok: true, data: [] })
})

app.get('/api/admin/settings/system', (_req, res) => {
  res.json({ ok: true, data: {} })
})

app.put('/api/admin/settings/system', (_req, res) => {
  res.json({ ok: true, message: 'system settings updated mock' })
})

export default app
