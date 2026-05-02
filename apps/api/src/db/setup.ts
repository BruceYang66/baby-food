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

async function initVaccines() {
  await executeSqlFile('vaccine_init.sql')
  console.log('疫苗数据初始化完成。')
}

async function backfillRecipeAgeMonths() {
  await executeSqlFile('backfill_recipe_age_months.sql')
  console.log('recipes 月龄字段回填完成。')
}

async function seedPopularRecipes() {
  await executeSqlFile('seed_popular.sql')
  console.log('热门食谱种子数据写入完成。')
}

async function seedRecipesV2() {
  // Recipe rows: 6-8月(036-065), 9-11月(066-095)
  await executeSqlFile('seed_recipes_v2.sql')
  // Recipe rows: 12-18月(096-125), 19-24月(126-155), 24月+(156-185)
  await executeSqlFile('seed_recipes_v2_part3.sql')
  await executeSqlFile('seed_recipes_v2_part4.sql')
  // Tags
  await executeSqlFile('seed_recipes_v2_tags1.sql')
  await executeSqlFile('seed_recipes_v2_tags2.sql')
  // Ingredients
  await executeSqlFile('seed_recipes_v2_ing1.sql')
  await executeSqlFile('seed_recipes_v2_ing2.sql')
  await executeSqlFile('seed_recipes_v2_ing3.sql')
  // Steps
  await executeSqlFile('seed_recipes_v2_steps1.sql')
  await executeSqlFile('seed_recipes_v2_steps2.sql')
  console.log('食谱扩展数据 v2 写入完成（150条，覆盖5个月龄段）。')
}

async function onlineSafeInitDatabase() {
  await executeSqlFile('online_safe_init.sql')
  console.log('线上安全初始化完成。')
}

async function resetDatabase() {
  await client.query(`
    DROP TABLE IF EXISTS user_knowledge_favorites, knowledge_article_sections, knowledge_articles, vaccine_records, vaccine_schedules, user_feedback, user_favorites, recipe_versions, recipe_reviews, symptom_food_rules, symptom_guides, guide_food_rules, guide_stages, feeding_records, meal_plan_items, custom_recipes, meal_plans, recipe_steps, recipe_ingredients, recipe_tags, import_jobs, system_settings, baby_invites, baby_members, baby_allergens, babies, recipes, users CASCADE;
    DROP TYPE IF EXISTS knowledge_content_type CASCADE;
    DROP TYPE IF EXISTS vaccine_record_status CASCADE;
    DROP TYPE IF EXISTS vaccine_category CASCADE;
    DROP TYPE IF EXISTS content_status CASCADE;
    DROP TYPE IF EXISTS review_status CASCADE;
    DROP TYPE IF EXISTS feeding_record_status CASCADE;
    DROP TYPE IF EXISTS baby_invite_status CASCADE;
    DROP TYPE IF EXISTS baby_member_role CASCADE;
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

  if (command === 'vaccine:init') {
    await initVaccines()
    return
  }

  if (command === 'seed:popular') {
    await seedPopularRecipes()
    return
  }

  if (command === 'seed:recipes-v2') {
    await seedRecipesV2()
    return
  }

  if (command === 'online:init') {
    await onlineSafeInitDatabase()
    return
  }

  if (command === 'backfill:recipe-age-months') {
    await backfillRecipeAgeMonths()
    return
  }

  if (command === 'reset') {
    await resetDatabase()
    return
  }

  throw new Error(`不支持的命令：${command ?? '未提供'}。可用命令：init | seed | seed:extend | seed:recipes-v2 | comment | vaccine:init | seed:popular | online:init | backfill:recipe-age-months | reset`)
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : '数据库初始化失败')
    process.exitCode = 1
  })
  .finally(async () => {
    await client.end()
  })
