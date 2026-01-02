## ADDED Requirements
### Requirement: Shaoyong Algorithm Module
The system SHALL provide a dedicated module for Shaoyong Yixue calculations that is separate from UI components.

#### Scenario: Algorithm module import
- **WHEN** a component needs to perform Shaoyong calculations
- **THEN** it can import the algorithm module without UI dependencies

### Requirement: Responsive Shaoyong UI
The system SHALL render Shaoyong components responsively across mobile and desktop devices using Tailwind CSS.

#### Scenario: Mobile Shaoyong display
- **WHEN** user accesses Shaoyong features on a mobile device
- **THEN** the UI adapts to the smaller screen size appropriately

### Requirement: Theme Consistency
The system SHALL maintain consistent theming across all Shaoyong components.

#### Scenario: Theme application
- **WHEN** user switches between light/dark themes
- **THEN** Shaoyong components update to reflect the new theme

## MODIFIED Requirements
### Requirement: Shaoyong Calculation Process
The Shaoyong Yixue calculation process MUST be available as pure functions in a dedicated utility module rather than embedded within UI components.

#### Scenario: Calculation from utility module
- **WHEN** calculation is needed
- **THEN** the utility module function is called directly
- **AND** UI components remain decoupled from algorithmic logic

## REMOVED Requirements
### Requirement: Embedded Algorithm Logic
**Reason**: Algorithm logic will be extracted to a dedicated module
**Migration**: Components will import and use the new algorithm module