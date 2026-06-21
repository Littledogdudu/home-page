---
tags:
  - ClaudeCode
---

# 1 使用npm安装（全平台）

> [!question] 为什么我现在没在官网上看见这种安装方式了？
> 这是ClaudeCode第一版最原始的安装方法，原先是在官网的，除非原生方法无法安装，否则不推荐使用。缺点如下：
>
> - 兼容性问题：必须安装Node.js。
> - 可能存在的权限冲突：`npm -g`运行时可能出现EACCES权限错误，迫使**使用管理员权限安装，这会导致ClaudeCode后续的文件权限混乱**。
> - 无法自动更新：只能通过`npm update -g @anthropic-ai/claude-code`更新。
> - 环境依赖问题：ClaudeCode可能会在使用nvm切换Node版本时受影响。
> - **已知问题：当superpowers技能和OpenSpecCLI同时安装时ClaudeCode会出现hook错误**
> - **已知问题：部分情况下可能出现spaw EBUSY问题**

```shell
npm install -g @anthropic-ai/claude-code
```

# 2 使用终端原生安装

## 2.1 macOS, Linux, WSL

> [!warning] 如果你发现无法安装或安装后启动ClaudeCode出现avx指令不支持的错误，使用以下方式安装
> `curl -fsSL https://claude.ai/install.sh | bash -s 2.1.112`
> 因为从2.1.113版本开始ClaudeCode就开始使用avx2指令了，而较老的CPU没有这个微指令

### 2.1.1 [官网](https://code.claude.com/docs/zh-CN/overview)

```shell
curl -fsSL https://claude.ai/install.sh | bash
```

### 2.1.2 [Cladue Code中文站](https://claude-zh.cn/guide/getting-started)

```shell
source <(curl -fsSL https://claude-zh.cn/scripts/install.sh)
```

## 2.2 Windows PowerShell

> [!warning] 如果你发现无法安装或安装后启动ClaudeCode出现avx指令不支持的错误，使用[2.2.1 指定版本安装](../../AI/Claude%20Code/1%20install.md#2.2.1%20指定版本安装)

### 2.2.1 指定版本安装

#### 2.2.1.1 Windows PowerShell

```shell
& ([scriptblock]::Create((irm "https://claude.ai/install.ps1"))) 2.1.112
```

> [!danger] 可能出现找不到git bash路径的问题
> 如果出现 Claude Code was unable to find CLAUDE_CODE_GIT_BASH_PATH path 的错误，继续按照下面的步骤操作

- 进入用户文件夹（在文件资源管理器的地址栏输入`%USERPROFILE%`）
- 在.claude文件夹（没有则新建）下的settings.json（没有则新建）追加以下内容（其中`"D:\\Git\\bin\\bash.exe"`替换成你本地的git bash路径）：

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "D:\\Git\\bin\\bash.exe"
  }
}
```

> [!question] 为什么可行？
> 因为从2.1.113版本开始ClaudeCode就开始使用avx2指令了，而较老的CPU没有这个微指令

### 2.2.2 [官网](https://code.claude.com/docs/zh-CN/overview)

```shell
irm "https://claude.ai/install.ps1" | iex
```

```shell
# 使用winget安装（如果上面的安装有问题的话）
winget install Anthropic.ClaudeCode
```

### 2.2.3 [Cladue Code中文站](https://claude-zh.cn/guide/getting-started)

```shell
& ([scriptblock]::Create((New-Object Net.WebClient).DownloadString("https://claude-zh.cn/scripts/install.ps1")))
```

## 2.3 Windows CMD

```shell
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

# 3 卸载

## 3.1 使用npm卸载

> [!warning] 这种方法仅适用于使用 [1 使用npm安装（全平台）](../../AI/Claude%20Code/1%20install.md#1%20使用npm安装（全平台）) 时使用

```shell
npm uninstall -g @anthropic-ai/claude-code
```

## 3.2 原生卸载

> [!warning] 这种方法仅适用于使用 [2 使用终端原生安装](../../AI/Claude%20Code/1%20install.md#2%20使用终端原生安装) 时使用

### 3.2.1 macOS, Linux, WSL

```shell
rm -f ~/.local/bin/claude
rm -rf ~/.local/share/claude

# apk
sudo apt remove claude-code
sudo rm /etc/apt/sources.list.d/claude-code.list /etc/apt/keyrings/claude-code.asc

# dnf
sudo dnf remove claude-code
sudo rm /etc/yum.repos.d/claude-code.repo

# apk
apk del claude-code
sed -i '\|downloads.claude.ai/claude-code/apk|d' /etc/apk/repositories
rm /etc/apk/keys/claude-code.rsa.pub
```

### 3.2.2 Windows PowerShell

```shell
Remove-Item -Path "$env:USERPROFILE\.local\bin\claude.exe" -Force
Remove-Item -Path "$env:USERPROFILE\.local\share\claude" -Recurse -Force

# 删除用户设置和状态
Remove-Item -Path "$env:USERPROFILE\.claude" -Recurse -Force
Remove-Item -Path "$env:USERPROFILE\.claude.json" -Force

# 可选：删除特定于项目的设置（从您的项目目录运行）
Remove-Item -Path ".claude" -Recurse -Force
Remove-Item -Path ".mcp.json" -Force
```
