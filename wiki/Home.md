# Welcome to the HaberNexus Wiki!

This Wiki provides in-depth documentation for the HaberNexus project. It is intended for developers, contributors, and anyone interested in the technical details of the project.

## 🚀 Quick Links

- **[Project Roadmap](https://github.com/sata2500/habernexus-nextjs/blob/master/ROADMAP.md)**
- **[Contribution Guide](https://github.com/sata2500/habernexus-nextjs/blob/master/CONTRIBUTING.md)**
- **[AI Development Guide](https://github.com/sata2500/habernexus-nextjs/blob/master/docs/ai-agents/AI_DEVELOPMENT_GUIDE.md)**

## 📚 Main Sections

### 1. [Project Philosophy & Architecture](Project-Philosophy-&-Architecture)
- Learn about the "Simple but Powerful" philosophy, the choice of a self-hosted Next.js monolith, and the overall system design.

### 2. [Getting Started](Getting-Started)
- A comprehensive guide to setting up your local development environment, including Node.js version management and obtaining API keys.

### 3. Core Features
- Detailed explanations of the project's core functionalities:
  - [AI Content Engine](AI-Content-Engine)
  - [User & Role System](User-&-Role-System)
  - [Admin Dashboard](Admin-Dashboard)

### 4. [Development & Contribution](Development-&-Contribution)
- Information on coding standards, commit conventions, and the pull request process.

### 5. [Deployment](Deployment)
- How to deploy the HaberNexus application to a production server using PM2.

## 🤖 For AI Agents

AI agents **MUST** follow the complete framework outlined in the [AI Development Guide](https://github.com/sata2500/habernexus-nextjs/blob/master/docs/ai-agents/AI_DEVELOPMENT_GUIDE.md). Your primary sources of truth are the protocols in `docs/ai-agents/` and the shared brain in `docs/ai-knowledge-base/`. This Wiki serves as a supplementary resource for deeper architectural context.

### Essential AI Agent Documents

| Document | Purpose |
|----------|---------|
| [ONBOARDING.md](https://github.com/sata2500/habernexus-nextjs/blob/master/docs/ai-agents/ONBOARDING.md) | Environment setup and project familiarization |
| [WORKFLOW.md](https://github.com/sata2500/habernexus-nextjs/blob/master/docs/ai-agents/WORKFLOW.md) | Step-by-step development process |
| [QUALITY_CHECKLIST.md](https://github.com/sata2500/habernexus-nextjs/blob/master/docs/ai-agents/QUALITY_CHECKLIST.md) | Verification requirements |
| [DOCUMENTATION_PROTOCOL.md](https://github.com/sata2500/habernexus-nextjs/blob/master/docs/ai-agents/DOCUMENTATION_PROTOCOL.md) | Wiki and documentation rules |

## 🤝 How to Contribute to the Wiki

This Wiki is automatically synchronized from the `wiki/` folder in the repository. To contribute:

1. Edit files in the `wiki/` folder
2. Commit and push to `master` branch
3. GitHub Action will sync changes to this Wiki

For detailed instructions, see [DOCUMENTATION_PROTOCOL.md](https://github.com/sata2500/habernexus-nextjs/blob/master/docs/ai-agents/DOCUMENTATION_PROTOCOL.md).
