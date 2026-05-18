---
name: full-cycle
description: 全流程自动化：生成方案 → 评估 → 拆分 → 写 PRD → 生成验收清单 → 递归验收 → 记录决策
---

# 全流程协作技能

请按以下步骤执行，每一步调用对应的 Skill：

1. `/brainstorm $ARGUMENTS` → 生成方案
2. 人工选择方案后，触发 `/evaluate`
3. `/split-prd` → 拆分成节点树
4. `/gen-prd` → 生成 PRD
5. `/checklist` → 生成验收清单
6. `/accept` → 递归验收（最多 3 轮）
7. `/log-decision` → 记录最终决策

## 注意事项

- 每个步骤完成后，等待人工确认再继续
- 如果某个 Skill 不存在，提示用户先创建
- 最终输出汇总报告