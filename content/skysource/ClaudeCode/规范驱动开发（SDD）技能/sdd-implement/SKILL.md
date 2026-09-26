---
name: sdd-implement
description: 当完成功能规格文档后或通过 `/sdd-implement` 显式调用时调用此技能。
---

# 1 第一步：前提

检查上下文或用户是否指定了当前需要实现的 `specs/feature-YYYYMMDDHHmmss` 的 `YYYYMMDDHHmmss` 后缀时间。

- 没有提供则通过[询问方式](./reference/question.md)提供最近两条 `feature-YYYYMMDDHHmmss` 文件夹（没有 `feature-YYYYMMDDHHmmss` 文件夹则[询问用户](./reference/question.md)是否调用 `/feature-specification` 技能制定项目总章程）和一个用户输入选项供用户指定。
- 当且仅当提供了才继续往下检查。

# 2 第二步：为不同的功能创建工作区

- **有创建子agent的能力**：为每一个功能分别创建一个子agent执行下面的动作。
- **没有创建子agent的能力但有多开会话的能力**：为每一个功能分别创建一个会话执行下面动作。
- **没有创建子agent也没有多开会话的能力**：按照下面动作一个功能接一个功能的串行实现。

1. [询问](./reference/question.md)是否从当前分支创建分支，得到答案后在执行第二步。
2. 通过 `/git-worktree` 为每一个功能创建独立工作区。工作分支的名称按动作（feat、fix、refactor）-当前功能名称命名，创建完毕后下面所有的代码实现都在这个工作分支上完成。
3. 根据各自的功能文件夹（YYYY-MM-DD-feature-name）在各自的工作区实现。
4. 每实现一个阶段自动通过 `git commit` 提交代码。
5. 每当完成一个功能就编写一个单元测试防止后续修改影响该部分正常功能。如果没有对应的单元测试依赖则[询问用户](./reference/question.md)是否添加推荐的单元测试依赖。
6. 功能完整实现后完善README.md开发文档和AGENTS.md/CLAUDE.md（如果有这些AI上下文文件的话）。
