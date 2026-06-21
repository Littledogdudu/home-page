---
tags:
  - ClaudeCode
  - settings
---

# 1 示例settings.json文件

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "你的API密钥",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-v4-flash",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_NO_FILICKER": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_GIT_BASH_PATH": "D:\\Git\\bin\\bash.exe",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "10000000",
    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "10000000"
  },
  "permissions": {
    "defaultMode": "bypassPermissions",
    "additionalDirectories": ["/tmp"]
  },
  "model": "opus",
  "viewMode": "default",
  "advisorModel": "opus",
  "awaySummaryEnabled": true,
  "showClearContextOnPlanAccept": true,
  "tui": "fullscreen",
  "autoMemoryEnabled": false,
  "autoDreamEnabled": false,
  "showThinkingSummaries": true,
  "skipDangerousModePermissionPrompt": true,
  "voiceEnabled": true,
  "theme": "auto",
  "preferredNotifChannel": "notifications_disabled",
  "autoScrollEnabled": false,
  "teammateMode": "auto",
  "remoteControlAtStartup": true,
  "agentPushNotifEnabled": true
}
```

> [!danger] 其中的CLAUDE_CODE_GIT_BASH_PATH需要设置为你自己的Git安装路径下的bin/bash.exe路径！！！不知道自己是否需要这个配置请查看：[5 配置ClaudeCode可用的Git Bash环境](5%20配置ClaudeCode可用的Git%20Bash环境.md)

> [!danger] 需要注意的语法问题
> 如果修改了配置，一定要注意最后属性值后面不要添加逗号结尾！
> ❌结尾添加了逗号
>
> ```json
> {
>   "env": {
>     "API_TIMEOUT_MS": "3000000"
>   }
> }
> ```
>
> ✔结尾干净
>
> ```json
> {
>   "env": {
>     "API_TIMEOUT_MS": "3000000"
>   }
> }
> ```

# 2 上下文窗口大小设置

|             配置项              |                说明                |
| :-----------------------------: | :--------------------------------: |
| CLAUDE_CODE_AUTO_COMPACT_WINDOW | ClaudeCode自动压缩的上下文窗口阈值 |
| CLAUDE_CODE_MAX_CONTEXT_TOKENS  |   CladueCode模型的最大上下文窗口   |

```json
{
  "env": {
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "10000000",
    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "10000000"
  }
}
```

## 2.1 通过`/context`查看上下文窗口大小

![](assets/2%20settings/context.png)

# 3 禁用自适应思考

|                配置项                 |      说明      |
| :-----------------------------------: | :------------: |
| CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING | 禁用自适应思考 |

```json
{
  "env": {
    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "1"
  }
}
```

# 4 多Agent协作

|                配置项                |                            说明                             |
| :----------------------------------: | :---------------------------------------------------------: |
| CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS | 开启ClaudeCode智能体团队，官方多subAgents协作（实验性功能） |

## 4.1 创建subAgent

> [!tip] 可以创建~/.claude/.agent文件夹，并在其中以特定方式编写markdown文件来定义subAgent

```md
---
name: code-reviewer
description: 审查代码质量和最佳实践
tools: Read, Glob, Grep
model: sonnet
---

你是代码审查员。被调用时，分析代码并提供
关于质量、安全性和最佳实践的具体、可操作的反馈。
```

# 5 启用全屏渲染

|         配置项          |     说明     |
| :---------------------: | :----------: |
| CLAUDE_CODE_NO_FILICKER | 启用全屏渲染 |

在任何 Claude Code 对话中运行 /tui fullscreen。CLI 会保存 tui 设置并以您的对话完整地重新启动到全屏模式，因此您可以在会话中途切换而不会丢失上下文。运行不带参数的 /tui 来打印当前活动的渲染器。 您也可以在启动 Claude Code 之前设置 CLAUDE_CODE_NO_FLICKER 环境变量或直接修改配置：

```json
{
  "tui": "fullscreen"
}
```

tui 设置和环境变量是等效的。/tui 命令会从重新启动的进程中清除 CLAUDE_CODE_NO_FLICKER，以便它写入的设置生效。

# 6 启用绕过权限模式

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "additionalDirectories": ["/tmp"]
  }
}
```

![](assets/2%20settings/bypass-permission-on.png)

## 6.1 所有权限

| 权限值              | 说明                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `default`           | 标准行为：在首次使用每个工具时提示权限                                                                           |
| `acceptEdits`       | 自动接受工作目录或 `additionalDirectories` 中路径的文件编辑和常见文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等） |
| `plan`              | Plan Mode：Claude 可以分析但不能修改文件或执行命令                                                               |
| `auto`              | 自动批准工具调用，并进行后台安全检查以验证操作与您的请求一致。目前处于研究预览阶段                               |
| `dontAsk`           | 自动拒绝工具，除非通过 `/permissions` 或 `permissions.allow` 规则预先批准                                        |
| `bypassPermissions` | 跳过所有权限提示。根目录和主目录删除操作（如 `rm -rf /`）仍会作为断路器提示                                      |

# 7 底部状态展示

安装claude hud后执行`/claude-hud:setup`指令自动生成

```json
{
  "statusLine": {
    "type": "command",
    "command": "cols=$(stty size </dev/tty 2>/dev/null | awk '{print }'); export COLUMNS=$(( ${cols:-120} > 4 ? ${cols:-120} - 4 : 1 )); plugin_dir=$(ls -1d \"${CLAUDE_CONFIG_DIR:-$HOME/.claude}\"/plugins/cache/*/claude-hud/*/ 2>/dev/null | sort -V | tail -1); exec \"/d/nvm/nodejs/node\" \"${plugin_dir}dist/index.js\""
  }
}
```

![](assets/2%20settings/status-line.png)

# 8 showClearContextOnPlanAccept

> [!note]+
> 在计划接受屏幕上显示”清除上下文”选项。默认为 `false`。设置为 `true` 以恢复该选项

# 9 MCP

## 9.1 pixso

> [!tip] 详细配置请访问官网[https://pixso.cn/developer/zh/mcp/local-mcp.html](https://pixso.cn/developer/zh/mcp/local-mcp.html)

### 9.1.1 本地版本

```json
"Pixso MCP": {
  "type": "http",
  "url": "http://127.0.0.1:3667/mcp",
  "headers": {}
},
```

### 9.1.2 密钥版本

```json
"Pixso MCP": {
  "type": "http",
  "url": "http://127.0.0.1:3667/mcp",
  "headers": {
	"Token": 你的pixso生成的密钥
  }
},
```

## 9.2 playwright

> [!danger]+ 弃用
> 因为完全可以通过安装playwright-cli和skills替代使用token消耗量巨大的MCP
> 具体查看[3 plugin](3%20plugin.md)

```json
"playwright": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "@playwright/mcp@latest"
    ]
}
```
