# ASDM 安装配置完成总结

## 安装日期
2026-01-07

## 已安装的工具集

### 1. Context Builder (v0.0.1)
- **工具集ID**: context-builder
- **描述**: 用于为工作区构建上下文的工具集
- **安装位置**: `.asdm/toolsets/context-builder/`
- **工作区**: `.asdm/contexts/`

### 2. Spec Builder for Agile Team (Standard version) (v0.0.1)
- **工具集ID**: spec-builder-agile-standard
- **描述**: 为使用敏捷方法的软件开发团队构建规范文档
- **安装位置**: `.asdm/toolsets/spec-builder-agile-standard/`
- **工作区**: `.asdm/specs/`

## 检测到的 Agentic Engine
- **提供商**: Tencent CodeBuddy
- **配置位置**: `.codebuddy/commands/`

## 已创建的命令

### Context Builder 命令
1. `context-generation-instruction.md` - 为工作区生成初始上下文
2. `context-update-instruction.md` - 更新工作区变化时的上下文

### Spec Builder 命令
1. `epic-prd-generation-instruction.md` - 为史诗构建 PRD 文档
2. `feature-prd-generation-instruction.md` - 基于史诗为功能构建 PRD 文档
3. `task-generation-instruction.md` - 为功能构建任务文档

## 使用方法

### 初始化 Context Builder
在工作区的 AI 助手中输入:
```
Follow the instructions in .codebuddy/commands/context-generation-instruction.md
```

### 更新上下文
```
Follow the instructions in .codebuddy/commands/context-update-instruction.md
```

### 生成 Epic PRD
```
Follow the instructions in .codebuddy/commands/epic-prd-generation-instruction.md
```

### 生成 Feature PRD
```
Follow the instructions in .codebuddy/commands/feature-prd-generation-instruction.md
```

### 生成 Task 文档
```
Follow the instructions in .codebuddy/commands/task-generation-instruction.md
```

## 验证清单
- [x] 安装了 context-builder 工具集
- [x] 安装了 spec-builder-agile-standard 工具集
- [x] 创建了 .asdm/contexts/ 目录
- [x] 创建了 .asdm/specs/ 目录
- [x] 检测到 CodeBuddy 提供商
- [x] 创建了所有快捷命令
- [x] 所有模板文件都已就位

## 参考文档
- ASDM 官方文档: https://asdm.ai/docs
- Context Builder README: `.asdm/toolsets/context-builder/README.md`
- Spec Builder README: `.asdm/toolsets/spec-builder-agile-standard/README.md`
