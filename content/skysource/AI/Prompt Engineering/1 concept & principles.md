---
tags:
  - prompt
  - concept
---

# 1 什么是提示词工程？

提示工程是为模型编写有效指令的过程，以便它始终如一地生成满足您要求的内容。

# 2 提示词的最佳实践

## 2.1 调整超参数

> [!quote] 参考文献：[使用 OpenAI API 进行提示工程的最佳实践 |OpenAI 帮助中心 --- Best practices for prompt engineering with the OpenAI API](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api)

- `role`（角色）：消息发送者的角色 ^28b04
  - `user`（用户）：代表用户的消息，即我们向LLM提出的问题
  - `system`（系统）：代表LLM的一些设定，包括一些性格和回答限制
  - `assiant`（助手）：LLM本身回复的内容
  - `developer`（开发人员）：提供系统的规则和业务逻辑，例如函数定义
- `instruction`（指令）：为模型提供有关在生成响应时应如何行为的高级指令，包括语气、目标和正确响应的示例。
  - 这种方式提供的任何指令都将**优先于**`input`（输入参数）中的提示
- `temperature`: 可以控制LLM生成文本的创造性和随机性，范围\[0, 2]，默认为1
  - ➔0：生成的文本更保守、**重复性高**，更倾向于选择最优可能的Token。适合需要准确性和一致性的任务，例如事实、代码、数学相关等。
  - ➔2：生成的文本更创建、发散，**重复性低**，更倾向于选择不太常见但仍然合理的Token。适合需要创造性和灵感的任务，例如故事创作、聊天等。
- `decoding strategy`（解码策略）:
  - `greedy decoding`（贪心解码）: 总是选择最高分的token
  - `top_k`: 从tokens里选择`k个`候选词，越大越随机，越小内容越固定，设置为1和`greedy decoding`效果一致 ^7203a5
  - `top_p`（核采样）: 范围\[0, 1.0]，从tokens里选择**累积概率**超过阈值p的候选词（例如取值为0.8，仅保留所有候选词概率累加大于等于0.8的最可能token的最小集合作为候选集）
    - ➔0：生成的**确定性越高**
    - ➔1，生成的**随机性越高**

> [!attention] 注意！
> 当top_k和top_p都被设置时，top_p只会在top_k之后起作用

- `frequency penalty`（频率惩罚）: 让**token**每次在**output文本**中出现都受到惩罚。这可以阻止重复使用的token/单词/短语。
- `Repetition Penalty`（重复惩罚）：让**句子**每次在**prompt和output文本**中出现都受到惩罚。
- `presence penalty`（存在惩罚）: 一种固定惩罚，如果一个**token**已经在**output文本**中出现过，就会受到**特定常量的惩罚**。
- `reasoning_effort`: 探索深度
  较低的reasoning_effort会**减少探索深度**，**提高效率和延迟**
  增加reasoning_effort会鼓励模型自主性、**增加工具调用持久性**并**减少澄清问题**或以其他方式返回给用户的次数。

针对探索深度(reasoning_effort)可以在提示词中定义明确的标准：

```xml
<context_gathering>
Goal: Get enough context fast. Parallelize discovery and stop as soon as you can act.

Method:
- Start broad, then fan out to focused subqueries.
- In parallel, launch varied queries; read top hits per query. Deduplicate paths and cache; don’t repeat queries.
- Avoid over searching for context. If needed, run targeted searches in one parallel batch.

Early stop criteria:
- You can name exact content to change.
- Top hits converge (~70%) on one area/path.

Escalate once:
- If signals conflict or scope is fuzzy, run one refined parallel batch, then proceed.

Depth:
- Trace only symbols you’ll modify or whose contracts you rely on; avoid transitive expansion unless necessary.

Loop:
- Batch search → minimal plan → complete task.
- Search again only if validation fails or new unknowns appear. Prefer acting over more searching.
</context_gathering>
```

### 2.1.1 固定探索深度及调用工具的预算

```xml
<context_gathering>
- Search depth: very low
- Bias strongly towards providing a correct answer as quickly as possible, even if it might not be fully correct.
- Usually, this means an absolute maximum of 2 tool calls.
- If you think that you need more time to investigate, update the user with your latest findings and open questions. You can proceed if the user confirms.
</context_gathering>
```

### 2.1.2 加强探索深度

```xml
<persistence>
- You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user.
- Only terminate your turn when you are sure that the problem is solved.
- Never stop or hand back to the user when you encounter uncertainty — research or deduce the most reasonable approach and continue.
- Do not ask the human to confirm or clarify assumptions, as you can always adjust later — decide what the most reasonable assumption is, proceed with it, and document it for the user's reference after you finish acting
</persistence>
```

## 2.2 针对提示词本身

### 2.2.1 可重用提示

### 2.2.2 避免冗余和不明确

`解释提示工程的概念。保持解释简短，只有几句话，不要过于描述。`

- 简洁：以上只有几句话和不要过于描述产生了冗余
- 具体：只有几句话不够具体

`使用 2-3 句话向高中学生解释提示工程的概念。`✅

### 2.2.3 使用Markdown和XML设置消息格式

- Markdown标头和列表有助于标记提示的不同部分，并将层次结构传达给模型。
- XML标记可以帮助描述一段内容（如用于参考的支持文档）的开始和结束位置。
  通常可以按次顺序排列
- Identity（身份）
  描述助理的目的、沟通方式和高级目标。
  尽可能告诉大模型应该遵循什么规则、**应该做什么**、遇到不该做的事时应该怎么做，尽可能不要告诉大模型不应该做什么
- Examples（示例）
- Context（上下文）
  为模型提供生成响应可能需要的任何其他信息

```markdown file=example.md
# 身份

你是一个帮助强制在JavaScript代码中使用蛇形命名法的代码助手，并且编写的代码将在IE6中运行

# Instructions

- 当定义变量时，使用蛇形命名法的名称（例如：my_variable），绝对不要使用驼峰命名法（例如：myVariable）
- 为了支持旧的浏览器，使用老式关键字"var"声明变量
- 仅仅返回请求的代码，绝对不要使用Markdown格式回复

# Examples

<user_query>
我怎样声明一个姓名字符串变量？
</user_query>

<assistant_response>
var first_name = "Anna";
</assistant_response>

# Context
```

> [!note]
> 将这部分会重复出现的内容根据不同厂商的缓存机制传递给大模型，最大限度地节省成本和延迟。

## 2.3 提示技术

### 2.3.1 少样本提示

> [!tip] 在提示中包含可生成响应的其他上下文信息，但是需要注意规划上下文窗口

- 提示词前有帮助模型响应结果的少量例子
- [RAG](../index.md#^78c0f5)
- 内置文件搜索工具

以下是进行少样本学习时关于演示/范例的一些额外提示：[@minRethinkingRoleDemonstrations2022]

- 标签空间和演示指定的输入文本的**分布**都很重要（即便有部分输入错误）
- 使用的**格式**对性能有关键作用（即使使用随机标签也比没有标签好）
- 从真实标签分布（而不是均匀分布）中选择**随机标签**也有帮助

> [!warning] 少样本提示可能在模型能力不足时难以完成任务，这时需要考虑微调或者下面👇更高级的提示技术。

### 2.3.2 链式思考（CoT）提示

#### 2.3.2.1 零样本CoT

> [!quote] 参考文献
> 论文：[@kojimaLargeLanguageModels2023]

> [!note]
> 提示词后面添加“_让我们逐步思考_”即可启用零样本CoT

#### 2.3.2.2 自动思维链（Auto-CoT）

> [!quote] 参考文献
> 论文：[@zhangAutomaticChainThought2022a]
> 开源项目：[https://github.com/amazon-science/auto-cot](https://github.com/amazon-science/auto-cot)

> [!note]
> 利用LLMs“_让我们一步一步地思考_”提示来生成一个接一个的推理链，减少人工设计问题。

Auto-CoT主要由两个阶段组成：

- 问题聚类：将给定数据集的问题划分为几个簇
- 演示采样：从每个簇中选择一个代表性问题，并使用简单的启发式规则通过Zero-Shot-CoT生成推理链

> [!warning] 存在的问题：需要把问题一并输入到大模型。聚类问题太少，思维链的多样性不够；聚类问题太多，提示词太长，效率低

### 2.3.3 自我一致性

> [!quote] 参考文献
> 论文：[@wangSelfconsistencyImprovesChain2023a]

> [!note]
> 自我一致性旨在“使用语言模型解码器替换链式思维提示中使用的天真贪婪解码方法”

![](assets/1%20concept%20&%20principles/self-consistant.png)

自我一致性包含三步：

- 使用模型的链式思考（CoT）提示方法
- 把链式思考（CoT）中的贪婪解码器（greedy decode）替换为**语言模型（Language model）的解码器**去生成多样化的推理路径集
- 在最终答案集中选择**出现次数最多**的答案
  优点：
- 更加简单，完全无监督的完成
- 仅使用一个language model

### 2.3.4 生成知识提示

> [!quote] 参考文献
> 论文：[@liuGeneratedKnowledgePrompting2022a]

> [!note]
> 通过大模型的“_回忆_”短暂提升大模型在当前问题方面知识的权重

![](assets/1%20concept%20&%20principles/generate-knowledge-prompt.png)

### 2.3.5 链式提示

> [!note]
> 将任务分解为许多子任务，确定子任务后，将子任务的提示词提供给语言模型，得到得到的结果作为新的提示词的一部分。

- 可以完成复杂任务
- 提高性能
- 提高LLM应用的透明度，增加控制性和可靠性
  链式调用类似装饰器模式，下图进行了三次链式调用：

![](assets/1%20concept%20&%20principles/CoT-prompt.png)

### 2.3.6 思维树（ToT）

> [!note]
> 利用多轮对话搜索树的方式，让LLM对推理过程中的中间思维进行评估

- 深度优先搜索(DFS)/广度优先搜索(BFS)/集束搜索(Beam)是通用搜索策略，不依赖于具体问题。[@yaoTreeThoughtsDeliberate2023a]
- 采用强化学习训练出ToT控制器可以从新的数据集中不断学习新的知识。[@longLargeLanguageModel2023]

![](assets/1%20concept%20&%20principles/think-chain-tree.png)

可以通过以下prompt指导LLM在推理过程中对中间思维进行评估，具体prompt详见：[https://github.com/dave1010/tree-of-thought-prompting](https://github.com/dave1010/tree-of-thought-prompting)

```txt file=ToT_prompt.txt
假设三位不同的专家来回答这个问题。
所有专家都写下他们思考这个问题的第一个步骤，然后与大家分享。
然后，所有专家都写下他们思考的下一个步骤并分享。
以此类推，直到所有专家写完他们思考的所有步骤。
只要大家发现有专家的步骤出错了，就让这位专家离开。
请问...
```

### 2.3.7 Active-Prompt

> [!quote] 参考文献
> 论文：[@diaoActivePromptingChainofthought2024]

> [!note]
> 背景：思维链（CoT）方法依赖于一组固定的人工注释范例，针对不同的任务这些范例可能不是的最有效示例。
> 目的：使用未标注数据让大模型自动生成适应任务的示例，让人类注释最不确定的示例，在一定程度上减少人类在Prompt上的工作量。

四步工作流程：

- 不确定性评估
  - 使用携带或者不携带人类编写的示例的链式思考
  - 查询大模型k次生成一组训练问题的中间步骤的可能的答案
  - 通过不确定的量度基于k个答案计算u
- 选择
  - 根据不确定性，选择出最不确定的问题用来注释
- 注释
  - 让人类注释已经选出来的问题
- 推理
  - 使用注释好的问题输入给大模型进行推理

![](assets/1%20concept%20&%20principles/think-chain.png)

### 2.3.8 方向性刺激提示（Directional Stimulus Prompt DSP）

> [!quote] 参考文献
> 论文：[@liGuidingLargeLanguage2023]

> [!note]
> 采用小型可调策略模型为每个输入实例生成辅助定向刺激提示

### 2.3.9 程序语言辅助模型（Program-aided Language Models PAL）

> [!quote] 参考文献
> 论文：[@gaoPALProgramaidedLanguage2023]

> [!note]
> 使用LLMs为每个输入实例生成程序（而不再是自然语言）作为中间推理步骤

### 2.3.10 ReAct框架

> [!quote] 参考文献
> 论文：[@yaoReActSynergizingReasoning2023]

> [!note]
> 在有限循环中进行推理+行动验证结合的协同框架（实践是检验真理的唯一标准😄）

- 推理跟踪帮助模型诱导、跟踪、更新行动计划和处理异常
- 行动允许与外部来源（如知识库或环境）交互并收集信息

![](assets/1%20concept%20&%20principles/ReAct.png)

#### 2.3.10.1 在知识密集型任务上的表现结果

|           知识密集型推理任务            |               知识验证任务               |
| :-------------------------------------: | :--------------------------------------: |
| [HotPotQA](https://hotpotqa.github.io/) | [Fever](https://fever.ai/resources.html) |

- CoT存在事实幻觉的问题
- ReAct的结构性约束降低了他在制定推理步骤方面的灵活性
- ReAct在很大程度上依赖于正在检索的信息；非信息性搜索结果阻碍了模型推理，导致难以恢复和重新形成思想

#### 2.3.10.2 在决策性任务上的表现结果

|             基于文本的游戏              | 在线购物网站环境                           |
| :-------------------------------------: | ------------------------------------------ |
| [ALFWorld](https://alfworld.github.io/) | [WebShop](https://webshop-pnlp.github.io/) |

ReAct优于Act，但是与人类专家相差甚远

### 2.3.11 自我反思（Reflexion）

> [!quote] 参考文献
> 论文：[@shinnReflexionLanguageAgents2023]

> [!note]
> 把环境中二进制或标量反馈转换成文本摘要以语言反馈的方式为大模型提供具体的改进方向的方法

Reflexion中包含三个角色：

- Actor：生成必要的文本（text）和基于环境状态的动作（actions）的LLM
- Evaluator：评估Actor生成的输出的质量，以Actor的轨迹为输入并计算一个奖励分数
- Self-Reflection Model：以当前轨迹及奖励信号为输入，自我反思模型会生成细致入微的具体反馈并存储在代理内存（mem）中

工作流程：

- Actor通过与环境交互生成轨迹，Evaluator生成一个分数（提升特定任务表现的标量奖励值）
- 自我反思模型分析轨迹和分数生成存储在内存中的摘要
- Actor、Evaluator和Self-Reflection模型在循环中通过试验（trial）协同工作，直到Evaluator认为Actor生成的轨迹正确为止

![](assets/1%20concept%20&%20principles/Reflexion.png)

### 2.3.12 上下文学习（In-context learning ICL）

> [!quote] 参考文献
> 论文：[@dherinLearningTrainingImplicit2025]

> [!note]
> 通过向量化提示词中相关的示例和指令，使大模型动态适应处理新任务

谷歌试图从理论和实证两个层面回答了在像模型提供示例的prompt后模型是在“学”还是在“模仿”或者“检索”：
Transformer架构中的注意力机制与神经网络（尤其是MLP）的组合，能够在推理阶段，通过处理上下文隐式地改变模型内部的行为方式。

### 2.3.13 基于图的提示

> [!note]
> 当前如何设计一个更通用的图预训练模型是一个难题

### 2.3.14 元提示（Meta Prompt）

> [!quote] 参考文献
> 论文：[@suzgunMetapromptingEnhancingLanguage2024]

- 把复杂的任务或问题分解成小的，可管理的片段
- 把这些片段带着正确且详细的指令分给特定的专家模型
- 审查这些专家模型间的交互
- 在这个过程中使用他们自己的思考、推理及验证

```txt file=prompt.txt
You are Meta-Expert, an extremely clever expert with the unique ability to collaborate with multiple experts (such as Expert
Problem Solver, Expert Mathematician, Expert Essayist, etc.) to tackle any task and solve any complex problems. Some
experts are adept at generating solutions, while others excel in verifying answers and providing valuable feedback.
Note that you also have special access to Expert Python, which has the unique ability to generate and execute Python code
given natural-language instructions. Expert Python is highly capable of crafting code to perform complex calculations when
given clear and precise directions. You might therefore want to use it especially for computational tasks.
As Meta-Expert, your role is to oversee the communication between the experts, effectively using their skills to answer a
given question while applying your own critical thinking and verification abilities.
To communicate with a expert, type its name (e.g., "Expert Linguist" or "Expert Puzzle Solver"), followed by a colon ":", and
then provide a detailed instruction enclosed within triple quotes. For example:
Expert Mathematician:
"""
You are a mathematics expert, specializing in the fields of geometry and algebra.
Compute the Euclidean distance between the points (-2, 5) and (3, 7).
"""
Ensure that your instructions are clear and unambiguous, and include all necessary information within the triple quotes. You
can also assign personas to the experts (e.g., "You are a physicist specialized in...").
Interact with only one expert at a time, and break complex problems into smaller, solvable tasks if needed. Each interaction
is treated as an isolated event, so include all relevant details in every call.
If you or an expert finds a mistake in another expert's solution, ask a new expert to review the details, compare both
solutions, and give feedback. You can request an expert to redo their calculations or work, using input from other experts.
Keep in mind that all experts, except yourself, have no memory! Therefore, always provide complete information in your
instructions when contacting them. Since experts can sometimes make errors, seek multiple opinions or independently
verify the solution if uncertain. Before providing a final answer, always consult an expert for confirmation. Ideally, obtain or
verify the final solution with two independent experts. However, aim to present your final answer within 15 rounds or fewer.
Refrain from repeating the very same questions to experts. Examine their responses carefully and seek clarification if
required, keeping in mind they don't recall past interactions.
Present the final answer as follows:
>> FINAL ANSWER:
"""
[final answer]
"""
For multiple-choice questions, select only one option. Each question has a unique answer, so analyze the provided
information carefully to determine the most accurate and appropriate response. Please present only one solution if you
come across multiple options.
```

### 2.3.15 自动推理并使用工具（ART）

> [!quote] 参考文献
> 论文：[@paranjapeARTAutomaticMultistep2023]

> [!note]
> 使用冻结的LLM（[冻结微调](../index.md#^2c7796)）自动生成包含中间推理步骤的程序。

ART（Auto Reasoning and Tool-use）的工作流程如下：

- 接到一个新任务的时候，从任务库（tool library）中选择多步推理和使用工具的示范。
- 调用任务库（tool library）中的工具时，暂停LLM生成，工具输出整合后LLM继续生成输出
- （可选）人类可以编辑分解步骤来提升性能

![](assets/1%20concept%20&%20principles/extract-task.png)

### 2.3.16 自动提示工程（自动优化提示）

#### 2.3.16.1 自动提示工程（Auto Prompt Engineer APE）

> [!quote] 参考文献
> 论文：[@zhouLargeLanguageModels2023]

> [!note]
> 自动指令生成和选择的系统。指令生成问题被构建为自然语言和成问题，使用LLMs作为黑盒优化问题的解决方案来生成和搜索候选解。

APE工作流程：

- 推理LLM基于输入输出演示（demonstrations）为当前任务自动**生成多个候选指令**
- 对这些候选指令**计算评估分数**
- 使用基于语义相似性（semantic similarity）或递归方法**优化**候选指令
- 再评分，最终**选择得分最高的提示**

![](assets/1%20concept%20&%20principles/APE.png)

APE发现了一个比人工设计的“让我们一步一步地思考”提示更好的零样本CoT提示“_让我们一步一步地解决问题，以确保我们有正确的答案_”

> [!quote] 更多参考文献
>
> - [【Prompt高手之路】提示词技术进阶——自动提示词工程](https://www.perozs.top/posts/prompt-advancement.html)
> - [带头实现APE](https://mp.weixin.qq.com/s/TxzkRUPhsiqtLhCyrIsQrQ)
> - Prompt-OIRL - 使用离线逆强化学习来**生成与查询相关的提示**[@sunQuerydependentPromptEvaluation2024]
> - OPRO - 引入使用**LLMs优化提示**的思想：让LLMs“深呼吸”提高数学问题的表现[@yangLargeLanguageModels2024]
> - AutoPrompt - 提出了一种基于梯度引导搜索的方法，用于**自动创建各种任务的提示**[@shinAutoPromptElicitingKnowledge2020]
> - Prefix Tuning - 一种轻量级的**fine-tuing替代**方案，为NLG任务添加可训练的连续前缀[@liPrefixtuningOptimizingContinuous2021]
> - Prompt Tuning - 提出了一种通过**反向传播学习软提示**的机制[@lesterPowerScaleParameterefficient2021]

#### 2.3.16.2 即插即用APE系统（Plug And Play APE System PAS）

> [!quote] 参考文献
> 论文： [@zhengPASDataefficientPlugandplay2024a]
> PAS实现：[https://github.com/PKU-Baichuan-MLSystemLab/PAS](https://github.com/PKU-Baichuan-MLSystemLab/PAS)

PAS分为三个阶段，前两个为主要阶段：`

- 选择高质量提示词
  - 使用嵌入模型从提示词中**提取特征值**
  - 使用cluster算法对相似的提示词做**分组和去重**
  - 使用LLMs**选择高质量的提示词**
  - 把高质量提示词**分类**到不同的目录。
- 自动生成补充提示词
  - 使用少样本学习（Few-Shot Learning）技术基于黄金数据（Golden Dataset）**生成**新的提示-补充提示对。
  - **筛选和再生成**
    - 正确性验证（Correctness Check）：每对提示-补充提示对经过少样本学习技术的评估，检查是否符合要求，不符合则会从生成的数据集中移除
    - 再生成（Regeneration）：对于错误的提示-补充对，系统继续使用少样本学习技术重新生成补充提示，直到生成符合标准的正确提示对为止。
- 大模型微调
  - 高质量的提示词用于微调大模型

![](assets/1%20concept%20&%20principles/PAS.png)

### 2.3.17 多模态提示方法

#### 2.3.17.1 多模态思维链提示方法

> [!quote] 参考文献
> 论文：[@zhangMultimodalChainofthoughtReasoning2024]
> 更多：[@huangLanguageNotAll2023]

多模态思维连提示将文本和视觉融入到一个二阶段框架中：

- 涉及基于多模态信息的理性生成
- 利用生成的理性信息做答案推理

更多参考资料：

- [涂津豪 https://github.com/richards199999/Thinking-Claude](https://github.com/richards199999/Thinking-Claude)
- [提示词库 https://github.com/f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)

## 2.4 抑制幻觉

### 2.4.1 引用生成（Citation Generation）

> [!tip] 提示LLM对每个句子和段落引用相关文献

```txt file=system_prompt
Cite your sources at the end of each sentence using [1], [2], etc.
```

|                          优点                          |        缺点        |
| :----------------------------------------------------: | :----------------: |
| 一定程度上减少幻觉，更多地可以让用户检查该内容是否正确 | 大模型可能虚构引用 |

### 2.4.2 上下文引用（Context Cite）

工作流程：

- 生成给定上下文（context）和查询（query）的响应（可以使用[2 RAG（Retrieval Augmented Generation 检索增强生成）](2%20RAG（Retrieval%20Augmented%20Generation%20检索增强生成）.md)保证相关性和正确性）
- 评估在响应上进行上下文消融产生的影响： 记录使用不同（随机）消融掩码$m_{i}$处理原始响应后得到的概率
  - $Pr(\text{Original response} | \text{Ablate}(\text{document}, m_{i}), \text{Original query})$
- 拟合线性代理模型：输出$f(m)$预测了对于上下文掩码$m$的ground-truth尺度缩放（logit-scaled）概率
  - logit-scaled：$\text{logit P}(\text{Original response}|\text{Ablate}(\text{document}, m), \text{Origianl query})$
  - $m$：作为输入的消融掩码
  - $w$：上下文中每个来源的重要性

$$f(m) = w^Tm + b$$

> [!quote] 消融实验（Ablation study）
> **去除系统中的某个特定模块来探究这个模块对于系统的作用——控制变量法**
> 针对一些无法去除的变量（超参数），控制系统其他方面不变，测试**一组**超参数来研究这个参数对于系统的影响

### 2.4.3 评估引用质量的方法

ALCE Benchmark在三个方面评估引用质量：

- Fluency：生成的文本有多清晰
- Correctness：生成的内容有多准确
- Citation Quality：生成的引用和正确的来源的契合度
