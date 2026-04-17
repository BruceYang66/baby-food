import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始执行知识库数据初始化...');

    const sqlFile = path.join(__dirname, '../db/seed_knowledge_articles.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 更智能的SQL分割：处理多行INSERT语句
    const lines = sql.split('\n');
    const statements = [];
    let currentStatement = '';
    let inInsert = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // 跳过注释和空行
      if (trimmed.startsWith('--') || trimmed.length === 0) {
        continue;
      }

      // 检测INSERT语句开始
      if (trimmed.startsWith('INSERT INTO')) {
        if (currentStatement) {
          statements.push(currentStatement.trim());
        }
        currentStatement = line;
        inInsert = true;
      } else if (inInsert) {
        currentStatement += '\n' + line;
        // 检测语句结束（以分号结尾）
        if (trimmed.endsWith(');')) {
          statements.push(currentStatement.trim());
          currentStatement = '';
          inInsert = false;
        }
      }
    }

    // 添加最后一条语句
    if (currentStatement) {
      statements.push(currentStatement.trim());
    }

    console.log(`共 ${statements.length} 条SQL语句`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        await prisma.$executeRawUnsafe(statement);
        successCount++;

        // 显示进度
        if (statement.includes('knowledge_articles')) {
          console.log(`✓ 插入文章 ${successCount}`);
        } else if (statement.includes('knowledge_article_sections')) {
          console.log(`  ✓ 插入章节`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ 执行第 ${i + 1} 条语句失败:`, error.message);
        console.error(`  语句预览: ${statement.substring(0, 100)}...`);
      }
    }

    console.log('\n执行完成！');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);

    // 查询插入的数据
    const articleCount = await prisma.knowledgeArticle.count();
    const sectionCount = await prisma.knowledgeArticleSection.count();

    console.log(`\n数据库中现有:`);
    console.log(`- 知识文章: ${articleCount} 篇`);
    console.log(`- 文章章节: ${sectionCount} 个`);

    // 显示文章列表
    const articles = await prisma.knowledgeArticle.findMany({
      select: {
        id: true,
        title: true,
        categoryLabel: true,
        isFeatured: true,
      },
      orderBy: { sortOrder: 'asc' }
    });

    console.log('\n文章列表:');
    articles.forEach((article, index) => {
      const featured = article.isFeatured ? '⭐' : '  ';
      console.log(`${featured} ${index + 1}. [${article.categoryLabel}] ${article.title}`);
    });

  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
