# Task Generation Instruction

## Purpose
This instruction guides the AI model to generate task documentation based on an existing feature document.

## Command
`/task-generation-instruction {feature document path} {additional prompt for task generation}`

## Input Requirements
- **Feature document path**: Path to an existing feature PRD document (e.g., `.asdm/specs/E001_user-registration-system/E001F001_email-registration/feature-prd.md`)
- **Additional prompt**: Description of the task to generate
- **Optional**: Task number, estimated effort, or assignee if specified

## Template Reference
- **Template**: `.asdm/toolsets/spec-builder-agile-standard/templates/task-template.md`
- **Template variables**:
  - `{{task_name}}`: Extracted from task description or user input
  - `{{task_description}}`: The provided task description
  - `{{feature_name}}`: Extracted from the feature document
  - `{{epic_name}}`: Extracted from the epic document (via feature document)
  - `{{current_date}}`: Current date in YYYY-MM-DD format
  - `{{author}}`: Inferred from git config or user context

## Processing Steps

### Step 1: Parse User Input
1. Extract the feature document path from the command input
2. Extract the task description from the additional prompt
3. Parse any optional parameters (task number, effort estimate, priority, etc.)
4. Validate that both inputs are provided and valid

### Step 2: Load Feature Document
1. Read and parse the feature PRD document from the provided path
2. Extract key information from the feature:
   - Feature name and number
   - Functional requirements
   - Technical specifications
   - UI/UX requirements
   - Acceptance criteria
3. Verify the feature document is valid and complete

### Step 3: Load Epic Context
1. Navigate up one directory to find the epic document
2. Read the epic PRD to extract epic-level context:
   - Epic name and number
   - Business objectives
   - Technical considerations
   - Success metrics
3. Establish the hierarchy: Epic → Feature → Task

### Step 4: Load Template
1. Read the task template from `.asdm/toolsets/spec-builder-agile-standard/templates/task-template.md`
2. Understand the template structure and required sections
3. Identify placeholder variables that need to be replaced

### Step 5: Generate Task Information
1. Analyze the task description to extract key elements
2. Generate a concise, descriptive task name
3. Create a task number if not provided (format: E001F001T001, E001F001T002, etc.)
4. Generate task filename: `{task-number}_{task-name}.md`

### Step 6: Determine Task Scope
1. Analyze the task description against feature requirements
2. Ensure the task is appropriately scoped (typically 1-3 days of work)
3. Break down complex tasks into subtasks if necessary
4. Identify dependencies on other tasks

### Step 7: Create Directory Structure
1. Navigate to the feature directory based on the feature document path
2. Ensure the task will be saved in the correct location:
   - `.asdm/specs/{epic-number}_{epic-name}/{feature-number}_{feature-name}/`

### Step 8: Apply Context (Required)
1. **Load context from context-builder**: Access context data from `.asdm/contexts/` directory
2. **Integrate project context**: Use context to ground the task in the actual codebase:
   - Codebase structure, architecture, and patterns
   - Existing APIs, libraries, and frameworks
   - Team coding standards and conventions
   - Deployment pipelines and infrastructure
   - Testing frameworks and practices
3. **Validate context availability**: If context-builder is not installed or context is missing:
   - Notify user that context integration is limited
   - Proceed with available information
   - Mark areas where context would provide specific implementation details

### Step 9: Populate Template with Context and Hierarchy
1. Replace template variables with hierarchy information **informed by context**:
   - `{{epic_name}}` → Epic name from epic document (contextualized)
   - `{{feature_name}}` → Feature name from feature document (contextualized)
   - References to parent feature and epic sections
2. Integrate relevant context from **parent documents AND codebase**:
   - Feature requirements that this task addresses
   - Technical specifications that apply **to this codebase**
   - Acceptance criteria to meet **using existing testing frameworks**

### Step 10: Populate Template with Task Details (Context-Grounded)
1. Replace template variables with task information:
   - `{{task_name}}` → Generated task name (aligned with project naming)
   - `{{task_description}}` → User-provided task description (enhanced with technical context)
   - `{{current_date}}` → Current date
   - `{{author}}` → Current user or system author
2. Expand each section based on **task description AND loaded context**:
   - **Implementation Details**: Specific code changes needed **based on actual codebase structure**
   - **Technical Specifications**: Detailed technical requirements **using existing patterns**
   - **Testing Requirements**: Verification steps **using existing test frameworks**
   - **Deployment Instructions**: How to deploy the changes **using existing pipelines**

### Step 10: Generate Implementation Steps
1. Break down the task into actionable steps
2. For each step, include:
   - Action to perform
   - Commands to run (if applicable)
   - Verification criteria
   - Estimated time
3. Ensure steps are sequential and logical

### Step 11: Add Technical Details (Context-Informed)
1. Specify exact code changes needed **based on codebase analysis**:
   - Files to modify **with actual file paths**
   - Functions to add/change **using existing patterns**
   - APIs to implement **consistent with existing API design**
   - Database changes required **following existing schema patterns**
2. Include code examples **that match project coding style**
3. Reference existing code patterns **from the actual codebase**

### Step 12: Define Testing Requirements (Context-Grounded)
1. Specify unit tests to write **using existing test frameworks**
2. Define integration test scenarios **based on actual system integration points**
3. List manual testing steps **aligned with team QA processes**
4. Include test data requirements **using existing data patterns**

### Step 13: Quality Checks (Context-Aware)
1. **Completeness check**: Ensure all template sections are populated **with contextually relevant content**
2. **Actionability check**: Verify steps are specific and actionable **within this codebase**
3. **Technical accuracy check**: Ensure technical details are correct **for this project**
4. **Test coverage check**: Verify testing requirements are adequate **for team standards**
5. **Dependency check**: Identify and document dependencies **on existing systems**

### Step 14: Save Document
1. Save the generated task to: `.asdm/specs/{epic-number}_{epic-name}/{feature-number}_{feature-name}/{task-number}_{task-name}.md`
2. Use proper file naming convention
3. Ensure file permissions are set correctly

### Step 15: Update Feature Documentation
1. Update feature README or index to include this task
2. Ensure task references are consistent
3. Update any task tracking files if they exist

## Output Specifications

### File Location
`.asdm/specs/{epic-number}_{epic-name}/{feature-number}_{feature-name}/{task-number}_{task-name}.md`

### File Format
- Markdown format with proper headers and sections
- Includes all template sections with populated content
- Contains metadata header with references to parent feature and epic
- Code blocks with proper syntax highlighting
- Actionable checklists for implementation

### Content Requirements
1. **Specificity**: Must provide exact implementation details
2. **Actionability**: Steps must be executable by a developer
3. **Completeness**: Must cover all aspects of the task
4. **Testability**: Must include verification criteria
5. **Traceability**: Must trace back to feature requirements

## Quality Assurance

### Before Completion
1. Verify the task is saved in the correct feature directory
2. Confirm the task references parent documents correctly
3. Check that implementation steps are specific and actionable
4. Validate that testing requirements are adequate

### After Completion
1. Provide summary to the user:
   - Task name and number
   - Location of generated task document
   - Parent feature and epic references
   - Estimated effort
   - Key implementation steps
2. Offer to generate additional tasks if needed

## Error Handling

### Common Issues and Solutions
1. **Feature document not found**:
   - Verify the path is correct
   - Check if epic document exists at expected location
   
2. **Task description too vague**:
   - Ask user for more specific details
   - Generate placeholder with clarification questions
   
3. **Task scope too large**:
   - Suggest breaking into multiple tasks
   - Provide guidance on appropriate task sizing
   
4. **Technical details unclear**:
   - Request clarification on implementation approach
   - Generate multiple implementation options

## Examples

### Input Example
```
/task-generation-instruction .asdm/specs/E001-user-registration-system/E001F001-email-registration/feature-prd.md "Create user registration API endpoint with email validation and password hashing"
```

### Output Summary
```
Generated task: E001F001T001-registration-api-endpoint
Location: .asdm/specs/E001-user-registration-system/E001F001-email-registration/E001F001T001-registration-api-endpoint.md
Parent Feature: E001F001-email-registration
Parent Epic: E001-user-registration-system
Estimated Effort: 8 hours
Key Steps: Create API endpoint, implement email validation, add password hashing, write tests
```

## Integration Points

### With Feature PRD
- Implements specific feature requirements
- References feature technical specifications
- Aligns with feature acceptance criteria
- Supports feature success metrics

### With Development Workflow
- Provides actionable steps for developers
- Includes testing requirements
- Specifies deployment procedures
- Supports code review process

### With Context Builder
- Uses codebase-specific patterns
- References existing APIs and components
- Follows team coding standards
- Integrates with CI/CD pipelines

## Task Sizing Guidelines

### Appropriate Task Size
- **Small**: 2-4 hours (bug fixes, minor changes)
- **Medium**: 4-16 hours (feature components, API endpoints)
- **Large**: 16-40 hours (complex features, integrations)

### When to Break Down Tasks
1. Task requires multiple distinct skills
2. Implementation spans multiple days
3. Multiple developers could work in parallel
4. Different testing approaches needed

## Notes
- Tasks should be sized for completion within a single sprint (typically 1-3 days)
- The AI model should use its knowledge of the codebase to provide specific implementation details
- Tasks should include both "what to do" and "how to verify it's done correctly"
- The instruction can be customized for different types of tasks (frontend, backend, infrastructure, etc.)