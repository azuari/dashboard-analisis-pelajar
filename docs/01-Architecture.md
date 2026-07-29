# IPSAS V2

# Software Architecture Document

> **Document ID** : IPSAS-ARCH-001  
> **Document** : Software Architecture  
> **Version** : 0.1   
> **Status** : Frozen  
> **Project** : IPSAS V2  
> **Author** : IKBN Pekan  
> **Last Updated** : July 2026

---

## Document Classification

| Item | Value |
|------|-------|
| Classification | Architecture |
| Audience | Developer, Software Architect, System Maintainer |
| Confidentiality | Internal |
| Approval Status | Frozen |

# 1. Introduction

## Purpose

This document describes the overall software architecture of the **Integrated Pelajar Smart Analytics System (IPSAS V2)**.

It defines the architectural principles, software layers, component responsibilities, data flow, and major design decisions that guide the development of the system.

This document serves as the primary architectural reference for all future development.

---

## Scope

This document covers:

- Overall system architecture
- Layer architecture
- Business Engine architecture
- Data flow
- Architecture Decision Records (ADR)
- Future expansion

It does not describe implementation details or source code.

---

# 2. System Vision

IPSAS V2 is designed as a modular academic analytics platform for **Institut Kemahiran Belia Negara (IKBN) Pekan**.

The system aims to centralize academic information, simplify attendance monitoring, support academic analysis, and provide a scalable foundation for future dashboard and AI integration.

---

# 3. Architecture Goals

The IPSAS V2 architecture is designed to achieve the following goals.

- Maintainability
- Scalability
- Simplicity
- Reliability
- Extensibility

# 4. Architecture Principles

IPSAS V2 is designed based on the following principles.

## 4.1 Single Responsibility

Every module owns exactly one responsibility.

---

## 4.2 Layered Architecture

Each layer communicates only with the layer immediately below or above it.

---

## 4.3 Single Source of Truth

DataHub is the only runtime data source used by Business Engines.

---

## 4.4 Business Engine Pattern

Business logic is separated into independent Business Engines.

---

## 4.5 Blueprint First

Every new Business Engine follows the StudentEngine blueprint.

---

## 4.6 Documentation First

Architecture decisions are documented before implementation.

---

# 5. System Context

The following diagram illustrates the external environment surrounding IPSAS V2.

```text
Academic Staff
        │
        ▼
Google Sheets
        │
        ▼
     IPSAS V2
   ┌────┼─────┐
   ▼    ▼     ▼
Dashboard
Reports
AI Assistant

```

# 6. Overall Architecture

The IPSAS V2 architecture is organized into four primary layers.

```text
                    IPSAS V2

             ┌──────────────────┐
             │ Registry Layer   │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │   Data Layer     │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Business Layer   │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │Presentation Layer│
             └──────────────────┘
```

Each layer has a clearly defined responsibility and communicates only through well-defined interfaces.

# 7. Layer Architecture

| Layer | Responsibility |
|--------|----------------|
| Registry Layer | System configuration and academic registry |
| Data Layer | Import, parse and manage runtime data |
| Business Layer | Business logic and domain services |
| Presentation Layer | Dashboard, reporting and user interaction |

## Registry Layer

The Registry Layer contains static configuration and academic reference information.

Components:

- identity.js
- config.js
- academic.js

Responsibilities:

- Store configuration
- Store academic structure
- Provide system identity

## Data Layer

The Data Layer transforms raw spreadsheet data into structured runtime data.

Main Components

Google Sheets

↓

CSV Loader

↓

Parser

↓

DataHub

Responsibilities

- Read CSV
- Parse academic data
- Normalize runtime data
- Provide a single source of truth

## Business Layer

Business logic is implemented using independent Business Engines.

Current Engines

- Student Engine
- Attendance Engine
- Marks Engine (Planned)
- Analytics Engine (Planned)

Every Business Engine:

- Owns one domain
- Reads data from DataHub
- Exposes a small public API
- Maintains its own runtime

## Presentation Layer

The Presentation Layer is responsible for presenting information to users.

Components

- Dashboard
- Reports
- AI Assistant (Planned)

This layer does not contain business logic.

# 8. Component Architecture

IPSAS V2 is divided into independent software components.

Each component has a clearly defined responsibility.

```text
Registry Layer
        │
        ▼
Data Layer
        │
        ▼
Business Layer
        │
        ▼
Presentation Layer
```

Each component communicates only through public interfaces.

Direct access across unrelated layers is not allowed.

## Registry Layer

The Registry Layer stores system configuration and academic reference information.

Main Components

- identity.js
- config.js
- academic.js

Responsibilities

- Store application identity
- Store configuration values
- Store academic structure

Characteristics

- Static
- Lightweight
- No business logic

## Data Layer

The Data Layer converts raw spreadsheet data into structured runtime objects.

Main Components

Google Sheets

↓

CSV Loader

↓

Parser

↓

DataHub

Responsibilities

- Import CSV data
- Parse spreadsheet structure
- Normalize runtime data
- Build DataHub

## Business Layer

Business logic is implemented using independent Business Engines.

Current Architecture

```text
             DataHub

                 │

      ┌──────────┼──────────┐

      ▼          ▼          ▼

 Student   Attendance    Marks

 Engine      Engine      Engine

      └──────────┼──────────┘

                 ▼

        Analytics Engine
```

Each engine:

- owns one business domain
- has its own runtime
- exposes public APIs
- reads DataHub only

## Presentation Layer

The Presentation Layer provides user interaction.

Current Components

- Dashboard
- Reports

Future Components

- AI Assistant

Responsibilities

- Display information
- Receive user input
- Call Business Engine APIs

The Presentation Layer contains no business logic.

# 9. Data Flow

IPSAS follows a one-way data flow.

```text
Google Sheets

        │

        ▼

CSV Loader

        │

        ▼

Parser

        │

        ▼

DataHub

        │

────────┼────────────────────────

        ▼

Business Engines

        │

────────┼────────────────────────

        ▼

Dashboard

Reports

AI Assistant
```

Every layer consumes data from the previous layer.

No layer bypasses another layer.

# 10. Dependency Rules

IPSAS V2 follows these dependency rules.

Presentation Layer

↓

Business Layer

↓

Data Layer

↓

Registry Layer

Rules

- Higher layers may depend on lower layers.
- Lower layers must never depend on higher layers.
- Business Engines never access Google Sheets directly.
- Presentation Layer never modifies DataHub.

# 11. Architecture Rules

AR-001

Every layer has a single responsibility.

---

AR-002

Business Layer never reads CSV directly.

---

AR-003

Business Layer only reads DataHub.

---

AR-004

Presentation Layer never modifies runtime data.

---

AR-005

Registry Layer contains no business logic.

# 12. Architecture Decision Records (ADR)

Architecture Decision Records (ADR) document the major architectural decisions made during the development of IPSAS V2.

Each ADR records the decision, its status and the rationale behind it.

---

## ADR-001

### Title

Primary Key = No. KP

### Status

Accepted

### Decision

Student identity throughout IPSAS V2 is based on the Malaysian National Identification Number (No. KP).

### Rationale

IKBN Pekan officially uses No. KP as the primary student identifier.

Although student names may be duplicated, No. KP is unique and stable across all modules.

### Impact

- StudentEngine uses No. KP as the primary key.
- AttendanceEngine indexes attendance by No. KP.
- Future Business Engines follow the same convention.

## ADR-002

### Title

DataHub as the Single Source of Truth

### Status

Accepted

### Decision

All Business Engines obtain runtime data exclusively from DataHub.

### Rationale

Using a centralized runtime data source eliminates duplicated parsing logic and ensures data consistency.

### Impact

- StudentEngine reads DataHub.
- AttendanceEngine reads DataHub.
- MarksEngine reads DataHub.
- AnalyticsEngine reads DataHub.

## ADR-003

### Title

Attendance Summary Model

### Status

Accepted

### Decision

AttendanceEngine uses only attendance summary data.

Daily attendance columns (D–W) are intentionally excluded.

### Rationale

IPSAS focuses on attendance analytics rather than daily attendance recording.

Google Sheets already provide summarized attendance values.

### Impact

AttendanceEngine stores only:

- Interaction Hours
- Present Hours
- Absent Hours
- Attendance Percentage

## ADR-004

### Title

StudentEngine as Business Engine Blueprint

### Status

Accepted

### Decision

StudentEngine is the reference architecture for all future Business Engines.

### Rationale

The module has been reviewed and frozen before other engines were developed.

Using a common blueprint improves consistency across the Business Layer.

### Impact

AttendanceEngine

↓

MarksEngine

↓

AnalyticsEngine

follow the same architecture.

## ADR-005

### Title

Business Engines are Read Models

### Status

Accepted

### Decision

Business Engines do not recreate calculations that already exist in DataHub.

### Rationale

Business Engines are responsible for exposing business information rather than reproducing parsed data.

### Impact

AttendanceEngine reads attendance percentage instead of recalculating it.

## ADR-006

### Title

Blueprint-First Development

### Status

Accepted

### Decision

Every new Business Engine is designed from an approved blueprint before implementation begins.

### Rationale

Designing the architecture first reduces rework and keeps all engines consistent.

### Impact

StudentEngine became the official blueprint for subsequent Business Engines.

## ADR-007

### Title

Documentation Before Expansion

### Status

Accepted

### Decision

Core architectural documentation must be completed before expanding the Business Layer.

### Rationale

A documented architecture improves maintainability, onboarding, and future development.

### Impact

README.md

↓

Architecture.md

↓

IPSAS Development Standard

↓

Business Layer Guide

# 13. Quality Attributes

IPSAS V2 is designed to achieve the following quality goals.

## Maintainability

Modules are independent and easy to maintain.

---

## Scalability

New Business Engines can be added without changing existing modules.

---

## Simplicity

Every module has a single responsibility.

---

## Reliability

DataHub acts as the single source of truth.

---

## Testability

Business Engines can be tested independently.

---

## Consistency

All Business Engines follow the same blueprint and development standard.

# 14. Architecture Summary

IPSAS V2 adopts a layered, modular and blueprint-driven architecture.

The system separates responsibilities across Registry, Data, Business and Presentation layers.

Business logic is implemented using independent Business Engines that share a common architectural blueprint.

This architecture provides a maintainable foundation for future expansion, including Dashboard, Reporting and AI-assisted analytics.

# 15. Glossary

| Term | Description |
|------|-------------|
| IPSAS | Integrated Pelajar Smart Analytics System |
| ADR | Architecture Decision Record |
| AR | Architecture Rule |
| IDS | IPSAS Development Standard |
| RC | Release Candidate |
| API | Application Programming Interface |

# 16. Revision History

| Version | Status | Description |
|----------|--------|-------------|
| 0.1 | Draft | Initial document structure |
| 0.2 | Draft | Layer architecture |
| 0.3 | Draft | Component architecture |
| 0.4 | Draft | ADR and Quality Attributes |

01-Architecture.md

Document Information

Introduction

System Vision

Architecture Principles

Overall Architecture

Layer Architecture

Component Architecture

Data Flow

Dependency Rules

Architecture Rules

Architecture Decision Records (ADR)

Quality Attributes

Architecture Summary

Revision History

## Related Documents

Prerequisite

README.md

See Also

02-IPSAS-Development-Standard.md