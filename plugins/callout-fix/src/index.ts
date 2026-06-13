import type { QuartzTransformerPlugin } from "@quartz-community/types";

// Match Obsidian callout directives: > [!type], > [!type]+, > [!type]-
// Supports callout types with optional metadata: [!type|metadata]
const calloutRegex = /^> *\[!\w+(?:\|.*?)?\][+-]?/;

// Match a heading line
const headingRegex = /^#{1,6}\s/;

// Match a horizontal rule
const hrRegex = /^(-{3,}|\*{3,}|_{3,})\s*$/;

// Match an empty line
const emptyRegex = /^\s*$/;

export const CalloutFix: QuartzTransformerPlugin = () => {
  return {
    name: "CalloutFix",
    textTransform(_ctx, src) {
      const lines = src.split("\n");
      const result: string[] = [];
      let inCallout = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const trimmed = line.trimStart();

        if (inCallout) {
          // Check exit conditions
          if (emptyRegex.test(line)) {
            // Empty line: exit callout mode (content no longer belongs to callout)
            inCallout = false;
            result.push(line);
            continue;
          }

          if (headingRegex.test(trimmed)) {
            // Heading: exit callout mode
            inCallout = false;
            result.push(line);
            continue;
          }

          if (hrRegex.test(trimmed)) {
            // Horizontal rule: exit callout mode
            inCallout = false;
            result.push(line);
            continue;
          }

          if (calloutRegex.test(trimmed)) {
            // New callout directive: exit current callout, stay in callout mode for the new one
            result.push(line);
            continue;
          }

          if (trimmed.startsWith(">")) {
            // Already has blockquote prefix — emit as-is
            result.push(line);
            continue;
          }

          // Content line: wrap with blockquote prefix
          // Preserve original indentation, add "> " after it
          const leadingSpace = line.match(/^(\s*)/)?.[1] ?? "";
          result.push(`${leadingSpace}> ${trimmed}`);
        } else {
          // Check if this line starts a new callout
          if (calloutRegex.test(trimmed)) {
            inCallout = true;
          }
          result.push(line);
        }
      }

      return result.join("\n");
    },
  };
};

export default CalloutFix;
