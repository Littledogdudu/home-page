import type { PageFrame, PageFrameProps, QuartzPageTypePlugin } from "@quartz-community/types";
import Navbar from "./components/Navbar.tsx";
import Hero from "./components/Hero.tsx";
import Footer from "./components/Footer.tsx";
import styles from "./components/styles/index.scss";
import skysourceStyles from "./components/styles/skysource/index.scss";

export const NeonFrame: PageFrame = {
  name: "neon",
  css: styles,
  render({ componentData }: PageFrameProps) {
    return (
      <>
        {Navbar()(componentData)}
        {Hero()(componentData)}
        {Footer()(componentData)}
      </>
    );
  },
};

export const SkysourceFrame: PageFrame = {
  name: "skysource",
  css: skysourceStyles,
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
  }: PageFrameProps) {
    return (
      <>
        {Navbar()(componentData)}
        <div class="left sidebar">{left.map((BodyComponent) => BodyComponent(componentData))}</div>
        <div class="center">
          <div class="page-header">
            <header>{header.map((HeaderComponent) => HeaderComponent(componentData))}</header>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => BodyComponent(componentData))}
            </div>
          </div>
          {Content(componentData)}
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => BodyComponent(componentData))}
          </div>
        </div>
        <div class="right sidebar">
          {right.map((BodyComponent) => BodyComponent(componentData))}
        </div>
        {Footer()(componentData)}
      </>
    );
  },
};

const Homepage: QuartzPageTypePlugin = () => ({
  name: "Homepage",
  match: ({ slug }: { slug: string }) => slug === "index",
  layout: "home",
  frame: "neon",
  body: () => () => null,
});

export default Homepage;
