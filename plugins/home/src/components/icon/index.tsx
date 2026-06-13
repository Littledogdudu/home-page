import { readFileSync } from "fs";
import { resolve } from "path";
import { icons as ms } from "@iconify-json/material-symbols";
import { icons as lineMd } from "@iconify-json/line-md";
import { icons as vscodeIcons } from "@iconify-json/vscode-icons";
import { getIconData, iconToHTML, iconToSVG, replaceIDs } from "@iconify/utils";
import type { IconifyJSON } from "@iconify/types";
const sets: Record<string, IconifyJSON> = {
  "material-symbols": ms,
  "line-md": lineMd,
  "vscode-icons": vscodeIcons,
};

const cache = new Map<string, string>();

const resolveSvg = (icon: string): string => {
  const key = icon;
  if (cache.has(key)) return cache.get(key)!;

  // Local file: file:path/to/icon.svg
  if (icon.startsWith("file:")) {
    const filePath = resolve(process.cwd(), icon.slice(5));
    const raw = readFileSync(filePath, "utf-8");
    // Replace root <svg> width/height with 1em for CSS-based sizing
    const svg = raw.replace(/<svg([^>]*)>/, (_, attrs) => {
      let a = attrs.replace(/\bwidth="[^"]*"/, 'width="1em"');
      a = a.replace(/\bheight="[^"]*"/, 'height="1em"');
      return `<svg${a}>`;
    });
    cache.set(key, svg);
    return svg;
  }

  // Iconify: prefix:name
  const [prefix, name] = icon.split(":");
  if (!prefix || !name) return "";
  const iconSet = sets[prefix];
  if (!iconSet) return "";
  const data = getIconData(iconSet, name);
  if (!data) return "";
  const r = iconToSVG(data, { height: "1em", width: "1em" });
  const svg = iconToHTML(replaceIDs(r.body), { ...r.attributes });
  cache.set(key, svg);
  return svg;
};

interface IconProps {
  icon: string;
  class?: string;
}

const Icon = (props: IconProps) => {
  const svg = resolveSvg(props.icon);
  return (
    <span
      class={`quartz-icon ${props.class ?? ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default Icon;
