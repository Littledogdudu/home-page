import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";

export default (() => {
  const Footer: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear();

    return (
      <footer class="neon-footer">
        {/* 避免报错 */}
        <div class="center"></div>

        <div class="neon-footer-container">
          <div class="neon-footer-brand">
            <span class="neon-footer-logo">{cfg.pageTitle as string}</span>
            <p class="neon-footer-copy">
              © {year} {cfg.pageTitle}
            </p>
          </div>
          <div class="neon-footer-links">
            <a href="/skysource" class="neon-footer-link">
              我的博客页面
            </a>
          </div>
        </div>
      </footer>
    );
  };

  return Footer;
}) satisfies QuartzComponentConstructor;
