# Feature PRD Generation Instruction

## Purpose
This instruction guides the AI model to generate a Product Requirements Document (PRD) for a feature based on an existing epic document.

## Command
`/feature-prd-generation-instruction {epic document path} {additional prompt for feature generation}`

## Input Requirements
- **Epic document path**: Path to an existing epic PRD document (e.g., `.asdm/specs/E001-user-registration-system/epic-prd.md`)
- **Additional prompt**: Description of the feature to generate
- **Optional**: Feature number or name if specified by user

## Template Reference
- **Template**: `.asdm/toolsets/spec-builder-agile-standard/templates/feature-prd-template.md`
- **Template variables**:
  - `{{feature_name}}`: Extracted from feature description or user input
  - `{{feature_description}}`: The provided feature description
  - `{{epic_name}}`: Extracted from the epic document
  - `{{current_date}}`: Current date in YYYY-MM-DD format
  - `{{author}}`: Inferred from git config or user context

## Processing Steps

### Step 1: Parse User Input
1. Extract the epic document path from the command input
2. Extract the feature description from the additional prompt
3. Parse any optional parameters (feature number, priority, etc.)
4. Validate that both inputs are provided and valid

### Step 2: Load Epic Document
1. Read and parse the epic PRD document from the provided path
2. Extract key information from the epic:
   - Epic name and number
   - Business objectives
   - User stories
   - Scope definition
   - Technical considerations
3. Verify the epic document is valid and complete

### Step 3: Load Template
1. Read the feature PRD template from `.asdm/toolsets/spec-builder-agile-standard/templates/feature-prd-template.md`
2. Understand the template structure and required sections
3. Identify placeholder variables that need to be replaced

### Step 4: Generate Feature Information
1. Analyze the feature description to extract key themes
2. Generate a concise, descriptive feature name
3. Create a feature number if not provided (format: E001F001, E001F002, etc.)
4. Generate feature folder name: `{feature-number}_{feature-name}`

### Step 5: Create Directory Structure
1. Navigate to the epic directory based on the epic document path
2. Create feature directory: `{feature-number}_{feature-name}/`
3. Ensure the directory structure is correct:
   - `.asdm/specs/{epic-number}_{epic-name}/{feature-number}_{feature-name}/`

### Step 6: Apply Context (Required)
1. **Load context from context-builder**: Access context data from `.asdm/contexts/` directory
2. **Integrate project context**: Use context to ground the feature PRD in the actual codebase:
   - Codebase architecture and patterns
   - Existing component libraries and frameworks
   - Team development standards and conventions
   - Deployment processes and infrastructure
   - Compliance and security requirements
3. **Validate context availability**: If context-builder is not installed or context is missing:
   - Notify user that context integration is limited
   - Proceed with available information
   - Mark areas where context would improve the document

### Step 7: Populate Template with Epic Context
1. Replace template variables with epic information:
   - `{{epic_name}}` → Epic name from epic document
   - References to parent epic sections
2. Integrate relevant epic content:
   - Business objectives that this feature supports
   - User stories that this feature implements
   - Technical considerations that apply
3. **Apply context to epic integration**: Use loaded context to ensure epic integration is technically accurate

### Step 8: Populate Template with Feature Details
1. Replace template variables with feature information:
   - `{{feature_name}}` → Generated feature name
   - `{{feature_description}}` → User-provided feature description
   - `{{current_date}}` → Current date
   - `{{author}}` → Current user or system author
2. Expand each section based on the feature description **AND loaded context**:
   - **Functional Requirements**: Detailed requirements grounded in actual codebase capabilities
   - **User Stories**: Specific user stories that align with existing user patterns
   - **UI/UX Specifications**: Interface requirements using existing design system components
   - **Technical Specifications**: Implementation details based on actual architecture

### Step 9: Ensure Consistency with Epic and Context
1. Verify that the feature aligns with epic scope **and technical context**
2. Ensure feature objectives support epic business objectives **and are technically feasible**
3. Check that feature user stories trace back to epic user stories **and existing user flows**
4. Validate technical consistency with epic considerations **and actual codebase constraints**

### Step 10: Quality Checks
1. **Completeness check**: Ensure all template sections are populated
2. **Consistency check**: Verify alignment with parent epic
3. **Clarity check**: Ensure requirements are clear and testable
4. **Technical feasibility check**: Verify requirements can be implemented
5. **Dependency check**: Identify dependencies on other features

### Step 11: Save Document
1. Save the generated feature PRD to: `.asdm/specs/{epic-number}_{epic-name}/{feature-number}_{feature-name}/feature-prd.md`
2. Use proper file naming convention: `feature-prd.md`
3. Ensure file permissions are set correctly

### Step 12: Create Supporting Structure
1. Create placeholder for tasks directory if needed
2. Update epic README or index to include this feature
3. Create any necessary configuration files

## Output Specifications

### File Location
`.asdm/specs/{epic-number}_{epic-name}/{feature-number}_{feature-name}/feature-prd.md`

### File Format
- Markdown format with proper headers and sections
- Includes all template sections with populated content
- Contains metadata header with references to parent epic
- Proper cross-references to epic document sections

### Content Requirements
1. **Epic Alignment**: Must clearly support parent epic objectives
2. **Completeness**: All template sections must be meaningfully populated
3. **Specificity**: Requirements must be specific and testable
4. **Technical Detail**: Must include sufficient technical specifications
5. **Traceability**: Must trace back to epic user stories and objectives

## Quality Assurance

### Before Completion
1. Verify the feature directory is within the correct epic directory
2. Confirm the feature PRD references the parent epic correctly
3. Check that all template variables are replaced
4. Validate that requirements are specific and actionable

### After Completion
1. Provide summary to the user:
   - Feature name and number
   - Location of generated feature PRD
   - Parent epic reference
   - Key requirements included
   - Next steps (task generation)
2. Offer to generate tasks from this feature PRD

## Error Handling

### Common Issues and Solutions
1. **Epic document not found**:
   - Verify the path is correct
   - Suggest using absolute path if relative path fails
   
2. **Epic document incomplete**:
   - Proceed with available information
   - Mark missing dependencies as TODO
   
3. **Feature description too vague**:
   - Ask user for more details
   - Generate placeholder content with clarification requests
   
4. **Directory creation failed**:
   - Check parent directory permissions
   - Suggest manual directory creation

## Examples

### Input Example
```
/feature-prd-generation-instruction .asdm/specs/E001-user-registration-system/epic-prd.md "Implement email-based user registration with email verification, password requirements, and account activation flow"
```

### Output Summary
```
Generated feature PRD: E001F001-email-registration
Location: .asdm/specs/E001-user-registration-system/E001F001-email-registration/feature-prd.md
Parent Epic: E001-user-registration-system
Sections: Feature Overview, Functional Requirements, UI/UX Specifications, Technical Specifications
Next: Use /task-generation-instruction to create tasks from this feature
```

## Integration Points

### With Epic PRD
- References parent epic sections
- Aligns with epic business objectives
- Implements epic user stories
- Respects epic scope boundaries

### With Context Builder
- Uses project-specific patterns
- References existing components
- Follows team standards
- Integrates with deployment processes

### With Task Generation
- Provides clear requirements for task breakdown
- Includes technical specifications for implementation
- Defines acceptance criteria for verification

## Notes
- The quality of the generated feature PRD depends on both the epic document and the feature description
- Features should be scoped appropriately (typically 1-2 weeks of development work)
- Users should review feature PRDs for technical feasibility before task breakdown
- The instruction can be extended to support multiple features from a single epic