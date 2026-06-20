---
tags:
  - ClaudeCode
  - hooks
---

# 1 概述

Claude Code 提供了几个在工作流程不同时间点运行的 hook 事件：

- **PreToolUse**：在工具调用之前运行（可以阻止它们）
- **PostToolUse**：在工具调用完成后运行
- **UserPromptSubmit**：当用户提交提示时运行，在 Claude 处理之前
- **Notification**：当 Claude Code 发送通知时运行
- **Stop**：当 Claude Code 完成响应时运行
- **Subagent Stop**：当子代理任务完成时运行
- **PreCompact**：在 Claude Code 即将运行压缩操作之前运行
- **SessionStart**：当 Claude Code 启动新会话或恢复现有会话时运行

每个事件接收不同的数据，并可以以不同的方式控制 Claude 的行为。

# 2 一些常用hooks

> [!warning] 使用以下hooks的环境要求
>
> - Claude Code已安装
> - jq命令必须可用（jq.exe路径加入到环境变量） (brew install jq / apt install jq / choco install jq / winget install jq)
> - git命令必须可用（git.exe路径加入到环境变量）

> [!danger] 如果你使用windows，务必查看[5 配置ClaudeCode可用的Git Bash环境](5%20配置ClaudeCode可用的Git%20Bash环境.md)，在添加hooks到你的ClaudeCode之后你必须使用git bash启动ClaudeCode

> [!tip] 以下所有hook脚本都存放在`%USERPROFILE%/.claude/hooks`文件夹中，没有请自行创建

> [!tip] 以下所有hook配置都追加在`%USERPROFILE%/.claude/setting.json`文件的hooks属性中

## 2.1 自动提交git的hook

```bash file=%USERPROFILE%/.claude/hooks/auto-commit.sh
#!/bin/bash
# Stop hook: 任务完成后自动检测未提交变更并触发 commit skill

INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

# 防止无限循环：commit 后再次触发时直接放行
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# 检查是否有未提交的变更
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

# 检查工作区是否有变更（已修改、新文件等）
if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null && [ -z "$(git ls-files --others --exclude-standard 2>/dev/null)" ]; then
  # 没有变更，正常结束
  exit 0
fi

# 有未提交变更，阻止 Claude 停止，让它继续执行 commit
cat <<'EOF'
{"decision": "block", "reason": "检测到未提交的变更，请调用 /commit-commands:commit 技能提交更新。"}
EOF
```

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/auto-commit.sh"
          }
        ]
      }
    ]
  }
}
```

### 2.1.1 完成通知

```json
"hooks": {
	"Stop": [
		{
		  "id": "notifications-desktop-task-complete",
		  "name": "Desktop Notification on Task Complete",
		  "event": "Stop",
		  "matcher": "Bash",
		  "command": "bash -c 'MSG=\"Claude Code task complete at $(date +%H:%M)\"; if command -v notify-send &>/dev/null; then notify-send \"Claude Code\" \"$MSG\"; elif command -v osascript &>/dev/null; then osascript -e \"display notification \\\"$MSG\\\" with title \\\"Claude Code\\\"\"; fi'"
		}
	]
}
```

### 2.1.2 密钥扫描拦截hook

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "id": "security-scan-env-secrets",
        "name": "Scan for Hardcoded Passwords",
        "description": "Checks Write/Edit targets for patterns like password=, secret=, token= with literal values",
        "category": "security",
        "event": "PreToolUse",
        "matcher": "Write",
        "command": "bash -c 'CONTENT=$(echo \"$CLAUDE_TOOL_INPUT\" | jq -r \".content // empty\"); if echo \"$CONTENT\" | grep -qiE \"(password|passwd|secret|token|api_key)\\s*=\\s*[\\x27\\\"][^\\x27\\\"]{6,}\"; then echo \"[SECURITY] Possible hardcoded secret in file write. Review before proceeding.\"; fi'",
        "enabled": true
      }
    ]
  }
}
```
