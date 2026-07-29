# IPSAS V2

# Business Layer Guide

> **Document ID** : IPSAS-BLG-001
> **Document** : Business Layer Guide
> **Version** : 0.1 
> **Status** : Frozen
> **Project** : IPSAS V2
> **Author** : IKBN Pekan
> **Last Updated** : July 2026

---

## Document Classification

| Item | Value |
|------|-------|
| Classification | Implementation Guide |
| Audience | Developer, Software Architect |
| Confidentiality | Internal |
| Approval Status | Frozen |

## Related Documents

Prerequisite

- README.md
- 01-Architecture.md
- 02-IPSAS-Development-Standard.md

See Also

- AttendanceEngine
- MarksEngine
- AnalyticsEngine

# 1. Purpose

This document defines the implementation standard for Business Engines within IPSAS V2.

It explains how Business Engines are designed, structured, implemented, reviewed and maintained.

This guide serves as the official implementation reference for all Business Layer components.

# 2. Scope

This guide applies to every Business Engine developed for IPSAS V2, including:

- StudentEngine
- AttendanceEngine
- MarksEngine
- AnalyticsEngine

The guide covers:

- Engine architecture
- Runtime model
- Public API design
- Internal helper pattern
- Engine lifecycle
- Best practices
- Review checklist

# 3. Business Layer Overview

The Business Layer is responsible for implementing business logic independently from the data source and presentation layer.

```text
                  Business Layer

                         │

        ┌────────────────┼────────────────┐

        ▼                ▼                ▼

 StudentEngine   AttendanceEngine   MarksEngine

        └────────────────┼────────────────┘

                         ▼

                 AnalyticsEngine
```

Every Business Engine owns one business domain and exposes business functionality through a documented public API.

# 4. Business Engine Definition

A Business Engine is an independent software component responsible for managing exactly one business domain.

Every Business Engine:

- owns one business responsibility;
- consumes runtime data from DataHub;
- maintains its own runtime state;
- exposes business functionality through a public API;
- does not depend on other Business Engines.

# Engine Contract

Input

↓

Runtime

↓

Public API

↓

Output

Input → DataHub
Runtime → Internal State
Public API → External Interface
Output → Dashboard / Reports / AI

# 5. Business Engine Philosophy

Every Business Engine shall follow these principles.

## Single Responsibility

One engine manages one domain.

---

## Read Model

Business Engines consume prepared runtime data.

---

## Independent Runtime

Each engine owns its own runtime.

---

## Public API

Only documented public APIs may be used by external modules.

---

## Private Helpers

Internal implementation details remain private.

# 6. Canonical Business Engine

IPSAS V2 adopts a canonical implementation approach for Business Engines.

A canonical implementation serves as the official engineering reference for all future Business Engines.

StudentEngine has been designated as the Canonical Business Engine because it:

- follows the approved software architecture;
- complies with the IPSAS Development Standard (IDS);
- has completed architecture and implementation review;
- provides a stable public API;
- serves as the implementation blueprint for future Business Engines.

# 7. Standard Business Engine Structure

Every Business Engine shall follow the same internal structure.

```text
Business Engine

│

Initialization

│

Private Helpers

│

Runtime

│

Public API

│

Export
```

Maintaining a consistent structure improves readability, maintenance and code review.

# 8. Runtime Model

Every Business Engine owns an independent runtime.

Business Engines shall never share runtime objects directly.

Runtime data is built from DataHub and maintained internally by the engine.

```text
DataHub

↓

Business Engine

↓

Runtime Cache

↓

Public API
```
Runtime Responsibilities

- Build runtime
- Update runtime
- Validate runtime
- Expose runtime through Public API

# 9. Public API Design

Every Public API shall be:

- Stable
- Predictable
- Well documented
- Independent
- Easy to test

Public APIs shall never expose:

- Internal runtime
- Private helper functions
- Temporary objects
- Mutable internal state

API Naming Convention

| Prefix | Purpose                |
| ------ | ---------------------- |
| get    | Retrieve data          |
| find   | Search a single entity |
| has    | Check existence        |
| list   | Return collections     |
| reload | Rebuild runtime        |


# 10. Private Helper Pattern

Private helpers implement reusable internal logic.

Private helpers:

- are not exported;
- are not called outside the engine;
- support Public APIs.

Example

normalizeIC()

buildStudent()

createLookup()

validateStudent()

Public API

↓

Private Helper

↓

Runtime

↓

Result

# 11. Runtime Lifecycle

Every Business Engine follows the same runtime lifecycle.

```text
Initialize

        │

        ▼

Load Data

        │

        ▼

Build Runtime

        │

        ▼

Validate Runtime

        │

        ▼

Ready

        │

        ▼

Public API
```

A Business Engine shall not expose its public API before the runtime reaches the Ready state.

# 12. Engine Checklist

Before a Business Engine can be frozen, it shall satisfy all of the following requirements.

Architecture

☐ Single Responsibility

☐ Read Model

☐ Independent Runtime

☐ Public API

☐ Private Helpers

Implementation

☐ Runtime implemented

☐ Public API documented

☐ Helper functions documented

Quality

☐ Architecture review completed

☐ Code review completed

☐ Documentation updated

☐ Ready for Freeze

# 13. Best Practices

Business Engines should:

- expose small Public APIs;
- use descriptive method names;
- avoid duplicated logic;
- keep runtime private;
- document every public function;
- follow the Canonical Business Engine.

# 14. Anti-Patterns

The following practices are prohibited.

❌ Reading CSV directly.

❌ Sharing runtime between engines.

❌ Calling private helpers from another engine.

❌ Placing business logic inside the Dashboard.

❌ Exposing mutable runtime objects.

❌ Mixing normalization with validation.

❌ Skipping architecture review.

# Business Engine Review Process

Every Business Engine shall pass the following review stages.

Architecture Review

↓

Implementation Review

↓

Documentation Review

↓

Final Review

↓

Freeze

# 15. Summary

The IPSAS Business Layer is based on independent Business Engines.

Every Business Engine follows the same architecture, runtime model, implementation pattern and review process.

This guide establishes the official implementation specification for all future Business Engines developed within IPSAS V2.

# 16. Revision History

| Version | Status | Description |
|----------|--------|-------------|
| 0.1 | Draft | Initial document structure |
| 0.2 | Draft | Business Engine architecture |
| 0.3 | Draft | Runtime lifecycle and review process |
| 1.0 | Frozen | Official Business Layer Guide |


