import type { QuartzTransformerPlugin } from "@quartz-community/types";
import { fixCodeBlockHeaders } from "./code-block-headers";
import { fixCalloutMarkdown } from "./callout-fix";
// @ts-expect-error - inline style import
import codeBlockHeadersStyle from "./styles/code-block-headers.scss";

export const ExtendsTransformer: QuartzTransformerPlugin = () => ({
  name: "ExtendsTransformer",
  textTransform(_ctx, src) {
    const withHeaders = fixCodeBlockHeaders(src);
    return fixCalloutMarkdown(withHeaders);
  },
  externalResources() {
    return {
      css: [{ content: codeBlockHeadersStyle, inline: true, spaPreserve: true }],
    };
  },
});
