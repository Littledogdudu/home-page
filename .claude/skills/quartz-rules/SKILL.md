---
name: quartz-rules
description: >
  Enforce Quartz v5 project operating rules for this repository. Use whenever
  working on the home-page blog project — any code change, new feature, bugfix,
  style tweak, plugin creation, or Markdown processing modification. This skill
  defines WHERE every type of change must live. If you touch code in this repo,
  consult this skill first.
---

# Quartz v5 项目操作规范

这些规范定义了在此项目中各类代码变更的**唯一正确位置**。违反这些规范会导致代码被放到错误的位置，难以维护和升级。

## 规则

### 1. 禁止修改 `.quartz` 目录

`.quartz` 是社区插件的中间依赖库，由 `npm run install-plugins` 自动生成和更新。任何手动修改都会在下次安装插件时丢失。

- 不要编辑 `.quartz/` 下的任何文件
- 不要新增文件到 `.quartz/` 目录

### 2. Markdown 解析变更集中在 `plugins/extends-transformer`

所有对 Markdown 解析、转换、渲染的改动——包括 remark/rehype 插件、AST 处理、自定义语法——都在这个插件中进行。

- 目录：`plugins/extends-transformer/`
- 这是一个 Transformer 类型的 Quartz 插件
- 在这里添加新的 remark/rehype 插件或修改现有的解析逻辑

### 3. 新增插件以 `plugins/darkmode` 为样板

创建新插件时，必须遵循 darkmode 的结构模式：

- 样式文件：独立放在 `.scss` 文件中（不要内联在组件里）
- 脚本文件：独立放在 `inline.ts` 文件中（不要内联在 JSX 里）
- 参考目录结构：`plugins/darkmode/` 的组织方式

这种分离保证样式和脚本可以独立构建和缓存，同时保持组件的可读性。

### 4. Markdown 内容全局样式变量

Markdown 渲染内容的全局样式变量（CSS 变量、主题变量等）在此文件中定义：

```
plugins/home/src/components/styles/skysource/index.scss
```

需要添加或覆盖全局变量时，修改这个文件。

### 5. Markdown 内容自定义样式

所有针对 Markdown 渲染内容的样式覆盖和新增样式在此文件中进行：

```
quartz/styles/custom.scss
```

这包括：标签样式、callout 样式、代码块样式、表格样式、以及其他任何从 `.md` 文件生成的 HTML 内容的 CSS。

---

## 快速判断

遇到不确定改动放哪时，按这个流程：

- 改动的是依赖库代码？→ **别动**（那是 `.quartz`）
- 改动的是 Markdown 如何被解析/转换？→ `plugins/extends-transformer`
- 改动的是全局设计变量（颜色、字体等）？→ `plugins/home/src/components/styles/skysource/index.scss`
- 改动的是 Markdown 内容的外观？→ `quartz/styles/custom.scss`
- 需要新建插件？→ 复制 `plugins/darkmode` 结构
