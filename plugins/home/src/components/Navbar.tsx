import Icon from "./icon";
import YzrtInput from "./yzrt-input";
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";

export default (() => {
  const Navbar: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
    const slug = fileData.slug ?? "";
    const isIndex = slug === "index";
    const isArticle = slug.startsWith("skysource");
    const isGallery = slug.startsWith("gallery");
    return (
      <nav class="neon-navbar">
        <div class="neon-nav-inner">
          <a class="neon-logo" href="/">
            <Icon icon="line-md:bluesky-twotone" />
            <span class="neon-logo-text">{cfg.pageTitle}</span>
          </a>
          <div class="neon-nav-links">
            <a href="/" class={`neon-nav-link${isIndex ? " active" : ""}`}>
              首页
            </a>
            <a href="/skysource" class={`neon-nav-link${isArticle ? " active" : ""}`}>
              文章
            </a>
            <a href="/gallery" class={`neon-nav-link${isGallery ? " active" : ""}`}>
              图册
            </a>
          </div>
          <div class="neon-nav-actions">
            <div class="neon-search">
              <YzrtInput placeholder="您可以在这里搜索内容~" />
            </div>
            <div class="neon-nav-icons">
              <a href="/skysource" class="neon-icon-btn" aria-label="博客">
                <Icon icon="line-md:hazard-lights-loop" />
              </a>
              <button class="neon-icon-btn darkmode" aria-label="切换主题">
                <Icon icon="line-md:moon-to-sunny-outline-transition" class="dayIcon" />
                <Icon icon="line-md:moon" class="nightIcon" />
              </button>
              <a href="https://github.com/Littledogdudu" target="_blank" class="neon-icon-btn">
                <Icon icon="line-md:github" />
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  return Navbar;
}) satisfies QuartzComponentConstructor;
