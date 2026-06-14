# Jewellery Tag Intelligence Platform

> AI-powered jewellery tag scanning and data extraction platform using Gemini Vision API

## 🎯 Project Overview

The Jewellery Tag Intelligence Platform is a comprehensive solution for scanning jewellery tags, extracting information using Google's Gemini Vision API, and managing structured data with an intuitive review workflow.

## 📁 Project Structure

```
jewellery-tag-intelligence-platform/
├── frontend/          # React Native mobile application
├── backend/           # Node.js REST API server
├── docs/              # Project documentation
└── .github/           # GitHub workflows and templates
```

## 👥 Team

| Name | Role | GitHub | Responsibilities |
|------|------|--------|------------------|
| Divyansh Kotnala | Architect / Product Owner | @divyanshkotnala | Architecture, Product Direction, Code Reviews |
| Anamika | Frontend Developer | @anamika | React Native Development, UI/UX |
| Ishika | Backend Developer | @ishika | Node.js API, Database, Integrations |

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Git
- GitHub account

### Clone Repository

```bash
git clone https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
cd jewellery-tag-intelligence-platform
```

### Frontend Setup

```bash
cd frontend
npm install
npm run lint
npm run build
```

### Backend Setup

```bash
cd backend
npm install
npm run lint
npm run test
```

## 🌿 Branch Strategy

### Main Branches

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features

### Feature Branches

- **`feature/frontend-anamika`** - Anamika's frontend work
- **`feature/backend-ishika`** - Ishika's backend work
- **`feature/<description>`** - Additional features

### Branch Protection Rules

#### `main` Branch
- ✅ Require pull request before merging
- ✅ Require 1 approval
- ✅ Dismiss stale PR approvals when new commits are pushed
- ❌ No direct pushes allowed

#### `develop` Branch
- ✅ Require pull request before merging
- ✅ Require 1 approval
- ❌ No direct pushes allowed

## 🏗️ Milestones

### Milestone 1: Scanner UI
- Mobile camera integration
- Tag capture interface
- Image preview and selection

### Milestone 2: Gemini Vision Integration
- API integration
- Image upload pipeline
- Response parsing

### Milestone 3: Abbreviation Engine
- Abbreviation mapping
- Data normalization
- Validation rules

### Milestone 4: Review Workflow
- Manual review interface
- Edit capabilities
- Approval system

### Milestone 5: Dataset Export
- Export formats (CSV, JSON, Excel)
- Bulk operations
- Data analytics

## 🏷️ Repository Labels

### Type Labels
- `frontend` - Frontend related
- `backend` - Backend related
- `documentation` - Documentation updates
- `devops` - CI/CD and infrastructure

### Status Labels
- `bug` - Bug reports
- `enhancement` - New features
- `technical-task` - Technical implementation

### Priority Labels
- `high-priority` - Urgent items
- `blocked` - Blocked by dependencies
- `needs-review` - Awaiting review

## 🔄 CI/CD Pipeline

### Frontend Workflow
- Linting with ESLint
- Build verification
- Artifact generation

### Backend Workflow
- Linting with ESLint
- Unit & Integration tests
- Code coverage reporting

## 📦 Release Strategy

### Environments

1. **Development** (`develop` branch)
   - Automatic deployment on merge
   - Used for integration testing

2. **Staging** (tags: `v*-rc*`)
   - Pre-production testing
   - UAT environment

3. **Production** (`main` branch)
   - Production releases
   - Tagged with semantic versioning (v1.0.0)

## 🤝 Contributing

Please read our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) before submitting PRs.

### Pull Request Process

1. Create feature branch from `develop`
2. Make your changes
3. Write/update tests
4. Submit PR to `develop`
5. Request review from code owner
6. Address review feedback
7. Merge after approval

## 📝 License

[Add your license here]

## 📧 Contact

For questions or support, contact:
- **Divyansh Kotnala** - Product Owner
- Create an issue in this repository
# jewellery-tag-intelligence-platform
