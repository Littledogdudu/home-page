import Icon from "./icon";
import YzrtInput from "./yzrt-input";
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";

export default (() => {
  const Navbar: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
    return (
      <nav class="neon-navbar">
        <div class="neon-nav-inner">
          <div class="neon-logo">
            <Icon icon="line-md:bluesky-twotone" />
            <span class="neon-logo-text">{cfg.pageTitle}</span>
          </div>
          <div class="neon-nav-links">
            <a href="/skysource" target="_blank" class="neon-nav-link active">
              文章
            </a>
            <a href="#" target="_blank" class="neon-nav-link">
              图册
            </a>
          </div>
          <div class="neon-nav-actions">
            <div class="neon-search">
              <YzrtInput placeholder="您可以在这里搜索内容~" />
            </div>
            <div class="neon-nav-icons">
              <button class="neon-icon-btn darkmode" aria-label="切换主题">
                <Icon icon="line-md:moon-to-sunny-outline-transition" class="dayIcon" />
                <Icon icon="line-md:moon" class="nightIcon" />
              </button>
              <a href="/skysource" target="_blank" class="neon-icon-btn" aria-label="博客">
                <Icon icon="line-md:hazard-lights-loop" />
              </a>
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
