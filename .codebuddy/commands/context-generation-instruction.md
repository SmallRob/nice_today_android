# Context Generation Instruction

## Purpose
This instruction guides the AI model to generate context for the current workspace using Context Builder toolset.

## Steps to Generate Context

### 1. Initialize Context Directory
Create the `.asdm/contexts/` directory in the workspace root if it doesn't exist.

### 2. Generate Context Files
Generate the following context files in `.asdm/contexts/` directory using the corresponding templates:

1. **asdm.index.md** - Workspace index and guide
2. **asdm.standard-project-structure.md** - Standard project structure
3. **asdm.standard-coding-style.md** - Standard coding style
4. **asdm.data-models.md** - Data models and relationships
5. **asdm.deployment.md** - Deployment configuration
6. **asdm.api.md** - API definitions and documentation
7. **asdm.architecture.md** - Architecture overview

### 3. Analyze Current Workspace
Before generating context, analyze the current workspace to understand:
- Technology stack and frameworks
- Project structure and organization
- Existing code patterns and conventions
- Data models and database schemas
- API endpoints and documentation
- Deployment configuration and environment

### 4. Use Templates
Use the templates from `templates/` directory as starting points, but customize them based on the actual workspace analysis.

### 5. Include Mermaid Diagrams
Where applicable, include mermaid diagrams for:
- Entity relationship diagrams
- Class diagrams
- Sequence diagrams
- Deployment diagrams
- Architecture diagrams

### 6. Provide Sample Data
For API definitions, include sample request/response data.

### 7. Link to Source Code
Include links to relevant source code files for detailed reference.

## Usage
To use this instruction, simply follow the steps above. The AI model should analyze the workspace and generate comprehensive context files that can be used by other toolsets through context injection.