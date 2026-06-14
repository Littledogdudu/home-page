import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import galleryStyles from "./styles/gallery/index.scss"
import lightboxScript from "./gallery/lightbox.inline.ts"

interface GalleryImage {
  path: string
  name: string
}

interface GalleryCategory {
  folder: string
  images: GalleryImage[]
}

interface GalleryFileData {
  categories?: GalleryCategory[]
}

export default (() => {
  const Gallery: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const data = fileData as unknown as GalleryFileData
    const categories = data.categories ?? []
    const totalImages = categories.reduce((sum, c) => sum + c.images.length, 0)

    if (totalImages === 0) {
      return (
        <div class="gallery-container">
          <img src="/static/image/page/no-image.png" alt="" width="100%" height="100%" />
        </div>
      )
    }

    return (
      <div class="gallery-container">
        {categories.map((cat) => (
          <section id={`gallery-cat-${cat.folder}`} class="gallery-category" key={cat.folder}>
            <h2 class="gallery-category-title">{cat.folder}</h2>
            <div class="gallery-grid">
              {cat.images.map((img) => (
                <div class="gallery-card" key={img.path}>
                  <a class="gallery-card-link" role="button" tabindex={0}>
                    <img class="gallery-card-image" src={img.path} alt={img.name} loading="lazy" />
                    <div class="gallery-card-overlay">
                      <p class="gallery-card-name">{img.name}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  Gallery.css = galleryStyles
  Gallery.afterDOMLoaded = lightboxScript

  return Gallery
}) satisfies QuartzComponentConstructor
