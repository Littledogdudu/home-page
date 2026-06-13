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
});
