# Context Update Instruction

## Purpose
This instruction guides the AI model to update existing context for the current workspace when changes occur.

## When to Update Context
Update context when:
- New files or directories are added/removed
- Technology stack changes (new frameworks, libraries, tools)
- Data models are modified
- API endpoints are added/changed/removed
- Deployment configuration changes
- Architecture evolves
- Coding standards are updated

## Steps to Update Context

### 1. Check Existing Context
Review existing context files in `.asdm/contexts/` directory to understand current state.

### 2. Analyze Changes
Analyze what has changed in the workspace since the last context generation:
- Compare current workspace structure with documented structure
- Identify new/modified files and directories
- Detect changes in dependencies and configurations
- Review updated code patterns and conventions

### 3. Update Specific Context Files
Update only the context files that are affected by the changes:

#### For structural changes:
- Update `asdm.index.md` with new file tree and comments
- Update `asdm.standard-project-structure.md` if project organization changed

#### For technology changes:
- Update `asdm.index.md` technology stack section
- Update `asdm.standard-coding-style.md` if coding standards changed

#### For data model changes:
- Update `asdm.data-models.md` with new/modified models
- Update diagrams and relationships

#### For API changes:
- Update `asdm.api.md` with new/modified endpoints
- Update sample data and documentation

#### For deployment changes:
- Update `asdm.deployment.md` with new configuration
- Update deployment diagrams

#### For architecture changes:
- Update `asdm.architecture.md` with new architectural decisions
- Update architecture diagrams

### 4. Maintain Consistency
Ensure all context files remain consistent with each other:
- Cross-references between files should be accurate
- Terminology should be consistent
- Diagrams should reflect current state

### 5. Version Context
Consider adding version information or change logs to context files to track updates.

## Usage
To use this instruction, analyze what has changed in the workspace and update the corresponding context files. Focus on incremental updates rather than regenerating everything from scratch.