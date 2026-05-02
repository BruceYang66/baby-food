import { prisma } from '../db/prisma.js'
import { createKnowledgeArticle, createRecipe, updateKnowledgeArticle, updateRecipe } from './admin.js'
import { parseKnowledgeSectionMedia } from './knowledgeSectionMedia.js'

type ImportEntityType = 'recipes' | 'knowledge'
type ImportFileFormat = 'json' | 'csv'
type ImportRowStatus = 'valid' | 'warning' | 'error'
type ImportValidationIssue = {
  field: string
  severity: 'warning' | 'error'
  message: string
}

type ImportPreviewRow = {
  rowNumber: number
  title: string
  status: ImportRowStatus
  issues: ImportValidationIssue[]
}

type ImportPreviewResponse = {
  entity: ImportEntityType
  format: ImportFileFormat
  fileName: string
  summary: {
    total: number
    valid: number
    warnings: number
    errors: number
  }
  rows: ImportPreviewRow[]
}

type ImportCommitResponse = {
  jobId: string
  total: number
  success: number
  failed: number
}

type RecipeImportRecord = {
  id?: string
  title: string
  summary?: string
  coverImage?: string
  ageLabel?: string
  ageMinMonths?: number
  ageMaxMonths?: number | null
  durationLabel: string
  difficultyLabel: string
  contentStatus?: 'draft' | 'pending_review' | 'published' | 'offline' | 'trash'
  tags: string[]
  ingredients: Array<{ name: string; amount: string; unit?: string }>
  steps: Array<{ stepNo: number; title: string; description: string; imageUrl?: string }>
}

type KnowledgeImportRecord = {
  id?: string
  title: string
  subtitle: string
  summary: string
  coverImage?: string
  categoryKey: string
  categoryLabel: string
  tags: string[]
  contentType: 'article' | 'guide' | 'taboo'
  content: string
  isFeatured?: boolean
  contentStatus?: 'draft' | 'pending_review' | 'published' | 'offline' | 'trash'
  sections: Array<{
    title?: string
    content: string
    images: string[]
    imageItems?: Array<{ url: string; style?: 'rounded' | 'square'; aspectRatio?: 'wide' | 'square' | 'portrait' }>
    layout?: { type: 'stack' | 'grid' | 'carousel'; columns?: 1 | 2 | 3 }
    sortOrder: number
  }>
}

type RecipePreparedRow = {
  row: ImportPreviewRow
  record?: RecipeImportRecord
}

type KnowledgePreparedRow = {
  row: ImportPreviewRow
  record?: KnowledgeImportRecord
}

const CONTENT_STATUS_VALUES = new Set(['draft', 'pending_review', 'published', 'offline', 'trash'])
const KNOWLEDGE_TYPE_VALUES = new Set(['article', 'guide', 'taboo'])

function ensureObjectArray(value: unknown, fallbackMessage: string) {
  if (!Array.isArray(value)) {
    throw new Error(fallbackMessage)
  }
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
}

function parseImportContent(format: ImportFileFormat, content: string) {
  if (!content.trim()) {
    throw new Error('导入内容不能为空')
  }

  if (format === 'json') {
    const parsed = JSON.parse(content) as unknown
    return ensureObjectArray(parsed, 'JSON 导入内容必须是对象数组')
  }

  return parseCsv(content)
}

function parseCsv(content: string) {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let insideQuotes = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const nextChar = content[index + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"'
        index += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentField)
      currentField = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }
      currentRow.push(currentField)
      currentField = ''
      if (currentRow.some((cell) => cell.trim() !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
      continue
    }

    currentField += char
  }

  currentRow.push(currentField)
  if (currentRow.some((cell) => cell.trim() !== '')) {
    rows.push(currentRow)
  }

  if (rows.length === 0) {
    return []
  }

  const [headerRow, ...dataRows] = rows
  const headers = headerRow.map((item) => item.trim())

  return dataRows.map((row) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = (row[index] ?? '').trim()
    })
    return record
  })
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeOptionalString(value: unknown) {
  const normalized = normalizeString(value)
  return normalized || undefined
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

function normalizeNullableNumber(value: unknown) {
  if (value === null || value === '' || value === undefined) {
    return null
  }
  return normalizeNumber(value)
}

function normalizeBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'y', '是'].includes(normalized)) {
      return true
    }
    if (['false', '0', 'no', 'n', '否'].includes(normalized)) {
      return false
    }
  }
  return undefined
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean)
  }

  if (typeof value !== 'string') {
    return []
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed) as unknown
    return Array.isArray(parsed) ? parsed.map((item) => normalizeString(item)).filter(Boolean) : []
  }

  return trimmed.split('|').map((item) => item.trim()).filter(Boolean)
}

function normalizeJsonArray<T>(value: unknown, fallback: T[] = []) {
  if (Array.isArray(value)) {
    return value as T[]
  }
  if (typeof value !== 'string' || !value.trim()) {
    return fallback
  }
  const parsed = JSON.parse(value) as unknown
  return Array.isArray(parsed) ? (parsed as T[]) : fallback
}

function normalizeSectionLayout(value: unknown): { type: 'stack' | 'grid' | 'carousel'; columns?: 1 | 2 | 3 } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const record = value as Record<string, unknown>
  const type = record.type
  if (type !== 'stack' && type !== 'grid' && type !== 'carousel') {
    return undefined
  }

  const columns = typeof record.columns === 'number' && [1, 2, 3].includes(record.columns)
    ? (record.columns as 1 | 2 | 3)
    : undefined

  return { type, columns }
}

function normalizeSectionImageItems(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined
  }

  const items = value.reduce<Array<{ url: string; style?: 'rounded' | 'square'; aspectRatio?: 'wide' | 'square' | 'portrait' }>>((accumulator, item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return accumulator
    }

    const record = item as Record<string, unknown>
    const url = normalizeString(record.url)
    if (!url) {
      return accumulator
    }

    const style = record.style === 'rounded' || record.style === 'square' ? record.style : undefined
    const aspectRatio = record.aspectRatio === 'wide' || record.aspectRatio === 'square' || record.aspectRatio === 'portrait'
      ? record.aspectRatio
      : undefined

    accumulator.push({ url, style, aspectRatio })
    return accumulator
  }, [])

  return items.length > 0 ? items : undefined
}

function buildRowStatus(issues: ImportValidationIssue[]): ImportRowStatus {
  if (issues.some((issue) => issue.severity === 'error')) {
    return 'error'
  }
  if (issues.length > 0) {
    return 'warning'
  }
  return 'valid'
}

function buildSummary(rows: ImportPreviewRow[]) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1
      if (row.status === 'error') {
        summary.errors += 1
      } else if (row.status === 'warning') {
        summary.warnings += 1
      } else {
        summary.valid += 1
      }
      return summary
    },
    { total: 0, valid: 0, warnings: 0, errors: 0 }
  )
}

function createPreviewResponse(
  entity: ImportEntityType,
  format: ImportFileFormat,
  fileName: string,
  rows: ImportPreviewRow[]
): ImportPreviewResponse {
  return {
    entity,
    format,
    fileName,
    summary: buildSummary(rows),
    rows
  }
}

function validateRecipeRecord(raw: Record<string, unknown>, rowNumber: number): RecipePreparedRow {
  const issues: ImportValidationIssue[] = []
  const title = normalizeString(raw.title)
  const summary = normalizeOptionalString(raw.summary)
  const coverImage = normalizeOptionalString(raw.coverImage)
  const ageLabel = normalizeOptionalString(raw.ageLabel)
  const ageMinMonths = normalizeNumber(raw.ageMinMonths)
  const ageMaxMonths = normalizeNullableNumber(raw.ageMaxMonths)
  const durationLabel = normalizeString(raw.durationLabel)
  const difficultyLabel = normalizeString(raw.difficultyLabel)
  const contentStatus = normalizeOptionalString(raw.contentStatus) as RecipeImportRecord['contentStatus']
  const tags = normalizeStringArray(raw.tags)
  const ingredients = normalizeJsonArray<{ name?: unknown; amount?: unknown; unit?: unknown }>(raw.ingredients)
  const steps = normalizeJsonArray<{ stepNo?: unknown; title?: unknown; description?: unknown; imageUrl?: unknown }>(raw.steps)

  if (!title) {
    issues.push({ field: 'title', severity: 'error', message: '标题不能为空' })
  }
  if (!durationLabel) {
    issues.push({ field: 'durationLabel', severity: 'error', message: '时长不能为空' })
  }
  if (!difficultyLabel) {
    issues.push({ field: 'difficultyLabel', severity: 'error', message: '难度不能为空' })
  }
  if (ageMinMonths === undefined && !ageLabel) {
    issues.push({ field: 'ageLabel', severity: 'error', message: '请提供 ageLabel 或 ageMinMonths' })
  }
  if (!coverImage) {
    issues.push({ field: 'coverImage', severity: 'warning', message: '缺少封面图' })
  }
  if (contentStatus && !CONTENT_STATUS_VALUES.has(contentStatus)) {
    issues.push({ field: 'contentStatus', severity: 'error', message: '内容状态不合法' })
  }
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    issues.push({ field: 'ingredients', severity: 'error', message: '至少需要 1 条食材' })
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    issues.push({ field: 'steps', severity: 'error', message: '至少需要 1 条步骤' })
  }

  const normalizedIngredients = ingredients
    .map((ingredient) => ({
      name: normalizeString(ingredient.name),
      amount: normalizeString(ingredient.amount),
      unit: normalizeOptionalString(ingredient.unit)
    }))
    .filter((ingredient) => ingredient.name || ingredient.amount || ingredient.unit)

  normalizedIngredients.forEach((ingredient, index) => {
    if (!ingredient.name) {
      issues.push({ field: `ingredients[${index}].name`, severity: 'error', message: '食材名称不能为空' })
    }
    if (!ingredient.amount) {
      issues.push({ field: `ingredients[${index}].amount`, severity: 'error', message: '食材数量不能为空' })
    }
  })

  const normalizedSteps = steps
    .map((step, index) => ({
      stepNo: normalizeNumber(step.stepNo) ?? index + 1,
      title: normalizeOptionalString(step.title) ?? `步骤${index + 1}`,
      description: normalizeString(step.description),
      imageUrl: normalizeOptionalString(step.imageUrl)
    }))
    .filter((step) => step.title || step.description || step.imageUrl)

  normalizedSteps.forEach((step, index) => {
    if (!step.description) {
      issues.push({ field: `steps[${index}].description`, severity: 'error', message: '步骤描述不能为空' })
    }
  })

  const row: ImportPreviewRow = {
    rowNumber,
    title: title || `第 ${rowNumber} 行`,
    status: buildRowStatus(issues),
    issues
  }

  if (row.status === 'error') {
    return { row }
  }

  return {
    row,
    record: {
      id: normalizeOptionalString(raw.id),
      title,
      summary,
      coverImage,
      ageLabel,
      ageMinMonths,
      ageMaxMonths,
      durationLabel,
      difficultyLabel,
      contentStatus,
      tags,
      ingredients: normalizedIngredients,
      steps: normalizedSteps
    }
  }
}

function validateKnowledgeRecord(raw: Record<string, unknown>, rowNumber: number): KnowledgePreparedRow {
  const issues: ImportValidationIssue[] = []
  const title = normalizeString(raw.title)
  const subtitle = normalizeString(raw.subtitle)
  const summary = normalizeString(raw.summary)
  const coverImage = normalizeOptionalString(raw.coverImage)
  const categoryKey = normalizeString(raw.categoryKey)
  const categoryLabel = normalizeString(raw.categoryLabel)
  const tags = normalizeStringArray(raw.tags)
  const contentType = normalizeString(raw.contentType) as KnowledgeImportRecord['contentType']
  const content = normalizeString(raw.content)
  const isFeatured = normalizeBoolean(raw.isFeatured)
  const contentStatus = normalizeOptionalString(raw.contentStatus) as KnowledgeImportRecord['contentStatus']
  const sections = normalizeJsonArray<{
    title?: unknown
    content?: unknown
    images?: unknown
    imageItems?: unknown
    layout?: unknown
    sortOrder?: unknown
  }>(raw.sections)

  if (!title) {
    issues.push({ field: 'title', severity: 'error', message: '标题不能为空' })
  }
  if (!subtitle) {
    issues.push({ field: 'subtitle', severity: 'error', message: '副标题不能为空' })
  }
  if (!summary) {
    issues.push({ field: 'summary', severity: 'error', message: '摘要不能为空' })
  }
  if (!categoryKey) {
    issues.push({ field: 'categoryKey', severity: 'error', message: '分类 key 不能为空' })
  }
  if (!categoryLabel) {
    issues.push({ field: 'categoryLabel', severity: 'error', message: '分类名称不能为空' })
  }
  if (!contentType || !KNOWLEDGE_TYPE_VALUES.has(contentType)) {
    issues.push({ field: 'contentType', severity: 'error', message: '内容类型不合法' })
  }
  if (!content && sections.length === 0) {
    issues.push({ field: 'content', severity: 'error', message: '正文和分段内容不能同时为空' })
  }
  if (!coverImage) {
    issues.push({ field: 'coverImage', severity: 'warning', message: '缺少封面图' })
  }
  if (contentStatus && !CONTENT_STATUS_VALUES.has(contentStatus)) {
    issues.push({ field: 'contentStatus', severity: 'error', message: '内容状态不合法' })
  }

  const normalizedSections = sections
    .map((section, index) => {
      const imageItems = normalizeSectionImageItems(section.imageItems)
      const images = imageItems?.map((item) => item.url) ?? normalizeStringArray(section.images)
      return {
        title: normalizeOptionalString(section.title),
        content: normalizeString(section.content),
        images,
        imageItems,
        layout: normalizeSectionLayout(section.layout),
        sortOrder: normalizeNumber(section.sortOrder) ?? index
      }
    })
    .filter((section) => section.title || section.content || section.images.length > 0)

  normalizedSections.forEach((section, index) => {
    if (!section.content) {
      issues.push({ field: `sections[${index}].content`, severity: 'error', message: '段落内容不能为空' })
    }
  })

  const row: ImportPreviewRow = {
    rowNumber,
    title: title || `第 ${rowNumber} 行`,
    status: buildRowStatus(issues),
    issues
  }

  if (row.status === 'error') {
    return { row }
  }

  return {
    row,
    record: {
      id: normalizeOptionalString(raw.id),
      title,
      subtitle,
      summary,
      coverImage,
      categoryKey,
      categoryLabel,
      tags,
      contentType,
      content,
      isFeatured,
      contentStatus,
      sections: normalizedSections
    }
  }
}

async function enrichRecipeRows(rows: RecipePreparedRow[]) {
  const duplicateTitleSet = new Set<string>()
  const titleCount = new Map<string, number>()
  rows.forEach((item) => {
    const title = item.record?.title
    if (!title) {
      return
    }
    titleCount.set(title, (titleCount.get(title) ?? 0) + 1)
  })
  titleCount.forEach((count, title) => {
    if (count > 1) {
      duplicateTitleSet.add(title)
    }
  })

  const ids = rows.map((item) => item.record?.id).filter((item): item is string => Boolean(item))
  const titles = rows.map((item) => item.record?.title).filter((item): item is string => Boolean(item))
  const [existingById, existingByTitle] = await Promise.all([
    ids.length ? prisma.recipe.findMany({ where: { id: { in: ids } }, select: { id: true } }) : Promise.resolve([]),
    titles.length ? prisma.recipe.findMany({ where: { title: { in: titles } }, select: { id: true, title: true } }) : Promise.resolve([])
  ])

  const existingIdSet = new Set(existingById.map((item) => item.id))
  const existingTitleMap = new Map(existingByTitle.map((item) => [item.title, item.id]))

  rows.forEach((item) => {
    if (!item.record) {
      return
    }
    if (duplicateTitleSet.has(item.record.title)) {
      item.row.issues.push({ field: 'title', severity: 'error', message: '文件内存在重复标题' })
    }
    if (item.record.id && !existingIdSet.has(item.record.id)) {
      item.row.issues.push({ field: 'id', severity: 'error', message: '指定的食谱 id 不存在' })
    }
    if (!item.record.id && existingTitleMap.has(item.record.title)) {
      item.row.issues.push({ field: 'title', severity: 'error', message: '已存在同名食谱，请改用 id 更新' })
    }
    item.row.status = buildRowStatus(item.row.issues)
  })

  return rows
}

async function enrichKnowledgeRows(rows: KnowledgePreparedRow[]) {
  const duplicateTitleSet = new Set<string>()
  const titleCount = new Map<string, number>()
  rows.forEach((item) => {
    const title = item.record?.title
    if (!title) {
      return
    }
    titleCount.set(title, (titleCount.get(title) ?? 0) + 1)
  })
  titleCount.forEach((count, title) => {
    if (count > 1) {
      duplicateTitleSet.add(title)
    }
  })

  const ids = rows.map((item) => item.record?.id).filter((item): item is string => Boolean(item))
  const titles = rows.map((item) => item.record?.title).filter((item): item is string => Boolean(item))
  const [existingById, existingByTitle] = await Promise.all([
    ids.length ? prisma.knowledgeArticle.findMany({ where: { id: { in: ids } }, select: { id: true } }) : Promise.resolve([]),
    titles.length ? prisma.knowledgeArticle.findMany({ where: { title: { in: titles } }, select: { id: true, title: true } }) : Promise.resolve([])
  ])

  const existingIdSet = new Set(existingById.map((item) => item.id))
  const existingTitleMap = new Map(existingByTitle.map((item) => [item.title, item.id]))

  rows.forEach((item) => {
    if (!item.record) {
      return
    }
    if (duplicateTitleSet.has(item.record.title)) {
      item.row.issues.push({ field: 'title', severity: 'error', message: '文件内存在重复标题' })
    }
    if (item.record.id && !existingIdSet.has(item.record.id)) {
      item.row.issues.push({ field: 'id', severity: 'error', message: '指定的干货 id 不存在' })
    }
    if (!item.record.id && existingTitleMap.has(item.record.title)) {
      item.row.issues.push({ field: 'title', severity: 'error', message: '已存在同名干货，请改用 id 更新' })
    }
    item.row.status = buildRowStatus(item.row.issues)
  })

  return rows
}

async function prepareRecipeImport(fileName: string, format: ImportFileFormat, content: string) {
  const parsedRows = parseImportContent(format, content)
  const validatedRows = await enrichRecipeRows(parsedRows.map((row, index) => validateRecipeRecord(row, index + 2)))
  return {
    response: createPreviewResponse('recipes', format, fileName, validatedRows.map((item) => item.row)),
    rows: validatedRows
  }
}

async function prepareKnowledgeImport(fileName: string, format: ImportFileFormat, content: string) {
  const parsedRows = parseImportContent(format, content)
  const validatedRows = await enrichKnowledgeRows(parsedRows.map((row, index) => validateKnowledgeRecord(row, index + 2)))
  return {
    response: createPreviewResponse('knowledge', format, fileName, validatedRows.map((item) => item.row)),
    rows: validatedRows
  }
}

async function createImportJob(fileName: string, total: number, success: number, failed: number) {
  const job = await prisma.importJob.create({
    data: {
      fileName,
      operator: '系统',
      total,
      success,
      failed,
      status: failed > 0 ? 'failed' : 'completed'
    }
  })
  return job.id
}

export async function previewRecipeImport(params: { fileName: string; format: ImportFileFormat; content: string }) {
  return (await prepareRecipeImport(params.fileName, params.format, params.content)).response
}

export async function commitRecipeImport(params: { fileName: string; format: ImportFileFormat; content: string }): Promise<ImportCommitResponse> {
  const prepared = await prepareRecipeImport(params.fileName, params.format, params.content)
  const committableRows = prepared.rows.filter((item) => item.record && item.row.status !== 'error')
  let success = 0
  let failed = prepared.response.summary.errors

  for (const item of committableRows) {
    try {
      if (item.record?.id) {
        await updateRecipe(item.record.id, item.record)
      } else if (item.record) {
        await createRecipe(item.record)
      }
      success += 1
    } catch {
      failed += 1
    }
  }

  const jobId = await createImportJob(params.fileName, prepared.response.summary.total, success, failed)
  return {
    jobId,
    total: prepared.response.summary.total,
    success,
    failed
  }
}

export async function previewKnowledgeImport(params: { fileName: string; format: ImportFileFormat; content: string }) {
  return (await prepareKnowledgeImport(params.fileName, params.format, params.content)).response
}

export async function commitKnowledgeImport(params: { fileName: string; format: ImportFileFormat; content: string }): Promise<ImportCommitResponse> {
  const prepared = await prepareKnowledgeImport(params.fileName, params.format, params.content)
  const committableRows = prepared.rows.filter((item) => item.record && item.row.status !== 'error')
  let success = 0
  let failed = prepared.response.summary.errors

  for (const item of committableRows) {
    try {
      if (item.record?.id) {
        await updateKnowledgeArticle(item.record.id, item.record)
      } else if (item.record) {
        await createKnowledgeArticle(item.record)
      }
      success += 1
    } catch {
      failed += 1
    }
  }

  const jobId = await createImportJob(params.fileName, prepared.response.summary.total, success, failed)
  return {
    jobId,
    total: prepared.response.summary.total,
    success,
    failed
  }
}

function escapeCsvCell(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toCsv(columns: string[], rows: Array<Record<string, string>>) {
  const header = columns.join(',')
  const body = rows.map((row) => columns.map((column) => escapeCsvCell(row[column] ?? '')).join(',')).join('\n')
  return `${header}\n${body}`
}

export async function exportRecipes(format: ImportFileFormat) {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: true,
      steps: { orderBy: { stepNo: 'asc' } },
      tags: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  const records = recipes.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    summary: recipe.summary ?? '',
    coverImage: recipe.coverImage ?? '',
    ageLabel: recipe.ageLabel,
    ageMinMonths: recipe.ageMinMonths,
    ageMaxMonths: recipe.ageMaxMonths,
    durationLabel: recipe.durationLabel,
    difficultyLabel: recipe.difficultyLabel,
    contentStatus: recipe.contentStatus,
    tags: recipe.tags.map((tag) => tag.name),
    ingredients: recipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit ?? ''
    })),
    steps: recipe.steps.map((step) => ({
      stepNo: step.stepNo,
      title: step.title,
      description: step.description,
      imageUrl: step.imageUrl ?? ''
    }))
  }))

  if (format === 'json') {
    return JSON.stringify(records, null, 2)
  }

  return toCsv(
    ['id', 'title', 'summary', 'coverImage', 'ageLabel', 'ageMinMonths', 'ageMaxMonths', 'durationLabel', 'difficultyLabel', 'contentStatus', 'tags', 'ingredients', 'steps'],
    records.map((record) => ({
      id: record.id,
      title: record.title,
      summary: record.summary,
      coverImage: record.coverImage,
      ageLabel: record.ageLabel,
      ageMinMonths: String(record.ageMinMonths),
      ageMaxMonths: record.ageMaxMonths === null ? '' : String(record.ageMaxMonths),
      durationLabel: record.durationLabel,
      difficultyLabel: record.difficultyLabel,
      contentStatus: record.contentStatus,
      tags: record.tags.join('|'),
      ingredients: JSON.stringify(record.ingredients),
      steps: JSON.stringify(record.steps)
    }))
  )
}

export async function exportKnowledgeArticles(format: ImportFileFormat) {
  const articles = await prisma.knowledgeArticle.findMany({
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const records = articles.map((article) => ({
    id: article.id,
    title: article.title,
    subtitle: article.subtitle,
    summary: article.summary,
    coverImage: article.coverImage ?? '',
    categoryKey: article.categoryKey,
    categoryLabel: article.categoryLabel,
    tags: JSON.parse(article.tagsJson) as string[],
    contentType: article.contentType,
    content: article.content,
    isFeatured: article.isFeatured,
    contentStatus: article.contentStatus,
    sections: article.sections.map((section) => {
      const media = parseKnowledgeSectionMedia(section.imagesJson)
      return {
        title: section.title ?? '',
        content: section.content,
        images: media.images,
        imageItems: media.imageItems,
        layout: media.layout,
        sortOrder: section.sortOrder
      }
    })
  }))

  if (format === 'json') {
    return JSON.stringify(records, null, 2)
  }

  return toCsv(
    ['id', 'title', 'subtitle', 'summary', 'coverImage', 'categoryKey', 'categoryLabel', 'tags', 'contentType', 'content', 'isFeatured', 'contentStatus', 'sections'],
    records.map((record) => ({
      id: record.id,
      title: record.title,
      subtitle: record.subtitle,
      summary: record.summary,
      coverImage: record.coverImage,
      categoryKey: record.categoryKey,
      categoryLabel: record.categoryLabel,
      tags: record.tags.join('|'),
      contentType: record.contentType,
      content: record.content,
      isFeatured: record.isFeatured ? 'true' : 'false',
      contentStatus: record.contentStatus,
      sections: JSON.stringify(record.sections)
    }))
  )
}
