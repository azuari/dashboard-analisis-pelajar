# IPSAS V2

# IPSAS Development Standard

> **Document ID** : IPSAS-STD-001
> **Document** : Development Standard
> **Version** : 0.1 
> **Status** : Frozen
> **Project** : IPSAS V2
> **Author** : IKBN Pekan
> **Last Updated** : July 2026

---

## Document Classification

| Item | Value |
|------|-------|
| Classification | Development Standard |
| Audience | Developer, Software Architect, Reviewer |
| Confidentiality | Internal |
| Approval Status | Frozen |

---

# 1. Purpose

The IPSAS Development Standard (IDS) defines the engineering principles, architectural rules and development practices adopted throughout the IPSAS V2 project.

This document establishes a common development standard to ensure consistency, maintainability and long-term sustainability across all software modules.

---

# 2. Scope

This standard applies to:

- Registry Layer
- Data Layer
- Business Layer
- Presentation Layer

It also applies to:

- JavaScript modules
- Documentation
- Architecture decisions
- Code review
- Future development

---

# 3. Development Philosophy

IPSAS V2 follows the principle:

> **Design First. Build Second.**

Every software component shall:

- Begin with architecture.
- Follow an approved blueprint.
- Be reviewed before implementation.
- Be documented before completion.
- Be frozen only after successful review.

Development speed must never compromise software quality.

## IDS-001

### Title

Single Responsibility

### Rule

Every module owns one responsibility only.

### Rationale

Small modules are easier to understand, test and maintain.

### Applies To

Registry Layer

Data Layer

Business Layer

Presentation Layer

### Example

StudentEngine manages student information only.

AttendanceEngine manages attendance only.

### Exceptions

None.

📜 IPSAS Development Standard v1

Core Principles

↓

Architecture

↓

Business Engine

↓

Runtime

↓

Code Quality

↓

Documentation

↓

Review

# 5. IPSAS Development Standards (IDS)

The IPSAS Development Standards (IDS) define the mandatory engineering principles used throughout the IPSAS V2 project.

Every software component shall comply with these standards unless an approved architectural decision states otherwise.

Each IDS consists of:

- Title
- Rule
- Rationale
- Applies To
- Example
- Exceptions

## IDS-001

### Title

Single Responsibility

### Rule

Every module shall own one responsibility only.

### Rationale

Modules with a single responsibility are easier to understand, maintain and test.

### Applies To

- Registry Layer
- Data Layer
- Business Layer
- Presentation Layer

### Example

StudentEngine manages student information only.

AttendanceEngine manages attendance information only.

### Exceptions

None.

## IDS-002

### Title

Single Source of Truth

### Rule

Every Business Engine shall obtain runtime data from a single authoritative source.

### Rationale

Using a single runtime source prevents duplicated logic and inconsistent data.

### Applies To

- DataHub
- Business Layer

### Example

StudentEngine reads student records from DataHub.

AttendanceEngine reads attendance records from DataHub.

### Exceptions

None.

## IDS-003

### Title

Normalize ≠ Validate

### Rule

Data normalization and data validation shall be implemented as separate responsibilities.

### Rationale

Separating normalization from validation improves code clarity and reusability.

### Applies To

- Parser
- Business Layer

### Example

normalizeIC()

validateIC()

are two different operations.

### Exceptions

None.

## IDS-004

### Title

Private Helper First

### Rule

Internal logic shall be implemented using private helper functions before exposing public APIs.

### Rationale

Private helpers simplify maintenance and reduce duplicated logic.

### Applies To

- Business Engines

### Example

normalizeIC()

buildStudent()

findStudent()

are internal helper functions.

### Exceptions

None.

## IDS-005

### Title

Atomic Runtime Update

### Rule

Runtime data shall be updated as a single completed operation.

### Rationale

Partial updates may leave the runtime in an inconsistent state.

### Applies To

- DataHub
- Business Layer

### Example

reloadStudents()

updates the entire student runtime before exposing it to other modules.

### Exceptions

None.

## IDS-006

### Title

Read Model

### Rule

Business Engines shall consume prepared runtime data instead of reconstructing raw data.

### Rationale

Business Engines are responsible for business logic, not data parsing or reconstruction.

Using prepared runtime data improves consistency, performance and maintainability.

### Applies To

- Business Layer

### Example

StudentEngine reads student objects from DataHub.

AttendanceEngine reads attendance summaries from DataHub.

Neither engine parses CSV files directly.

### Exceptions

None.

## IDS-007

### Title

Blueprint First

### Rule

Every new Business Engine shall be designed from an approved architectural blueprint before implementation begins.

### Rationale

Architecture-first development reduces rework and ensures consistency across the Business Layer.

### Applies To

- Business Layer

### Example

StudentEngine serves as the reference blueprint for:

- AttendanceEngine
- MarksEngine
- AnalyticsEngine

### Exceptions

Prototype or experimental modules that are explicitly marked as non-production.

## IDS-008

### Title

Documentation First

### Rule

Architecture, standards and public interfaces shall be documented before implementation is considered complete.

### Rationale

Documentation preserves design decisions and improves long-term maintainability.

### Applies To

- All Layers
- Documentation

### Example

README.md

↓

Architecture.md

↓

Development Standard

↓

Business Layer Guide

are completed before expanding the Business Layer.

### Exceptions

Minor documentation corrections.

## IDS-009

### Title

Golden Reference

### Rule

A reviewed and approved implementation may become the official reference for future modules.

### Rationale

Using a proven implementation improves consistency and reduces design variations.

### Applies To

- Business Layer

### Example

StudentEngine is the Golden Reference for all future Business Engines.

### Exceptions

None.

## IDS-010

### Title

Review Before Freeze

### Rule

No module shall be frozen before completing architecture review, implementation review and documentation review.

### Rationale

Formal review ensures software quality and prevents unresolved design issues from becoming permanent.

### Applies To

- Source Code
- Documentation

### Example

StudentEngine

Architecture Review

↓

Implementation Review

↓

Final Review

↓

Frozen RC1

### Exceptions

None.

# Relationship Between Standards

The IPSAS Development Standards are designed to complement one another.

Architecture defines the system.

Development Standards define how the system is built.

Business Layer Guide demonstrates how the standards are implemented.

Together, these documents establish a consistent engineering approach for IPSAS V2.

## IDS-011

### Title

Public API Only

### Rule

Every Business Engine shall expose functionality only through its documented public API.

Internal runtime objects, helper functions and implementation details shall remain private.

### Rationale

A stable public API protects internal implementation from external dependencies.

This allows internal refactoring without affecting other modules.

### Applies To

- Business Layer

### Example

StudentEngine

Public APIs

- getStudent()
- findStudent()
- getStudents()

Private Helpers

- normalizeIC()
- buildStudentMap()
- createStudentObject()

Only the public APIs may be called by other modules.

### Exceptions

None.

## IDS-012

### Title

Layer Independence

### Rule

Every software layer shall perform only its assigned responsibility.

Layers shall communicate only through approved interfaces.

### Rationale

Layer independence reduces coupling and simplifies maintenance.

### Applies To

- Registry Layer
- Data Layer
- Business Layer
- Presentation Layer

### Example

Presentation Layer

↓

Business Layer

↓

Data Layer

↓

Registry Layer

The Presentation Layer shall never access DataHub directly.

Business Engines shall never read Google Sheets directly.

### Exceptions

None.

## IDS-013

### Title

Business Before UI

### Rule

Business logic shall be completed and reviewed before user interface development begins.

### Rationale

A stable Business Layer enables multiple user interfaces to reuse the same implementation.

It also prevents UI decisions from influencing business rules.

### Applies To

- Business Layer
- Presentation Layer

### Example

StudentEngine

↓

AttendanceEngine

↓

MarksEngine

↓

Dashboard

↓

AI Assistant

The Dashboard consumes Business Engine APIs rather than implementing business logic itself.

### Exceptions

Prototype demonstrations that are clearly identified as temporary.

# 6. Architecture Compliance

Every IPSAS software component shall comply with the approved architecture documented in:

- README.md
- 01-Architecture.md
- IPSAS Development Standard

Architectural deviations shall be documented through an approved Architecture Decision Record (ADR).

# 7. Definition of Done

A software component is considered complete only when all of the following conditions are satisfied.

- Architecture approved.
- Implementation completed.
- Public API documented.
- Review completed.
- Documentation updated.
- Freeze approved.

# 8. Revision History

| Version | Status | Description |
|----------|--------|-------------|
| 0.1 | Draft | Document structure |
| 0.2 | Draft | IDS-001 – IDS-005 |
| 0.3 | Draft | IDS-006 – IDS-010 |
| 0.4 | Draft | IDS-011 – IDS-013 |
| 1.0 | Frozen | Initial IPSAS Development Standard |

## Related Documents

Prerequisite

01-Architecture.md

Implementation Guide

03-Business-Layer-Guide.md