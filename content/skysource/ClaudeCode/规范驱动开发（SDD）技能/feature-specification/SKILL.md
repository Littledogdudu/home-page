---
name: feature-specification
description: 当完成项目总章程制定后、用户直接通过 `/feature-specification` 命令显式调用后调用此技能。
---

# 第一步：前提

检查项目根目录下的 `specs` 文件夹下的 `constitution` 文件夹下是否存在三个文件：

- mission.md（任务）
- tech-stack.md（技术栈）
- roadmap.md（路线图）

如果存在进入第二步，不满足则[询问用户](./reference/question.md)是否调用 `/constitution` 技能制定项目总章程。

# 第二步：制定计划、需求和验证文档

参考 `specs/constitution/mission.md` 和 `specs/constitution/tech-stack.md`，根据 `specs/constitution/roadmap.md` 路线图中的每一步都创建各自的功能规格清单：

- 在 `specs/feature-YYYYMMDDHHmmss/` 文件夹下创建 `YYYY-MM-DD-feature-name` 的文件夹放置以下规格文件
  - `plan.md`: 编写一系列编号的任务组。
  - `requirements.md`: 明确范围，决定和上下文。
  - `validation.md`: 指导什么是正确的实现，如何正确地合并进分支。

如果以上任何步骤存在歧义或需要用户决定的任务细节、技术栈和路线图则向用户询问，如何询问参考[询问方式](./reference/question.md)

当且仅当以上文档完成并写入对应文件后进入第三步。

# 第三步：实现计划

调用 `/sdd-implement` 技能实施计划。
