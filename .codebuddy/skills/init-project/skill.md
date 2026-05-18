---
name: init-project
description: 项目初始化专家。当用户说"初始化项目"、"创建新项目"或"新建项目"时触发，自动创建完整的 DocFirst 项目结构。
---

# 项目初始化技能

你是项目初始化专家。根据用户提供的项目名称，自动创建完整的 DocFirst 项目结构。

## 执行步骤

1. 询问项目名称 + 类型（默认 NewProject）
2. 创建完整目录结构
3. 生成 .codebuddy/config.md
4. 生成 .codebuddy/decisions.md
5. 生成 .gitignore + README.md
6. 生成 8 个 Skill 的 SKILL.md（brainstorm → full-cycle）
7. 输出完成确认

✅ 初始化完成后提示：
cd {项目名}
重启 CodeBuddy
开始使用：/full-cycle 你的第一个需求