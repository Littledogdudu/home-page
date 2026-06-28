import type { QuartzTransformerPlugin } from "@quartz-community/types";
import { slug } from "github-slugger";
import { fixCodeBlockHeaders } from "./code-block-headers";
import { fixCalloutMarkdown } from "./callout-fix";
import { fixCrossFileAnchors } from "./cross-file-anchors";
import codeBlockHeadersStyle from "./styles/code-block-headers.scss";
import noteLightboxStyle from "./styles/note-lightbox.scss";
import noteLightboxScript from "./note-lightbox.inline";

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
  markdownPlugins() {
    return [fixCrossFileAnchors];
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
      css: [
        { content: codeBlockHeadersStyle, inline: true, spaPreserve: true },
        { content: noteLightboxStyle, inline: true, spaPreserve: true },
      ],
      js: [
        {
          script: noteLightboxScript,
          loadTime: "afterDOMReady",
          contentType: "inline",
          spaPreserve: true,
        },
      ],
    };
  },
});
