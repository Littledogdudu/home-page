import Icon from "./icon";
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";

const SCI_FI_IMAGE = "/static/image/background/Tairitsu.jpg";
const FEATURED_IMAGE = "/static/image/background/Tairitsu_banner.png";

export default (() => {
  const Hero: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
    const now = new Date();
    const welcomeText =
      now.getHours() < 5
        ? "夜深了，人静了，该出来活动了😋"
        : now.getHours() < 11
          ? "早上好呀(つω`*)～☆💤"
          : now.getHours() < 14
            ? "中午好🌞"
            : now.getHours() < 18
              ? "下午好🌤️"
              : "晚上好吖🌙";
    const APP_VERSION = process.env.npm_package_version;

    return (
      <main class="neon-hero">
        <div className="neon-hero-bg grid-bg">
          <div className="neon-hero-gradient" />
          <img class="neon-hero-image" alt="" src={SCI_FI_IMAGE} />
        </div>

        <div class="neon-hero-content-container">
          <div class="neon-hero-content">
            <div class="neon-headline">
              <p class="neon-headline-tag">{`> ${welcomeText}`}</p>
              <div class="neon-headline-accent-left">
                <div class="neon-accent-line">
                  <div class="neon-accent-dot-left" />
                </div>
              </div>
              <h1 class="neon-headline-title">
                Welcome to the
                <br /> <span class="neon-headline-gradient neon-glow">SkySource's Space!</span>
              </h1>
              <div class="neon-headline-accent-right">
                <div class="neon-accent-line">
                  <div class="neon-accent-dot-right" />
                </div>
              </div>
            </div>

            <div class="neon-content-module">
              <div class="neon-featured glass-panel">
                <div class="neon-featured-gradient" />
                <img class="neon-featured-img" alt="Featured Article" src={FEATURED_IMAGE} />
                <div class="neon-featured-overlay">
                  <div class="neon-featured-overlay-content">
                    <span class="neon-featured-badge">ARCAEA</span>
                    <h2 class="neon-featured-title">对立小姐真可爱😋</h2>
                    <p class="neon-featured-desc">
                      原来这只是过去的我太傻X了没能把握住她的情感映射吗😭，有谁能理解一起走了2个小时说了5句话的痛吗😅
                    </p>
                  </div>
                </div>
              </div>

              <div class="neon-action-grid">
                <a
                  href="https://console-log-webstorm.netlify.app/console-log/"
                  class="neon-action-btn tech-btn"
                >
                  <div class="neon-intellij-background"></div>
                  <div class="neon-action-left">
                    <Icon icon="vscode-icons:file-type-jetbrains" class="neon-action-icon" />
                    <div class="neon-action-text">
                      <p class="neon-action-label">Intellij Plugin</p>
                      <p class="neon-action-title">Console Log</p>
                    </div>
                  </div>
                  <Icon icon="material-symbols:add" class="btn-icon" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="neon-hud">
          <p class="neon-hud-text">APP_VERSION {APP_VERSION}</p>
          <div class="neon-hud-line" />
        </div>
      </main>
    );
  };

  return Hero;
}) satisfies QuartzComponentConstructor;
