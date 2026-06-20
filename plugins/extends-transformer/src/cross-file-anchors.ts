import { visit } from "unist-util-visit";
import { slug } from "github-slugger";
import { slugifyFilePath } from "@quartz-community/utils";
import path from "path";
import type { Link, Root } from "mdast";
import type { VFile } from "vfile";

export function fixCrossFileAnchors() {
  return (_tree: Root, file: VFile) => {
    const currentSlug = file.data.slug as string | undefined;
    if (!currentSlug) return;

    const currentDir = currentSlug.includes("/")
      ? currentSlug.substring(0, currentSlug.lastIndexOf("/"))
      : "";

    visit(_tree, "link", (node: Link) => {
      const { url } = node;
      if (!url.includes("#")) return;

      const hashIndex = url.indexOf("#");
      const linkPath = url.slice(0, hashIndex);
      const rawAnchor = url.slice(hashIndex + 1);

      if (!linkPath) return; // pure fragment → htmlPlugin handles
      if (rawAnchor.startsWith("^")) return; // block reference → preserve
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(linkPath)) return; // absolute URL
      if (linkPath.startsWith("/")) return; // root-relative → CrawlLinks handles

      // Slugify anchor
      const decoded = decodeURIComponent(rawAnchor);
      const slugged = slug(decoded);

      // Resolve to root-relative in slug space so CrawlLinks can't double-count traversal
      // Decode percent-encoding in the path (e.g. %20 → space) before slugifying
      const decodedPath = decodeURI(linkPath);
      const resolvedAbs = path.posix.resolve("/", currentDir, decodedPath);
      const resolvedPath = resolvedAbs.slice(1); // strip "/"
      const targetSlug = slugifyFilePath(resolvedPath as Parameters<typeof slugifyFilePath>[0]);

      // Don't strip "index" — CrawlLinks does that correctly when given a root-relative path
      node.url = "/" + targetSlug + "#" + slugged;
    });
  };
}
