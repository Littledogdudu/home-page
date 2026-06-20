// ponyrail: simple HTML escape, add a real sanitizer only if user content
// paths ever contain angle brackets or quotes (they don't in practice).
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function codeHeader(lang: string, file?: string): string {
  const langSpan = lang ? `<span class="cb-lang">${esc(lang)}</span>` : "";
  const fileSpan = file ? `<span class="cb-file">${esc(file)}</span>` : "";
  return `<div class="cb-header">${langSpan}${fileSpan}</div>`;
}

// Matches ```lang rest\n...\n``` capturing: fence, lang, rest-of-info, body
// \1 backref ensures opening/closing fences have the same length.
const fenceBlockRe = /^(`{3,})(\w*)([^\n]*)\n([\s\S]*?)\n\1\s*$/gm;

export function fixCodeBlockHeaders(src: string): string {
  return src.replace(
    fenceBlockRe,
    (match, fence: string, lang: string, rest: string, code: string) => {
      const fileMatch = rest.match(/file=(\S+)/);
      const hasLang = lang.length > 0;
      const hasFile = !!fileMatch?.[1];
      if (!hasLang && !hasFile) return match;

      // Build clean info string (strip file=)
      const cleanRest = rest.replace(/\s*file=\S+\s*/, " ").trim();
      let cleanOpening = fence + (lang || "");
      if (cleanRest) cleanOpening += " " + cleanRest;

      const header = codeHeader(lang, fileMatch?.[1]);
      // ponytail: blank line after header so CommonMark HTML block (type 6)
      // ends before the fenced code block opening — prevents it being eaten as raw HTML.
      return header + "\n\n" + cleanOpening + "\n" + code + "\n" + fence;
    },
  );
}
