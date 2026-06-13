该文件仅作为一个占位符存在，实际的首页内容由 `plugins/home/src/index.tsx`中的`Homepage` 插件提供。
```ts
const Homepage: QuartzPageTypePlugin = () => ({
  name: "Homepage",
  // content/index.md  →  slug = "index"  →  PageTypeDispatcher 匹配
  // PageTypeDispatcher（quartz/plugins/pageTypes/dispatcher.ts:212-231）按 priority 降序检查所有 page-type，第一个匹配的胜出：
  // 1. Homepage 插件 (plugins/home/src/index.tsx:24) — match: ({ slug }) => slug === "index" — 匹配！胜出！
  // 2. ContentPage 永远不会被检查，因为 Homepage 已经胜出
  match: ({ slug }: { slug: string }) => slug === "index",
  layout: "home",
  frame: "neon",
  // body: () => () => null → body 为空，content/index.md 的内容永远不会被渲染
  body: () => () => null,
})
```