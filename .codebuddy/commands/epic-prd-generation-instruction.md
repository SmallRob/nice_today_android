# Epic PRD Generation Instruction

## Purpose
This instruction guides the AI model to generate a Product Requirements Document (PRD) for an epic using the epic PRD template.

## Command
`/epic-prd-generation-instruction {epic description}`

## Input Requirements
- **Epic description**: A textual description of the epic provided by the user
- **Optional context**: Additional context from the workspace (loaded via context-builder if available)

## Template Reference
- **Template**: `.asdm/toolsets/spec-builder-agile-standard/templates/epic-prd-template.md`
- **Template variables**: 
  - `{{epic_name}}`: Extracted from epic description or user input
  - `{{epic_description}}`: The provided epic description
  - `{{current_date}}`: Current date in YYYY-MM-DD format
  - `{{author}}`: Inferred from git config or user context

## Processing Steps

### Step 1: Parse User Input
1. Extract the epic description from the command input
2. If the input contains additional parameters (e.g., epic name, priority), parse them separately
3. Validate that the epic description is sufficiently detailed (at least 2-3 sentences)

### Step 2: Load Template
1. Read the epic PRD template from `.asdm/toolsets/spec-builder-agile-standard/templates/epic-prd-template.md`
2. Understand the template structure and required sections
3. Identify placeholder variables that need to be replaced

### Step 3: Generate Epic Name
1. Analyze the epic description to extract key themes
2. Generate a concise, descriptive epic name (e.g., "User Registration System")
3. Create an epic number if not provided (format: E001, E002, etc.)
4. Combine epic number and name for folder naming (e.g., "E001_user-registration-system")

### Step 4: Create Directory Structure
1. Create the epic directory: `.asdm/specs/{epic-number}_{epic-name}/`
2. Ensure the `.asdm/specs` directory exists, create if necessary
3. Set up proper permissions for the directory

### Step 5: Apply Context (Required)
1. **Load context from context-builder**: Access context data from `.asdm/contexts/` directory
2. **Integrate project context**: Use context to ground the epic PRD in the actual project:
   - Project-specific terminology and domain language
   - Existing architecture patterns and technical constraints
   - Team processes, standards, and workflows
   - Compliance, security, and regulatory requirements
   - Existing user personas and patterns
3. **Validate context availability**: If context-builder is not installed or context is missing:
   - Notify user that context integration is limited
   - Proceed with available information
   - Mark areas where context would improve accuracy

### Step 6: Populate Template with Context
1. Replace template variables with actual values **informed by context**:
   - `{{epic_name}}` → Generated epic name (aligned with project naming conventions)
   - `{{epic_description}}` → User-provided epic description (enhanced with domain knowledge)
   - `{{current_date}}` → Current date
   - `{{author}}` → Current user or system author
2. Expand each section of the template based on **epic description AND loaded context**:
   - **Business Objectives**: Extract objectives grounded in project business context
   - **User Stories**: Generate user stories based on actual user patterns and needs
   - **Scope**: Define in-scope and out-of-scope items considering technical constraints
   - **Technical Considerations**: Infer technical requirements based on actual architecture
   - **Success Metrics**: Define measurable success criteria aligned with project metrics

### Step 7: Enhance with AI Analysis and Context
1. Analyze the epic description **through the lens of project context** to identify implicit requirements
2. Add relevant sections that are important **for this specific project**:
   - Risks and mitigations specific to project environment
   - Dependencies on existing systems and teams
   - Timeline considerations based on team velocity
3. Ensure all sections are complete, coherent, **and contextually accurate**

### Step 8: Quality Checks
1. **Completeness check**: Ensure all template sections are populated
2. **Consistency check**: Verify terminology is consistent throughout
3. **Clarity check**: Ensure requirements are clear and unambiguous
4. **Actionability check**: Verify requirements can be implemented
5. **Formatting check**: Ensure proper markdown formatting

### Step 9: Save Document
1. Save the generated PRD to: `.asdm/specs/{epic-number}_{epic-name}/epic-prd.md`
2. Use proper file naming convention: `epic-prd.md`
3. Ensure file permissions are set correctly

### Step 10: Create Supporting Files
1. Create a `README.md` in the epic directory with basic information
2. Create placeholder directories for features:
   - `.asdm/specs/{epic-number}_{epic-name}/features/`
3. Update any index or catalog files if they exist

## Output Specifications

### File Location
`.asdm/specs/{epic-number}_{epic-name}/epic-prd.md`

### File Format
- Markdown format with proper headers and sections
- Includes all template sections with populated content
- Contains metadata header (date, author, status)

### Content Requirements
1. **Complete**: All template sections must be populated
2. **Consistent**: Terminology and style must be consistent
3. **Actionable**: Requirements must be implementable
4. **Measurable**: Success criteria must be quantifiable
5. **Traceable**: Requirements should be traceable to user needs

## Quality Assurance

### Before Completion
1. Verify the epic directory structure is correct
2. Confirm the PRD document is saved in the right location
3. Check that all template variables are replaced
4. Validate that the document is readable and well-structured

### After Completion
1. Provide summary to the user:
   - Epic name and number
   - Location of generated PRD
   - Key sections included
   - Next steps (feature generation)
2. Offer to generate features from the epic PRD

## Error Handling

### Common Issues and Solutions
1. **Insufficient epic description**: 
   - Ask user for more details
   - Generate placeholder content with TODO markers
   
2. **Template not found**:
   - Use fallback template structure
   - Notify user about the issue
   
3. **Directory creation failed**:
   - Check permissions
   - Suggest alternative location
   
4. **Context loading failed**:
   - Proceed without context
   - Notify user that context integration is missing

## Examples

### Input Example
```
/epic-prd-generation-instruction Build a user registration system that allows users to sign up with email, social media accounts, and provides email verification. The system should support role-based access control and have admin dashboard for user management.
```

### Output Summary
```
Generated epic PRD: E001-user-registration-system
Location: .asdm/specs/E001-user-registration-system/epic-prd.md
Sections: Epic Overview, Business Objectives, User Stories, Scope, Technical Considerations, Success Metrics
Next: Use /feature-prd-generation-instruction to create features from this epic
```

## Notes
- This instruction assumes the AI model has access to the workspace and can create files
- The quality of the generated PRD depends on the detail provided in the epic description
- Users should review and refine the generated PRD before using it for development
- The instruction can be customized by team administrators to match specific processes