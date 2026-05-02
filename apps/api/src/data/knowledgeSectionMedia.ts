type KnowledgeSectionLayoutType = 'stack' | 'grid' | 'carousel'
type KnowledgeSectionImageStyle = 'rounded' | 'square'
type KnowledgeSectionImageAspectRatio = 'wide' | 'square' | 'portrait'

type KnowledgeSectionLayout = {
  type: KnowledgeSectionLayoutType
  columns?: 1 | 2 | 3
}

type KnowledgeSectionImageItem = {
  url: string
  style?: KnowledgeSectionImageStyle
  aspectRatio?: KnowledgeSectionImageAspectRatio
}

type KnowledgeSectionMedia = {
  images: string[]
  imageItems?: KnowledgeSectionImageItem[]
  layout?: KnowledgeSectionLayout
}

function normalizeLayout(value: unknown): KnowledgeSectionLayout | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const layout = value as Record<string, unknown>
  const type = layout.type
  if (type !== 'stack' && type !== 'grid' && type !== 'carousel') {
    return undefined
  }

  const columns = typeof layout.columns === 'number' && [1, 2, 3].includes(layout.columns)
    ? (layout.columns as 1 | 2 | 3)
    : undefined

  return { type, columns }
}

function normalizeImageItems(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined
  }

  const items = value.reduce<KnowledgeSectionImageItem[]>((accumulator, item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return accumulator
    }

    const record = item as Record<string, unknown>
    const url = typeof record.url === 'string' ? record.url.trim() : ''
    if (!url) {
      return accumulator
    }

    const style = record.style === 'rounded' || record.style === 'square'
      ? record.style
      : undefined
    const aspectRatio = record.aspectRatio === 'wide' || record.aspectRatio === 'square' || record.aspectRatio === 'portrait'
      ? record.aspectRatio
      : undefined

    accumulator.push({ url, style, aspectRatio })
    return accumulator
  }, [])

  return items.length > 0 ? items : undefined
}

export function parseKnowledgeSectionMedia(imagesJson: string | null | undefined): KnowledgeSectionMedia {
  if (!imagesJson) {
    return { images: [] }
  }

  try {
    const parsed = JSON.parse(imagesJson) as unknown

    if (Array.isArray(parsed)) {
      const images = parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      return { images }
    }

    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>
      const imageItems = normalizeImageItems(record.items ?? record.imageItems)
      const legacyImages = Array.isArray(record.images)
        ? record.images.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : []
      const images = imageItems?.map((item) => item.url) ?? legacyImages
      return {
        images,
        imageItems,
        layout: normalizeLayout(record.layout)
      }
    }
  } catch {
    return { images: [] }
  }

  return { images: [] }
}

export function stringifyKnowledgeSectionMedia(section: {
  images?: string[]
  imageItems?: Array<{ url: string; style?: string; aspectRatio?: string }>
  layout?: { type?: string; columns?: number }
}) {
  const imageItems = normalizeImageItems(section.imageItems)
  const layout = normalizeLayout(section.layout)
  const images = imageItems?.map((item) => item.url)
    ?? (Array.isArray(section.images) ? section.images.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [])

  if (!imageItems && !layout) {
    return JSON.stringify(images)
  }

  return JSON.stringify({
    layout: layout ?? { type: 'stack' },
    items: imageItems ?? images.map((url) => ({ url }))
  })
}
