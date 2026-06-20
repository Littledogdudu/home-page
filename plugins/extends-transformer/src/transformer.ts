import type { QuartzTransformerPlugin } from "@quartz-community/types";
import { slug } from "github-slugger";
import { fixCodeBlockHeaders } from "./code-block-headers";
import { fixCalloutMarkdown } from "./callout-fix";
import codeBlockHeadersStyle from "./styles/code-block-headers.scss";

export function slugifyHeadingAnchors(node: any) {
  if (node.type === "element" && node.tagName === "a" && node.properties?.href) {
    const href = node.properties.href as string;
    if (href.startsWith("#")) {
      const rawAnchor = href.slice(1);
      if (rawAnchor && !rawAnchor.startsWith("^")) {
        // rehypeObsidian percent-encodes non-ASCII characters in hrefs,
        // so decode first before slugifying (idempotent for already-decoded text)
        const anchor = decodeURIComponent(rawAnchor);
        node.properties.href = "#" + slug(anchor);
      }
    } else if (href.includes("#")) {
      const hashIndex = href.indexOf("#");
      const path = href.slice(0, hashIndex);
      const rawAnchor = href.slice(hashIndex + 1);
      if (rawAnchor && !rawAnchor.startsWith("^")) {
        const anchor = decodeURIComponent(rawAnchor);
        node.properties.href = path + "#" + slug(anchor);
      }
    }
  }
  if (node.children) {
    for (const child of node.children) {
      slugifyHeadingAnchors(child);
    }
  }
}

export const ExtendsTransformer: QuartzTransformerPlugin = () => ({
  name: "ExtendsTransformer",
  textTransform(_ctx, src) {
    const withHeaders = fixCodeBlockHeaders(src);
    return fixCalloutMarkdown(withHeaders);
  },
  htmlPlugins() {
    return [
      () => (tree: any) => {
        slugifyHeadingAnchors(tree);
      },
    ];
  },
  externalResources() {
    return {
      css: [{ content: codeBlockHeadersStyle, inline: true, spaPreserve: true }],
    };
  },
});
