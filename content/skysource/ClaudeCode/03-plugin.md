---
tags:
  - ClaudeCode
  - plugin
  - skills
日期: 2026年4月29日
---

# 1 Plugin：离线状态下为Claude Code安装插件

## 1.1 Download：通过`git clone`或直接下载压缩包

> [!tip] 检查你的插件文件
>
> - 使用`git clone`克隆项目后注意查看项目根目录下是否包含`.claude-plugin/marketplace.json`
> - 如果直接下载压缩包，解压后也要注意查看项目根目录下是否包含`.claude-plugin/marketplace.json`

## 1.2 Marketplace：添加插件市场到Claude

1. 终端打开Claude Code
2. 在Claude Code中输入`/plugin`打开插件设置
3. 左右键移动到`Marketplaces`选项
4. 选择`Add Marketplace`并把第一步克隆或解压的项目文件夹路径复制粘贴到输入框，路径需要注意以下几点👇

> [!danger] 路径要点
>
> - 路径必须是`.claude-plugin`文件夹的父级文件夹，Claude Code会自动添加`.claude-plugin/marketplace.json`以便正确添加插件市场
> - 路径尽可能填写绝对路径，相对路径是相对于启动Claude Code时的路径。如果每个项目都包含自己的插件，则可以使用相对路径引入

## 1.3 Discover：添加插件到Claude

1. 添加插件市场后会自动跳转到插件设置的`Discover`，没有自动跳转则需要手动左右方向键选中插件设置的`Discover`
2. 在`Discover`中查询插件进行安装即可

> [!danger]- 明明是本地安装，却始终去链接github.com？
> Failed to install: Failed to clone repository: Cloning into 'C:\Users\SkySource\.claude\plugins\cache\temp_github_1781937858986_6f0am8'...
> ssh: Could not resolve hostname github.com: Name or service not known. fatal: Could not read from remote repository.
> Please make sure you have the correct access rights and the repository exists.
> 这是因为`.claude-plugin`中的`marketplace.json`文件中配置了github地址导致的，解决方法请看 [2.1.1 source属性的两种配置方式](../../AI/Claude%20Code/3%20plugin.md#2.1.1%20source属性的两种配置方式)

# 2 插件结构

在`.claude-plugin`中包含两个文件

- marketplace.json
- plugin.json

## 2.1 marketplace.json

```json file=.claude-plugin/marketplace.json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "插件名称",
  "description": "插件描述",
  "owner": {
    "name": "插件作者",
    "url": "插件下载地址"
  },
  "plugins": [
    {
      "name": "插件名称",
      "description": "插件描述",
      "source": "./",
      "category": "插件分类"
    }
  ]
}
```

其中`plugins`下的`source`标识插件的根路径

### 2.1.1 source属性的两种配置方式

以上贴出的`.claude-plugin/marketplace.json`配置中的`source`属性有不同的配置方式：

- 引用当前本地插件根目录

```json file=.claude-plugin/marketplace.json
{
  "plugins": [
    {
      "source": "./"
    }
  ]
}
```

- 引用github仓库

```json file=.claude-plugin/marketplace.json
{
  "plugins": [
    {
      "source": {
        "source": "github",
        "repo": "addyosmani/agent-skills"
      }
    }
  ]
}
```

`source`属性在官网（[https://code.claude.com/docs/zh-CN/plugin-marketplaces#plugin-sources](https://code.claude.com/docs/zh-CN/plugin-marketplaces#plugin-sources)）上的描述：

| 源           | 类型                             | 字段                               | 注释                                                                                                          |
| ------------ | -------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 相对路径     | `string`（例如 `"./my-plugin"`） | 无                                 | marketplace repo 中的本地目录。必须以 `./` 开头。相对于 marketplace 根目录解析，而不是 `.claude-plugin/` 目录 |
| `github`     | object                           | `repo`、`ref?`、`sha?`             |                                                                                                               |
| `url`        | object                           | `url`、`ref?`、`sha?`              | Git URL 源                                                                                                    |
| `git-subdir` | object                           | `url`、`path`、`ref?`、`sha?`      | git repo 中的子目录。稀疏克隆以最小化大型 monorepos 的带宽                                                    |
| `npm`        | object                           | `package`、`version?`、`registry?` | 通过 `npm install` 安装                                                                                       |

> [!danger] 如果出现本地安装插件却始终访问github下载的问题，查看`.claude-plugin/marketplace.json`配置文件，把`引用github仓库`的配置修改成`引用当前本地插件根目录`的配置

## 2.2 plugin.json

```json file=.claude-plugin/plugin.json
{
  "name": "agent-skills",
  "description": "Production-grade engineering skills for AI coding agents — covering the full software development lifecycle from spec to ship.",
  "author": {
    "name": "Addy Osmani"
  },
  "homepage": "https://github.com/addyosmani/agent-skills",
  "repository": "https://github.com/addyosmani/agent-skills",
  "license": "MIT",
  "commands": "./.claude/commands",
  "skills": "./skills",
  "agents": [
    "./agents/code-reviewer.md",
    "./agents/security-auditor.md",
    "./agents/test-engineer.md",
    "./agents/web-performance-auditor.md"
  ],
  "hooks": "./hooks/claude-codex-hooks.json"
}
```

- `commands` 提供命令安装路径
- `skills` 提供技能安装路径
- `agents` 提供子智能体的描述文件
- `hooks` 提供钩子自动配置文件
