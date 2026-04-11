import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'
import { env, hasDatabaseUrl } from '../config/env.js'

const client = new Client({
  connectionString: env.databaseUrl
})
const command = process.argv[2]
const currentFilePath = fileURLToPath(import.meta.url)
const dbDir = path.resolve(path.dirname(currentFilePath), '../../db')

function assertDatabaseUrl() {
  if (!hasDatabaseUrl()) {
    throw new Error('DATABASE_URL 未配置，请先参考 apps/api/.env.example 设置 PostgreSQL 连接串。')
  }
}

async function executeSqlFile(fileName: string) {
  const filePath = path.join(dbDir, fileName)
  const sql = await readFile(filePath, 'utf8')

  if (!sql.trim()) {
    return
  }

  await client.query(sql)
}

async function initDatabase() {
  await executeSqlFile('init.sql')
  console.log('数据库表结构初始化完成。')
}

async function seedDatabase() {
  await executeSqlFile('seed.sql')
  console.log('数据库种子数据写入完成。')
}

async function commentDatabase() {
  await executeSqlFile('comments.sql')
  console.log('表结构注释写入完成。')
}

async function seedExtendDatabase() {
  await executeSqlFile('seed_extend.sql')
  console.log('扩展种子数据写入完成。')
}

async function resetDatabase() {
  await client.query(`
    DROP TABLE IF EXISTS user_feedback, user_favorites, recipe_versions, recipe_reviews, symptom_food_rules, symptom_guides, guide_food_rules, guide_stages, meal_plan_items, custom_recipes, meal_plans, recipe_steps, recipe_ingredients, recipe_tags, import_jobs, system_settings, baby_allergens, babies, recipes, users CASCADE;
    DROP TYPE IF EXISTS content_status CASCADE;
    DROP TYPE IF EXISTS review_status CASCADE;
  `)

  console.log('旧表与枚举已清空。')
  await initDatabase()
  await seedDatabase()
  await seedExtendDatabase()
  await commentDatabase()
}

async function main() {
  assertDatabaseUrl()
  await client.connect()

  if (command === 'init') {
    await initDatabase()
    return
  }

  if (command === 'seed') {
    await seedDatabase()
    return
  }

  if (command === 'seed:extend') {
    await seedExtendDatabase()
    return
  }

  if (command === 'comment') {
    await commentDatabase()
    return
  }

  if (command === 'reset') {
    await resetDatabase()
    return
  }

  throw new Error(`不支持的命令：${command ?? '未提供'}。可用命令：init | seed | seed:extend | comment | reset`)
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : '数据库初始化失败')
    process.exitCode = 1
  })
  .finally(async () => {
    await client.end()
  })
