![Version](https://img.shields.io/badge/version-2.0.0-blue)

![Status](https://img.shields.io/badge/status-Development-orange)

![Architecture](https://img.shields.io/badge/architecture-Layered-success)

![License](https://img.shields.io/badge/license-Internal-lightgrey)

# IPSAS V2

> **Integrated Pelajar Smart Analytics System**
>
> *Building sustainable academic analytics through clean architecture and disciplined software engineering.*

---

## About IPSAS

IPSAS (Integrated Pelajar Smart Analytics System) is a modular academic analytics platform developed for **Institut Kemahiran Belia Negara (IKBN) Pekan**.

The system is designed to simplify student management, attendance monitoring, academic performance analysis, reporting, and future AI-assisted decision support.

IPSAS V2 adopts a layered architecture where each module has a single responsibility and communicates through well-defined interfaces, making the system easier to maintain, extend, and scale.

---

## Vision

To build a sustainable academic analytics platform that is:

- Modular
- Lightweight
- Maintainable
- Scalable
- Easy to understand
- Easy to extend

---

## Objectives

IPSAS V2 is developed to:

- Centralize academic information.
- Simplify attendance monitoring.
- Improve academic reporting.
- Support data-driven decision making.
- Prepare the platform for future AI integration.

---

## Core Features

- Student Management
- Attendance Analytics
- Academic Performance Analysis
- Dashboard & Visualization
- Report Generation
- AI Assistant *(Planned)*

---

# System Architecture

```text
                 IPSAS V2

          ┌──────────────────────┐
          │   Google Sheets      │
          └──────────┬───────────┘
                     │
               CSV Loader
                     │
                  Parser
                     │
                  DataHub
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
 Student Engine Attendance Engine Marks Engine
        └────────────┼────────────┘
                     ▼
            Analytics Engine
                     ▼
     Dashboard • Reports • AI Assistant
```

---

# Project Structure

```text
IPSAS-V2/

├── assets/
├── data/
├── docs/
├── js/
│   ├── ai/
│   ├── core/
│   ├── data/
│   └── engine/
├── reports/
├── tests/
│
├── index.html
├── style.css
├── README.md
└── LICENSE
```

---

# Development Progress

| Layer | Status |
|--------|--------|
| Registry Layer | ✅ Completed |
| Data Layer | ✅ Completed |
| Business Layer | 🔄 In Progress |
| Presentation Layer | ⏳ Planned |

---

## Business Engine Progress

| Engine | Status |
|---------|--------|
| Student Engine | ✅ Frozen RC1 |
| Attendance Engine | 🔄 Development |
| Marks Engine | ⏳ Planned |
| Analytics Engine | ⏳ Planned |

---

# Documentation

Detailed project documentation is available in the `/docs` directory.

| Document | Description |
|-----------|-------------|
| 01-Architecture.md | Overall system architecture |
| 02-IPSAS-Development-Standard.md | IPSAS Development Standard (IDS) |
| 03-Business-Layer-Guide.md | Business Engine architecture |
| 04-Academic-Structure.md | Academic data structure |
| 05-GoogleSheet-Guide.md | Google Sheets specification |
| 06-API-Guide.md | Public API documentation |
| 07-AI-Planning.md | AI development planning |
| 08-Project-Roadmap.md | Development roadmap |
| 09-Release-Notes.md | Release history |
| 10-Changelog.md | Project change history |

---

# Engineering Principles

IPSAS V2 is developed based on the following principles:

- Single Responsibility Principle
- Single Source of Truth
- Blueprint First Development
- Read Model Architecture
- Normalize ≠ Validate
- Atomic Runtime Update
- Documentation First

---

# Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)

### Data Source

- Google Sheets
- CSV

### Architecture

- Layered Architecture
- Business Engine Pattern
- Modular Design

---

# Development Workflow

```text
Architecture Review
        │
        ▼
Skeleton
        │
        ▼
Release Candidate (RC)
        │
        ▼
Code Review
        │
        ▼
Freeze
```

---

# Project Roadmap

```text
Foundation Layer
████████████████████ 100%

Data Layer
████████████████████ 100%

Business Layer
█████░░░░░░░░░░░░░░░ 30%

Presentation Layer
░░░░░░░░░░░░░░░░░░░░ 0%
```

---

# License

This project is developed for academic and internal institutional use at **IKBN Pekan**.

---

# Version

| Version | Status |
|----------|--------|
| 2.0.0 | Development |

---

## Related Documents

- 01-Architecture.md
- 02-IPSAS-Development-Standard.md
- 03-Business-Layer-Guide.md

**Developed for**

Institut Kemahiran Belia Negara (IKBN) Pekan

© IPSAS V2 Project
