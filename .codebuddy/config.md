# DocFirst 项目配置

active_project: {项目名称}

项目列表:
- {项目名称} | {类型} | ./{项目名称}/

输出路径模板:
- brainstorm: ./docs/workflow/brainstorm/ → {需求名}_方案.md
- evaluate: ./docs/workflow/brainstorm/ → {方案名}_评估.md
- split-prd: ./docs/workflow/execution/ → node_tree.md
- gen-prd: ./docs/workflow/execution/ → {节点名称}_PRD.md
- checklist: ./docs/workflow/acceptance/ → {节点名称}_验收清单.md
- accept: ./docs/workflow/acceptance/ → {节点名称}_验收报告.md
- log-decision: ./docs/iterations/ → {日期}_{需求名}.md
- full-cycle: ./ → full_cycle_report.md

递归验收最大轮次: 3
默认优先级: P0
自动创建目录: 是
代码注释格式: // @doc: {node_id}