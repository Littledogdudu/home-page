const calloutRegex = /^> *\[!\w+(?:\|.*?)?\][+-]?/;
const headingRegex = /^#{1,6}\s/;
const hrRegex = /^(-{3,}|\*{3,}|_{3,})\s*$/;
const emptyRegex = /^\s*$/;

export function fixCalloutMarkdown(src: string): string {
  const lines = src.split("\n");
  const result: string[] = [];
  let inCallout = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trimStart();

    if (inCallout) {
      if (emptyRegex.test(line)) {
        inCallout = false;
        result.push(line);
        continue;
      }
      if (headingRegex.test(trimmed)) {
        inCallout = false;
        result.push(line);
        continue;
      }
      if (hrRegex.test(trimmed)) {
        inCallout = false;
        result.push(line);
        continue;
      }
      if (calloutRegex.test(trimmed)) {
        result.push(line);
        continue;
      }
      if (trimmed.startsWith(">")) {
        result.push(line);
        continue;
      }
      const leadingSpace = line.match(/^(\s*)/)?.[1] ?? "";
      result.push(`${leadingSpace}> ${trimmed}`);
    } else {
      if (calloutRegex.test(trimmed)) {
        inCallout = true;
      }
      result.push(line);
    }
  }

  return result.join("\n");
}
