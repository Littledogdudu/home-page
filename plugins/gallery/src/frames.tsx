import type { PageFrame, PageFrameProps } from "@quartz-community/types"
import type { ComponentChildren } from "preact"
import Navbar from "../../home/src/components/Navbar"
import frameCss from "./components/styles/index.scss"

/**
 * Full-width gallery frame — no sidebars. Navbar and Footer are shared
 * from the home plugin so gallery pages match the rest of the site.
 */
export const GalleryFrame: PageFrame = {
  name: "gallery",
  css: frameCss,
  render({ componentData, pageBody: Content }: PageFrameProps) {
    return (
      <>
        {Navbar()(componentData) as ComponentChildren}
        <div class="center gallery-frame">{Content(componentData) as ComponentChildren}</div>
      </>
    )
  },
}
