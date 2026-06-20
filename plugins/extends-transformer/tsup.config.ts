import type { Plugin } from "esbuild";
import path from "path";
import { defineConfig } from "tsup";

const SINGLETON_EXTERNALS = [
  "preact",
  "preact/hooks",
  "preact/jsx-runtime",
  "preact/compat",
  "skyource-blog",
  "@jackyzha0/quartz/*",
  "vfile",
  "vfile/*",
  "unified",
];

const inlineScriptPlugin: Plugin = {
  name: "inline-script-loader",
  setup(parentBuild) {
    const absWorkingDir = parentBuild.initialOptions.absWorkingDir ?? process.cwd();
    parentBuild.onLoad({ filter: /\.scss$/ }, async (args) => {
      const sass = await import("sass");
      const result = sass.compile(args.path);
      return { contents: result.css, loader: "text" };
    });
    parentBuild.onLoad({ filter: /\.inline\.ts$/ }, async (args) => {
      const esbuild = await import("esbuild");
      const fs = await import("fs");
      let text = await fs.promises.readFile(args.path, "utf8");
      text = text.replace(/^export default /gm, "").replace(/^export /gm, "");
      const resolveDir = path.dirname(args.path);
      const sourcefile = path.relative(absWorkingDir, args.path);
      const result = await esbuild.build({
        stdin: { contents: text, loader: "ts", resolveDir, sourcefile },
        write: false,
        bundle: true,
        minify: true,
        platform: "browser",
        format: "esm",
        target: "es2020",
        sourcemap: false,
        external: ["http://*", "https://*"],
      });
      const js = result.outputFiles?.[0]?.text;
      if (!js) throw new Error(`inline-script-loader: no JS output for ${args.path}`);
      return { contents: js, loader: "text" };
    });
  },
};

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  dts: false,
  tsconfig: "tsconfig.build.json",
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  splitting: false,
  noExternal: [/.*/],
  external: [...SINGLETON_EXTERNALS, "@quartz-community/types"],
  outDir: "dist",
  platform: "node",
  esbuildPlugins: [inlineScriptPlugin],
});
