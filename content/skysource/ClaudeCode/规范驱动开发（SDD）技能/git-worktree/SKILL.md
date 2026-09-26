---
name: git-worktree
description: 当需要使用git worktree创建独立的工作区，或用户显式调用 `/git-worktree` 技能时调用此技能
---

# git-worktree

## 概念

仓库只有一份对象库和 refs，但可有多个工作区并行检出不同分支：`git init/clone` 得到主工作区，`git worktree add` 得到链接工作区。链接工作区除私有文件（HEAD、index 等）外与主工作区共享一切，元数据存放在 `$GIT_DIR/worktrees/<名称>`。

## 命令

| 命令                                             | 用途                                                          |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `git worktree add <路径> [<分支>]`               | 在 `<路径>` 检出；省略分支时自动以 `basename <路径>` 建新分支 |
| `git worktree add -b <新分支> <路径> [<提交号>]` | 从 `<提交号>`（默认 HEAD）建新分支并检出；`-B` 会重置同名分支 |
| `git worktree add -d <路径>`                     | 分离 HEAD，做与分支无关的抛弃式工作区                         |
| `git worktree add --no-checkout <路径>`          | 不检出，便于配置稀疏检出                                      |
| `git worktree list [-v \| --porcelain [-z]]`     | 列出工作区；`--porcelain` 为跨版本稳定的可解析格式            |
| `git worktree move <工作区> <新路径>`            | 移动链接工作区                                                |
| `git worktree remove [-f] <工作区>`              | 删除链接工作区                                                |
| `git worktree lock [--reason <字符串>] <工作区>` | 阻止管理文件被 prune 及被 move/remove                         |
| `git worktree unlock <工作区>`                   | 解锁                                                          |
| `git worktree prune [-n] [-v] [--expire <时间>]` | 清理工作区已丢失的元数据；`-n` 只报告不删除                   |
| `git worktree repair [<路径>…]`                  | 重建因外部移动而失效的链接                                    |

`<工作区>` 可用相对或绝对路径；路径后几层唯一时可用后缀指代（如 `def/ghi`）。

## 规则与陷阱

- 保护机制：同一分支默认不能被两个工作区同时检出，`<路径>` 已分配给丢失的工作区时 `add` 也拒绝，除非 `-f`；已锁定的需 `-f -f`。
- `remove` 只接受干净工作区（无未跟踪文件、无未提交修改），脏工作区或含子模块的用 `-f`；主工作区不能 `remove`/`move`。
- 省略 `<提交号>` 且未用 `-b/-B/-d` 时：`basename <路径>` 不存在则基于 HEAD 新建，存在则检出，仓库无任何有效分支时关联未出生分支（等价 `--orphan`）。
- 分支名只在唯一远程仓库存在跟踪分支时，`add` 等价于 `--track -b <分支> <路径> <远程>/<分支>`；多远程歧义时由 `checkout.defaultRemote` 决定。
- refs 共享（`refs/bisect`、`refs/worktree`、`refs/rewitten` 除外），伪引用与 config 按工作区隔离；跨工作区引用写作 `main-worktree/HEAD`、`worktrees/<名称>/HEAD`。
- 按工作区配置需先启用 `extensions.worktreeConfig`，再 `git config --worktree`；`core.worktree`、`core.bare=true`、`core.sparseCheckout` 不宜共享。
- 手动移动工作区后跑 `git worktree repair` 重建链接，不要手改 `gitdir` 文件。
- 不要直接拼 `$GIT_DIR` 路径，用 `git rev-parse --git-path <路径>` 解析最终位置。
- 多重检出仍属试验特性，对子模块支持不完整。

## 典型流程

紧急修复当前混乱的工作区，不打扰手头改动：

```bash
git worktree add -b emergency-fix ../temp master
pushd ../temp
# ... 修复并提交 ...
popd
git worktree remove ../temp
```
