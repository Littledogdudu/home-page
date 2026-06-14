import fs from "fs"
import path from "path"
import type { QuartzPageTypePlugin, FullSlug } from "@quartz-community/types"
import GalleryBody from "./components/Gallery"

interface GalleryImage {
  path: string
  name: string
}

interface GalleryCategory {
  folder: string
  images: GalleryImage[]
}

function collectDirImages(dir: string, folderPath: string): GalleryImage[] {
  const images: GalleryImage[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      images.push(...collectDirImages(path.join(dir, entry.name), `${folderPath}/${entry.name}`))
    } else if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(entry.name)) {
      images.push({
        path: `/images/${folderPath}/${entry.name}`,
        name: entry.name.replace(/\.[^.]+$/, ""),
      })
    }
  }
  return images
}

/** Parse the `order` property from an index.md YAML frontmatter. Returns null if not found. */
function parseFrontmatterOrder(indexPath: string): number | null {
  try {
    const content = fs.readFileSync(indexPath, "utf-8")
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!fmMatch || !fmMatch[1]) return null
    const orderMatch = fmMatch[1].match(/^order:\s*(\d+)$/m)
    if (!orderMatch) return null
    return Number(orderMatch[1])
  } catch {
    return null
  }
}

/**
 * Parse image filenames (with extension) from an index.md body.
 * Returns filenames in order of first appearance, deduplicated.
 * Only extracts filenames matching image extensions.
 */
function parseImageOrder(indexPath: string): string[] {
  try {
    const content = fs.readFileSync(indexPath, "utf-8")
    // Strip frontmatter
    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
    const re = /[\w-]+\.(?:jpg|jpeg|png|gif|webp|avif)/gi
    const seen = new Set<string>()
    const result: string[] = []
    for (const match of body.matchAll(re)) {
      const name = match[0]
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase())
        result.push(name)
      }
    }
    return result
  } catch {
    return []
  }
}

export const GalleryPage: QuartzPageTypePlugin = () => ({
  name: "GalleryPage",
  priority: 15,
  match: ({ slug }) => slug === "gallery",
  frame: "gallery",
  layout: "gallery",
  generate({ ctx }) {
    const imagesDir = path.join(ctx.argv.directory, "images")
    const categories: GalleryCategory[] = []

    if (fs.existsSync(imagesDir)) {
      const rootImages: GalleryImage[] = []

      for (const entry of fs.readdirSync(imagesDir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          const imgs = collectDirImages(path.join(imagesDir, entry.name), entry.name)
          if (imgs.length > 0) {
            categories.push({ folder: entry.name, images: imgs })
          }
        } else if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(entry.name)) {
          rootImages.push({
            path: `/images/${entry.name}`,
            name: entry.name.replace(/\.[^.]+$/, ""),
          })
        }
      }

      // Root category always first
      if (rootImages.length > 0) {
        categories.unshift({ folder: "默认", images: rootImages })
      }

      // --- Sort categories by order from index.md ---
      // Tiers: 1=has order, 2=has index.md no order, 3=no index.md
      const orderMap = new Map<string, number | null>()
      const hasIndexSet = new Set<string>()
      for (const cat of categories) {
        if (cat.folder === "默认") continue
        const indexPath = path.join(imagesDir, cat.folder, "index.md")
        if (fs.existsSync(indexPath)) {
          hasIndexSet.add(cat.folder)
          orderMap.set(cat.folder, parseFrontmatterOrder(indexPath))
        }
      }

      // Root stays first. Others: ordered first (asc), index.md no-order next, no index.md last.
      const rootCat = categories[0]?.folder === "默认" ? categories[0] : null
      const rest = rootCat ? categories.slice(1) : categories

      rest.sort((a, b) => {
        const orderA = orderMap.get(a.folder)
        const orderB = orderMap.get(b.folder)
        const hasOrderA = orderA != null
        const hasOrderB = orderB != null
        const hasIndexA = hasIndexSet.has(a.folder)
        const hasIndexB = hasIndexSet.has(b.folder)

        // Tier 1: both have order → sort by order value
        if (hasOrderA && hasOrderB) return orderA! - orderB!
        if (hasOrderA) return -1
        if (hasOrderB) return 1

        // Tier 2: both have index.md (no order) → sort by folder name
        if (hasIndexA && hasIndexB) return a.folder.localeCompare(b.folder)
        if (hasIndexA) return -1
        if (hasIndexB) return 1

        // Tier 3: neither has index.md → sort by folder name
        return a.folder.localeCompare(b.folder)
      })

      if (rootCat) {
        categories.length = 0
        categories.push(rootCat, ...rest)
      }

      // --- Sort images within each category by index.md ---
      for (const cat of categories) {
        if (cat.folder === "默认") {
          // Root category: sort by name only (no index.md for root)
          cat.images.sort((a, b) => {
            const nameA = path.basename(a.path)
            const nameB = path.basename(b.path)
            return nameA.localeCompare(nameB)
          })
          continue
        }

        const indexPath = path.join(imagesDir, cat.folder, "index.md")
        if (!fs.existsSync(indexPath)) {
          // No index.md: sort by filename
          cat.images.sort((a, b) => {
            const nameA = path.basename(a.path)
            const nameB = path.basename(b.path)
            return nameA.localeCompare(nameB)
          })
          continue
        }

        const orderedNames = parseImageOrder(indexPath)
        const rankMap = new Map<string, number>()
        for (let i = 0; i < orderedNames.length; ++i) {
          if (orderedNames[i]) {
            rankMap.set(orderedNames[i]!.toLowerCase(), i)
          }
        }

        cat.images.sort((a, b) => {
          const fileNameA = path.basename(a.path)
          const fileNameB = path.basename(b.path)
          const rankA = rankMap.get(fileNameA.toLowerCase())
          const rankB = rankMap.get(fileNameB.toLowerCase())

          // Both in index.md → preserve listed order
          if (rankA !== undefined && rankB !== undefined) return rankA - rankB
          // One in index.md → it comes first
          if (rankA !== undefined) return -1
          if (rankB !== undefined) return 1
          // Neither in index.md → alphabetical by filename
          return fileNameA.localeCompare(fileNameB)
        })
      }
    }

    return [{ slug: "gallery" as FullSlug, title: "图册", data: { categories } }]
  },
  body: GalleryBody,
})
