# Feature Specification: Legal Process Summaries

**Feature Branch**: `001-legal-summaries`  
**Created**: March 17, 2026  
**Status**: Draft  
**Input**: User description: "Crie uma especificação para uma nova função no nosso projeto: os resumos dos processos juridicos que ficará na tela do modulo juridico"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Legal Process Registration (Priority: P1)

A user opens the juridico module and initiates the creation of a new legal process by uploading judicial documents. This is the foundational step where users feed the system with raw case data before AI analysis begins.

**Why this priority**: This is the entry point for the entire legal process workflow. Without the ability to register and upload processes, no subsequent analysis or summary generation can occur. This directly unblocks the core value proposition.

**Independent Test**: Can be fully tested by uploading a valid legal process document (PDF) and verifying that the process record is created with metadata before AI processing begins. Delivers value by establishing process records in the system.

**Acceptance Scenarios**:

1. **Given** a user is in the juridico module, **When** they click to create a new process and select a PDF document, **Then** the document is uploaded and a process registration form appears for selection of professional role (e.g., Perito/Assistente Técnico)
2. **Given** a user has selected a professional role and uploaded a document, **When** they confirm the registration, **Then** the system creates a process record and initiates AI analysis
3. **Given** a user uploads an unsupported file format, **When** they attempt to create the process, **Then** the system displays a clear error message indicating supported formats and prevents process creation

---

### User Story 2 - AI-Powered Document Analysis & Extraction (Priority: P1)

After process registration, the AI system automatically performs deep extraction of judicial documents, identifying critical information like parties, dates, deadlines, judges, and technical elements (quesitos).

**Why this priority**: This is the core differentiator of the feature. P1 because it's essential for generating all downstream summaries. Without successful AI extraction, the summaries will be incomplete or inaccurate.

**Independent Test**: Can be fully tested by verifying that AI extraction correctly identifies and indexes key entities (parties, dates, judges, quesitos) from an uploaded judicial document. Delivers value by making document information machine-readable and actionable.

**Acceptance Scenarios**:

1. **Given** a legal process has been registered, **When** the AI analysis completes, **Then** the system extracts and stores all parties, judges, procedural dates, and deadlines
2. **Given** a judicial document contains quesitos (technical questions), **When** AI analysis completes, **Then** all quesitos are identified and structured for easy reference
3. **Given** a document contains attached images, tables, or embedded data, **When** AI analysis processes the document, **Then** these elements are processed and their content is extracted for analysis
4. **Given** AI extraction encounters unclear or corrupted text, **When** extraction completes, **Then** the system flags ambiguous sections and provides confidence scores for user review

---

### User Story 3 - Executive Summary Dashboard (Priority: P1)

After AI analysis, the user sees a dynamic, summarized view of the legal process highlighting critical decisions and immediate action items needed for case strategy.

**Why this priority**: P1 because users need immediate visibility into case criticality. This summary enables rapid decision-making without reading entire documents, providing immediate business value.

**Independent Test**: Can be tested by verifying that an Executive Summary is generated and displayed with critical alerts, key dates, and decision points withinSeconds of analysis completion. Delivers value by enabling rapid case assessment.

**Acceptance Scenarios**:

1. **Given** a legal process has completed AI analysis, **When** the user views the process details, **Then** the Executive Summary displays key critical issues, upcoming deadlines, and immediate action items
2. **Given** the Executive Summary is displayed, **When** the user reviews it, **Then** critical dates are highlighted and differentiated from routine information
3. **Given** a process contains multiple defendant parties, **When** the Executive Summary is generated, **Then** it clearly identifies all parties and their key positions in the case

---

### User Story 3.5 - User Data Privacy & Access Control (Priority: P1)

Each user can only view and access legal processes that they personally uploaded. The system enforces strict data isolation to ensure sensitive judicial information is protected and only visible to the process owner.

**Why this priority**: P1 because data security and privacy are foundational. Without proper access isolation, sensitive judicial information could be exposed to unauthorized users, creating legal and compliance risks.

**Independent Test**: Can be tested by verifying that a user cannot see processes uploaded by other users, and that processes are properly isolated at the database level. Delivers value by ensuring data confidentiality and legal compliance.

**Acceptance Scenarios**:

1. **Given** User A uploads a legal process, **When** User B logs into the system, **Then** User B cannot see User A's process in any view, search results, or listing
2. **Given** User A views their process details, **When** User A reviews the data, **Then** all summaries and extracted information belongs exclusively to User A
3. **Given** a user attempts to access another user's process directly via URL or API, **When** the system processes the request, **Then** the system validates RLS permissions and blocks unauthorized access
4. **Given** User A uploads a process, **When** User A views their process list, **Then** the list shows only User A's processes and not processes from other users

---

### User Story 4 - Process Historical Summary & Chronology (Priority: P2)

The user can access a consolidated time-ordered summary of all major case events, including court proceedings, decisions, appeals, and relevant dates extracted from the judicial documents.

**Why this priority**: P2 because while important for complete case understanding, the executive summary (P1) provides immediate value first. This story enhances comprehension of case progression over time.

**Independent Test**: Can be tested independently by verifying that a chronological timeline of case events is generated and displayed accurately. Delivers value by providing structured case history without manual document review.

**Acceptance Scenarios**:

1. **Given** a legal process has completed AI analysis, **When** the user navigates to the Process Summary tab, **Then** a chronological timeline of major events is displayed in order
2. **Given** a process has multiple court decisions and appeals, **When** the Process Summary is viewed, **Then** all decisions and appeals are included with dates and outcomes
3. **Given** the chronology contains procedural deadlines, **When** the user reviews the summary, **Then** upcoming deadlines are visually distinguished from past events

---

### User Story 5 - Quesitos Management & Organization (Priority: P2)

The user can review all technical questions (quesitos) presented by parties, organized and ready to be addressed during the expert opinion or technical analysis phase.

**Why this priority**: P2 because while essential for expert analysis, it's secondary to understanding the overall case. This is independent of executive summary but required for the examining professional phase.

**Independent Test**: Can be tested by verifying that a complete, well-organized list of all quesitos extracted from the judicial document is generated and displayed. Delivers value by centralizing technical requirements for the expert professional.

**Acceptance Scenarios**:

1. **Given** a legal process contains quesitos from multiple parties, **When** the user views the Quesitos tab, **Then** all quesitos are listed and grouped by party/source
2. **Given** quesitos are displayed, **When** the user interacts with them, **Then** they can reference back to the source document location where each quesito appears
3. **Given** quesitos have dependencies or cross-references, **When** they are displayed, **Then** these relationships are visually indicated

---

### User Story 6 - Relevant Documents Triage & Categorization (Priority: P2)

The system identifies and curates relevant attachments and documents from the judicial process, categorizing them by document type with extracted metadata (dates, parties, key content) to streamline document review.

**Why this priority**: P2 because while important for comprehensive case analysis, executive summary and quesitos management are more immediately critical. Users can initially operate without deep document organization.

**Independent Test**: Can be tested by verifying that attached documents are identified, categorized by type, and displayed with extracted metadata. Delivers value by reducing manual document sorting time.

**Acceptance Scenarios**:

1. **Given** a legal process contains multiple attached documents, **When** the user views the Documents tab, **Then** documents are organized by category (e.g., Reports, Expert Opinions, Correspondence)
2. **Given** documents are displayed, **When** the user reviews a document, **Then** extracted metadata (date, parties mentioned, summary) is visible
3. **Given** some documents are marked as evidence or expert reports, **When** the system categorizes documents, **Then** these special classifications are highlighted

---

### User Story 7 - AI-Suggested Examinations & Diagnostics (Priority: P3)

Based on the damages claimed and case circumstances, the AI system suggests relevant examinations and forensic analyses that should be conducted during the expert phase to properly address the case.

**Why this priority**: P3 because while valuable for expert guidance, it's supplementary to case understanding. The examining professional may have domain expertise that supersedes these suggestions, so it's not critical to block case access.

**Independent Test**: Can be tested independently by verifying that examination suggestions are generated based on claimed damages and displayed to the user. Delivers value by providing AI-assisted diagnostic guidance.

**Acceptance Scenarios**:

1. **Given** a legal process describes specific damages or injuries, **When** AI analysis completes, **Then** relevant examination suggestions are generated and presented in the Suggested Exams section
2. **Given** suggested exams are displayed, **When** the user reviews them, **Then** each suggestion includes justification for why it's relevant to the case
3. **Given** some examinations are marked as critical vs. optional, **When** the user reviews suggestions, **Then** priority levels are visually distinguished

---

### User Story 8 - Kanban Processos Management (Priority: P1)

Users can view and manage legal processes through a Kanban board in the Juridico > Pipelines > Contencioso Cível view, with processes organized by workflow stages. The system supports initial stage selection during process creation and automatic AI-driven stage assignment based on document analysis. Users can manually move processes between stages using drag-and-drop interactions.

**Why this priority**: P1 because this enables effective case workflow management and provides visual organization of case status. Without kanban stage management, users cannot efficiently track and organize multiple cases through their lifecycle.

**Independent Test**: Can be fully tested by verifying that: (1) processes appear in the kanban view, (2) users can select initial stage during registration, (3) AI assigns appropriate stages post-analysis, (4) users can drag and drop processes between stages, (5) stage changes persist in the database.

**Acceptance Scenarios**:

1. **Given** a user navigates to Juridico > Pipelines > Contencioso Cível, **When** the view loads, **Then** processes are displayed in a Kanban board organized by workflow stages
2. **Given** a user is creating a new legal process, **When** during registration they reach the stage selection step, **Then** an input/dropdown displays all available kanban stages for them to select the initial stage (default: "Pendentes")
3. **Given** a user has selected an initial stage and confirmed process registration, **When** the process is created, **Then** it appears in the selected kanban stage
4. **Given** a legal process has completed AI analysis, **When** extraction identifies relevant case status indicators, **Then** the system automatically assigns the process to the appropriate kanban stage based on predefined decision criteria
5. **Given** a process is in any kanban stage, **When** a user clicks and drags the process card, **Then** they can move it to a different stage and the system updates the process status immediately
6. **Given** a user manually moves a process to a new stage, **When** the drag-and-drop operation completes, **Then** the new stage is persisted to the database and visible to the user

---

## Kanban Stages & AI Assignment Logic

The following stages comprise the legal process workflow in the Contencioso Cível kanban:

| Stage | Description | AI Auto-Assignment Criteria |
|-------|-------------|---------------------------|
| **Pendentes** | Process registered but not yet accepted or no clear progression indicators | Default initial stage; no specific indicators present |
| **Aceites** | Parties have confirmed or accepted the expert proceedings | Document contains explicit acceptance/confirmation from parties |
| **Perícia Agendada** | Expert examination has been scheduled with a defined date | Document specifies expertise appointment date and parties confirmed attendance |
| **Periciado Não Compareceu** | Expert or defendant failed to appear at scheduled examination | Document records absence/no-show at scheduled expertise examination |
| **Revisando Laudo/Impugnação** | Expert report (laudo) or expert opinion is under review, or parties have filed objections | Document shows expert report submission or objection/challenge filing |
| **Aguardando Manifestações** | Process is awaiting responses or statements from the parties | Document indicates pending party submissions or judicial request for manifestations |
| **Aguardando Pagamento** | Process payment is pending (expert fees, court costs, honorários, etc.) | Document references unpaid fees, pending payment requirement, or cost allocation |
| **Finalizado** | Case has concluded with judgment, settlement, or official closure | Document contains final judgment, court decision, settlement agreement, or case closure notice |
| **Não Realizado** | Expert proceedings were cancelled or did not occur | Document records cancellation, expert refusal, or proceeding termination |

**AI Assignment Decision Tree**: When AI analysis completes, it evaluates the latest identified case event or status indicator. The system scans the document in reverse chronological order to identify the most recent status update and assigns the stage accordingly. If multiple criteria are present, the system prioritizes the most recent temporal indicator.

---

### Edge Cases

- What happens when a PDF is corrupted or illegible during AI extraction?
- How does the system handle legal documents in languages other than Portuguese?
- What is the expected time for AI extraction to complete for very large documents (e.g., 500+ pages)?
- How does the system handle processes with no detailed supporting documents or minimal metadata?
- What happens if extraction quality is below a confidence threshold?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept PDF, JPG, PNG, and scanned image formats for legal process upload
- **FR-002**: System MUST extract and store the following entities from uploaded documents: parties, judges, dates, deadlines, quesitos, and document attachments
- **FR-003**: System MUST display a time estimate warning (5 minutes expected) before AI analysis begins, informing users of expected processing duration
- **FR-004**: System MUST display a chronological Process Summary of all major case events with accurate date sequencing
- **FR-005**: System MUST organize and list all quesitos (technical questions) presented by all parties in the judicial proceeding
- **FR-006**: System MUST categorize and display relevant documents with extracted metadata (type, date, parties involved, summarized content)
- **FR-007**: System MUST suggest relevant examinations based on the claimed damages and case circumstances
- **FR-008**: System MUST clearly highlight critical dates and deadlines to prevent missed procedural timelines
- **FR-009**: System MUST support user role selection during process registration (Perito, Assistente Técnico, etc.)
- **FR-010**: System MUST persist all extracted data and summaries for future access and reference
- **FR-011**: System MUST provide visual feedback (loading indicators, progress updates) during AI document analysis
- **FR-012**: System MUST handle extraction errors by blocking the process but allowing users to manually review and correct extraction results before finalizing the process
- **FR-013**: System MUST persist all extracted data and generated summaries to Supabase database following Supabase security best practices and Row Level Security (RLS) rules
- **FR-014**: System MUST establish security linkage between uploaded documents, generated summaries, and the user who uploaded the document
- **FR-015**: System MUST automatically populate the process name/number field by extracting the process identification from the judicial document during AI analysis
- **FR-016**: System MUST enforce RLS policies at the database level to ensure users cannot bypass UI restrictions and view other users' processes
- **FR-017**: System MUST persist all user-corrected extraction data to maintain data integrity and provide audit trail of corrections made
- **FR-018**: System MUST maintain an audit log of all data modifications and corrections for security compliance
- **FR-019**: System MUST display legal processes in a Kanban board view within Juridico > Pipelines > Contencioso Cível, organized by workflow stages
- **FR-020**: System MUST provide a stage selection input during process registration, allowing users to select the initial kanban stage (defaulting to "Pendentes")
- **FR-021**: System MUST support drag-and-drop functionality to move process cards between kanban stages, with immediate database persistence
- **FR-022**: System MUST automatically assign processes to appropriate kanban stages post-AI-analysis based on identified case status indicators from document extraction
- **FR-023**: System MUST implement AI stage assignment logic that evaluates document content and selects the most appropriate stage according to the decision criteria table (Aceites, Perícia Agendada, Periciado Não Compareceu, Revisando Laudo/Impugnação, Aguardando Manifestações, Aguardando Pagamento, Finalizado, Não Realizado, or Pendentes)
- **FR-024**: System MUST scan judicial documents in reverse chronological order to identify the most recent case status indicator for stage assignment
- **FR-025**: System MUST persist all kanban stage changes (both user-initiated drag-drop and AI-driven assignments) to the database with timestamp and audit trail
- **FR-026**: System MUST display all nine kanban stages in the Contencioso Cível board: Pendentes, Aceites, Perícia Agendada, Periciado Não Compareceu, Revisando Laudo/Impugnação, Aguardando Manifestações, Aguardando Pagamento, Finalizado, Não Realizado

### Key Entities

- **LegalProcess**: Represents a complete judicial case, containing process number, parties, type of action, registration date, professional role, status, and current kanban stage
- **JudicialDocument**: The uploaded PDF or document file associated with a process, with processing status and extraction metadata
- **Party**: A legal entity (person or organization) involved in the case, with role type and representative information
- **Quesito**: A technical question posed by a party to be addressed during expert analysis, with source reference
- **ProcessEvent**: A major procedural event or decision in the case timeline, with date and description
- **AttachedDocument**: Files referenced or attached within the judicial documents, with category and extracted metadata
- **ExtractionMetadata**: System-generated metadata about extraction quality, confidence scores, and processing results
- **KanbanStage**: Represents workflow stage in the Contencioso Cível kanban, with stage name, display order, and AI assignment criteria; tracks process movement history and audit trail

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can register a new legal process and upload a document in under 2 minutes
- **SC-002**: AI document analysis completes and presents summaries within 5 minutes for documents up to 200 pages
- **SC-003**: Executive Summary correctly identifies and displays critical information with 95% accuracy rate as validated against case facts
- **SC-004**: Quesito extraction successfully identifies 90% of all quesitos present in judicial documents
- **SC-005**: 85% of users can complete their primary task (case assessment and strategy planning) without requesting clarification or support
- **SC-006**: System handles 1000 concurrent process uploads without performance degradation
- **SC-007**: All procedural dates are extracted with 100% accuracy to prevent missed deadlines
- **SC-008**: Users report 40% reduction in time spent reading and organizing judicial documents compared to manual review
- **SC-009**: Chronological case summary is generated with 98% accuracy in event ordering
- **SC-010**: Document categorization accuracy reaches 90% (category assignment for attached documents)
- **SC-011**: All unauthorized access attempts are blocked at the RLS database level and logged for security audit trails
- **SC-012**: Users can create a process and assign initial kanban stage in under 30 seconds
- **SC-013**: Drag-and-drop stage transitions complete with zero latency (update visible immediately to user)
- **SC-014**: AI automatic stage assignment accuracy reaches 85% based on document analysis and decision criteria
- **SC-015**: All kanban stage changes (manual and AI-driven) persist to database within 1 second and show complete audit trail

## Assumptions

- Users have access to complete judicial process documents in supported formats (PDF, DOCX, JPG, PNG, scanned images) for upload
- The system will integrate with existing AI/ML services for document extraction and analysis
- The application already has user authentication and role management in place (Supabase setup)
- All documents uploaded will be in Portuguese or standard international legal formats
- Users have basic familiarity with legal case terminology and document types
- Initial document processing will be done on-demand (not batch processing)
- The juridico module UI framework and database schema support the new entities described above
- Supabase RLS policies are fully implemented to enforce user-owned data isolation
- Users understand they can review and manually correct AI extraction results if needed
- Processing time estimate (5 minutes) will be communicated to users before analysis begins
- Each user can only access processes they have personally uploaded
- RLS policies prevent users from accessing other users' processes at the database level
- User identification is available through authenticated Supabase user sessions
- The Kanban board is implemented as a visual workflow management tool for Contencioso Cível cases
- Kanban stages represent standard workflow steps in Brazilian legal expert proceedings (perícia)
- Users are familiar with drag-and-drop interactions and Kanban board concepts
- All nine kanban stages are always displayed in the board, with processes filtered by user ownership (RLS)
- AI stage assignment logic can be updated post-launch to improve accuracy based on user feedback and additional document context
- Kanban stage transitions should be instant (optimistic updates) without blocking UI
- Database persistence happens asynchronously after optimistic UI update for improved user experience